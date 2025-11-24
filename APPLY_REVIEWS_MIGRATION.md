# Apply Reviews Migration to Supabase

## The Problem

The migration command tried to connect to a local database, but you're using a remote Supabase project.

---

## ✅ Solution: Apply Migration via Supabase Dashboard

### Step 1: Go to Supabase Dashboard

1. **Visit:** https://supabase.com/dashboard
2. **Log in** to your account
3. **Click on your project** (the one with URL: `bkdhxrhdoqeyfsrfipku.supabase.co`)

### Step 2: Open SQL Editor

1. **Click "SQL Editor"** in the left sidebar
2. **Click "New Query"** (or use the existing query editor)

### Step 3: Copy and Paste Migration

**Copy the entire contents of this file:**
`supabase/migrations/20251124000008_create_reviews_table.sql`

**Paste it into the SQL Editor**

### Step 4: Run the Migration

1. **Click "Run"** button (or press Ctrl+Enter)
2. **Wait for it to complete**
3. **You should see:** "Success. No rows returned"

---

## 📋 What the Migration Does

1. **Creates reviews table** (if it doesn't exist)
2. **Adds updated_at column** (if missing)
3. **Updates RLS policies** to allow reviews for delivered/completed orders
4. **Creates indexes** for faster queries
5. **Adds trigger** for auto-updating timestamps

---

## ✅ Verify It Worked

**After running the migration:**

1. **Go to "Table Editor"** in Supabase Dashboard
2. **Look for "reviews" table** in the list
3. **Click on it** to see the structure
4. **Should have columns:**
   - id
   - order_id
   - reviewer_id
   - reviewee_id
   - rating
   - comment
   - created_at
   - updated_at

---

## 🆘 If You Get Errors

**Common errors:**

1. **"relation already exists"** → Table already exists, that's okay!
2. **"column already exists"** → Column already exists, that's okay!
3. **"policy already exists"** → Policy already exists, migration will update it

**The migration is designed to be safe** - it checks if things exist before creating them.

---

## Alternative: Use Supabase CLI with Remote

**If you want to use CLI with remote project:**

```bash
# Link to your remote project
npx supabase link --project-ref bkdhxrhdoqeyfsrfipku

# Then run migration
npx supabase db push
```

**But using the Dashboard SQL Editor is easier!**

---

**Copy the migration file content and paste it into Supabase SQL Editor!** 🚀

