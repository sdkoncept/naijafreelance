-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view enrollees" ON public.enrollees;
DROP POLICY IF EXISTS "Authenticated users can update enrollees" ON public.enrollees;

-- Create restrictive SELECT policies
CREATE POLICY "Admins can view all enrollees" 
ON public.enrollees 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view their own enrollees" 
ON public.enrollees 
FOR SELECT 
USING (auth.uid() = created_by);

-- Create restrictive UPDATE policies
CREATE POLICY "Admins can update all enrollees" 
ON public.enrollees 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can update their own enrollees" 
ON public.enrollees 
FOR UPDATE 
USING (auth.uid() = created_by);