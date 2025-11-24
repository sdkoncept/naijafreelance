# Quick Fix: Paystack Error on Live Site

## The Problem

You have the Paystack public key set up, but you're getting errors on the live site. This is almost always because **environment variables aren't set in production**.

---

## The Solution (3 Steps)

### Step 1: Get Your Live Paystack Key

1. Go to https://dashboard.paystack.com
2. **Switch to Live Mode** (toggle in top right)
3. Go to **Settings** → **API Keys & Webhooks**
4. Copy your **Live Public Key** (starts with `pk_live_...`)

---

### Step 2: Build with the Key

**In your local project**, create/update `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
```

**Then build:**
```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"
npm run build
```

**Important:** The environment variable must be in `.env` **before** you run `npm run build`!

---

### Step 3: Upload to Live Site

Upload the `dist/` folder contents to your live server (via FTP, cPanel, etc.)

---

## Why This Happens

**Vite embeds environment variables at BUILD TIME**, not runtime. So:
- ✅ `.env` file works locally (dev server reads it)
- ❌ `.env` file on server doesn't work (already built)
- ✅ You must build with the variable, then upload

---

## Verify It's Fixed

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Try to place an order
4. Check browser console (F12) - no Paystack errors

---

## Still Not Working?

**Check browser console (F12) and tell me:**
1. What exact error message you see
2. Whether you rebuilt after adding the key
3. Whether you're using `pk_live_...` (not `pk_test_...`)

**I'll help you fix it!** 🚀


