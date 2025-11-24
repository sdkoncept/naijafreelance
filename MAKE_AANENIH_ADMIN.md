# Make aanenih@live.com Superuser Admin

## Quick Setup

To make `aanenih@live.com` a superuser admin, run this SQL in your Supabase SQL Editor:

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Log in to your account
3. Click on your project
4. Click **"SQL Editor"** in the left sidebar
5. Click **"New Query"**

### Step 2: Copy and Run This SQL

```sql
-- Make aanenih@live.com a superuser admin
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE email = 'aanenih@live.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Update user_type to 'admin' in profiles table
    UPDATE public.profiles
    SET user_type = 'admin'
    WHERE id = v_user_id;
    
    -- Insert or update admin role in user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Admin role and user_type assigned to aanenih@live.com (User ID: %)', v_user_id;
  ELSE
    RAISE NOTICE 'User with email aanenih@live.com not found. Please ensure the user has signed up first.';
  END IF;
END $$;
```

### Step 3: Click "Run"

After running, you should see a success message in the output.

---

## What This Does

This SQL script:
1. ✅ Finds the user with email `aanenih@live.com`
2. ✅ Sets `user_type = 'admin'` in the `profiles` table (for marketplace features)
3. ✅ Assigns `role = 'admin'` in the `user_roles` table (for admin access)
4. ✅ Handles conflicts if the role already exists

---

## Verify It Worked

After running the SQL:

1. **Check the user in User Management:**
   - Log in as `aanenih@live.com`
   - Go to `/users` (User Management page)
   - You should see your user with "admin" badge

2. **Check admin access:**
   - You should be able to access:
     - `/users` - User Management
     - `/audit-logs` - Audit Logs
     - All marketplace features

---

## If User Doesn't Exist

If you get "User not found", you need to:

1. **Sign up first:**
   - Go to your app's `/auth` page
   - Sign up with `aanenih@live.com`
   - Complete the registration

2. **Then run the SQL again**

---

## Alternative: Manual Update

If you prefer to do it manually:

1. **Find the user ID:**
```sql
SELECT id, email, full_name 
FROM public.profiles 
WHERE email = 'aanenih@live.com';
```

2. **Update profiles:**
```sql
UPDATE public.profiles
SET user_type = 'admin'
WHERE email = 'aanenih@live.com';
```

3. **Add admin role:**
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM public.profiles
WHERE email = 'aanenih@live.com'
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
```

---

**Copy the SQL above and run it in Supabase SQL Editor!** 🚀


