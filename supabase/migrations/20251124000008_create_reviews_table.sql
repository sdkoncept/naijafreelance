-- Create Reviews/Feedback Table
-- This table stores client feedback and ratings for completed orders
-- Note: If reviews table already exists, this migration will update policies

-- Check if table exists, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    CREATE TABLE public.reviews (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
      reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'reviews' 
      AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE public.reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- Enable RLS (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view reviews for their orders" ON public.reviews;
  DROP POLICY IF EXISTS "Clients can create reviews for their completed orders" ON public.reviews;
  DROP POLICY IF EXISTS "Users can create reviews for their orders" ON public.reviews;
  DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.reviews;
END $$;

-- Create policies
CREATE POLICY "Users can view reviews for their orders"
  ON public.reviews FOR SELECT
  USING (
    auth.uid() = reviewer_id OR 
    auth.uid() = reviewee_id OR
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = reviews.order_id 
      AND (orders.client_id = auth.uid() OR orders.freelancer_id = auth.uid())
    )
  );

-- Create new policy that allows reviews for delivered or completed orders
CREATE POLICY "Clients can create reviews for their orders"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = reviews.order_id 
      AND orders.client_id = auth.uid()
      AND orders.status IN ('delivered', 'completed')
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();
