-- Populate Categories for Freelancer Marketplace
-- This ensures categories exist in the database

-- First, ensure the categories table exists (from freelancer marketplace schema)
-- This migration assumes the categories table was created by the freelancer_marketplace_schema migration

-- Insert categories if they don't exist (using slug as unique identifier)
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

