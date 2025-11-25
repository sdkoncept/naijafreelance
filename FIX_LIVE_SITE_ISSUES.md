# Fix Live Site Issues - Missing Features

## Problem
Some features are not visible on the live site, including:
- Client verification status
- Other UI elements

## Possible Causes

### 1. **Build/Deployment Issues**
- Changes not deployed yet
- Build errors preventing features from showing
- Cached old version

### 2. **Database/Profile Issues**
- `verification_status` column might not exist in `profiles` table
- Profile data not loading correctly
- RLS policies blocking profile access

### 3. **Environment Variables**
- Missing Supabase environment variables
- Wrong Supabase URL/key

## Solutions

### Step 1: Check Database Schema
Run this SQL in Supabase to ensure `verification_status` column exists:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'verification_status';

-- If it doesn't exist, add it
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';

-- Update existing users to have a default status
UPDATE public.profiles 
SET verification_status = 'unverified' 
WHERE verification_status IS NULL;
```

### Step 2: Verify Environment Variables in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure these are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

### Step 3: Check Build Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check "Build Logs" for any errors
4. Look for TypeScript errors, missing imports, etc.

### Step 4: Clear Cache and Redeploy
```bash
# Force a new deployment
git commit --allow-empty -m "Force redeploy to clear cache"
git push
```

### Step 5: Verify Profile Loading
Check browser console (F12) for errors:
- Network tab: Check if profile API calls are successful
- Console tab: Look for JavaScript errors
- Application tab: Check localStorage for auth data

### Step 6: Test Profile Fetch
Add this to check if profile is loading:

```typescript
// In browser console on live site
// Check if profile loads
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'YOUR_USER_ID')
  .single();
console.log('Profile:', data);
```

## Quick Fixes Applied

1. ✅ Added verification status banner to Client Dashboard
2. ✅ Added verification status badge to user dropdown menu
3. ✅ Verification alert on Gig Detail page (already exists)
4. ✅ Verification status in Profile page (already exists)

## What to Check on Live Site

1. **Client Dashboard** (`/client/orders`):
   - Should show verification status banner at top
   - Green for verified, Amber for pending, Red for unverified

2. **User Dropdown Menu** (top right):
   - Should show verification badge for clients
   - "✓ Verified", "⏳ Pending", or "⚠ Unverified"

3. **Gig Detail Page**:
   - Should show verification alert for unverified clients
   - "Request Verification" button

4. **Profile Page**:
   - Should show verification status card

## If Still Not Showing

1. **Hard refresh browser**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache**: Settings → Clear browsing data
3. **Check if logged in**: Make sure you're authenticated
4. **Check user type**: Make sure profile shows `user_type = 'client'`
5. **Check database**: Verify `verification_status` column exists and has data

## Database Migration to Run

If `verification_status` column doesn't exist, run this migration:

```sql
-- Add verification_status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN verification_status TEXT DEFAULT 'unverified';
    
    -- Set default for existing users
    UPDATE public.profiles 
    SET verification_status = 'unverified' 
    WHERE verification_status IS NULL;
  END IF;
END $$;
```

## Next Steps

1. Deploy the latest changes (with verification banner)
2. Run the database migration if needed
3. Test on live site
4. Check browser console for errors
5. Verify environment variables are set

