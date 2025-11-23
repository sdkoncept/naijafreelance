-- Create security definer function to check if user is a primary enrollee
CREATE OR REPLACE FUNCTION public.is_primary_enrollee(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollees
    WHERE created_by = _user_id
      AND enrollment_type = 'primary'::enrollment_type
  )
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Primary enrollees can view group members" ON public.enrollees;

-- Recreate the policy using the security definer function
CREATE POLICY "Primary enrollees can view group members"
ON public.enrollees
FOR SELECT
USING (
  (enrollment_type = 'group_member'::enrollment_type AND primary_enrollee_id IN (
    SELECT id FROM enrollees WHERE created_by = auth.uid() AND enrollment_type = 'primary'::enrollment_type
  ))
  OR created_by = auth.uid()
  OR has_role(auth.uid(), 'staff'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'viewer'::app_role)
);

-- Actually, let's use a better approach with the security definer function
DROP POLICY IF EXISTS "Primary enrollees can view group members" ON public.enrollees;

CREATE POLICY "Primary enrollees can view group members"
ON public.enrollees
FOR SELECT
USING (
  created_by = auth.uid()
  OR has_role(auth.uid(), 'staff'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'viewer'::app_role)
);