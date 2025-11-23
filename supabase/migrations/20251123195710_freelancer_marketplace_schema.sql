-- Freelancer Marketplace Schema Migration
-- This migration sets up the complete database schema for the Nigerian freelancer marketplace

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE public.user_type AS ENUM ('freelancer', 'client', 'admin');
CREATE TYPE public.verification_status AS ENUM ('verified', 'pending', 'unverified');
CREATE TYPE public.loyalty_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'professional', 'premium');
CREATE TYPE public.gig_status AS ENUM ('active', 'paused', 'deleted');
CREATE TYPE public.package_type AS ENUM ('basic', 'standard', 'premium');
CREATE TYPE public.order_status AS ENUM ('pending', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.currency_type AS ENUM ('NGN', 'USD');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.notification_type AS ENUM ('order_received', 'order_delivered', 'message', 'payment', 'review', 'off_platform_warning', 'loyalty_tier_upgrade');
CREATE TYPE public.detection_type AS ENUM ('email', 'phone', 'url', 'payment_platform', 'messaging_app');
CREATE TYPE public.severity_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.monitoring_action AS ENUM ('none', 'warning_sent', 'message_restricted', 'account_reviewed');

-- ============================================================================
-- PROFILES TABLE (Updated for Marketplace)
-- ============================================================================

-- Update existing profiles table or create new structure
-- Check if profiles table exists and update it
DO $$ 
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
    ALTER TABLE public.profiles ADD COLUMN user_type public.user_type;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
    ALTER TABLE public.profiles ADD COLUMN location JSONB; -- {city, state}
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_status') THEN
    ALTER TABLE public.profiles ADD COLUMN verification_status public.verification_status DEFAULT 'unverified';
  END IF;
END $$;

-- ============================================================================
-- FREELANCER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10, 2),
  total_earnings DECIMAL(12, 2) DEFAULT 0,
  completed_orders_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  response_time INTEGER, -- in hours
  languages TEXT[] DEFAULT '{}',
  education JSONB, -- {degree, institution, year}
  certifications JSONB, -- array of {name, issuer, date}
  portfolio_urls TEXT[] DEFAULT '{}',
  loyalty_tier public.loyalty_tier DEFAULT 'bronze',
  total_orders_completed INTEGER DEFAULT 0,
  off_platform_warnings_count INTEGER DEFAULT 0,
  last_warning_at TIMESTAMP WITH TIME ZONE,
  subscription_tier public.subscription_tier DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view freelancer profiles"
  ON public.freelancer_profiles FOR SELECT
  USING (true); -- Public profiles

CREATE POLICY "Users can update their own freelancer profile"
  ON public.freelancer_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own freelancer profile"
  ON public.freelancer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

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

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly viewable"
  ON public.categories FOR SELECT
  USING (true);

-- ============================================================================
-- GIGS TABLE
-- ============================================================================

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

ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

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

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL NOT NULL,
  package_type public.package_type NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency public.currency_type NOT NULL DEFAULT 'NGN',
  status public.order_status DEFAULT 'pending',
  requirements TEXT,
  delivery_date TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.20, -- e.g., 0.20 = 20%
  commission_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  freelancer_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_repeat_client BOOLEAN DEFAULT false,
  cancellation_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "Clients can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
