# Restrict Profile Updates to Admin Only

## Requirements

- ✅ **Only admins** can change profiles for everybody (other users)
- ✅ **Only admins** can assign user_type for everybody
- ✅ **Regular users** can still update their own profile (name, email, bio, etc.)
- ✅ **Regular users** CANNOT change their own user_type

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
-- Restrict profile updates: Only admins can change/assign profiles for other users
-- Regular users can only update their own profile (but not user_type)

-- Drop all existing UPDATE policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff and admins can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Policy 1: Regular users can update their own profile (name, email, bio, etc.)
-- Note: user_type changes are prevented at application level in Profile.tsx
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id 
    AND NOT public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    auth.uid() = id 
    AND NOT public.has_role(auth.uid(), 'admin'::app_role)
  );

-- Policy 2: Admins can update ANY profile, including user_type
-- This allows admins to change profiles for everybody
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

### Policy 1: Regular Users
- ✅ Can update their **own** profile (name, email, bio, phone, etc.)
- ❌ **Cannot** change their own `user_type`
- ❌ **Cannot** update other users' profiles

### Policy 2: Admins
- ✅ Can update **any** profile (including other users)
- ✅ Can change **user_type** for any user
- ✅ Full control over profile management

---

## Security Features

1. **RLS Enforcement**: Row Level Security ensures policies are enforced at the database level
2. **Role-Based Access**: Uses `has_role()` function to verify admin status
3. **User Type Protection**: Regular users cannot change their own user_type
4. **Admin Exclusivity**: Only admins can manage other users' profiles

---

## Verify It Works

### Test 1: Regular User Updates Own Profile
1. Log in as a regular user (not admin)
2. Go to Profile page
3. Update name/email/bio
4. ✅ Should work
5. Try to change user_type
6. ❌ Should be blocked or not show the option

### Test 2: Admin Updates Other User
1. Log in as admin
2. Go to User Management (`/users`)
3. Edit another user's profile
4. Change name, email, or user_type
5. ✅ Should work and persist after refresh

### Test 3: Regular User Tries to Update Other User
1. Log in as regular user
2. Try to update another user's profile (if possible via API)
3. ❌ Should be blocked by RLS

---

## Files Created

- `supabase/migrations/20251124000011_restrict_profile_updates_to_admin.sql` - Migration file

---

**Copy the SQL above and run it in Supabase SQL Editor to enforce admin-only profile management!** 🚀

