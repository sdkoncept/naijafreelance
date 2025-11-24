# How to Deploy Email Functions - Super Simple Guide

Follow these steps **one by one**. Don't skip ahead!

---

## 🎯 What We're Doing

We're setting up email notifications so that:
- When a freelancer applies for a job → Client gets an email
- When client accepts/declines → Freelancer gets an email

---

## Step 1: Get Email Service (Resend) - 5 minutes

### 1.1 Sign Up
1. Open your browser
2. Go to: https://resend.com
3. Click "Sign Up" (top right)
4. Sign up with Google/GitHub (easiest) or email
5. Verify your email if asked

### 1.2 Get API Key
1. After logging in, look at the left sidebar
2. Click "API Keys"
3. Click the big button "Create API Key"
4. Name it: `NaijaFreelance`
5. Click "Create"
6. **COPY THE KEY** - it looks like: `re_abc123xyz...`
   - ⚠️ **Save this somewhere!** You can't see it again
   - I recommend pasting it in a text file for now

✅ **Done with Step 1!** You now have an email service account.

---

## Step 2: Install Supabase CLI - 2 minutes

### 2.1 Open Terminal
- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

### 2.2 Go to Your Project
Type this (press Enter after each line):

```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"
```

### 2.3 Install Supabase CLI
Type this and press Enter:

```bash
npm install -g supabase
```

**Wait for it to finish** - it will say "added X packages" when done.

### 2.4 Check It Worked
Type:
```bash
supabase --version
```

You should see a number like `1.123.4`. If you see an error, tell me!

✅ **Done with Step 2!** Supabase CLI is installed.

---

## Step 3: Login to Supabase - 1 minute

### 3.1 Login Command
In your terminal, type:
```bash
supabase login
```

### 3.2 What Happens
1. A browser window will open automatically
2. If it doesn't, copy the URL shown in terminal and paste in browser
3. Log in to Supabase (use your Supabase account)
4. Click "Authorize" or "Allow"
5. You'll see "Success! You can close this window"
6. Go back to terminal - it should say "Logged in successfully"

✅ **Done with Step 3!** You're logged in.

---

## Step 4: Find Your Project Reference - 2 minutes

### 4.1 Go to Supabase Dashboard
1. Open browser
2. Go to: https://supabase.com/dashboard
3. Click on your project (the one you're using for NaijaFreelance)

### 4.2 Find the Project Reference
Look at the URL in your browser. It will be like:
```
https://supabase.com/dashboard/project/abcdefghijklmnopqrstuvwxyz123456
```

The part after `/project/` is your project reference. It's a long string of letters and numbers.

**Example**: If URL is `.../project/bkdhxrhdoqeyfsrfipku`, then `bkdhxrhdoqeyfsrfipku` is your project reference.

### 4.3 Copy It
- Select and copy that entire string
- Save it somewhere (text file is fine)

✅ **Done with Step 4!** You have your project reference.

---

## Step 5: Link Your Project - 1 minute

### 5.1 Link Command
In your terminal, type this (replace `YOUR_PROJECT_REF` with what you copied):

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**Example** (use YOUR actual project ref, not this one):
```bash
supabase link --project-ref bkdhxrhdoqeyfsrfipku
```

Press Enter.

### 5.2 Success Message
You should see: "Linked to project YOUR_PROJECT_REF"

✅ **Done with Step 5!** Project is linked.

---

## Step 6: Add API Key to Supabase - 2 minutes

### 6.1 Go to Edge Functions
1. In Supabase Dashboard, click "Edge Functions" in left sidebar
2. Click "Secrets" tab (at the top)

### 6.2 Add Secret
1. Click "New Secret" or "Add Secret" button
2. **Name**: Type exactly: `RESEND_API_KEY`
3. **Value**: Paste your Resend API key (the one that starts with `re_...`)
4. Click "Save" or "Add"

✅ **Done with Step 6!** API key is saved.

---

## Step 7: Deploy Functions - 2 minutes

### 7.1 Deploy First Function
In your terminal, type:
```bash
supabase functions deploy send-job-application-email
```

Press Enter and wait. You should see "Function deployed successfully"

### 7.2 Deploy Second Function
Type:
```bash
supabase functions deploy send-application-status-email
```

Press Enter and wait. Again, "Function deployed successfully"

✅ **Done with Step 7!** Functions are deployed!

---

## Step 8: Test It! - 5 minutes

### 8.1 Test the Flow
1. Go to your website
2. Log in as a client
3. Post a job
4. Log in as a freelancer (different account)
5. Apply for the job
6. Check the client's email inbox - they should get an email!

### 8.2 If It Doesn't Work
1. Go to Supabase Dashboard → Edge Functions → Logs
2. Look for error messages
3. Check that RESEND_API_KEY secret is set
4. Verify you deployed both functions

---

## 🎉 You're Done!

Your email notifications are now set up! 

**What happens now:**
- ✅ Freelancers apply → Client gets email
- ✅ Client accepts → Freelancer gets email  
- ✅ Client declines → Freelancer gets email

---

## Quick Checklist

Before you start, make sure you have:
- [ ] Resend account (https://resend.com)
- [ ] Resend API key copied
- [ ] Supabase account
- [ ] Your Supabase project reference
- [ ] Terminal/Command Prompt open
- [ ] Node.js installed (you have v18.19.1 ✅)

---

## Common Issues

### "Command not found: supabase"
**Fix**: Run `npm install -g supabase` again

### "Not logged in"
**Fix**: Run `supabase login` again

### "Project not linked"  
**Fix**: Run `supabase link --project-ref YOUR_PROJECT_REF` again

### "Function not found"
**Fix**: Make sure you're in the project folder: `cd "/home/aanenih/Cursor Projects/naijafreelance"`

### Emails not sending
**Fix**: 
1. Check Supabase → Edge Functions → Secrets → RESEND_API_KEY is set
2. Check Edge Functions → Logs for errors
3. Verify Resend API key is correct

---

## Need Help?

If you get stuck:
1. Tell me which step you're on
2. Copy the exact error message
3. I'll help you fix it!

