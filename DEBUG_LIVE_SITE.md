# Debug Live Site - Step by Step

## 🔍 Let's Find the Exact Problem

Follow these steps to identify what's wrong:

---

## Step 1: Check Browser Console

**On your live site** (`naijafreelance.sdkoncept.com`):

1. **Open the site** in your browser
2. **Press F12** (or right-click → Inspect)
3. **Go to Console tab**
4. **Look for RED errors**
5. **Copy the EXACT error message** (word for word)

**Common errors to look for:**
- "Paystack public key not configured"
- "Failed to load payment gateway"
- "Paystack script not loaded"
- "VITE_PAYSTACK_PUBLIC_KEY is undefined"
- "Invalid key format"
- Any other red error messages

**📝 Write down the exact error message here:**

---

## Step 2: Check Network Tab

1. **Still in browser** (F12 open)
2. **Go to Network tab**
3. **Clear the network log** (trash icon)
4. **Refresh the page** (F5)
5. **Look for failed requests** (red entries)
6. **Check if Paystack script loads:**
   - Look for: `js.paystack.co/v1/inline.js`
   - Is it loading? (Status 200 = good, 404/403 = bad)

**📝 What do you see?**
- [ ] Paystack script loads successfully (200)
- [ ] Paystack script fails to load (404/403/other)
- [ ] No Paystack script request at all

---

## Step 3: Check What Key is in Your Build

**On your local machine**, run:

```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"
grep -r "pk_" dist/assets/*.js | head -1
```

**This shows what key is actually in your uploaded files.**

**📝 What does it show?**
- `pk_live_...` = ✅ Correct (live key)
- `pk_test_...` = ❌ Wrong (test key)
- `sk_live_...` = ❌ Wrong (secret key, not public key)
- Nothing found = ❌ Key not in build

---

## Step 4: Verify .env File

**Check your `.env` file:**

```bash
grep "VITE_PAYSTACK_PUBLIC_KEY" .env
```

**Should show:**
- `VITE_PAYSTACK_PUBLIC_KEY=pk_live_...` ✅
- NOT `sk_live_...` ❌
- NOT `pk_test_...` (unless you want test mode)

---

## Step 5: Test Payment Flow

1. **Go to your live site**
2. **Try to place an order:**
   - Browse to a gig
   - Click "Place Order"
   - Select a package
   - Click "Create Order & Proceed to Payment"
3. **What happens?**
   - [ ] Payment dialog opens
   - [ ] Error message appears
   - [ ] Nothing happens
   - [ ] Page reloads
   - [ ] Other: _______________

---

## Step 6: Check File Upload

**Verify files were uploaded correctly:**

1. **In cPanel File Manager** (or FTP):
2. **Navigate to your website folder** (`public_html/` or `www/`)
3. **Check if these files exist:**
   - [ ] `index.html`
   - [ ] `assets/` folder
   - [ ] `assets/index-xxx.js` (JavaScript file)
   - [ ] `favicon.ico`

**If files are missing, re-upload!**

---

## Common Issues & Fixes

### Issue 1: "Paystack public key not configured"

**Fix:**
1. Make sure `.env` has `VITE_PAYSTACK_PUBLIC_KEY=pk_live_...`
2. Rebuild: `npm run build`
3. Re-upload `dist/` folder

---

### Issue 2: "Failed to load payment gateway"

**Fix:**
1. Check internet connection
2. Check if Paystack CDN is blocked
3. Try disabling ad blockers
4. Check browser console Network tab

---

### Issue 3: Payment button does nothing

**Fix:**
1. Check browser console for JavaScript errors
2. Verify Paystack script loaded (Network tab)
3. Check if key format is correct (`pk_live_...`)

---

### Issue 4: Files not updating

**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check file timestamps on server
4. Verify files were actually uploaded

---

## 📋 Information I Need

**To help you fix this, please provide:**

1. **Exact error message** from browser console (F12 → Console)
2. **What happens** when you click "Pay" button
3. **What key is in your build** (from Step 3)
4. **What key is in your .env** (from Step 4)
5. **Screenshot** of browser console (if possible)

**Copy and paste the error messages here!**

---

## Quick Test

**Try this in browser console (F12):**

```javascript
console.log(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY)
```

**What does it show?**
- `undefined` = Key not in build
- `pk_live_...` = ✅ Correct
- `pk_test_...` = Wrong (test key)
- `sk_live_...` = Wrong (secret key)

---

**Once you provide the error message, I'll give you the exact fix!** 🚀


