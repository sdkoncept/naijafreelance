# How to Upload dist/ Folder - Step by Step

## 🎯 Your Goal

Upload the `dist/` folder contents to: `naijafreelance.sdkoncept.com`

---

## Method 1: Using cPanel File Manager (Easiest)

### Step 1: Access cPanel
1. Go to: `http://sdkoncept.com/cpanel` (or your cPanel URL)
2. Log in with your credentials
3. Look for **"File Manager"** icon and click it

### Step 2: Navigate to Your Website Folder
1. In File Manager, look for:
   - `public_html/` folder, OR
   - `www/` folder, OR
   - A folder named `naijafreelance/` or similar
2. **Click** on that folder to open it

### Step 3: Backup Current Files (Optional but Recommended)
1. **Select all files** in the current folder (Ctrl+A or Cmd+A)
2. Right-click → **Compress** → Choose "Zip"
3. Name it: `backup_$(date)` (e.g., `backup_20241124.zip`)
4. This creates a backup in case something goes wrong

### Step 4: Delete Old Files
1. **Select all files** in the folder (Ctrl+A)
2. Click **Delete** button (or right-click → Delete)
3. Confirm deletion
4. **Keep the folder empty** (don't delete the folder itself)

### Step 5: Upload New Files
1. Click **Upload** button (top menu)
2. Click **Select Files** or drag and drop
3. **Navigate to your local `dist/` folder**:
   - Path: `/home/aanenih/Cursor Projects/naijafreelance/dist/`
4. **Select ALL files** from `dist/` folder:
   - `index.html`
   - `favicon.ico`
   - `robots.txt`
   - `placeholder.svg`
   - `assets/` folder (select the entire folder)
5. Click **Upload**
6. Wait for upload to complete

### Step 6: Verify
1. Visit: http://naijafreelance.sdkoncept.com
2. Clear browser cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+F5)
4. Check if site loads

---

## Method 2: Using FTP Client (FileZilla)

### Step 1: Download FileZilla
1. Go to: https://filezilla-project.org
2. Download FileZilla Client (free)
3. Install it

### Step 2: Connect to Your Server
1. Open FileZilla
2. Enter connection details:
   - **Host:** `naijafreelance.sdkoncept.com` or `ftp.sdkoncept.com`
   - **Username:** Your FTP username
   - **Password:** Your FTP password
   - **Port:** 21 (or 22 for SFTP)
3. Click **Quickconnect**

### Step 3: Navigate to Website Folder
1. **Right side (Remote site):** Navigate to `public_html/` or `www/`
2. **Left side (Local site):** Navigate to your `dist/` folder:
   - `/home/aanenih/Cursor Projects/naijafreelance/dist/`

### Step 4: Upload Files
1. **Select all files** on the left (from `dist/` folder)
2. **Drag and drop** them to the right side (server)
3. Or right-click → **Upload**
4. Wait for upload to complete

### Step 5: Verify
1. Visit your website
2. Clear cache and test

---

## Method 3: Using Command Line (SSH)

If you have SSH access:

```bash
# Navigate to your project
cd "/home/aanenih/Cursor Projects/naijafreelance"

# Upload via SCP (replace with your details)
scp -r dist/* username@naijafreelance.sdkoncept.com:/path/to/public_html/

# Or using rsync (better)
rsync -avz --delete dist/ username@naijafreelance.sdkoncept.com:/path/to/public_html/
```

---

## ⚠️ Important Notes

1. **Upload CONTENTS of `dist/`**, not the `dist` folder itself
   - ✅ Upload: `index.html`, `assets/`, `favicon.ico`, etc.
   - ❌ Don't upload: `dist/` as a subfolder

2. **File Structure Should Be:**
   ```
   public_html/
   ├── index.html
   ├── favicon.ico
   ├── assets/
   │   ├── index-xxx.js
   │   └── index-xxx.css
   └── ...
   ```

3. **Permissions:**
   - Files: 644
   - Folders: 755
   - (Usually set automatically)

---

## 🔍 Troubleshooting Upload

### "Permission Denied"
- Check file permissions in cPanel
- Files should be 644, folders 755

### "Files Not Updating"
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check if files actually uploaded

### "404 Errors"
- Make sure `index.html` is in the root folder
- Check web server configuration

---

## 📞 Need Help?

**Tell me:**
1. Do you have cPanel access? (Yes/No)
2. Do you have FTP credentials? (Yes/No)
3. Do you have SSH access? (Yes/No)

**I'll give you the exact steps for your situation!**


