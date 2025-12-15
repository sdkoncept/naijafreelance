# Portfolio Feature - Live Site Diagnostic & Fix Guide

## 🔍 Step 1: Check Browser Console

1. Open your live site
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Navigate to Profile > Portfolio tab
5. Look for **red error messages**

### Common Errors & Fixes:

#### Error: "relation 'portfolio_items' does not exist"
**Problem:** Database migration not run  
**Fix:** 
1. Go to Supabase Dashboard > SQL Editor
2. Copy content from: `supabase/migrations/20251126000001_create_portfolio_table.sql`
3. Paste and run the SQL
4. Verify: Run `SELECT * FROM portfolio_items LIMIT 1;` (should not error)

#### Error: "Bucket 'portfolio' not found"
**Problem:** Storage bucket doesn't exist  
**Fix:**
1. Go to Supabase Dashboard > Storage
2. Click "New bucket"
3. Name: `portfolio`
4. Set to **Public**
5. Click "Create bucket"

#### Error: "permission denied" or "RLS policy violation"
**Problem:** Row Level Security blocking access  
**Fix:**
1. Go to Supabase Dashboard > Authentication > Policies
2. Find `portfolio_items` table
3. Ensure these policies exist:
   - **SELECT**: `Portfolio items are publicly viewable` (USING: true)
   - **INSERT**: `Users can insert their own portfolio items` (WITH CHECK: auth.uid() = freelancer_id)
   - **UPDATE**: `Users can update their own portfolio items` (USING: auth.uid() = freelancer_id)
   - **DELETE**: `Users can delete their own portfolio items` (USING: auth.uid() = freelancer_id)

## 🔍 Step 2: Verify Database Setup

Run these SQL queries in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'portfolio_items'
);

-- Check if policies exist
SELECT * FROM pg_policies 
WHERE tablename = 'portfolio_items';

-- Test insert (should work if everything is set up)
INSERT INTO portfolio_items (
  freelancer_id, 
  title, 
  media_type, 
  media_url
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with your user ID
  'Test Item',
  'image',
  'https://example.com/test.jpg'
) RETURNING *;
```

## 🔍 Step 3: Verify Storage Setup

1. Go to Supabase Dashboard > Storage
2. Check if `portfolio` bucket exists
3. If it exists, check:
   - Is it **Public**?
   - Are there any policies blocking uploads?
4. Test upload manually:
   - Go to Storage > portfolio bucket
   - Try uploading a test file
   - If it fails, check error message

## 🔍 Step 4: Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Navigate to Profile > Portfolio tab
4. Look for failed requests (red)
5. Click on failed request
6. Check:
   - **Status code** (404 = table/bucket missing, 403 = permission denied)
   - **Response** tab for error message

## 🔍 Step 5: Verify User Type

1. Check if your account is set as "freelancer"
2. Go to Profile page
3. Look for account type badge
4. If it says "client", you need to:
   - Update your profile user_type to "freelancer"
   - Or contact admin to update it

## 🔍 Step 6: Test Component Rendering

1. Open Developer Tools > Console
2. Type: `localStorage.getItem('supabase.auth.token')`
3. Check if you're logged in
4. Check if PortfolioManager component is rendering:
   - Look for "Portfolio Gallery" heading
   - Look for "Add Portfolio Item" button

## 🛠️ Quick Fix Checklist

Run through this checklist:

- [ ] Database migration `20251126000001_create_portfolio_table.sql` has been run
- [ ] `portfolio_items` table exists (verify with SQL query)
- [ ] RLS policies are set up correctly
- [ ] Storage bucket `portfolio` exists
- [ ] Storage bucket is set to **Public**
- [ ] Storage bucket has correct policies
- [ ] Your account type is "freelancer" (not "client")
- [ ] You're logged in
- [ ] No console errors when opening Portfolio tab
- [ ] "Add Portfolio Item" button is visible

## 🚨 Most Common Issues

### Issue 1: "Table doesn't exist"
**Solution:** Run the migration SQL in Supabase Dashboard

### Issue 2: "Bucket not found"
**Solution:** Create the `portfolio` bucket in Supabase Storage

### Issue 3: "Permission denied"
**Solution:** Check RLS policies for `portfolio_items` table

### Issue 4: "Portfolio tab not visible"
**Solution:** Verify your account type is "freelancer"

### Issue 5: "Button not showing"
**Solution:** 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check console for JavaScript errors

## 📝 What to Share for Debugging

If it's still not working, share:

1. **Console errors** (F12 > Console tab > screenshot)
2. **Network errors** (F12 > Network tab > failed requests)
3. **Database status:**
   - Does `portfolio_items` table exist? (SQL query result)
   - Do RLS policies exist? (SQL query result)
4. **Storage status:**
   - Does `portfolio` bucket exist?
   - Is it public?
5. **Your account type:** freelancer or client?
6. **What you see:** 
   - Do you see the Portfolio tab?
   - Do you see the "Add Portfolio Item" button?
   - What error messages appear?

## 🔧 Manual Setup Commands

If you have Supabase CLI access:

```bash
# Run migration
supabase db push

# Or manually in SQL Editor:
# Copy and paste: supabase/migrations/20251126000001_create_portfolio_table.sql
```

## ✅ Expected Behavior

When everything is set up correctly:

1. **Portfolio tab** should be visible on Profile page (for freelancers)
2. **"Add Portfolio Item" button** should be visible in top-right
3. **Clicking button** opens upload dialog
4. **Uploading file** should work without errors
5. **Portfolio items** should appear in grid after upload

If any of these don't work, follow the diagnostic steps above.

