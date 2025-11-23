-- Drop the restrictive policy that only allows staff to update their own enrollees
DROP POLICY IF EXISTS "Staff can update their own enrollees" ON enrollees;

-- Create new policy that allows staff to update all enrollees
CREATE POLICY "Staff can update all enrollees"
ON enrollees
FOR UPDATE
USING (
  has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
);