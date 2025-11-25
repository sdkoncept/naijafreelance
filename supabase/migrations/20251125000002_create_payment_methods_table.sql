-- Create Payment Methods Table
-- This table stores securely tokenized payment methods (not actual card numbers)

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  payment_gateway TEXT NOT NULL DEFAULT 'paystack', -- 'paystack', 'stripe', etc.
  card_token TEXT NOT NULL, -- Tokenized card reference from payment gateway
  card_last4 TEXT NOT NULL, -- Last 4 digits for display
  card_brand TEXT, -- 'visa', 'mastercard', 'verve', etc.
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
  DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.payment_methods;
  DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.payment_methods;
  DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.payment_methods;
END $$;

-- Create policies
CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
  ON public.payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON public.payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON public.payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON public.payment_methods(user_id, is_default) WHERE is_default = true;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods;

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_methods_updated_at();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Unset other default payment methods for this user
    UPDATE public.payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS ensure_single_default_payment_method_trigger ON public.payment_methods;

CREATE TRIGGER ensure_single_default_payment_method_trigger
  BEFORE INSERT OR UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_payment_method();

