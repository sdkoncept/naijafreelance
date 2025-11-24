-- Create Messages and Job Applications Tables
-- This migration creates the messages table and job_applications table

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  flagged_for_review BOOLEAN DEFAULT false,
  off_platform_attempt_detected BOOLEAN DEFAULT false,
  detection_reason TEXT,
  reviewed_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view messages they're part of" ON public.messages;
  DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
  DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
END $$;

-- Create policies
CREATE POLICY "Users can view messages they're part of"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON public.messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON public.messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================================================
-- JOB APPLICATIONS TABLE
-- ============================================================================

-- Create enum for application status if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'declined', 'withdrawn');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  application_text TEXT NOT NULL,
  status public.application_status DEFAULT 'pending',
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  declined_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, freelancer_id) -- Prevent duplicate applications
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view applications for their jobs" ON public.job_applications;
  DROP POLICY IF EXISTS "Users can view their own applications" ON public.job_applications;
  DROP POLICY IF EXISTS "Freelancers can create applications" ON public.job_applications;
  DROP POLICY IF EXISTS "Clients can update applications for their jobs" ON public.job_applications;
END $$;

-- Create policies
CREATE POLICY "Users can view applications for their jobs"
  ON public.job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can create applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Clients can update applications for their jobs"
  ON public.job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs 
      WHERE jobs.id = job_applications.job_id 
      AND jobs.client_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_freelancer_id ON public.job_applications(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications(created_at DESC);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to send email notification (placeholder - will use Supabase Edge Function)
CREATE OR REPLACE FUNCTION notify_job_application()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be handled by a Supabase Edge Function
  -- For now, we just log it
  PERFORM pg_notify('job_application', json_build_object(
    'job_id', NEW.job_id,
    'freelancer_id', NEW.freelancer_id,
    'application_id', NEW.id
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify on new application
DROP TRIGGER IF EXISTS on_job_application_created ON public.job_applications;
CREATE TRIGGER on_job_application_created
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_job_application();

