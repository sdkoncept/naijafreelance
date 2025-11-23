-- Make record_id nullable in audit_logs table
-- This allows logging of events that don't have a specific record ID (like login/logout)
ALTER TABLE public.audit_logs 
ALTER COLUMN record_id DROP NOT NULL;