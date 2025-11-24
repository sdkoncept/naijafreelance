# 🔧 Fix Paystack - Do This Now

## Problem Found

You're using a **TEST key** (`pk_test_...`) on your **LIVE site**. Test keys don't work on live sites!

---

## ✅ Quick Fix (3 Steps)

### Step 1: Get Your LIVE Public Key

1. Go to: https://dashboard.paystack.com
2. **Switch to LIVE MODE** (toggle in top right - should say "Live" not "Test")
3. Go to **Settings** → **API Keys & Webhooks**
4. Find **"Public Key"** (NOT Secret Key)
5. Copy it - it should start with `pk_live_...`

### Step 2: Update .env File

**Edit your `.env` file** and change:

```env
# Change from (TEST key):
VITE_PAYSTACK_PUBLIC_KEY=pk_test_b35b82a6c7851235d65fa897b7c76360dae5b568

# To (LIVE key):
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_actual_live_key_here
```

**Replace `pk_live_your_actual_live_key_here` with your actual live key!**

### Step 3: Rebuild and Re-upload

```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"

# Rebuild with the new key
npm run build

# Verify the key is in the build
grep -r "pk_live_" dist/assets/*.js
```

**Should show your live key!**

Then **re-upload the `dist/` folder** to your server (same way you did before).

---

## 🔍 What Error Are You Seeing?

**On your live site**, when you try to pay:

1. **Press F12** (open browser console)
2. **Go to Console tab**
3. **Try to place an order**
4. **Copy the exact error message**

**Common errors:**
- "Invalid API key"
- "Test key used in live mode"
- "Paystack public key not configured"
- "Payment failed"

**Tell me the exact error message and I'll help fix it!**

---

## ⚠️ Important

- **Test key** (`pk_test_...`) = Only works in test mode
- **Live key** (`pk_live_...`) = Works on live site with real payments
- **You MUST use live key on live site!**

---

## After Fixing

1. Update `.env` with LIVE key
2. Rebuild: `npm run build`
3. Re-upload `dist/` folder
4. Clear browser cache
5. Test payment

**Do this and tell me what error you see (if any)!** 🚀


