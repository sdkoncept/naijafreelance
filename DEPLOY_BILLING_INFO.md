# Deploy Billing Info Migration

## Step 1: Run Migration in Supabase

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Paste Migration**
   - Open the file: `supabase/migrations/20251125000001_create_billing_info_table.sql`
   - Copy the entire content
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click **Run** button (or press `Ctrl+Enter`)
   - Wait for success message

5. **Verify Table Created**
   - Run this query to verify:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name = 'billing_info';
   ```
   - Should return: `billing_info`

### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd "/home/aanenih/Cursor Projects/naijafreelance"

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

## Step 2: Verify Migration Success

Run these queries in Supabase SQL Editor:

```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'billing_info';

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'billing_info'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'billing_info';

-- Check policies exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'billing_info';
```

## Step 3: Deploy Frontend Changes

After migration is successful:

```bash
# Navigate to project directory
cd "/home/aanenih/Cursor Projects/naijafreelance"

# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Add billing information form and billing history page"

# Push to deploy
git push origin main
```

## Step 4: Test on Live Site

1. **Go to Billing & Payments page**
   - Navigate to `/client/billing`
   - Click on "Billing info" tab

2. **Fill out the form**
   - Enter your billing information
   - Click "Save Billing Information"

3. **Verify it saved**
   - Refresh the page
   - Check that your information is still there

4. **Check Billing History tab**
   - Click on "Billing history" tab
   - Should show empty state with illustration

## Troubleshooting

### If migration fails:

1. **Check for existing table:**
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'billing_info';
   ```
   - If table exists, you may need to drop it first (be careful!)

2. **Check for errors:**
   - Look at the error message in Supabase SQL Editor
   - Common issues:
     - Table already exists (use `DROP TABLE IF EXISTS` first)
     - Permission issues (check RLS policies)
     - Syntax errors (check SQL syntax)

3. **If table exists but migration fails:**
   ```sql
   -- Drop and recreate (WARNING: This deletes all data!)
   DROP TABLE IF EXISTS public.billing_info CASCADE;
   ```
   Then run the migration again.

### If frontend doesn't work:

1. **Check browser console** (F12)
   - Look for errors related to `billing_info` table
   - Check network tab for failed requests

2. **Verify environment variables:**
   - `VITE_SUPABASE_URL` is set
   - `VITE_SUPABASE_PUBLISHABLE_KEY` is set

3. **Check RLS policies:**
   - Make sure policies allow users to insert/update their own billing info

## Complete Migration SQL

If you need to copy the complete migration, here it is:

```sql
-- Create Billing Info Table
-- This table stores client billing information

CREATE TABLE IF NOT EXISTS public.billing_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  company_name TEXT,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  state_region TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  tax_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.billing_info ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own billing info" ON public.billing_info;
  DROP POLICY IF EXISTS "Users can insert their own billing info" ON public.billing_info;
  DROP POLICY IF EXISTS "Users can update their own billing info" ON public.billing_info;
END $$;

-- Create policies
CREATE POLICY "Users can view their own billing info"
  ON public.billing_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing info"
  ON public.billing_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing info"
  ON public.billing_info FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_billing_info_user_id ON public.billing_info(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_billing_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billing_info_updated_at
  BEFORE UPDATE ON public.billing_info
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_info_updated_at();
```

---

**After running the migration, deploy the frontend changes and test!** 🚀

