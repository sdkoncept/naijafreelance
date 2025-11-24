# Fix Admin Profile Update Issue

## Problem

When an admin tries to update a user's profile, it shows "success" but the changes don't persist after refresh. This is because **Row Level Security (RLS) policies** are blocking the update.

## Solution

Run this SQL migration in Supabase to allow admins to update any user's profile.

---

## Quick Fix

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Log in to your account
3. Click on your project
4. Click **"SQL Editor"** in the left sidebar
5. Click **"New Query"**

### Step 2: Copy and Run This SQL

```sql
-- Allow admins to update any user profile
-- This migration adds an RLS policy to allow admins to update profiles of other users

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create policy to allow admins to update any profile
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
```

### Step 3: Click "Run"

---

## What This Does

This SQL adds a new **Row Level Security (RLS) policy** that:
- ✅ Allows users with `admin` role to UPDATE any profile
- ✅ Uses the `has_role()` function to check if the current user is an admin
- ✅ Applies to both `USING` (checking existing rows) and `WITH CHECK` (checking new values)

---

## Why This Was Needed

The existing RLS policies only allowed:
- Users to update their own profile (`auth.uid() = id`)
- Staff/admins to update their own profile

But there was **no policy allowing admins to update other users' profiles**, so RLS was silently blocking the updates.

---

## Verify It Works

After running the migration:

1. **Log in as admin**
2. **Go to User Management** (`/users`)
3. **Edit a user's profile** (name or email)
4. **Confirm the changes**
5. **Refresh the page**
6. **The changes should now persist!** ✅

---

## Files Created

- `supabase/migrations/20251124000010_allow_admin_update_profiles.sql` - Migration file

---

**Copy the SQL above and run it in Supabase SQL Editor to fix the issue!** 🚀


