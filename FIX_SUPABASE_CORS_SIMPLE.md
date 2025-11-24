# 🔧 Fix Supabase CORS - Simple Steps

## The Real Fix: Add Domain to Auth Settings

Supabase doesn't have a "CORS settings" section. Instead, you need to add your domain to **Authentication settings**.

---

## ✅ Step-by-Step Fix

### Step 1: Go to Supabase Dashboard

1. **Visit:** https://supabase.com/dashboard
2. **Log in**
3. **Click on your project** (the one with URL: `bkdhxrhdoqeyfsrfipku.supabase.co`)

### Step 2: Go to Authentication Settings

1. **Click "Authentication"** in the left sidebar (person icon)
2. **Click "URL Configuration"** (under Authentication)

### Step 3: Add Your Domain

**Find "Redirect URLs" section:**

1. **Click "Add URL"** or the **"+" button**
2. **Add your domain:**
   ```
   https://naijafreelance.sdkoncept.com
   ```
3. **Also add (for callbacks):**
   ```
   https://naijafreelance.sdkoncept.com/**
   ```
   Or just:
   ```
   https://naijafreelance.sdkoncept.com/*
   ```
4. **Click "Save"**

---

## 🔍 Alternative: Check Project Status

**If you still get errors, check:**

1. **Is your project active?**
   - Go to Dashboard
   - Check if project shows "Active" (not "Paused")
   - If paused, click "Resume" or "Activate"

2. **Check API Settings:**
   - Settings → API
   - Verify your API URL is correct
   - Check if there are any rate limits or restrictions

---

## 📋 What to Add in "Redirect URLs"

**Add these URLs (one per line):**

```
https://naijafreelance.sdkoncept.com
https://naijafreelance.sdkoncept.com/**
```

**Or if you want to be more specific:**

```
https://naijafreelance.sdkoncept.com
https://naijafreelance.sdkoncept.com/auth
https://naijafreelance.sdkoncept.com/payment/callback
```

---

## ⚠️ Important Notes

1. **Include `https://`** - Don't forget the protocol
2. **No trailing slash** - Don't add `/` at the end (unless using `/**`)
3. **Wildcards:** Use `/**` to allow all paths under your domain
4. **Save changes** - Click "Save" after adding

---

## 🧪 Test After Fixing

1. **Add domain in Authentication → URL Configuration**
2. **Wait 1-2 minutes** for changes to propagate
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Refresh your site**
5. **Check console** - CORS errors should be gone

---

## 🆘 Still Not Working?

**If you still see CORS errors:**

1. **Check project status** - Is it active?
2. **Verify domain spelling** - No typos?
3. **Try adding both with and without wildcard:**
   - `https://naijafreelance.sdkoncept.com`
   - `https://naijafreelance.sdkoncept.com/**`
4. **Check if you're using the correct Supabase project**

**Tell me:**
- Can you find "Authentication → URL Configuration"?
- What do you see there?
- Is your project showing as "Active"?

**I'll help you fix it!** 🚀