BEGIN
  LOOP
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_number);
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- ============================================================================
-- ORDER DELIVERABLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.order_deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  file_urls TEXT[] DEFAULT '{}',
  message TEXT,
  delivered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.order_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deliverables for their orders"
  ON public.order_deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_deliverables.order_id 
      AND (orders.client_id = auth.uid() OR orders.freelancer_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can create deliverables"
  ON public.order_deliverables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_deliverables.order_id 
      AND orders.freelancer_id = auth.uid()
    )
  );

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly viewable"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their orders"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = reviews.order_id 
      AND orders.client_id = auth.uid()
      AND orders.status = 'completed'
    )
  );

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
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

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they're part of"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- ============================================================================
-- COMMUNICATION MONITORING LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.communication_monitoring_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  detection_type public.detection_type NOT NULL,
  detected_content TEXT NOT NULL,
  severity public.severity_level NOT NULL,
  action_taken public.monitoring_action DEFAULT 'none',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.communication_monitoring_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view monitoring logs"
  ON public.communication_monitoring_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency public.currency_type NOT NULL DEFAULT 'NGN',
  payment_method TEXT,
  payment_gateway TEXT, -- 'paystack', 'flutterwave'
  gateway_reference TEXT,
  status public.payment_status DEFAULT 'pending',
  commission_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  freelancer_payout_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_processing_fee DECIMAL(10, 2) DEFAULT 0,
  commission_breakdown JSONB DEFAULT '{}',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their orders"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id 
      AND (orders.client_id = auth.uid() OR orders.freelancer_id = auth.uid())
    )
  );

-- ============================================================================
-- WITHDRAWALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency public.currency_type NOT NULL DEFAULT 'NGN',
  bank_account_details JSONB NOT NULL,
  status public.withdrawal_status DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Users can create their own withdrawals"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- Can reference orders, messages, etc.
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PLATFORM VALUE METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.platform_value_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  clients_brought_by_platform INTEGER DEFAULT 0,
  orders_from_platform_clients INTEGER DEFAULT 0,
  estimated_marketing_value DECIMAL(10, 2) DEFAULT 0,
  disputes_resolved INTEGER DEFAULT 0,
  time_saved_hours DECIMAL(5, 2) DEFAULT 0,
  total_commission_paid DECIMAL(10, 2) DEFAULT 0,
  total_value_received DECIMAL(10, 2) DEFAULT 0,
  value_to_commission_ratio DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.platform_value_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own metrics"
  ON public.platform_value_metrics FOR SELECT
  USING (auth.uid() = freelancer_id);

