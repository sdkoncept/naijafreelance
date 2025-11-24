# Deploy to Live Site (naijafreelance.sdkoncept.com)

This guide covers how to deploy your updated code to your live site.

## Quick Deploy Steps

### Step 1: Build the Production Version

```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"
npm run build
```

This creates a `dist/` folder with all the production-ready files.

### Step 2: Upload to Your Server

The method depends on how your site is hosted:

---

## Option A: FTP/SFTP Upload (Most Common)

If you use FTP/SFTP to upload files:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload the `dist/` folder contents**:
   - Connect via FTP/SFTP (FileZilla, WinSCP, etc.)
   - Navigate to your web root (usually `public_html/` or `www/`)
   - Upload ALL files from the `dist/` folder
   - **Important**: Upload the contents of `dist/`, not the `dist` folder itself

3. **Verify**:
   - Visit http://naijafreelance.sdkoncept.com
   - Check that the new GigDetail page works

---

## Option B: cPanel File Manager

If you use cPanel:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload via cPanel**:
   - Log into cPanel
   - Open "File Manager"
   - Navigate to `public_html/` (or your domain's root)
   - Delete old files (or backup first)
   - Upload all files from `dist/` folder
   - Extract if uploaded as zip

---

## Option C: SSH/SCP Command Line

If you have SSH access:

```bash
# 1. Build
npm run build

# 2. Upload via SCP (replace with your server details)
scp -r dist/* username@your-server.com:/path/to/web/root/

# Or using rsync (better for updates)
rsync -avz --delete dist/ username@your-server.com:/path/to/web/root/
```

---

## Option D: Git + Automated Deployment

If your server supports Git deployments:

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add GigDetail page and fix routing"
   git push origin main
   ```

2. **On your server**, pull the latest:
   ```bash
   ssh username@your-server.com
   cd /path/to/your/project
   git pull origin main
   npm install
   npm run build
   # Then copy dist/ to web root or configure web server
   ```

---

## Option E: Vercel/Netlify (If Using)

If your site is on Vercel or Netlify:

### Vercel:
```bash
# Install Vercel CLI if not already
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify:
```bash
# Install Netlify CLI if not already
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

---

## Important: Environment Variables

Make sure your live site has these environment variables set:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
```

**⚠️ CRITICAL FOR PAYSTACK:**
- Environment variables must be set **BEFORE** building
- Vite embeds env variables at **build time**, not runtime
- You must rebuild after adding/changing variables

### How to Set Environment Variables:

**For Vercel/Netlify:**
- Dashboard → Project Settings → Environment Variables
- Add `VITE_PAYSTACK_PUBLIC_KEY` with your **LIVE** key (`pk_live_...`)
- Redeploy after adding

**For cPanel/Shared Hosting (FTP Upload):**
1. **Create `.env` file** in your project root (locally)
2. Add your variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
   ```
3. **Build locally** with the `.env` file:
   ```bash
   npm run build
   ```
4. **Upload the `dist/` folder** to your server
   - The env variables are now embedded in the built files

**For VPS/Server:**
- Create `.env` file in project root
- Or set system environment variables
- Or configure in web server (nginx/apache)
- **Rebuild** after setting variables: `npm run build`

### Paystack Key Types:
- **Live Site:** Use `pk_live_...` (from Paystack dashboard in Live Mode)
- **Local Development:** Use `pk_test_...` (from Paystack dashboard in Test Mode)

---

## Quick Deployment Script

Create a simple deployment script:

### `deploy.sh` (for SSH/SCP):

```bash
#!/bin/bash

echo "Building project..."
npm run build

echo "Uploading to server..."
# Replace with your server details
scp -r dist/* username@your-server.com:/path/to/web/root/

echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Verification Checklist

After deploying:

- [ ] Visit http://naijafreelance.sdkoncept.com
- [ ] Click on a gig from Browse page
- [ ] Verify GigDetail page loads correctly
- [ ] Check browser console for errors (F12)
- [ ] Test navigation (back button, links)
- [ ] Verify environment variables are working
- [ ] Test on mobile device

---

## Troubleshooting

### Files Not Updating:
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check file permissions on server
- Verify files were uploaded correctly

### 404 Errors:
- Ensure all files from `dist/` are uploaded
- Check web server configuration for SPA routing
- Verify `.htaccess` or `nginx.conf` has proper redirect rules

### Environment Variables Not Working:
- Check variables are set correctly
- Rebuild after changing variables
- Check browser console for errors

### Build Errors:
```bash
# Clear and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## Recommended: Automated Deployment

For easier future deployments, consider:

1. **GitHub Actions** - Auto-deploy on push
2. **Vercel/Netlify** - Auto-deploy from Git
3. **Webhook** - Trigger deployment from Git push

---

## Current Status

✅ Code is ready (GigDetail page created)
✅ Build tested and working
⏳ Need to upload `dist/` folder to your server

---

## Need Help?

If you're not sure which method to use:
1. Check your hosting provider's documentation
2. Contact your hosting support
3. Check if you have FTP/cPanel/SSH access

The most common method is **FTP/SFTP upload** of the `dist/` folder contents.

