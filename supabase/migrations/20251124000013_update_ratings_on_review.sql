-- Update average ratings when reviews are created or updated
-- This migration creates functions and triggers to automatically update
-- average_rating on gigs and freelancer_profiles when reviews are added/updated

-- Function to update gig average rating
CREATE OR REPLACE FUNCTION update_gig_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_gig_id UUID;
  v_avg_rating DECIMAL(3, 2);
BEGIN
  -- Get the gig_id from the order
  SELECT gig_id INTO v_gig_id
  FROM public.orders
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  IF v_gig_id IS NOT NULL THEN
    -- Calculate average rating for this gig
    SELECT COALESCE(AVG(rating)::DECIMAL(3, 2), 0) INTO v_avg_rating
    FROM public.reviews
    WHERE EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = reviews.order_id
      AND orders.gig_id = v_gig_id
    );
    
    -- Update gig average_rating
    UPDATE public.gigs
    SET average_rating = v_avg_rating
    WHERE id = v_gig_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update freelancer average rating
CREATE OR REPLACE FUNCTION update_freelancer_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_freelancer_id UUID;
  v_avg_rating DECIMAL(3, 2);
BEGIN
  -- Get the freelancer_id (reviewee_id) from the review
  v_freelancer_id := COALESCE(NEW.reviewee_id, OLD.reviewee_id);
  
  IF v_freelancer_id IS NOT NULL THEN
    -- Calculate average rating for this freelancer
    SELECT COALESCE(AVG(rating)::DECIMAL(3, 2), 0) INTO v_avg_rating
    FROM public.reviews
    WHERE reviewee_id = v_freelancer_id;
    
    -- Update freelancer_profiles if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'freelancer_profiles') THEN
      UPDATE public.freelancer_profiles
      SET average_rating = v_avg_rating
      WHERE id = v_freelancer_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_gig_rating ON public.reviews;
CREATE TRIGGER trigger_update_gig_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_gig_rating();

DROP TRIGGER IF EXISTS trigger_update_freelancer_rating ON public.reviews;
CREATE TRIGGER trigger_update_freelancer_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_freelancer_rating();

-- Make reviews publicly viewable (for displaying on gigs and profiles)
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.reviews;
CREATE POLICY "Reviews are publicly viewable"
  ON public.reviews FOR SELECT
  USING (true);