-- ============================================================================
-- LOYALTY TIER HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.loyalty_tier_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  previous_tier TEXT,
  new_tier TEXT NOT NULL,
  previous_commission_rate DECIMAL(5, 4),
  new_commission_rate DECIMAL(5, 4) NOT NULL,
  orders_at_tier_change INTEGER NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.loyalty_tier_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tier history"
  ON public.loyalty_tier_history FOR SELECT
  USING (auth.uid() = freelancer_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_gigs_freelancer_id ON public.gigs(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category_id ON public.gigs(category_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON public.gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_slug ON public.gigs(slug);

CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_freelancer_id ON public.orders(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_orders_gig_id ON public.orders(gig_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON public.messages(order_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ============================================================================
-- FUNCTIONS FOR COMMISSION CALCULATION
-- ============================================================================

-- Function to calculate commission based on loyalty tier
CREATE OR REPLACE FUNCTION calculate_commission_rate(
  p_freelancer_id UUID,
  p_subscription_tier public.subscription_tier DEFAULT 'free'
)
RETURNS DECIMAL(5, 4) AS $$
DECLARE
  v_loyalty_tier public.loyalty_tier;
  v_orders_completed INTEGER;
  v_base_rate DECIMAL(5, 4) := 0.20; -- 20% base
  v_final_rate DECIMAL(5, 4);
BEGIN
  -- Get freelancer's loyalty tier and completed orders
  SELECT loyalty_tier, total_orders_completed
  INTO v_loyalty_tier, v_orders_completed
  FROM public.freelancer_profiles
  WHERE id = p_freelancer_id;
  
  -- Calculate rate based on subscription tier first
  IF p_subscription_tier = 'premium' THEN
    v_final_rate := 0.10; -- 10% for premium
  ELSIF p_subscription_tier = 'professional' THEN
    v_final_rate := 0.15; -- 15% for professional
  ELSE
    -- Base rate, then apply loyalty discounts
    v_final_rate := v_base_rate;
    
    -- Apply loyalty tier discounts
    IF v_loyalty_tier = 'platinum' AND v_orders_completed >= 500 THEN
      v_final_rate := 0.12; -- 12%
    ELSIF v_loyalty_tier = 'gold' AND v_orders_completed >= 200 THEN
      v_final_rate := 0.15; -- 15%
    ELSIF v_loyalty_tier = 'silver' AND v_orders_completed >= 50 THEN
      v_final_rate := 0.18; -- 18%
    END IF;
  END IF;
  
  RETURN v_final_rate;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update loyalty tier based on completed orders
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER AS $$
DECLARE
  v_new_tier public.loyalty_tier;
  v_old_tier public.loyalty_tier;
  v_orders_count INTEGER;
BEGIN
  -- Only process when order is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get current tier and order count
    SELECT loyalty_tier, total_orders_completed
    INTO v_old_tier, v_orders_count
    FROM public.freelancer_profiles
    WHERE id = NEW.freelancer_id;
    
    -- Determine new tier
    IF v_orders_count + 1 >= 500 THEN
      v_new_tier := 'platinum';
    ELSIF v_orders_count + 1 >= 200 THEN
      v_new_tier := 'gold';
    ELSIF v_orders_count + 1 >= 50 THEN
      v_new_tier := 'silver';
    ELSE
      v_new_tier := 'bronze';
    END IF;
    
    -- Update tier if changed
    IF v_new_tier != v_old_tier THEN
      UPDATE public.freelancer_profiles
      SET 
        loyalty_tier = v_new_tier,
        total_orders_completed = total_orders_completed + 1,
        updated_at = NOW()
      WHERE id = NEW.freelancer_id;
      
      -- Log tier change
      INSERT INTO public.loyalty_tier_history (
        freelancer_id,
        previous_tier,
        new_tier,
        previous_commission_rate,
        new_commission_rate,
        orders_at_tier_change
      ) VALUES (
        NEW.freelancer_id,
        v_old_tier::TEXT,
        v_new_tier::TEXT,
        calculate_commission_rate(NEW.freelancer_id, (SELECT subscription_tier FROM public.freelancer_profiles WHERE id = NEW.freelancer_id)),
        calculate_commission_rate(NEW.freelancer_id, (SELECT subscription_tier FROM public.freelancer_profiles WHERE id = NEW.freelancer_id)),
        v_orders_count + 1
      );
      
      -- Create notification
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        related_id
      ) VALUES (
        NEW.freelancer_id,
        'loyalty_tier_upgrade',
        'Loyalty Tier Upgraded!',
        'Congratulations! You''ve been upgraded to ' || v_new_tier || ' tier. Your commission rate has been reduced.',
        NEW.id
      );
    ELSE
      -- Just increment order count
      UPDATE public.freelancer_profiles
      SET total_orders_completed = total_orders_completed + 1
      WHERE id = NEW.freelancer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update loyalty tier on order completion
CREATE TRIGGER orders_update_loyalty_tier
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_tier();

-- ============================================================================
-- SAMPLE DATA: CATEGORIES
-- ============================================================================

-- Insert some common categories for Nigerian freelancers
INSERT INTO public.categories (id, name, slug, icon, description) VALUES
  (uuid_generate_v4(), 'Graphics & Design', 'graphics-design', '🎨', 'Logo design, branding, illustrations'),
  (uuid_generate_v4(), 'Digital Marketing', 'digital-marketing', '📱', 'Social media, SEO, content marketing'),
  (uuid_generate_v4(), 'Writing & Translation', 'writing-translation', '✍️', 'Content writing, copywriting, translation'),
  (uuid_generate_v4(), 'Video & Animation', 'video-animation', '🎬', 'Video editing, animation, motion graphics'),
  (uuid_generate_v4(), 'Music & Audio', 'music-audio', '🎵', 'Music production, voiceover, audio editing'),
  (uuid_generate_v4(), 'Programming & Tech', 'programming-tech', '💻', 'Web development, mobile apps, software'),
  (uuid_generate_v4(), 'Business', 'business', '💼', 'Business consulting, virtual assistant, data entry'),
  (uuid_generate_v4(), 'Lifestyle', 'lifestyle', '🌟', 'Personal styling, fitness, wellness')
ON CONFLICT DO NOTHING;

