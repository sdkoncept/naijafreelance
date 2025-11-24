# ⚠️ CRITICAL FIX NEEDED!

## Problem Found

Your `.env` file has a **SECRET KEY** (`sk_live_...`) but you need a **PUBLIC KEY** (`pk_live_...`)!

**Secret keys should NEVER be in frontend code!** They're for backend only.

---

## 🔧 Fix This Now

### Step 1: Get Your PUBLIC Key (Not Secret Key)

1. Go to https://dashboard.paystack.com
2. **Switch to LIVE MODE** (toggle in top right)
3. Go to **Settings** → **API Keys & Webhooks**
4. Look for **"Public Key"** (NOT Secret Key)
5. Copy the **Public Key** - it starts with `pk_live_...`

### Step 2: Update .env File

**Edit your `.env` file** and change:

```env
# WRONG (what you have now):
VITE_PAYSTACK_PUBLIC_KEY=sk_live_your_secret_key_here

# CORRECT (what you need):
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here
```

**Important:**
- ✅ Use **PUBLIC** key (`pk_live_...`)
- ❌ Don't use **SECRET** key (`sk_live_...`)

### Step 3: Rebuild

```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"
npm run build
```

### Step 4: Upload

Then upload the new `dist/` folder (see upload guide).

---

## Why This Matters

- **Public Key** (`pk_live_...`) = Safe for frontend, used to initialize payments
- **Secret Key** (`sk_live_...`) = Backend only, used to verify payments server-side
- **Never expose secret keys in frontend code!**

---

## After Fixing

1. Update `.env` with PUBLIC key
2. Rebuild: `npm run build`
3. Upload `dist/` folder
4. Test on live site

**Fix this first, then we'll help you upload!**


