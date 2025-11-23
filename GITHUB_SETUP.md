# GitHub Setup Guide

Your project is now initialized as a Git repository, but you need to:

1. **Configure Git** (if not already done)
2. **Create a GitHub repository**
3. **Connect and push your code**

---

## Step 1: Configure Git (One-time setup)

Run these commands with your information:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Example:**
```bash
git config --global user.name "Aanenih"
git config --global user.email "aanenih@live.com"
```

---

## Step 2: Create Initial Commit

After configuring Git, commit your code:

```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"
git add .
git commit -m "Initial commit: NaijaFreelance marketplace"
```

---

## Step 3: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `naijafreelance` (or your preferred name)
   - **Description**: "Nigerian Freelancer Marketplace"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

---

## Step 4: Connect and Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/naijafreelance.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

**If you're using SSH instead of HTTPS:**
```bash
git remote add origin git@github.com:YOUR_USERNAME/naijafreelance.git
git branch -M main
git push -u origin main
```

---

## Step 5: Verify

1. Go to your GitHub repository page
2. You should see all your files
3. Check that `.env` files are NOT visible (they should be in `.gitignore`)

---

## Quick Commands Summary

```bash
# 1. Configure Git (one-time)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. Commit your code
cd "/home/aanenih/Cursor Projects/naijafreelance"
git add .
git commit -m "Initial commit: NaijaFreelance marketplace"

# 3. Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/naijafreelance.git

# 4. Push to GitHub
git branch -M main
git push -u origin main
```

---

## Troubleshooting

### Authentication Issues

If you get authentication errors when pushing:

**Option 1: Use Personal Access Token (Recommended)**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

**Option 2: Use SSH**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your.email@example.com"`
2. Add to GitHub: Settings → SSH and GPG keys → New SSH key
3. Use SSH URL for remote: `git@github.com:USERNAME/REPO.git`

### Branch Name Issues

If you get branch name errors:
```bash
git branch -M main  # Rename to main
```

---

## After Pushing to GitHub

Once your code is on GitHub, you can:

1. **Deploy to Vercel/Netlify** - They can auto-deploy from GitHub
2. **Collaborate** - Share the repository with team members
3. **Track Changes** - All future changes will be version controlled

---

## Next Steps

After pushing to GitHub:

1. ✅ Update `DEPLOYMENT.md` with your GitHub repository URL
2. ✅ Connect to Vercel/Netlify for automatic deployments
3. ✅ Set up environment variables in your hosting platform
4. ✅ Deploy!

---

## Current Status

✅ Git repository initialized
✅ `.gitignore` file created
⏳ Git user configuration needed
⏳ Initial commit needed
⏳ GitHub repository creation needed
⏳ Push to GitHub needed

