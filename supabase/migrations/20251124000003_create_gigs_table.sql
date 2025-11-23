-- Create Gigs Table and Required Enums
-- This migration creates the gigs table and all required enum types

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Create enum types if they don't exist
DO $$ 
BEGIN
  -- Gig status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gig_status') THEN
    CREATE TYPE public.gig_status AS ENUM ('active', 'paused', 'deleted');
  END IF;
  
  -- Package type enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'package_type') THEN
    CREATE TYPE public.package_type AS ENUM ('basic', 'standard', 'premium');
  END IF;
  
  -- Order status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM ('pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed');
  END IF;
  
  -- Currency type enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency_type') THEN
    CREATE TYPE public.currency_type AS ENUM ('NGN', 'USD');
  END IF;
END $$;

-- ============================================================================
-- GIGS TABLE
-- ============================================================================

-- Create gigs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  basic_package_price DECIMAL(10, 2),
  standard_package_price DECIMAL(10, 2),
  premium_package_price DECIMAL(10, 2),
  basic_package_delivery_days INTEGER,
  standard_package_delivery_days INTEGER,
  premium_package_delivery_days INTEGER,
  basic_package_features TEXT[] DEFAULT '{}',
  standard_package_features TEXT[] DEFAULT '{}',
  premium_package_features TEXT[] DEFAULT '{}',
  status public.gig_status DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(freelancer_id, slug)
);

-- Enable RLS
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Gigs are publicly viewable" ON public.gigs;
  DROP POLICY IF EXISTS "Users can create their own gigs" ON public.gigs;
  DROP POLICY IF EXISTS "Users can update their own gigs" ON public.gigs;
  DROP POLICY IF EXISTS "Users can delete their own gigs" ON public.gigs;
END $$;

-- Create policies
CREATE POLICY "Gigs are publicly viewable"
  ON public.gigs FOR SELECT
  USING (status = 'active' OR auth.uid() = freelancer_id);

CREATE POLICY "Users can create their own gigs"
  ON public.gigs FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Users can update their own gigs"
  ON public.gigs FOR UPDATE
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Users can delete their own gigs"
  ON public.gigs FOR DELETE
  USING (auth.uid() = freelancer_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gigs_freelancer_id ON public.gigs(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category_id ON public.gigs(category_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON public.gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_slug ON public.gigs(slug);

