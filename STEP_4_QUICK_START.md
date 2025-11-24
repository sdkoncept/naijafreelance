# Step 4: Quick Start Guide

## ✅ Good News!

The error you saw is **normal** - Supabase CLI doesn't support global installation. But we already have it working! Just use `npx supabase` for everything.

---

## Follow These Steps (Copy & Paste):

### 1. Open Terminal
Open your terminal/command prompt.

### 2. Go to Project Folder
```bash
cd "/home/aanenih/Cursor Projects/naijafreelance"
```

### 3. Login to Supabase
```bash
npx supabase login
```
- Browser will open → Log in → Authorize
- Terminal will say "Logged in successfully"

### 4. Get Your Project Reference
1. Go to: https://supabase.com/dashboard
2. Click your project
3. Look at URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
4. Copy the part after `/project/`

### 5. Link Project
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```
(Replace `YOUR_PROJECT_REF` with what you copied)

### 6. Add Resend API Key
1. Supabase Dashboard → Edge Functions → Secrets
2. Click "New Secret"
3. Name: `RESEND_API_KEY`
4. Value: Your Resend API key (from https://resend.com)
5. Save

### 7. Deploy Functions
```bash
npx supabase functions deploy send-job-application-email
```

Wait for success, then:

```bash
npx supabase functions deploy send-application-status-email
```

---

## ✅ Done!

Both functions are now deployed and ready to send emails!

---

## Need Help?

Tell me which step you're on and I'll help! 🚀


