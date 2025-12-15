# Portfolio Feature Troubleshooting Guide

## Console Warning (Not an Error)
The message you're seeing:
```
Partitioned cookie or storage access was provided to "https://vercel.live/..."
```

This is a **harmless browser warning** from Vercel's live feedback widget. It's about third-party cookie/storage access and does NOT affect your portfolio functionality. You can safely ignore it.

## Common Issues & Solutions

### Issue 1: "Portfolio tab not visible"
**Symptoms:** You don't see the Portfolio tab on your Profile page

**Solution:**
1. Check your account type:
   - Go to Profile page
   - Look for your account type badge
   - It should say "freelancer"
   
2. If it says "client" or is missing:
   - You need to set your account type to "freelancer"
   - Go to Profile > Overview tab
   - If you see an "Account Type" dropdown, select "Freelancer"
   - Or contact an admin to update your account type

### Issue 2: "Add Portfolio Item button not showing"
**Symptoms:** You see the Portfolio tab but no button to add items

**Solution:**
- The button should ALWAYS be visible in the top-right of the Portfolio tab
- If you don't see it, try:
  1. Refresh the page (Ctrl+R or Cmd+R)
  2. Clear browser cache
  3. Check browser console for errors (F12)

### Issue 3: "Error loading portfolio" or "Failed to load portfolio"
**Symptoms:** Error message when opening Portfolio tab

**Possible Causes:**
1. **Database migration not run:**
   - The `portfolio_items` table doesn't exist
   - **Fix:** Run the migration in Supabase Dashboard:
     - Go to SQL Editor
     - Run: `supabase/migrations/20251126000001_create_portfolio_table.sql`

2. **RLS (Row Level Security) issues:**
   - Check Supabase Dashboard > Authentication > Policies
   - Ensure policies exist for `portfolio_items` table

### Issue 4: "Failed to save portfolio item" or upload errors
**Symptoms:** Can't upload files to portfolio

**Possible Causes:**
1. **Storage bucket doesn't exist:**
   - The `portfolio` bucket must be created in Supabase Storage
   - **Fix:**
     1. Go to Supabase Dashboard > Storage
     2. Click "New bucket"
     3. Name it: `portfolio`
     4. Set to **Public** (or configure RLS policies)
     5. Save

2. **Storage permissions:**
   - Check bucket policies allow authenticated users to upload
   - **Fix:** In Storage > portfolio bucket > Policies:
     - INSERT: Allow authenticated users
     - UPDATE: Allow authenticated users (own files only)
     - DELETE: Allow authenticated users (own files only)

3. **File size too large:**
   - Default limit is 10MB
   - **Fix:** Use smaller files or increase limit in code

### Issue 5: "Table 'portfolio_items' does not exist"
**Symptoms:** Database error when trying to add/view portfolio

**Solution:**
1. Run the migration:
   ```sql
   -- Copy content from: supabase/migrations/20251126000001_create_portfolio_table.sql
   -- Paste in Supabase Dashboard > SQL Editor > Run
   ```

2. Verify table exists:
   ```sql
   SELECT * FROM portfolio_items LIMIT 1;
   ```

## Quick Checklist

Before reporting issues, verify:

- [ ] Your account type is "freelancer" (not "client")
- [ ] You can see the Portfolio tab on Profile page
- [ ] The "Add Portfolio Item" button is visible
- [ ] Database migration has been run (`portfolio_items` table exists)
- [ ] Storage bucket `portfolio` exists in Supabase
- [ ] No console errors (F12 > Console tab)
- [ ] Browser cache cleared

## Testing Steps

1. **Navigate to Profile:**
   - Click your avatar (top right)
   - Click "Profile"

2. **Check for Portfolio tab:**
   - Should see tabs: Overview | **Portfolio** | Reviews | Pricing
   - Click "Portfolio" tab

3. **Verify button visibility:**
   - Should see "Add Portfolio Item" button (top right)
   - Or "Add Your First Portfolio Item" button (if empty)

4. **Test upload:**
   - Click "Add Portfolio Item"
   - Drag & drop or select a file
   - Fill in title (required)
   - Click "Add Item"
   - Should see success message

## Still Having Issues?

If you've checked everything above and still have problems:

1. **Check browser console for errors:**
   - Press F12
   - Go to Console tab
   - Look for red error messages
   - Share the error message

2. **Check Network tab:**
   - Press F12 > Network tab
   - Try to add a portfolio item
   - Look for failed requests (red)
   - Check the error response

3. **Verify Supabase setup:**
   - Database: Check if `portfolio_items` table exists
   - Storage: Check if `portfolio` bucket exists
   - Policies: Verify RLS policies are set correctly

## Contact Support

If none of the above solutions work, provide:
- Your account email
- Screenshot of the error
- Browser console errors (F12 > Console)
- Network tab errors (F12 > Network)

