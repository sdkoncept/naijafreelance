-- Drop the old policy that restricted staff to only their own enrollees
DROP POLICY IF EXISTS "Staff can view their own enrollees" ON public.enrollees;

-- Create new policy allowing staff to view all enrollees
CREATE POLICY "Staff can view all enrollees" 
ON public.enrollees 
FOR SELECT 
USING (has_role(auth.uid(), 'staff'::app_role));