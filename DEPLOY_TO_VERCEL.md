# Deploy to Vercel via Git Push

This guide shows you how to push your changes to Git, which will automatically trigger a Vercel deployment.

## Prerequisites
- Git is installed
- You have a Git repository set up (GitHub, GitLab, or Bitbucket)
- Your Vercel project is connected to your Git repository

## Step-by-Step Instructions

### Step 1: Check Your Changes
```bash
git status
```
This shows which files have been modified.

### Step 2: Add All Changes
```bash
git add .
```
This stages all your changes for commit.

**Alternative:** To add specific files only:
```bash
git add src/pages/ContactUs.tsx
git add src/pages/HowItWorks.tsx
# etc.
```

### Step 3: Commit Your Changes
```bash
git commit -m "Add missing pages and update contact phone number"
```
Replace the message with a description of your changes.

**Good commit messages:**
- `"Add missing pages: How It Works, Help Center, Contact, Terms, Privacy"`
- `"Update contact phone number to +234 (0) 7061350647"`
- `"Fix 404 errors for footer links"`

### Step 4: Push to Git
```bash
git push
```

If this is your first push or you're pushing a new branch:
```bash
git push -u origin main
```
(Replace `main` with your branch name if different, e.g., `master`)

### Step 5: Monitor Vercel Deployment

1. **Go to your Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Find your project

2. **Watch the deployment:**
   - You'll see a new deployment appear
   - It will show "Building..." then "Deploying..."
   - When it says "Ready", your site is live!

3. **Check deployment status:**
   - Green checkmark = Success ✅
   - Red X = Failed (check logs) ❌

### Step 6: Verify Your Changes

Once deployment is complete:
- Visit your live site
- Check that the new pages work:
  - `/how-it-works`
  - `/help`
  - `/contact`
  - `/terms`
  - `/privacy`
- Verify the phone number is updated on the Contact page

## Troubleshooting

### If `git push` asks for credentials:
- Use a Personal Access Token (not your password)
- For GitHub: Settings → Developer settings → Personal access tokens
- For GitLab: User Settings → Access Tokens

### If deployment fails:
1. Check Vercel build logs
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Build errors in your code
   - Dependency issues

### If changes don't appear:
1. Wait a few minutes (deployment takes 1-3 minutes)
2. Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
3. Clear browser cache
4. Check that you're on the correct domain

## Quick Command Summary

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Your commit message here"

# Push to trigger Vercel deployment
git push
```

## Notes

- Vercel automatically deploys on every push to your main branch
- You can also set up preview deployments for other branches
- Build time is usually 1-3 minutes
- Your site will be live immediately after successful deployment
