# ⚠️ IMPORTANT: Before Uploading

## Current Status

I found that your build has a **TEST** key (`pk_test_...`) embedded.

**For your live site, you need a LIVE key (`pk_live_...`)**!

---

## 🔧 Fix This First

### Step 1: Get Your Live Paystack Key

1. Go to https://dashboard.paystack.com
2. **Switch to LIVE MODE** (toggle in top right)
3. Go to **Settings** → **API Keys & Webhooks**
4. Copy your **Live Public Key** (starts with `pk_live_...`)

### Step 2: Update .env File

Edit your `.env` file and change:

```env
# Change from:
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...

# To:
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
```

### Step 3: Rebuild

```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"
npm run build
```

This will create a new `dist/` folder with the LIVE key.

### Step 4: Then Upload

Upload the new `dist/` folder to your live server.

---

## Why This Matters

- **Test key** (`pk_test_...`) = Only works in test mode, won't process real payments
- **Live key** (`pk_live_...`) = Processes real payments on your live site

**You must use the LIVE key on your live site!**

---

## Quick Fix Commands

```bash
# 1. Edit .env file (replace with your live key)
# VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here

# 2. Rebuild
npm run build

# 3. Upload dist/ folder to server
```

---

## After Upload

1. Clear browser cache
2. Test payment on live site
3. Should work with real payments now! ✅

---

**Don't upload yet - rebuild with LIVE key first!** 🚀


