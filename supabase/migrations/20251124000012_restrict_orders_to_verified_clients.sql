-- Restrict order creation to verified clients only
-- Unverified clients can view everything and contact freelancers, but cannot purchase

-- Drop existing policy
DROP POLICY IF EXISTS "Clients can create orders" ON public.orders;

-- Create new policy that only allows verified clients to create orders
CREATE POLICY "Verified clients can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() = client_id 
    AND EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_type = 'client' 
      AND verification_status = 'verified'
    )
  );

