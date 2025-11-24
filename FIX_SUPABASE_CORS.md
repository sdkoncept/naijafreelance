# 🔧 Fix Supabase CORS Error

## The Problem

You're getting CORS errors because your domain `naijafreelance.sdkoncept.com` is not allowed in Supabase's CORS settings.

**Error:** `CORS Missing Allow Origin`
**Status Code:** 556 (Supabase-specific error)

---

## ✅ Solution: Add Domain to Supabase

### Step 1: Go to Supabase Dashboard

1. **Visit:** https://supabase.com/dashboard
2. **Log in** to your account
3. **Select your project** (the one with URL: `bkdhxrhdoqeyfsrfipku.supabase.co`)

### Step 2: Go to API Settings

1. **Click "Settings"** (gear icon in left sidebar)
2. **Click "API"** (under Settings)
3. **Scroll down to "CORS"** section

### Step 3: Add Your Domain

1. **Find "Additional Allowed Origins"** or **"Allowed Origins"**
2. **Add your domain:**
   ```
   https://naijafreelance.sdkoncept.com
   ```
3. **Also add (if not already there):**
   ```
   https://naijafreelance.sdkoncept.com/*
   ```
   Or just:
   ```
   https://naijafreelance.sdkoncept.com
   ```
4. **Click "Save"**

### Step 4: Wait and Test

1. **Wait 1-2 minutes** for changes to propagate
2. **Refresh your site**
3. **Check console** - CORS errors should be gone

---

## 🔍 Alternative: Check Project Status

**If you can't find CORS settings, check:**

1. **Is your Supabase project active?**
   - Go to Dashboard
   - Check if project shows "Active" status
   - If paused, you need to resume it

2. **Check API Settings:**
   - Settings → API
   - Verify your API URL is correct
   - Check if there are any restrictions

---

## 📋 Common Supabase CORS Settings

**In Supabase Dashboard → Settings → API:**

Look for:
- **"Additional Allowed Origins"**
- **"CORS Origins"**
- **"Allowed Origins"**

**Add:**
```
https://naijafreelance.sdkoncept.com
```

**Or if you want to allow all subdomains:**
```
https://*.sdkoncept.com
```

---

## ⚠️ Important Notes

1. **Don't use wildcards in production** (security risk)
2. **Add exact domain:** `https://naijafreelance.sdkoncept.com`
3. **Include protocol:** Must include `https://`
4. **No trailing slash:** Don't add `/` at the end

---

## 🧪 Test After Fixing

1. **Add domain in Supabase**
2. **Wait 1-2 minutes**
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Refresh page**
5. **Check console** - should see successful API calls

---

## 🆘 Still Not Working?

**If you still see CORS errors:**

1. **Check Supabase project status** (not paused?)
2. **Verify domain is correct** (no typos?)
3. **Check if you have multiple Supabase projects** (using the right one?)
4. **Try adding both with and without `www`:**
   - `https://naijafreelance.sdkoncept.com`
   - `https://www.naijafreelance.sdkoncept.com` (if you use www)

**Tell me what you see in Supabase dashboard and I'll help!** 🚀

