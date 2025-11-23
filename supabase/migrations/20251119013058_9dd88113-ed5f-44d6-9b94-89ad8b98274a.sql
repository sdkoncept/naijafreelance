-- Allow audit logs to capture failed login attempts without a valid user_id
-- This is necessary for security monitoring of unauthorized access attempts

ALTER TABLE public.audit_logs 
ALTER COLUMN user_id DROP NOT NULL;

-- Update the RLS policy for creating audit logs to allow inserts without user_id
-- This enables logging of failed login attempts before authentication
DROP POLICY IF EXISTS "Users can create their own audit logs" ON public.audit_logs;

CREATE POLICY "Users can create their own audit logs" 
ON public.audit_logs 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add a new policy to allow logging failed login attempts (no auth required)
CREATE POLICY "Allow logging failed login attempts" 
ON public.audit_logs 
FOR INSERT 
TO anon
WITH CHECK (action = 'login_failed' AND user_id IS NULL);