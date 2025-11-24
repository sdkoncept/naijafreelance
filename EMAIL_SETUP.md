# Email Notification Setup Guide

This guide explains how to set up email notifications for job applications.

## Overview

The system sends email notifications when:
1. A freelancer applies for a job (notifies the client)
2. A client accepts an application (notifies the freelancer)
3. A client declines an application (notifies the freelancer)

## Option 1: Supabase Edge Functions (Recommended)

### Step 1: Create Edge Function for Job Application Emails

1. Go to Supabase Dashboard → Edge Functions
2. Create a new function: `send-job-application-email`
3. Use this code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, clientName, freelancerName, jobTitle, jobId, applicationUrl } = await req.json()

    const emailBody = `
      <h2>New Job Application</h2>
      <p>Hello ${clientName},</p>
      <p><strong>${freelancerName}</strong> has applied for your job: <strong>${jobTitle}</strong></p>
      <p><a href="${applicationUrl}">View Application</a></p>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'NaijaFreelance <noreply@yourdomain.com>',
        to: [to],
        subject: `New Application: ${jobTitle}`,
        html: emailBody,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### Step 2: Create Edge Function for Application Status

Create another function: `send-application-status-email`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, freelancerName, jobTitle, status, reason, jobUrl } = await req.json()

    const statusText = status === 'accepted' ? 'accepted' : 'declined'
    const emailBody = `
      <h2>Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h2>
      <p>Hello ${freelancerName},</p>
      <p>Your application for <strong>${jobTitle}</strong> has been <strong>${statusText}</strong>.</p>
      ${reason ? `<p>Reason: ${reason}</p>` : ''}
      <p><a href="${jobUrl}">View Job</a></p>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'NaijaFreelance <noreply@yourdomain.com>',
        to: [to],
        subject: `Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}: ${jobTitle}`,
        html: emailBody,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### Step 3: Set Up Resend (Email Service)

1. Sign up at https://resend.com
2. Get your API key
3. Add to Supabase Edge Functions secrets:
   - Go to Project Settings → Edge Functions → Secrets
   - Add: `RESEND_API_KEY=your_resend_api_key`

### Step 4: Deploy Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy send-job-application-email
supabase functions deploy send-application-status-email
```

## Option 2: Use Supabase Built-in Email (Limited)

Supabase has built-in email capabilities but they're limited. You can use database triggers to send emails, but this requires more setup.

## Option 3: Third-party Service (SendGrid, Mailgun, etc.)

Similar to Resend, you can use any email service provider. Just update the Edge Function code to use their API.

## Testing

1. Apply for a job as a freelancer
2. Check the client's email inbox
3. Accept/decline the application
4. Check the freelancer's email inbox

## Troubleshooting

### Emails not sending

1. Check Edge Function logs in Supabase Dashboard
2. Verify API keys are set correctly
3. Check email service provider dashboard for delivery status
4. Ensure email addresses are valid

### Function not found error

- Make sure Edge Functions are deployed
- Check function names match exactly
- Verify Supabase project is linked correctly

## Notes

- Email sending is non-blocking - if it fails, the application still goes through
- Email addresses are fetched from the profiles table
- Make sure users have valid email addresses in their profiles

