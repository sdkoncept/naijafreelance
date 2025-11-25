# Quick Deploy Billing Info - Step by Step

## ✅ Step 1: Run Migration in Supabase

### Copy this SQL and run in Supabase SQL Editor:

```sql
-- Create Billing Info Table
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

**How to run:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** → **New Query**
4. Paste the SQL above
5. Click **Run** (or press `Ctrl+Enter`)

---

## ✅ Step 2: Verify Migration

Run this in Supabase SQL Editor:

```sql
-- Should return: billing_info
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'billing_info';
```

---

## ✅ Step 3: Deploy Frontend

```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"

# Check what changed
git status

# Add all changes
git add .

# Commit
git commit -m "Add billing information form and billing history page"

# Push to deploy
git push origin main
```

---

## ✅ Step 4: Test

1. Wait 1-3 minutes for Vercel to deploy
2. Go to `/client/billing` on your live site
3. Click "Billing info" tab
4. Fill out the form and save
5. Check "Billing history" tab

---

**That's it!** 🚀

