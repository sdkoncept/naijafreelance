-- Create Categories Table and Populate
-- This migration creates the categories table and populates it with initial data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Categories are publicly viewable" ON public.categories;

-- Create policy for categories
CREATE POLICY "Categories are publicly viewable"
  ON public.categories FOR SELECT
  USING (true);

-- Populate categories (only insert if they don't exist)
INSERT INTO public.categories (name, slug, icon, description) 
SELECT * FROM (VALUES
  ('Graphics & Design', 'graphics-design', '🎨', 'Logo design, branding, illustrations'),
  ('Digital Marketing', 'digital-marketing', '📱', 'Social media, SEO, content marketing'),
  ('Writing & Translation', 'writing-translation', '✍️', 'Content writing, copywriting, translation'),
  ('Video & Animation', 'video-animation', '🎬', 'Video editing, animation, motion graphics'),
  ('Music & Audio', 'music-audio', '🎵', 'Music production, voiceover, audio editing'),
  ('Programming & Tech', 'programming-tech', '💻', 'Web development, mobile apps, software'),
  ('Business', 'business', '💼', 'Business consulting, virtual assistant, data entry'),
  ('Mobile Apps', 'mobile-apps', '📱', 'Mobile app development and design')
) AS v(name, slug, icon, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories WHERE categories.slug = v.slug
);

