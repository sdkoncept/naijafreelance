-- Restrict profile updates: Only admins can change/assign profiles for other users
-- Regular users can only update their own profile (but not user_type)

-- Ensure has_role function exists (in case it doesn't)
-- Handle both app_role enum and text types
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role::text
  )
$$;

-- Drop all existing UPDATE policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff and admins can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile (except user_type)" ON public.profiles;

-- Policy 1: Regular users can update their own profile (name, email, bio, etc.)
-- Note: user_type changes are prevented at application level in Profile.tsx
-- This policy only allows non-admins to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id 
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role::text = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = id 
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role::text = 'admin'
    )
  );

-- Policy 2: Admins can update ANY profile, including user_type
-- This allows admins to change profiles for everybody
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role::text = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role::text = 'admin'
    )
  );
