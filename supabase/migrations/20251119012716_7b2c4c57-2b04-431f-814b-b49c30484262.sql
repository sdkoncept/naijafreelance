-- Fix critical security issue: Update all RLS policies to require authentication
-- This prevents public access to sensitive data

-- ============================================
-- ENROLLEES TABLE - Restrict to authenticated users
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can view all enrollees" ON public.enrollees;
DROP POLICY IF EXISTS "Viewers can view all enrollees" ON public.enrollees;
DROP POLICY IF EXISTS "Admins can view all enrollees" ON public.enrollees;
DROP POLICY IF EXISTS "Staff and admins can insert enrollees" ON public.enrollees;
DROP POLICY IF EXISTS "Staff can update their own enrollees" ON public.enrollees;
DROP POLICY IF EXISTS "Admins can update all enrollees" ON public.enrollees;
DROP POLICY IF EXISTS "Admins can delete enrollees" ON public.enrollees;

-- Recreate policies with TO authenticated
CREATE POLICY "Staff can view all enrollees" 
ON public.enrollees 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Viewers can view all enrollees" 
ON public.enrollees 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'viewer'::app_role));

CREATE POLICY "Admins can view all enrollees" 
ON public.enrollees 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff and admins can insert enrollees" 
ON public.enrollees 
FOR INSERT 
TO authenticated
WITH CHECK ((auth.uid() = created_by) AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Staff can update their own enrollees" 
ON public.enrollees 
FOR UPDATE 
TO authenticated
USING ((auth.uid() = created_by) AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Admins can update all enrollees" 
ON public.enrollees 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete enrollees" 
ON public.enrollees 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- DEPENDANTS TABLE - Restrict to authenticated users
-- ============================================

DROP POLICY IF EXISTS "Users can view dependants for their enrollees" ON public.dependants;
DROP POLICY IF EXISTS "Viewers can view all dependants" ON public.dependants;
DROP POLICY IF EXISTS "Staff and admins can insert dependants" ON public.dependants;
DROP POLICY IF EXISTS "Staff and admins can update dependants" ON public.dependants;
DROP POLICY IF EXISTS "Staff and admins can delete dependants" ON public.dependants;

CREATE POLICY "Users can view dependants for their enrollees" 
ON public.dependants 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM enrollees 
  WHERE enrollees.id = dependants.enrollee_id 
  AND (enrollees.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
));

CREATE POLICY "Viewers can view all dependants" 
ON public.dependants 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'viewer'::app_role));

CREATE POLICY "Staff and admins can insert dependants" 
ON public.dependants 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM enrollees 
  WHERE enrollees.id = dependants.enrollee_id 
  AND (enrollees.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)) 
  AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
));

CREATE POLICY "Staff and admins can update dependants" 
ON public.dependants 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM enrollees 
  WHERE enrollees.id = dependants.enrollee_id 
  AND (enrollees.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)) 
  AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
));

CREATE POLICY "Staff and admins can delete dependants" 
ON public.dependants 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM enrollees 
  WHERE enrollees.id = dependants.enrollee_id 
  AND (enrollees.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)) 
  AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
));

-- ============================================
-- AUDIT_LOGS TABLE - Restrict to authenticated users
-- ============================================

DROP POLICY IF EXISTS "Admin can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Viewers can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can create their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs are immutable - no updates" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs are immutable - no deletes" ON public.audit_logs;

CREATE POLICY "Admin can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Viewers can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'viewer'::app_role));

CREATE POLICY "Users can create their own audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Audit logs are immutable - no updates" 
ON public.audit_logs 
FOR UPDATE 
TO authenticated
USING (false);

CREATE POLICY "Audit logs are immutable - no deletes" 
ON public.audit_logs 
FOR DELETE 
TO authenticated
USING (false);

-- ============================================
-- USER_ROLES TABLE - Restrict to authenticated users
-- ============================================

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- PROFILES TABLE - Already secure, but verify
-- ============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff and admins can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff and admins can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING ((auth.uid() = id) AND (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));