# Debug Paystack Error on Live Site

## Step 1: Check Browser Console

**On your live site** (`naijafreelance.sdkoncept.com`):

1. **Open the site** in your browser
2. **Press F12** (or right-click → Inspect)
3. **Go to Console tab**
4. **Look for errors** (red text)
5. **Copy the exact error message**

**Common errors:**
- "Paystack public key not configured"
- "Failed to load payment gateway"
- "Paystack script not loaded"
- "VITE_PAYSTACK_PUBLIC_KEY is undefined"

---

## Step 2: Verify Build Has Live Key

**On your local machine:**

```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"

# Check if live key is in built files
grep -r "pk_live_" dist/assets/*.js
```

**Should show:** Your live key embedded in the JS file

**If it shows `pk_test_`:** You need to rebuild with live key!

---

## Step 3: Rebuild with Live Key

### Make sure .env has LIVE key:

```bash
# Check current key
grep "VITE_PAYSTACK_PUBLIC_KEY" .env
```

**Should show:** `VITE_PAYSTACK_PUBLIC_KEY=pk_live_...`

**If it shows `pk_test_`:**

1. **Edit `.env` file:**
   ```env
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_actual_live_key_here
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Verify build has live key:**
   ```bash
   grep -r "pk_live_" dist/assets/*.js
   ```

4. **Upload the new `dist/` folder**

---

## Step 4: Common Issues & Fixes

### Issue: "Paystack public key not configured"

**Cause:** Environment variable not in build

**Fix:**
1. Make sure `.env` has `VITE_PAYSTACK_PUBLIC_KEY=pk_live_...`
2. Rebuild: `npm run build`
3. Upload new `dist/` folder

---

### Issue: "Failed to load payment gateway"

**Cause:** Paystack script can't load

**Fix:**
1. Check internet connection
2. Check if Paystack CDN is accessible
3. Check browser console Network tab for failed requests
4. Try disabling ad blockers

---

### Issue: "Invalid key format"

**Cause:** Wrong key format or key not set

**Fix:**
1. Verify key starts with `pk_live_` (not `pk_test_`)
2. Make sure no extra spaces in `.env` file
3. Rebuild after fixing

---

### Issue: Payment dialog opens but fails

**Cause:** Using test key on live site, or key mismatch

**Fix:**
1. Use **LIVE** key (`pk_live_...`) on live site
2. Make sure you rebuilt after changing key
3. Clear browser cache

---

## Step 5: Verify After Upload

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** (Ctrl+F5)
3. **Open browser console** (F12)
4. **Try to place an order**
5. **Check console** - should see no Paystack errors
6. **Payment dialog should open**

---

## 🔍 Debug Checklist

- [ ] `.env` file has `VITE_PAYSTACK_PUBLIC_KEY=pk_live_...`
- [ ] Rebuilt after setting live key: `npm run build`
- [ ] Verified build has live key: `grep -r "pk_live_" dist/assets/*.js`
- [ ] Uploaded new `dist/` folder to server
- [ ] Cleared browser cache
- [ ] Checked browser console for errors
- [ ] Using LIVE key (not test key)

---

## 📝 Tell Me

**To help you fix it, I need:**

1. **Exact error message** from browser console (F12)
2. **What you see** when you try to pay
3. **Did you rebuild** after adding live key?
4. **Did you upload** the new `dist/` folder?

**Copy and paste the error message here!**


