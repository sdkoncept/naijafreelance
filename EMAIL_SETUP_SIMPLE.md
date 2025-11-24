# Email Setup - Step by Step Guide (Baby Steps)

This guide will walk you through setting up email notifications for job applications in the simplest way possible.

## Prerequisites

Before starting, make sure you have:
- ✅ A Supabase account (you already have this)
- ✅ Node.js installed on your computer (check with `node --version` in terminal)
- ✅ A Resend account (free email service) - we'll create this

---

## Part 1: Set Up Resend (Email Service)

### Step 1.1: Create Resend Account
1. Go to https://resend.com
2. Click "Sign Up" (you can use Google/GitHub to sign up quickly)
3. Complete the signup process
4. Verify your email address if asked

### Step 1.2: Get Your API Key
1. After logging in, you'll see a dashboard
2. Look for "API Keys" in the left sidebar (or go to https://resend.com/api-keys)
3. Click "Create API Key"
4. Give it a name like "NaijaFreelance"
5. Click "Create"
6. **IMPORTANT**: Copy the API key immediately (it starts with `re_...`)
   - You won't be able to see it again!
   - Save it somewhere safe (like a text file)

### Step 1.3: Add Domain (Optional for Testing)
- For testing, you can use Resend's test domain
- For production, you'll need to add your own domain
- For now, we'll skip this and use test mode

---

## Part 2: Install Supabase CLI

### Step 2.1: Open Your Terminal
- On Windows: Open Command Prompt or PowerShell
- On Mac/Linux: Open Terminal
- Navigate to your project folder:
  ```bash
  cd "/home/aanenih/Cursor Projects/naijafreelance"
  ```

### Step 2.2: Install Supabase CLI
Type this command and press Enter:
```bash
npm install -g supabase
```

**What this does**: Installs the Supabase command-line tool globally on your computer.

**Wait for it to finish** - you'll see something like "added 50 packages" when done.

### Step 2.3: Verify Installation
Type this to check if it worked:
```bash
supabase --version
```

You should see a version number like `1.123.4`. If you see an error, let me know!

---

## Part 3: Login to Supabase

### Step 3.1: Login Command
Type this command:
```bash
supabase login
```

### Step 3.2: What Happens Next
1. A browser window will open automatically
2. If it doesn't, copy the URL that appears in the terminal
3. Paste it into your browser
4. You'll be asked to log in to Supabase
5. Click "Authorize" or "Allow"
6. You'll see "Success! You can close this window"
7. Go back to your terminal - it should say "Logged in successfully"

---

## Part 4: Link Your Project

### Step 4.1: Find Your Project Reference
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Click on your project (NaijaFreelance or whatever you named it)
3. Look at the URL in your browser - it will be like:
   `https://supabase.com/dashboard/project/abcdefghijklmnop`
4. The part after `/project/` is your project reference (the long string of letters/numbers)
5. Copy this entire string

### Step 4.2: Link Command
In your terminal, type:
```bash
supabase link --project-ref YOUR_PROJECT_REF_HERE
```

**Replace `YOUR_PROJECT_REF_HERE`** with the string you copied.

**Example** (don't use this, use YOUR actual project ref):
```bash
supabase link --project-ref abcdefghijklmnopqrstuvwxyz123456
```

Press Enter.

### Step 4.3: Verify Link
You should see a message like "Linked to project abcdefghijklmnop"

---

## Part 5: Create the Email Functions

### Step 5.1: Create Functions Folder
In your terminal, make sure you're in your project folder, then type:
```bash
mkdir -p supabase/functions
```

This creates a folder for your functions.

### Step 5.2: Create First Function - Job Application Email

Create a new file: `supabase/functions/send-job-application-email/index.ts`

**On Windows (using Notepad)**:
1. Open Notepad
2. Copy the code below
3. Save as `index.ts` in: `supabase/functions/send-job-application-email/index.ts`

**On Mac/Linux (using terminal)**:
```bash
mkdir -p supabase/functions/send-job-application-email
```

Then create the file with this content:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, clientName, freelancerName, jobTitle, jobId, applicationUrl } = await req.json()

    const emailBody = `
      <h2>New Job Application</h2>
      <p>Hello ${clientName},</p>
      <p><strong>${freelancerName}</strong> has applied for your job: <strong>${jobTitle}</strong></p>
      <p><a href="${applicationUrl}">View Application</a></p>
      <p>Best regards,<br>NaijaFreelance Team</p>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'NaijaFreelance <onboarding@resend.dev>',
        to: [to],
        subject: `New Application: ${jobTitle}`,
        html: emailBody,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### Step 5.3: Create Second Function - Application Status Email

Create: `supabase/functions/send-application-status-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, freelancerName, jobTitle, status, reason, jobUrl } = await req.json()

    const statusText = status === 'accepted' ? 'accepted' : 'declined'
    const statusEmoji = status === 'accepted' ? '✅' : '❌'
    
    const emailBody = `
      <h2>${statusEmoji} Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h2>
      <p>Hello ${freelancerName},</p>
      <p>Your application for <strong>${jobTitle}</strong> has been <strong>${statusText}</strong>.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p><a href="${jobUrl}">View Job</a></p>
      <p>Best regards,<br>NaijaFreelance Team</p>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'NaijaFreelance <onboarding@resend.dev>',
        to: [to],
        subject: `Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}: ${jobTitle}`,
        html: emailBody,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

---

## Part 6: Add API Key to Supabase

### Step 6.1: Go to Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "Edge Functions" in the left sidebar
4. Click on "Secrets" tab

### Step 6.2: Add Secret
1. Click "Add Secret" or "New Secret"
2. Name: `RESEND_API_KEY`
3. Value: Paste your Resend API key (the one that starts with `re_...`)
4. Click "Save" or "Add"

---

## Part 7: Deploy the Functions

### Step 7.1: Deploy First Function
In your terminal, type:
```bash
supabase functions deploy send-job-application-email
```

**What to expect**:
- It will say "Deploying function..."
- Then "Function deployed successfully"
- If you see errors, let me know!

### Step 7.2: Deploy Second Function
Type:
```bash
supabase functions deploy send-application-status-email
```

Again, wait for "Function deployed successfully"

---

## Part 8: Test It!

### Step 8.1: Test the Setup
1. Go to your website
2. Post a job as a client
3. Apply for the job as a freelancer
4. Check the client's email inbox - they should receive an email!

### Step 8.2: If Emails Don't Send
1. Check Supabase Dashboard → Edge Functions → Logs
2. Look for any error messages
3. Verify the RESEND_API_KEY secret is set correctly
4. Check Resend dashboard for email delivery status

---

## Troubleshooting

### "Command not found: supabase"
- Make sure you installed it: `npm install -g supabase`
- Try closing and reopening your terminal

### "Not logged in"
- Run `supabase login` again
- Make sure the browser window opened and you authorized it

### "Project not linked"
- Run `supabase link --project-ref YOUR_PROJECT_REF` again
- Make sure you copied the correct project reference

### "Function not found" when testing
- Make sure you deployed both functions
- Check the function names match exactly

### Emails not sending
- Check Resend API key is correct
- Check Supabase Edge Functions logs
- Make sure the secret name is exactly `RESEND_API_KEY`

---

## Quick Reference Commands

Copy and paste these one by one (replace YOUR_PROJECT_REF):

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link project (replace with YOUR project ref)
supabase link --project-ref YOUR_PROJECT_REF_HERE

# 4. Deploy functions
supabase functions deploy send-job-application-email
supabase functions deploy send-application-status-email
```

---

## Need Help?

If you get stuck at any step:
1. Copy the exact error message
2. Tell me which step you're on
3. I'll help you fix it!

