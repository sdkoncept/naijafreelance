# Fix Paystack Errors on Live Site

## Common Issue: Environment Variables Not Set in Production

**The most common problem:** Your `.env` file works locally, but your live site doesn't have access to it. You need to set environment variables in your hosting platform.

---

## Step 1: Identify the Error

**Check your browser console on the live site:**
1. Open your live site: `http://naijafreelance.sdkoncept.com`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for errors related to Paystack

**Common error messages:**
- "Paystack public key not configured"
- "Failed to load payment gateway"
- "Paystack script not loaded"
- "VITE_PAYSTACK_PUBLIC_KEY is undefined"

---

## Step 2: Set Environment Variables on Your Live Site

Since your site is at `naijafreelance.sdkoncept.com`, you're likely using:
- **cPanel** / **FTP hosting**
- **VPS/Server** with direct file access

### Option A: If Using cPanel

1. **Log in to cPanel**
2. Go to **File Manager**
3. Navigate to your site's root folder (usually `public_html` or `www`)
4. Look for `.env` file or create one
5. Add this line:
   ```env
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
   ```
   **Important:** Use your **LIVE** key (`pk_live_...`) not test key!
6. **Save the file**

### Option B: If Using Vite Build (Most Likely)

**The problem:** Vite needs environment variables at **build time**, not runtime!

1. **Build your project locally** with the env variable:
   ```bash
   # Make sure .env file has the key
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here
   
   # Build
   npm run build
   ```

2. **Upload the `dist/` folder** to your live server

3. **OR** set the variable during build:
   ```bash
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key npm run build
   ```

### Option C: If Using a Hosting Platform (Vercel, Netlify, etc.)

1. Go to your hosting platform dashboard
2. Find **Environment Variables** or **Settings** → **Environment**
3. Add new variable:
   - **Name:** `VITE_PAYSTACK_PUBLIC_KEY`
   - **Value:** `pk_live_your_live_key_here`
4. **Redeploy** your site

---

## Step 3: Verify the Fix

1. **Clear your browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** the page (Ctrl+F5)
3. **Try to place an order** on the live site
4. **Check console** - errors should be gone

---

## Step 4: Use the Correct Key Type

**For Live Site:**
- ✅ Use **LIVE** key: `pk_live_...`
- ❌ Don't use **TEST** key: `pk_test_...`

**How to get your live key:**
1. Go to https://dashboard.paystack.com
2. Make sure you're in **Live Mode** (toggle in top right)
3. Go to **Settings** → **API Keys & Webhooks**
4. Copy your **Live Public Key** (starts with `pk_live_`)

---

## Common Errors & Solutions

### Error: "Paystack public key not configured"

**Cause:** Environment variable not set or not accessible

**Fix:**
1. Verify `.env` file exists in project root
2. Check variable name is exactly: `VITE_PAYSTACK_PUBLIC_KEY`
3. For production, rebuild with the variable set
4. Make sure you're using the correct key (live vs test)

### Error: "Failed to load payment gateway"

**Cause:** Paystack script can't load from CDN

**Fix:**
1. Check internet connection
2. Verify Paystack CDN is accessible: https://js.paystack.co/v1/inline.js
3. Check browser console for network errors
4. Try disabling ad blockers

### Error: "Paystack script not loaded"

**Cause:** Script loading timeout or blocked

**Fix:**
1. Check browser console for script errors
2. Verify no ad blockers are blocking Paystack
3. Check network tab for failed requests
4. Try in incognito mode

### Error: Payment dialog opens but payment fails

**Cause:** Using test key on live site or vice versa

**Fix:**
- Use **live key** (`pk_live_...`) on live site
- Use **test key** (`pk_test_...`) for local development

---

## Quick Checklist

- [ ] Environment variable set in production
- [ ] Using **LIVE** key (`pk_live_...`) on live site
- [ ] Site rebuilt/redeployed after adding variable
- [ ] Browser cache cleared
- [ ] Checked browser console for specific errors
- [ ] Paystack script loads (check Network tab)

---

## Still Not Working?

**Tell me:**
1. What exact error message you see in browser console
2. What hosting platform you're using (cPanel, Vercel, etc.)
3. Whether you've set the environment variable in production
4. Whether you're using live or test key

**I'll help you fix it!** 🚀


