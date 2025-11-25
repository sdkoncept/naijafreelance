# 🚀 Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ 1. Environment Variables
Make sure these are set in your Vercel project settings:

**Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

**Optional (if using):**
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key for payments

### ✅ 2. Git Repository
- [ ] All changes committed to Git
- [ ] Repository is connected to Vercel
- [ ] Main branch is set correctly

### ✅ 3. Database Migrations
- [ ] All Supabase migrations have been applied
- [ ] Database schema is up to date
- [ ] RLS policies are configured

### ✅ 4. Build Test
- [ ] Run `npm run build` locally to ensure no build errors
- [ ] Check for any TypeScript or linting errors

## Deployment Steps

### Step 1: Commit All Changes
```bash
# Check what files have changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Complete platform features: reviews, delivery, withdrawals, community, notifications, OAuth, chatbot, logo creator"
```

### Step 2: Push to Git
```bash
# Push to your main branch
git push origin main

# Or if you're on a different branch
git push origin <your-branch-name>
```

### Step 3: Vercel Auto-Deployment
Vercel will automatically:
1. Detect the push
2. Start building your project
3. Deploy to production

### Step 4: Monitor Deployment
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project
3. Watch the deployment progress
4. Check build logs if there are any errors

### Step 5: Verify Deployment
After deployment completes:
- [ ] Visit your live site
- [ ] Test authentication (sign up/sign in)
- [ ] Test Google OAuth
- [ ] Check that all pages load correctly
- [ ] Test key features:
  - Browse gigs
  - Create orders
  - Messaging
  - Notifications
  - Community (for freelancers)
  - Logo Creator (for clients)

## Post-Deployment

### 1. Update Supabase Redirect URLs
In your Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel domain to **Redirect URLs**:
   ```
   https://your-domain.vercel.app
   https://your-domain.vercel.app/**
   ```
3. If you have a custom domain:
   ```
   https://your-custom-domain.com
   https://your-custom-domain.com/**
   ```

### 2. Test OAuth
- [ ] Test Google sign-in works
- [ ] Verify OAuth callback redirects correctly

### 3. Check Environment Variables
In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Verify all variables are set correctly
3. Make sure they're available for **Production** environment

## Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Import errors
   - Missing dependencies

### OAuth Not Working
1. Check Supabase redirect URLs are set
2. Verify OAuth provider is enabled in Supabase
3. Check environment variables are correct

### Database Errors
1. Ensure all migrations are applied
2. Check RLS policies are correct
3. Verify Supabase connection

### Pages Not Loading
1. Check routing configuration
2. Verify all routes are defined in App.tsx
3. Check for 404 errors in browser console

## Quick Commands

```bash
# Build locally to test
npm run build

# Preview production build
npm run preview

# Check for linting errors
npm run lint

# Check Git status
git status

# Add and commit all changes
git add .
git commit -m "Deploy latest changes"

# Push to trigger deployment
git push
```

## Important Notes

- ⚠️ **Never commit `.env` files** - Use Vercel environment variables instead
- ✅ Vercel automatically builds on every push to main branch
- ✅ Build time is typically 1-3 minutes
- ✅ Your site is live immediately after successful deployment
- ✅ Preview deployments are created for pull requests

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify Supabase connection
4. Review environment variables

Good luck with your deployment! 🎉

