# Order Functionality Troubleshooting Guide

## Common Issues and Solutions

### 1. "Orders table not found" Error

**Error Message:** `PGRST205: Could not find the table 'public.orders'`

**Solution:**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/20251124000005_create_orders_and_payments.sql`
4. Verify tables were created by checking the Table Editor

### 2. "Paystack public key not configured" Error

**Error Message:** `Paystack public key not configured`

**Solution:**
1. Create or edit your `.env` file in the project root
2. Add your Paystack public key:
   ```env
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
   ```
3. Restart your development server
4. For production, add the key to your hosting platform's environment variables

### 3. "Layout was forced before the page was fully loaded" Warning

**This is a browser warning, not an error.** It happens when:
- CSS files are still loading
- JavaScript executes before DOM is ready
- Third-party scripts (like Paystack) load asynchronously

**Solution:**
- This warning is usually harmless
- The order functionality should still work
- To minimize: ensure CSS loads before JavaScript execution

### 4. Order Creation Fails Silently

**Symptoms:** Clicking "Create Order" does nothing or shows no error

**Debugging Steps:**
1. Open browser Developer Tools (F12)
2. Check the Console tab for errors
3. Check the Network tab for failed requests
4. Look for Supabase errors (PGRST codes)

**Common Causes:**
- Missing database tables
- RLS (Row Level Security) policies blocking access
- Invalid user authentication
- Missing required fields

### 5. Payment Dialog Doesn't Open

**Symptoms:** Payment button clicked but nothing happens

**Possible Causes:**
1. **Paystack script not loaded:**
   - Check browser console for script loading errors
   - Verify internet connection
   - Check if Paystack CDN is accessible

2. **Missing Paystack public key:**
   - Verify `.env` file has `VITE_PAYSTACK_PUBLIC_KEY`
   - Restart dev server after adding key

3. **Invalid email:**
   - Ensure user has a valid email address
   - Check `user.email` is not null

### 6. Payment Succeeds but Order Status Doesn't Update

**Symptoms:** Payment completes but order stays "pending"

**Solution:**
1. Check browser console for errors
2. Verify payment record was created in `payments` table
3. Check if order update query succeeded
4. Verify RLS policies allow updates

### 7. "You cannot order your own service" Error

**This is intentional behavior:**
- Freelancers cannot order their own gigs
- This prevents self-promotion and fake orders
- If you need to test, use a different account

## Database Verification

Run this SQL in Supabase SQL Editor to verify tables exist:

```sql
-- Check if orders table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'orders'
);

-- Check if payments table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'payments'
);

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'orders';
SELECT * FROM pg_policies WHERE tablename = 'payments';
```

## Testing Order Creation

1. **Verify you're logged in** as a client (not freelancer)
2. **Select a gig** that you didn't create
3. **Choose a package** (Basic, Standard, or Premium)
4. **Click "Place Order"**
5. **Fill in requirements** (optional)
6. **Click "Create Order & Proceed to Payment"**
7. **Check browser console** for any errors

## Environment Variables Checklist

Ensure these are set in your `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

## Still Having Issues?

1. **Check browser console** for detailed error messages
2. **Check Supabase logs** in the Dashboard
3. **Verify database migrations** have been run
4. **Test with a fresh browser session** (clear cache)
5. **Check network tab** for failed API requests

## Quick Test

Run this in browser console on a gig page:

```javascript
// Check if orders table is accessible
const { data, error } = await supabase
  .from('orders')
  .select('id')
  .limit(1);

console.log('Orders table check:', { data, error });
```

If you see `PGRST205` error, the table doesn't exist - run the migration!

