-- Create Billing Info Table
-- This table stores client billing information

CREATE TABLE IF NOT EXISTS public.billing_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company_name TEXT,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  state_region TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  tax_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.billing_info ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own billing info" ON public.billing_info;
  DROP POLICY IF EXISTS "Users can insert their own billing info" ON public.billing_info;
  DROP POLICY IF EXISTS "Users can update their own billing info" ON public.billing_info;
END $$;

-- Create policies
CREATE POLICY "Users can view their own billing info"
  ON public.billing_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing info"
  ON public.billing_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing info"
  ON public.billing_info FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_billing_info_user_id ON public.billing_info(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_billing_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billing_info_updated_at
  BEFORE UPDATE ON public.billing_info
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_info_updated_at();

