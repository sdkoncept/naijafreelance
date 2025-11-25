-- Ensure order_deliverables table exists
-- This migration creates the deliverables table if it doesn't exist

CREATE TABLE IF NOT EXISTS public.order_deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  file_urls TEXT[] DEFAULT '{}',
  message TEXT,
  delivered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.order_deliverables ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view deliverables for their orders" ON public.order_deliverables;
  DROP POLICY IF EXISTS "Freelancers can create deliverables" ON public.order_deliverables;
END $$;

-- Create policies
CREATE POLICY "Users can view deliverables for their orders"
  ON public.order_deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_deliverables.order_id 
      AND (orders.client_id = auth.uid() OR orders.freelancer_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can create deliverables"
  ON public.order_deliverables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_deliverables.order_id 
      AND orders.freelancer_id = auth.uid()
    )
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_order_deliverables_order_id ON public.order_deliverables(order_id);

