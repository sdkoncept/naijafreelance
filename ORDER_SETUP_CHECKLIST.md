# Order Functionality Setup Checklist

Follow these steps to get orders and payments working:

## ✅ Step 1: Run Database Migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `supabase/migrations/20251124000005_create_orders_and_payments.sql`
3. Copy the entire SQL content
4. Paste into SQL Editor
5. Click **Run**
6. Verify success message

**Verify tables exist:**
- Go to **Table Editor**
- You should see `orders` and `payments` tables

## ✅ Step 2: Configure Paystack

1. Sign up/login at https://dashboard.paystack.com
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** (starts with `pk_test_` for testing)
4. Create/update `.env` file in project root:
   ```env
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
   ```
5. Restart your development server

## ✅ Step 3: Test Order Creation

1. **Start dev server:** `npm run dev`
2. **Login** as a client (not freelancer)
3. **Browse** to a gig you didn't create
4. **Select** a package (Basic/Standard/Premium)
5. **Click** "Place Order"
6. **Fill** requirements (optional)
7. **Click** "Create Order & Proceed to Payment"
8. **Complete** payment with Paystack test card:
   - Card: `4084084084084081`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)

## ✅ Step 4: Verify Everything Works

- [ ] Order is created successfully
- [ ] Order appears in "My Orders" page
- [ ] Payment dialog opens
- [ ] Payment can be completed
- [ ] Order status updates to "in_progress" after payment
- [ ] Payment record created in database

## 🔍 Troubleshooting

If something doesn't work:

1. **Check browser console** (F12) for errors
2. **Check Supabase logs** in Dashboard
3. **Verify environment variables** are set correctly
4. **See** `ORDER_TROUBLESHOOTING.md` for detailed help

## Common Issues

### "Orders table not found"
→ Run the database migration (Step 1)

### "Paystack public key not configured"
→ Add `VITE_PAYSTACK_PUBLIC_KEY` to `.env` (Step 2)

### "Layout was forced before page loaded"
→ This is a harmless warning, functionality should still work

### Payment dialog doesn't open
→ Check browser console for script loading errors
→ Verify Paystack public key is correct
→ Check internet connection

## Need Help?

- See `ORDER_TROUBLESHOOTING.md` for detailed solutions
- Check browser console for specific error messages
- Verify all steps above are completed

