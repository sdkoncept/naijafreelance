# Deployment Guide for NaijaFreelance

This guide covers multiple deployment options for your React + Vite + Supabase application.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Supabase project set up and configured
- [ ] Environment variables ready
- [ ] Database migrations applied
- [ ] Tested the build locally (`npm run build`)
- [ ] Git repository initialized and pushed

---

## Option 1: Vercel (Recommended - Easiest)

Vercel is the easiest option for React/Vite apps with automatic deployments.

### Steps:

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI**:
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy (follow prompts)
   vercel
   
   # For production
   vercel --prod
   ```

3. **Or Deploy via Web Interface**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

4. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
     ```
   - Redeploy after adding variables

5. **Custom Domain** (optional):
   - Go to Project Settings → Domains
   - Add your custom domain

**Pros**: Free tier, automatic HTTPS, CDN, easy setup
**Cons**: Limited server-side features

---

## Option 2: Netlify

Netlify is another excellent option for static sites.

### Steps:

1. **Install Netlify CLI** (optional):
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy via CLI**:
   ```bash
   # Login
   netlify login
   
   # Initialize and deploy
   netlify init
   netlify deploy --prod
   ```

3. **Or Deploy via Web Interface**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Connect your repository
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Base directory**: (leave empty)

4. **Add Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
     ```
   - Trigger a new deploy

5. **Create `netlify.toml`** (optional, for better control):
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

**Pros**: Free tier, automatic HTTPS, form handling, easy setup
**Cons**: Similar to Vercel

---

## Option 3: GitHub Pages

Free hosting for static sites, but requires some configuration.

### Steps:

1. **Install gh-pages package**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update `package.json`**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/naijafreelance"
   }
   ```

3. **Update `vite.config.ts`**:
   ```typescript
   export default defineConfig({
     base: '/naijafreelance/', // Your repo name
     // ... rest of config
   })
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: `gh-pages` branch
   - Save

**Note**: Environment variables need to be set at build time. Consider using GitHub Secrets with GitHub Actions.

**Pros**: Free, integrated with GitHub
**Cons**: Requires repo to be public (or GitHub Pro), manual environment variable setup

---

## Option 4: Railway

Good for full-stack apps, but your app is static so this might be overkill.

### Steps:

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Configure:
   - Build Command: `npm run build`
   - Start Command: `npx serve dist`
5. Add environment variables
6. Deploy

**Pros**: Full-stack capable, easy scaling
**Cons**: Paid after free tier, might be overkill for static site

---

## Option 5: Render

Similar to Railway, good for static sites.

### Steps:

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. New → Static Site
4. Connect repository
5. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
6. Add environment variables
7. Deploy

**Pros**: Free tier, easy setup
**Cons**: Slower than Vercel/Netlify

---

## Environment Variables Setup

Your app requires these environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Where to find Supabase credentials:

1. Go to your Supabase project dashboard
2. Settings → API
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### Important Notes:

- ⚠️ **Never commit `.env` files to Git**
- ✅ Environment variables starting with `VITE_` are exposed to the browser
- ✅ Use Supabase Row Level Security (RLS) to protect your data
- ✅ The `anon` key is safe to expose (it's public by design)

---

## Supabase Configuration for Production

1. **Update Supabase Auth Settings**:
   - Go to Authentication → URL Configuration
   - Add your production URL to "Redirect URLs"
   - Example: `https://yourdomain.com`

2. **Database Migrations**:
   - Ensure all migrations are applied
   - Check Supabase Dashboard → Database → Migrations

3. **Row Level Security (RLS)**:
   - Verify RLS policies are enabled
   - Test with different user roles

4. **Email Templates** (optional):
   - Customize email templates in Authentication → Email Templates

---

## Testing Your Deployment

After deploying:

1. ✅ Test user registration
2. ✅ Test login/logout
3. ✅ Test protected routes
4. ✅ Test database operations
5. ✅ Test on mobile devices
6. ✅ Check browser console for errors
7. ✅ Verify environment variables are loaded

---

## Custom Domain Setup

### For Vercel:
1. Add domain in Project Settings → Domains
2. Follow DNS configuration instructions
3. SSL certificate is automatic

### For Netlify:
1. Add domain in Site Settings → Domain Management
2. Follow DNS configuration instructions
3. SSL certificate is automatic

### DNS Records Needed:
- **A Record** or **CNAME** pointing to your hosting provider
- Usually takes 24-48 hours to propagate

---

## Build Optimization

Before deploying, optimize your build:

```bash
# Build for production
npm run build

# Check build size
du -sh dist/

# Preview production build locally
npm run preview
```

### Tips:
- Images should be optimized
- Use lazy loading for images
- Enable gzip/brotli compression (automatic on Vercel/Netlify)

---

## Troubleshooting

### Build Fails:
- Check Node.js version (should be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Environment Variables Not Working:
- Ensure variables start with `VITE_`
- Redeploy after adding variables
- Check browser console for errors

### Routing Issues (404 on refresh):
- Ensure your hosting provider supports SPA routing
- Add redirect rules (see Netlify example above)
- Vercel handles this automatically

### Supabase Connection Issues:
- Verify environment variables are set correctly
- Check Supabase project is active
- Verify RLS policies allow access

---

## Recommended: Vercel

For this project, **Vercel is recommended** because:
- ✅ Zero configuration needed
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier is generous
- ✅ Easy environment variable management
- ✅ Automatic deployments from Git
- ✅ Preview deployments for PRs

---

## Quick Start with Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in Vercel dashboard
# 5. Redeploy
vercel --prod
```

That's it! Your app will be live at `https://your-project.vercel.app`

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html

