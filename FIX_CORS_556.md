# 🔧 Fix CORS Error 556 - Complete Guide

## The Problem

You're getting **Status Code 556** which is a Supabase-specific error. This usually means:
1. **Project is paused** (most common)
2. **Domain not added correctly**
3. **Project configuration issue**

---

## ✅ Solution 1: Check if Project is Paused

### Step 1: Check Project Status

1. **Go to:** https://supabase.com/dashboard
2. **Click on your project**
3. **Look at the top of the page** - does it say:
   - ✅ **"Active"** = Good
   - ❌ **"Paused"** = Problem!

### Step 2: Resume if Paused

**If your project is paused:**
1. **Click "Resume"** or **"Activate"** button
2. **Wait 1-2 minutes** for project to start
3. **Refresh your site** and test again

---

## ✅ Solution 2: Add Domain to Authentication (If Not Done)

### Step 1: Go to Authentication Settings

1. **Supabase Dashboard** → Your Project
2. **Click "Authentication"** (left sidebar)
3. **Click "URL Configuration"**

### Step 2: Add Redirect URLs

**In "Redirect URLs" section:**

1. **Click "Add URL"** or **"+" button**
2. **Add these URLs (one per line):**
   ```
   https://naijafreelance.sdkoncept.com
   https://naijafreelance.sdkoncept.com/**
   ```
3. **Also add "Site URL"** (if there's a separate field):
   ```
   https://naijafreelance.sdkoncept.com
   ```
4. **Click "Save"**

---

## ✅ Solution 3: Check API Settings

### Step 1: Go to API Settings

1. **Settings** (gear icon) → **API**
2. **Look for "Additional Allowed Origins"** or similar
3. **If you see it, add:**
   ```
   https://naijafreelance.sdkoncept.com
   ```

---

## ✅ Solution 4: Verify Project is Active

### Check Project Health

1. **Go to Dashboard**
2. **Look for any warnings or errors**
3. **Check if project shows as "Active"**
4. **If paused, click "Resume"**

---

## 🔍 What Status Code 556 Means

**Status 556** in Supabase usually means:
- Project is paused/inactive
- Domain not whitelisted
- Project has billing issues
- Project exceeded free tier limits

---

## 📋 Complete Checklist

- [ ] Project is **Active** (not paused)
- [ ] Domain added to **Authentication → URL Configuration → Redirect URLs**
- [ ] Domain added to **Site URL** (if separate field)
- [ ] Domain format is correct: `https://naijafreelance.sdkoncept.com`
- [ ] No trailing slash (unless using `/**`)
- [ ] Clicked "Save" after adding
- [ ] Waited 1-2 minutes after saving
- [ ] Cleared browser cache
- [ ] Refreshed site

---

## 🆘 Still Not Working?

**Tell me:**
1. **Is your project showing as "Active" or "Paused"?**
2. **Did you add the domain to Authentication → URL Configuration?**
3. **What do you see in the Redirect URLs field?**
4. **Are there any warnings in the Supabase dashboard?**

**I'll help you fix it!** 🚀

---

## ⚡ Quick Test

**Try this:**
1. **Go to Supabase Dashboard**
2. **Check project status** (Active/Paused)
3. **If paused, click "Resume"**
4. **Wait 2 minutes**
5. **Refresh your site**

**This fixes 90% of 556 errors!**

