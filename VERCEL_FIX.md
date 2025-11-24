# 🚀 Fix Paystack on Vercel - Step by Step

## The Problem

You're hosting on **Vercel**, not cPanel! This means:
- ❌ Uploading `dist/` folder manually won't work
- ❌ `.env` file on your computer doesn't affect the live site
- ✅ You need to set environment variables in **Vercel Dashboard**
- ✅ Vercel builds automatically from your code

---

## ✅ Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. **Visit:** https://vercel.com
2. **Log in** to your account
3. **Find your project** (`naijafreelance` or similar)
4. **Click on the project**

### Step 2: Go to Settings

1. **Click "Settings"** tab (top menu)
2. **Click "Environment Variables"** (left sidebar)

### Step 3: Add Paystack Key

1. **Click "Add New"** button
2. **Enter:**
   - **Key:** `VITE_PAYSTACK_PUBLIC_KEY`
   - **Value:** `pk_test_b35b82a6c7851235d65fa897b7c76360dae5b568` (or your live key)
   - **Environment:** Select **ALL** (Production, Preview, Development)
3. **Click "Save"**

### Step 4: Redeploy

**After adding the environment variable:**

1. **Go to "Deployments"** tab
2. **Click the three dots** (⋯) on the latest deployment
3. **Click "Redeploy"**
4. **OR** push a new commit to trigger a rebuild

---

## 🔄 Alternative: Push to GitHub (If Connected)

**If your project is connected to GitHub:**

1. **Make sure your code is committed:**
   ```bash
   git add .
   git commit -m "Add Paystack test page"
   git push
   ```

2. **Vercel will automatically rebuild** with the new environment variable

---

## ⚠️ Important Notes

### For Production (Live Site):
- Use **LIVE key**: `pk_live_...` (from Paystack dashboard in Live Mode)
- Set it in **Production** environment in Vercel

### For Testing:
- Use **TEST key**: `pk_test_...` (from Paystack dashboard in Test Mode)
- Can use in Preview/Development environments

---

## 🧪 Test After Fixing

1. **Wait for deployment to finish** (check Deployments tab)
2. **Visit:** https://naijafreelance.sdkoncept.com/paystack-test
3. **Should work now!** ✅

---

## 📋 Checklist

- [ ] Logged into Vercel dashboard
- [ ] Found your project
- [ ] Went to Settings → Environment Variables
- [ ] Added `VITE_PAYSTACK_PUBLIC_KEY` with your key
- [ ] Selected ALL environments (Production, Preview, Development)
- [ ] Saved the variable
- [ ] Redeployed (or pushed new commit)
- [ ] Tested `/paystack-test` page

---

## 🆘 Still Not Working?

**Tell me:**
1. Did you add the environment variable in Vercel?
2. Did you redeploy after adding it?
3. What does `/paystack-test` show now?
4. What error (if any) do you see?

**I'll help you fix it!** 🚀

