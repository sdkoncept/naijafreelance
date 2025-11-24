-- Allow admins to update any user profile
-- This migration adds an RLS policy to allow admins to update profiles of other users

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create policy to allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));


