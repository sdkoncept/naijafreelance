-- Create Admin User
-- This script shows how to create an admin user
-- Replace 'YOUR_USER_EMAIL' with the email of the user you want to make admin

-- Step 1: Find the user ID from their email (after they've signed up)
-- Replace 'your-email@example.com' with the actual email
-- Then run Step 2 to assign admin role

-- Step 2: Assign admin role to a user
-- Uncomment and replace USER_ID_HERE with the actual user ID from Step 1

/*
-- Example: Assign admin role to a user
INSERT INTO public.user_roles (user_id, role)
VALUES (
  'USER_ID_HERE', -- Replace with actual user ID
  'admin'
)
ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
*/

-- Alternative: Create admin role for user by email (if you know their email)
-- This requires the user to already exist in auth.users and profiles
/*
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE email = 'your-email@example.com'; -- Replace with actual email
  
  IF v_user_id IS NOT NULL THEN
    -- Insert or update admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO UPDATE SET role = 'admin';
    
    RAISE NOTICE 'Admin role assigned to user: %', v_user_id;
  ELSE
    RAISE NOTICE 'User not found with email: your-email@example.com';
  END IF;
END $$;
*/

