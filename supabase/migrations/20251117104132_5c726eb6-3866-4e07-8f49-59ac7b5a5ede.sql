-- Fix all critical security issues: dependants RLS, audit logs policies, and storage permissions

-- 1. Fix dependants table RLS policies - Replace overpermissive 'true' conditions with ownership checks
DROP POLICY IF EXISTS "Authenticated users can view dependants" ON dependants;
DROP POLICY IF EXISTS "Authenticated users can insert dependants" ON dependants;
DROP POLICY IF EXISTS "Authenticated users can update dependants" ON dependants;
DROP POLICY IF EXISTS "Authenticated users can delete dependants" ON dependants;

-- Only allow access to dependants whose enrollees the user created (or if admin)
CREATE POLICY "Users can view dependants for their enrollees"
ON dependants FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollees
    WHERE id = dependants.enrollee_id
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can insert dependants for their enrollees"
ON dependants FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollees
    WHERE id = dependants.enrollee_id
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can update dependants for their enrollees"
ON dependants FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollees
    WHERE id = dependants.enrollee_id
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Users can delete dependants for their enrollees"
ON dependants FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM enrollees
    WHERE id = dependants.enrollee_id
    AND (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- 2. Fix audit_logs - Add INSERT policy and make logs immutable
CREATE POLICY "Users can create their own audit logs"
ON audit_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Audit logs are immutable - no updates"
ON audit_logs FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "Audit logs are immutable - no deletes"
ON audit_logs FOR DELETE TO authenticated
USING (false);

-- 3. Fix storage policies - Restrict DELETE/UPDATE to photo owners only
DROP POLICY IF EXISTS "Authenticated users can delete photos from enrollee-photos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update photos in enrollee-photos bucket" ON storage.objects;

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'enrollee-photos' AND auth.uid() = owner);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'enrollee-photos' AND auth.uid() = owner);