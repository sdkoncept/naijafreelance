# Quick Upload Guide - Fix Paystack

## ✅ Everything is Ready!

Your build is ready to upload:
- ✅ `.env` file has Paystack key
- ✅ `dist/` folder built (1.8M)
- ✅ All files ready

---

## 🚀 Upload Steps (Choose Your Method)

### Method 1: FTP/SFTP (Most Common)

1. **Open your FTP client** (FileZilla, WinSCP, etc.)
2. **Connect** to: `naijafreelance.sdkoncept.com`
3. **Navigate** to: `public_html/` or `www/`
4. **Select all files** from your local `dist/` folder
5. **Upload** to server (overwrite existing files)
6. **Done!** ✅

---

### Method 2: cPanel File Manager

1. **Log into cPanel**
2. **Open "File Manager"**
3. **Navigate** to `public_html/` (or your domain folder)
4. **Select all current files** (backup first if needed)
5. **Upload** → Choose files from `dist/` folder
6. **Extract** if uploaded as zip
7. **Done!** ✅

---

### Method 3: Command Line (SSH/SCP)

If you have SSH access:

```bash
# From your project folder
cd "/home/aanenih/Cursor Projects/naijafreelance"

# Upload via SCP (replace with your server details)
scp -r dist/* username@naijafreelance.sdkoncept.com:/path/to/public_html/

# Or using rsync (better - only uploads changed files)
rsync -avz --delete dist/ username@naijafreelance.sdkoncept.com:/path/to/public_html/
```

---

## ⚠️ Important Notes

1. **Upload CONTENTS of `dist/` folder**, not the `dist` folder itself
   - ✅ Upload: `index.html`, `assets/`, `favicon.ico`, etc.
   - ❌ Don't upload: `dist/` folder as a subfolder

2. **Overwrite existing files** when prompted

3. **Backup first** (optional but recommended)
   - Rename current `public_html/` to `public_html_backup_$(date)`

---

## ✅ After Upload - Verify

1. **Visit**: http://naijafreelance.sdkoncept.com
2. **Clear cache**: Ctrl+Shift+Delete (or Ctrl+F5 for hard refresh)
3. **Test Paystack**:
   - Go to a gig
   - Click "Place Order"
   - Try to pay
   - Check browser console (F12) - should see no errors

---

## 🔍 If Paystack Still Doesn't Work

1. **Check browser console** (F12) for exact error
2. **Verify** you're using **LIVE** key (`pk_live_...`) not test key
3. **Rebuild** if you changed `.env` after last build:
   ```bash
   npm run build
   ```
4. **Re-upload** the new `dist/` folder

---

## 📋 Quick Checklist

- [ ] Uploaded all files from `dist/` folder
- [ ] Files are in `public_html/` (or web root)
- [ ] Cleared browser cache
- [ ] Tested payment flow
- [ ] No errors in browser console

---

## 🎉 Success!

Once uploaded and verified, Paystack should work on your live site!

**Need help?** Check browser console (F12) and tell me what error you see.


