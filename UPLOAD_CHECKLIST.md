# Upload Checklist - Fix Paystack on Live Site

## ✅ Pre-Upload Checklist

Before uploading, make sure:

- [ ] `.env` file has `VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_key_here`
- [ ] You've run `npm run build` (creates/updates `dist/` folder)
- [ ] You have FTP/cPanel/SSH access to your server
- [ ] You know where your website files are located (usually `public_html/` or `www/`)

---

## 📤 Upload Steps

### Step 1: Verify Build

Your `dist/` folder should contain:
- `index.html`
- `assets/` folder (with JS, CSS files)
- `favicon.ico`
- Other static files

### Step 2: Connect to Your Server

**Option A: FTP/SFTP (Most Common)**
- Use FileZilla, WinSCP, or similar
- Connect to: `naijafreelance.sdkoncept.com`
- Navigate to: `public_html/` or `www/`

**Option B: cPanel File Manager**
- Log into cPanel
- Open "File Manager"
- Navigate to `public_html/` or your domain folder

**Option C: SSH/SCP**
- Use terminal/command line
- Command: `scp -r dist/* user@server:/path/to/web/root/`

### Step 3: Backup Current Files (Recommended)

Before uploading:
1. **Backup** your current live site files
2. Or rename current folder to `public_html_backup_$(date +%Y%m%d)`

### Step 4: Upload Files

**Important:** Upload the **contents** of the `dist/` folder, not the `dist` folder itself!

1. **Select all files** from `dist/` folder
2. **Upload** to your web root (`public_html/` or `www/`)
3. **Overwrite** existing files when prompted
4. **Wait** for upload to complete

### Step 5: Verify Upload

1. Visit: http://naijafreelance.sdkoncept.com
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Hard refresh** (Ctrl+F5)
4. Try to place an order
5. Check browser console (F12) - should see no Paystack errors

---

## 🔍 Troubleshooting

### Files Not Updating?
- Clear browser cache
- Check file permissions (should be 644 for files, 755 for folders)
- Verify files were uploaded correctly

### Still Getting Paystack Error?
1. Check browser console (F12) for exact error
2. Verify you used **LIVE** key (`pk_live_...`) not test key
3. Make sure you rebuilt after adding the key to `.env`
4. Check that `dist/` folder was uploaded, not just `.env` file

### 404 Errors?
- Make sure you uploaded all files from `dist/`
- Check web server configuration for SPA routing
- Verify `.htaccess` or `nginx.conf` has proper redirect rules

---

## ✅ Success Indicators

After upload, you should see:
- ✅ Site loads normally
- ✅ No Paystack errors in console
- ✅ Payment button works
- ✅ Order placement works

---

## 📝 Quick Upload Commands

### If Using SCP:
```bash
scp -r dist/* username@naijafreelance.sdkoncept.com:/path/to/public_html/
```

### If Using RSYNC (Better):
```bash
rsync -avz --delete dist/ username@naijafreelance.sdkoncept.com:/path/to/public_html/
```

---

## Need Help?

If something goes wrong:
1. Check browser console (F12) for errors
2. Verify all files uploaded correctly
3. Check file permissions
4. Make sure you rebuilt with the Paystack key in `.env`

Good luck! 🚀


