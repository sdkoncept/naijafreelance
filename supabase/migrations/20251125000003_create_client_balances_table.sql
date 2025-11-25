-- Create Client Balances Table
-- This table tracks referral credits and refunds for clients

-- Create types if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'balance_type') THEN
    CREATE TYPE public.balance_type AS ENUM (
      'referral_credit',
      'refund',
      'adjustment'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'balance_status') THEN
    CREATE TYPE public.balance_status AS ENUM (
      'pending',
      'available',
      'used',
      'expired'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.client_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type public.balance_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency public.currency_type NOT NULL DEFAULT 'NGN',
  status public.balance_status DEFAULT 'available',
  description TEXT,
  related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL, -- For refunds
  referral_code TEXT, -- For referral credits
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- For referral credits
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration date
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.client_balances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own balances" ON public.client_balances;
  DROP POLICY IF EXISTS "Admins can view all balances" ON public.client_balances;
  DROP POLICY IF EXISTS "System can create balances" ON public.client_balances;
END $$;

-- Create policies
CREATE POLICY "Users can view their own balances"
  ON public.client_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all balances"
  ON public.client_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role::text = 'admin'
    )
  );

-- System can create balances (via triggers or service role)
-- This will be handled by database functions with SECURITY DEFINER

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_balances_user_id ON public.client_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_client_balances_status ON public.client_balances(status);
CREATE INDEX IF NOT EXISTS idx_client_balances_type ON public.client_balances(type);
CREATE INDEX IF NOT EXISTS idx_client_balances_referral_code ON public.client_balances(referral_code);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_client_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_balances_updated_at
  BEFORE UPDATE ON public.client_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_client_balances_updated_at();

-- Function to calculate total available balance for a user
CREATE OR REPLACE FUNCTION get_user_available_balance(p_user_id UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_total DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total
  FROM public.client_balances
  WHERE user_id = p_user_id
  AND status = 'available'
  AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

