# Simple Upload Guide - Step by Step

## 🎯 Goal: Upload `dist/` folder to your live site

---

## Method 1: cPanel File Manager (Easiest - Recommended)

### Step 1: Access cPanel
1. Go to: `http://sdkoncept.com/cpanel` (or your cPanel URL)
2. Log in
3. Find and click **"File Manager"** icon

### Step 2: Find Your Website Folder
1. In File Manager, look for one of these:
   - `public_html/` folder
   - `www/` folder  
   - A folder with your domain name
2. **Click** on it to open

### Step 3: Upload Files
1. Click **"Upload"** button (top menu)
2. Click **"Select Files"**
3. Navigate to: `/home/aanenih/Cursor Projects/naijafreelance/dist/`
4. **Select ALL files and folders**:
   - Click `index.html`
   - Click `favicon.ico`
   - Click `assets` folder
   - Click `robots.txt`
   - Click `placeholder.svg`
   - (Or press Ctrl+A to select all)
5. Click **"Open"**
6. Wait for upload to finish
7. **Done!** ✅

### Step 4: Test
1. Visit: http://naijafreelance.sdkoncept.com
2. Clear cache (Ctrl+Shift+Delete)
3. Hard refresh (Ctrl+F5)

---

## Method 2: Using FileZilla (FTP)

### Step 1: Download FileZilla
- Go to: https://filezilla-project.org
- Download and install FileZilla Client (free)

### Step 2: Connect
1. Open FileZilla
2. Enter:
   - **Host:** `ftp.sdkoncept.com` or `naijafreelance.sdkoncept.com`
   - **Username:** Your FTP username
   - **Password:** Your FTP password
   - **Port:** 21
3. Click **"Quickconnect"**

### Step 3: Upload
1. **Left side (Local):** Navigate to your `dist/` folder
2. **Right side (Remote):** Navigate to `public_html/` or `www/`
3. **Select all files** on left
4. **Drag and drop** to right side
5. Wait for upload

---

## ⚠️ Important

1. **Upload CONTENTS of `dist/`**, not the `dist` folder itself
2. **Overwrite** existing files when asked
3. **Backup first** (optional but recommended)

---

## 📞 Need Help?

**Tell me:**
1. Do you have cPanel access? (Yes/No)
2. Do you have FTP credentials? (Yes/No)
3. What error do you see when trying to upload?

**I'll give you exact steps!**


