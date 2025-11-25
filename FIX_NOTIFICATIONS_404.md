# Fix Notifications 404 Error

## Problem

You're seeing 404 errors for the notifications table:
```
GET https://bkdhxrhdoqeyfsrfipku.supabase.co/rest/v1/notifications?select=*&user_id=eq...
[HTTP/3 404]
```

This means the `notifications` table doesn't exist in your Supabase database.

## Solution: Run the Migration

The migration file exists but needs to be applied to your database.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy and Run the Migration

Copy the entire content below and paste it into the SQL Editor, then click **Run**:

```sql
-- Ensure Notifications Table Exists
-- This migration creates the notifications table if it doesn't exist

CREATE TYPE IF NOT EXISTS public.notification_type AS ENUM (
  'order_received',
  'order_delivered',
  'message',
  'payment',
  'review',
  'off_platform_warning',
  'loyalty_tier_upgrade',
  'withdrawal_approved',
  'withdrawal_rejected',
  'verification_approved',
  'order_completed'
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- Can reference orders, messages, withdrawals, etc.
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
END $$;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to create notification (can be called from triggers or application)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type public.notification_type,
  p_title TEXT,
  p_message TEXT,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Verify It Worked

After running the migration:

1. **Check the table exists:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name = 'notifications';
   ```
   Should return: `notifications`

2. **Check the structure:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'notifications';
   ```
   Should show all columns: id, user_id, type, title, message, related_id, read, created_at

3. **Refresh your live site:**
   - Hard refresh: `Ctrl+F5` or `Cmd+Shift+R`
   - The notification bell should now work
   - No more 404 errors

## What This Migration Does

1. ✅ Creates `notification_type` enum with all notification types
2. ✅ Creates `notifications` table with proper structure
3. ✅ Enables Row Level Security (RLS)
4. ✅ Creates RLS policies (users can only see their own notifications)
5. ✅ Creates indexes for performance
6. ✅ Creates helper function `create_notification()` for easy notification creation

## After Running Migration

The notification bell in the header should:
- ✅ Load without 404 errors
- ✅ Show unread count badge
- ✅ Display notifications when clicked
- ✅ Allow marking as read

## Other Tables to Check

While you're at it, verify these tables exist too:

```sql
-- Check all important tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'notifications',
  'reviews',
  'community_posts',
  'community_replies',
  'community_likes',
  'withdrawals',
  'order_deliverables'
)
ORDER BY table_name;
```

If any are missing, run the corresponding migration from `supabase/migrations/` folder.

---

**Once you run this migration, the 404 errors will stop and notifications will work!** 🎉

