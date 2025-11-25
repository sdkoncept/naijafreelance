-- Create Community Tables for Freelancers
-- This migration creates tables for community discussions, posts, and replies

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.community_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id),
  CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR
    (post_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Community posts are viewable by all authenticated users" ON public.community_posts;
  DROP POLICY IF EXISTS "Freelancers can create posts" ON public.community_posts;
  DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
  DROP POLICY IF EXISTS "Admins can update any post" ON public.community_posts;
  DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;
  
  DROP POLICY IF EXISTS "Replies are viewable by all authenticated users" ON public.community_replies;
  DROP POLICY IF EXISTS "Users can create replies" ON public.community_replies;
  DROP POLICY IF EXISTS "Users can update their own replies" ON public.community_replies;
  DROP POLICY IF EXISTS "Users can delete their own replies" ON public.community_replies;
  
  DROP POLICY IF EXISTS "Likes are viewable by all" ON public.community_likes;
  DROP POLICY IF EXISTS "Users can create likes" ON public.community_likes;
  DROP POLICY IF EXISTS "Users can delete their own likes" ON public.community_likes;
END $$;

-- Community Posts Policies
CREATE POLICY "Community posts are viewable by all authenticated users"
  ON public.community_posts FOR SELECT
  USING (true);

CREATE POLICY "Freelancers can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'freelancer'
    )
  );

CREATE POLICY "Users can update their own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can update any post"
  ON public.community_posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role::text = 'admin'
    )
  );

CREATE POLICY "Users can delete their own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = author_id);

-- Community Replies Policies
CREATE POLICY "Replies are viewable by all authenticated users"
  ON public.community_replies FOR SELECT
  USING (true);

CREATE POLICY "Users can create replies"
  ON public.community_replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies"
  ON public.community_replies FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own replies"
  ON public.community_replies FOR DELETE
  USING (auth.uid() = author_id);

-- Community Likes Policies
CREATE POLICY "Likes are viewable by all"
  ON public.community_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create likes"
  ON public.community_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.community_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_pinned ON public.community_posts(is_pinned);

CREATE INDEX IF NOT EXISTS idx_community_replies_post_id ON public.community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_author_id ON public.community_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_community_replies_created_at ON public.community_replies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON public.community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_reply_id ON public.community_likes(reply_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_community_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON public.community_posts;
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_updated_at();

DROP TRIGGER IF EXISTS update_community_replies_updated_at ON public.community_replies;
CREATE TRIGGER update_community_replies_updated_at
  BEFORE UPDATE ON public.community_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_community_updated_at();

-- Function to update replies_count
CREATE OR REPLACE FUNCTION update_post_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET replies_count = replies_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET replies_count = GREATEST(replies_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update replies_count
DROP TRIGGER IF EXISTS update_replies_count_on_insert ON public.community_replies;
CREATE TRIGGER update_replies_count_on_insert
  AFTER INSERT ON public.community_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_post_replies_count();

DROP TRIGGER IF EXISTS update_replies_count_on_delete ON public.community_replies;
CREATE TRIGGER update_replies_count_on_delete
  AFTER DELETE ON public.community_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_post_replies_count();

