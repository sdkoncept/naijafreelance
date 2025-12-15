-- Fix Notification Insert Policy
-- This allows authenticated users to create notifications (for messages, etc.)

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

-- Create policy to allow authenticated users to create notifications
-- This is needed for message notifications and other user-triggered notifications
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: Users can only view their own notifications (existing SELECT policy)
-- Users can only update their own notifications (existing UPDATE policy)
-- But anyone authenticated can create notifications (needed for messages)

