# Step 4: Deploy Functions - Exact Instructions

You're on **Step 4: Deploy Functions**. Here's exactly what to do:

---

## Part A: Install Supabase CLI ✅ ALREADY DONE!

**Good news!** Supabase CLI is already installed in your project. 

**Note:** Supabase CLI **does NOT support** global npm installation (`npm install -g supabase`). That's why you saw that error - it's normal!

**We'll use `npx supabase` for all commands** - this works perfectly and doesn't require any additional installation.

**Verify it's working:**
```bash
npx supabase --version
```

You should see a version number like `2.58.5` ✅

**Now proceed to Part B!**

---

## Part B: Login to Supabase

**In your terminal**, run:

```bash
npx supabase login
```

**What will happen:**
1. A browser window will open automatically
2. If it doesn't, copy the URL shown in the terminal
3. Log in to your Supabase account
4. Click "Authorize" or "Allow"
5. You'll see "Success! You can close this window"
6. Go back to terminal - it should say "Logged in successfully"

---

## Part C: Find Your Project Reference

1. **Open your browser**
2. Go to: https://supabase.com/dashboard
3. Click on your project (the one for NaijaFreelance)
4. **Look at the URL** in your browser address bar

The URL will look like:
```
https://supabase.com/dashboard/project/abcdefghijklmnopqrstuvwxyz123456
```

**The part after `/project/` is your project reference.**

**Example:** If your URL is:
```
https://supabase.com/dashboard/project/bkdhxrhdoqeyfsrfipku
```

Then your project reference is: `bkdhxrhdoqeyfsrfipku`

**Copy this entire string** - you'll need it in the next step!

---

## Part D: Link Your Project

**In your terminal**, run this command (replace `YOUR_PROJECT_REF` with what you copied):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

**Example** (use YOUR actual project ref, not this one):
```bash
supabase link --project-ref bkdhxrhdoqeyfsrfipku
```

**What to expect:**
- It might ask you to confirm - type `y` and press Enter
- You should see: "Linked to project YOUR_PROJECT_REF"

---

## Part E: Add Resend API Key to Supabase

**Before deploying**, you need to add your Resend API key to Supabase:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. Click on your project
3. Click **"Edge Functions"** in the left sidebar
4. Click the **"Secrets"** tab (at the top)
5. Click **"New Secret"** or **"Add Secret"** button
6. **Name**: Type exactly: `RESEND_API_KEY`
7. **Value**: Paste your Resend API key (the one that starts with `re_...`)
   - If you don't have one yet, go to https://resend.com and create an account
8. Click **"Save"** or **"Add"**

✅ **Done!** Now you can deploy the functions.

---

## Part F: Deploy the Functions

**In your terminal**, run these two commands **one at a time**:

### Deploy First Function:
```bash
npx supabase functions deploy send-job-application-email
```

**Wait for it to finish** - you should see "Function deployed successfully"

### Deploy Second Function:
```bash
npx supabase functions deploy send-application-status-email
```

**Wait for it to finish** - again, "Function deployed successfully"

---

## ✅ You're Done with Step 4!

If both functions deployed successfully, you're all set!

**Next:** Test it by applying for a job and checking if emails are sent.

---

## Troubleshooting

### "Command not found: supabase"
- **Fix**: Use `npx supabase` instead of just `supabase` for all commands

### "Not logged in"
- **Fix**: Run `npx supabase login` again

### "Project not linked"
- **Fix**: Make sure you copied the correct project reference
- Run `npx supabase link --project-ref YOUR_PROJECT_REF` again

### "Function not found"
- **Fix**: Make sure you're in the project folder:
  ```bash
  cd "/home/aanenih/Cursor Projects/naijafreelance"
  ```

### "Installing Supabase CLI as a global module is not supported"
- **This is normal!** Supabase CLI doesn't support global installation
- **Fix**: Use `npx supabase` for all commands (already set up ✅)

---

## Quick Checklist

Before deploying, make sure you have:
- [ ] Supabase CLI installed (or use npx)
- [ ] Logged in to Supabase (`supabase login`)
- [ ] Found your project reference
- [ ] Linked your project (`supabase link`)
- [ ] Added RESEND_API_KEY secret in Supabase Dashboard
- [ ] Resend API key ready (from https://resend.com)

---

## Need Help?

Tell me:
1. Which part (A, B, C, D, E, or F) are you on?
2. What error message do you see?
3. I'll help you fix it!

