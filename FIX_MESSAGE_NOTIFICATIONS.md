# Fix Message Notifications

## Problem
Message notifications are not working when messages are sent.

## Root Causes

1. **Notifications table might not exist** - If you saw 404 errors earlier, the table needs to be created
2. **RLS policies might be blocking inserts** - Need to allow system to create notifications
3. **Error handling is swallowing errors** - Need better logging

## Solution

### Step 1: Ensure Notifications Table Exists

Run this migration in Supabase SQL Editor:

```sql
-- File: supabase/migrations/20251124000016_ensure_notifications_table.sql
-- Or copy the content from that file
```

**Quick check:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'notifications';
```

If it doesn't exist, run the migration.

### Step 2: Check RLS Policies

The notifications table needs a policy that allows users to create notifications for other users (for messages).

Run this to check policies:
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'notifications';
```

**If missing, add this policy:**
```sql
-- Allow system to create notifications (for messages, orders, etc.)
-- This uses SECURITY DEFINER function or service role
-- For now, we'll allow authenticated users to create notifications
-- (In production, use a SECURITY DEFINER function)

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

**Note:** The current policy only allows users to view their own notifications, but doesn't allow creating notifications for others. We need to add a policy that allows creating notifications.

### Step 3: Add Policy for Creating Notifications

Run this in Supabase SQL Editor:

```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create policy to allow creating notifications
-- This allows authenticated users to create notifications
-- In production, you might want to restrict this further
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

### Step 4: Verify Notification Creation

After running the above, test sending a message and check:

1. **Browser Console** (F12):
   - Look for "Notification created successfully" log
   - Check for any error messages

2. **Database**:
   ```sql
   SELECT * FROM notifications 
   WHERE type = 'message' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

3. **Notification Bell**:
   - Should show unread count
   - Should display new message notification

## Testing

1. **Send a message** from one user to another
2. **Check browser console** for logs
3. **Check notification bell** on recipient's account
4. **Check database** to see if notification was created

## If Still Not Working

1. **Check browser console** for errors
2. **Check Supabase logs** for RLS policy violations
3. **Verify notifications table exists**:
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'notifications';
   ```
4. **Check RLS is enabled**:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'notifications';
   ```
5. **Test notification creation directly**:
   ```sql
   -- Replace USER_ID with actual user ID
   INSERT INTO notifications (user_id, type, title, message)
   VALUES ('USER_ID', 'message', 'Test', 'Test notification');
   ```

## Code Changes Made

1. ✅ Improved error handling in `Messages.tsx`
2. ✅ Better logging in `notifications.ts`
3. ✅ Direct notification creation with error checking
4. ✅ Console logs for debugging

## Next Steps

1. Run the RLS policy update (Step 3 above)
2. Test sending a message
3. Check browser console for logs
4. Verify notification appears in notification bell

---

**The main issue is likely the RLS policy blocking notification creation. Run Step 3 to fix it!**

