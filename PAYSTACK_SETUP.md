# Paystack Payment Gateway Setup

This guide will help you set up Paystack payment integration for NaijaFreelance.

## Prerequisites

1. A Paystack account (sign up at https://paystack.com)
2. Access to your Paystack dashboard

## Step 1: Get Your Paystack API Keys

1. Log in to your Paystack dashboard: https://dashboard.paystack.com
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
4. Copy your **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)

## Step 2: Add Environment Variables

Add your Paystack public key to your `.env` file:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

**Important Notes:**
- For production, use your **live** public key (`pk_live_...`)
- For development/testing, use your **test** public key (`pk_test_...`)
- Never commit your secret key to the frontend - it should only be used on the backend
- The public key is safe to use in the frontend

## Step 3: Configure Webhook (Optional but Recommended)

To verify payments server-side, set up a webhook:

1. In Paystack dashboard, go to **Settings** → **API Keys & Webhooks**
2. Click **Add Webhook URL**
3. Enter your webhook URL: `https://your-domain.com/api/paystack/webhook`
4. Select events to listen to:
   - `charge.success` - When payment is successful
   - `charge.failed` - When payment fails
5. Save the webhook

## Step 4: Test the Integration

### Test Mode

1. Use test API keys (starts with `pk_test_`)
2. Use Paystack test cards:
   - **Success**: `4084084084084081`
   - **Decline**: `5060666666666666666`
   - **Insufficient Funds**: `5060666666666666667`
   - Use any future expiry date (e.g., 12/25)
   - Use any 3-digit CVV (e.g., 123)
   - Use any PIN (e.g., 0000)

### Test Flow

1. Browse services on your marketplace
2. Select a gig and choose a package
3. Click "Place Order"
4. Fill in order requirements (optional)
5. Click "Create Order & Proceed to Payment"
6. Complete payment using test card
7. Verify order status updates to "in_progress"

## Step 5: Go Live

When ready for production:

1. Switch to live API keys in your `.env` file
2. Update webhook URL to production domain
3. Test with a small real transaction first
4. Monitor transactions in Paystack dashboard

## Payment Flow

1. **Order Creation**: Client creates an order from a gig
2. **Payment Initiation**: Paystack payment dialog opens
3. **Payment Processing**: Client completes payment via Paystack
4. **Payment Verification**: System verifies payment via callback
5. **Order Update**: Order status changes from "pending" to "in_progress"
6. **Payment Record**: Payment record created in database

## Commission Structure

- **Platform Commission**: 20% of order amount
- **Freelancer Earnings**: 80% of order amount
- Commission is automatically calculated when order is created

## Troubleshooting

### Payment Not Processing

1. Check that `VITE_PAYSTACK_PUBLIC_KEY` is set in `.env`
2. Verify the key is correct (no extra spaces)
3. Check browser console for errors
4. Ensure Paystack script loads correctly

### Payment Succeeds but Order Not Updated

1. Check Supabase database for payment record
2. Verify order status in database
3. Check browser console for errors
4. Verify RLS policies allow payment creation

### Webhook Not Working

1. Check webhook URL is correct
2. Verify webhook is active in Paystack dashboard
3. Check server logs for webhook events
4. Ensure webhook endpoint is publicly accessible

## Security Best Practices

1. ✅ **DO**: Use public key in frontend
2. ✅ **DO**: Verify payments server-side via webhook
3. ✅ **DO**: Use HTTPS in production
4. ❌ **DON'T**: Expose secret key in frontend
5. ❌ **DON'T**: Trust client-side payment verification alone
6. ❌ **DON'T**: Skip webhook verification in production

## Support

- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Paystack Status: https://status.paystack.com

