-- Create Jobs Table for Job Postings
-- This migration creates the jobs table for clients to post job requests

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES (if not exists)
-- ============================================================================

DO $$ 
BEGIN
  -- Job status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE public.job_status AS ENUM ('open', 'in_progress', 'closed', 'cancelled');
  END IF;
END $$;

-- ============================================================================
-- JOBS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  budget DECIMAL(10, 2),
  currency public.currency_type NOT NULL DEFAULT 'NGN',
  delivery_days INTEGER,
  requirements TEXT,
  status public.job_status DEFAULT 'open',
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, slug)
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Jobs are publicly viewable" ON public.jobs;
  DROP POLICY IF EXISTS "Clients can create jobs" ON public.jobs;
  DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
  DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;
END $$;

-- Create policies
CREATE POLICY "Jobs are publicly viewable"
  ON public.jobs FOR SELECT
  USING (status = 'open' OR auth.uid() = client_id);

CREATE POLICY "Clients can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Users can delete their own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = client_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON public.jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON public.jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON public.jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- Trigger to update updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate job slug
CREATE OR REPLACE FUNCTION generate_job_slug(title TEXT, client_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title
  base_slug := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  base_slug := SUBSTRING(base_slug FROM 1 FOR 50); -- Limit length
  
  final_slug := base_slug;
  
  -- Check for uniqueness
  WHILE EXISTS (SELECT 1 FROM public.jobs WHERE slug = final_slug AND jobs.client_id = generate_job_slug.client_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

