# Admin User Setup Guide

## How to Create an Admin User

### Method 1: Using SQL (Recommended)

1. **First, sign up a user account** through the app at `/auth`
   - Use the email you want to make admin
   - Complete the signup process

2. **Get the user's ID** by running this SQL in Supabase SQL Editor:
```sql
-- Find user ID by email
SELECT id, email, full_name 
FROM public.profiles 
WHERE email = 'your-email@example.com';
```

3. **Assign admin role** by running this SQL (replace `USER_ID_HERE` with the ID from step 2):
```sql
-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES (
  'USER_ID_HERE', -- Replace with actual user ID
  'admin'
)
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
```

### Method 2: One-Step SQL (If user already exists)

Run this SQL, replacing `'your-email@example.com'` with the actual email:

```sql
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE email = 'your-email@example.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Insert or update admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Admin role assigned to user: %', v_user_id;
  ELSE
    RAISE NOTICE 'User not found. Please sign up first.';
  END IF;
END $$;
```

## Admin Roles Available

- **admin**: Full access to all features
  - User Management (`/users`)
  - Audit Logs (`/audit-logs`)
  - All marketplace features

- **staff**: Limited admin access (if implemented)
- **viewer**: Read-only access

## Admin Features

Once you have admin role, you can access:

1. **User Management** - Manage all users and their roles
2. **Audit Logs** - View all platform activity
3. **Full Marketplace Access** - All freelancer and client features

## Current Admin Pages

- `/users` - User Management (requires admin role)
- `/audit-logs` - Audit Logs (requires admin role)

**Note**: These pages exist but may not be routed in the marketplace app yet. You may need to add routes in `App.tsx`.

