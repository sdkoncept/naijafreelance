-- Make aanenih@live.com a superuser admin
-- This migration assigns admin role and user_type to aanenih@live.com

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


