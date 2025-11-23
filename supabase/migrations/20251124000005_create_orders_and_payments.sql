-- Create Orders and Payments Tables
-- This migration ensures orders and payments tables exist with proper structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES (if not exists)
-- ============================================================================

DO $$ 
BEGIN
  -- Package type enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'package_type') THEN
    CREATE TYPE public.package_type AS ENUM ('basic', 'standard', 'premium');
  END IF;
  
  -- Order status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM ('pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed');
  END IF;
  
  -- Currency type enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency_type') THEN
    CREATE TYPE public.currency_type AS ENUM ('NGN', 'USD');
  END IF;
  
  -- Payment status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
  END IF;
END $$;

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL NOT NULL,
  package_type public.package_type NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency public.currency_type NOT NULL DEFAULT 'NGN',
  status public.order_status DEFAULT 'pending',
  requirements TEXT,
  delivery_date TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.20,
  commission_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  freelancer_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_repeat_client BOOLEAN DEFAULT false,
  cancellation_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
  DROP POLICY IF EXISTS "Clients can create orders" ON public.orders;
  DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
END $$;

-- Create policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "Clients can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  LOOP
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_number);
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS orders_set_order_number ON public.orders;

CREATE TRIGGER orders_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_freelancer_id ON public.orders(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_orders_gig_id ON public.orders(gig_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency public.currency_type NOT NULL DEFAULT 'NGN',
  payment_method TEXT,
  payment_gateway TEXT,
  gateway_reference TEXT,
  status public.payment_status DEFAULT 'pending',
  commission_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  freelancer_payout_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_processing_fee DECIMAL(10, 2) DEFAULT 0,
  commission_breakdown JSONB DEFAULT '{}',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view payments for their orders" ON public.payments;
  DROP POLICY IF EXISTS "Users can create payments for their orders" ON public.payments;
  DROP POLICY IF EXISTS "Users can update payments for their orders" ON public.payments;
END $$;

-- Create policies
CREATE POLICY "Users can view payments for their orders"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id 
      AND (orders.client_id = auth.uid() OR orders.freelancer_id = auth.uid())
    )
  );

CREATE POLICY "Users can create payments for their orders"
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id 
      AND orders.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payments for their orders"
  ON public.payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id 
      AND (orders.client_id = auth.uid() OR orders.freelancer_id = auth.uid())
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_reference ON public.payments(gateway_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Trigger to update order updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

