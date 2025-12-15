-- Create portfolio_items table for freelancer portfolios
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'document')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT, -- e.g., 'web_design', 'logo_design', 'branding'
  tags TEXT[] DEFAULT '{}',
  project_url TEXT, -- External link to live project
  client_name TEXT, -- Optional: client name if allowed
  featured BOOLEAN DEFAULT false, -- Featured items shown first
  display_order INTEGER DEFAULT 0, -- For custom ordering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Portfolio items are publicly viewable" ON public.portfolio_items;
  DROP POLICY IF EXISTS "Users can insert their own portfolio items" ON public.portfolio_items;
  DROP POLICY IF EXISTS "Users can update their own portfolio items" ON public.portfolio_items;
  DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON public.portfolio_items;
END $$;

-- Policies
CREATE POLICY "Portfolio items are publicly viewable"
  ON public.portfolio_items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own portfolio items"
  ON public.portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Users can update their own portfolio items"
  ON public.portfolio_items FOR UPDATE
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Users can delete their own portfolio items"
  ON public.portfolio_items FOR DELETE
  USING (auth.uid() = freelancer_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_freelancer_id ON public.portfolio_items(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_featured ON public.portfolio_items(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON public.portfolio_items(category);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_portfolio_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_portfolio_items_updated_at ON public.portfolio_items;

CREATE TRIGGER trigger_update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_items_updated_at();

