-- Update enrollees table policies to restrict viewers
DROP POLICY IF EXISTS "Authenticated users can insert enrollees" ON public.enrollees;
DROP POLICY IF EXISTS "Staff can update their own enrollees" ON public.enrollees;

CREATE POLICY "Staff and admins can insert enrollees" 
ON public.enrollees 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Staff can update their own enrollees" 
ON public.enrollees 
FOR UPDATE 
USING (
  auth.uid() = created_by 
  AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Add viewer select policy for enrollees
CREATE POLICY "Viewers can view all enrollees" 
ON public.enrollees 
FOR SELECT 
USING (has_role(auth.uid(), 'viewer'::app_role));

-- Update dependants table policies to restrict viewers
DROP POLICY IF EXISTS "Users can delete dependants for their enrollees" ON public.dependants;
DROP POLICY IF EXISTS "Users can insert dependants for their enrollees" ON public.dependants;
DROP POLICY IF EXISTS "Users can update dependants for their enrollees" ON public.dependants;

CREATE POLICY "Staff and admins can delete dependants" 
ON public.dependants 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM enrollees 
    WHERE enrollees.id = dependants.enrollee_id 
    AND (enrollees.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Staff and admins can insert dependants" 
ON public.dependants 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollees 
    WHERE enrollees.id = dependants.enrollee_id 
    AND (enrollees.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Staff and admins can update dependants" 
ON public.dependants 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM enrollees 
    WHERE enrollees.id = dependants.enrollee_id 
    AND (enrollees.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Add viewer select policy for dependants
CREATE POLICY "Viewers can view all dependants" 
ON public.dependants 
FOR SELECT 
USING (has_role(auth.uid(), 'viewer'::app_role));

-- Update profiles table policies to restrict viewer updates
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Staff and admins can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = id 
  AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Update audit_logs policy for viewers
CREATE POLICY "Viewers can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'viewer'::app_role));