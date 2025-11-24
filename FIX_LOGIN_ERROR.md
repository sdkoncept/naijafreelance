# Fix: "Access token not provided" Error

## What This Error Means

You tried to run a Supabase command, but you're not logged in yet. You need to authenticate first.

---

## Solution: Login to Supabase

**In your terminal**, run this command:

```bash
npx supabase login
```

---

## What Will Happen

1. **A browser window will open automatically**
   - If it doesn't open, look in the terminal for a URL
   - Copy that URL and paste it into your browser

2. **You'll see a Supabase login page**
   - Log in with your Supabase account
   - Click "Authorize" or "Allow"

3. **You'll see "Success! You can close this window"**
   - Close the browser window
   - Go back to your terminal

4. **Terminal will show "Logged in successfully"**
   - Now you can run other commands!

---

## After Login, Continue With:

### Step 1: Get Your Project Reference
1. Go to: https://supabase.com/dashboard
2. Click your project
3. Look at URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
4. Copy the part after `/project/`

### Step 2: Link Your Project
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Step 3: Deploy Functions
```bash
npx supabase functions deploy send-job-application-email
npx supabase functions deploy send-application-status-email
```

---

## Troubleshooting

### Browser didn't open?
- Look in terminal for a URL starting with `https://`
- Copy and paste it into your browser manually

### "Already logged in" but still getting error?
- Try logging out and back in:
  ```bash
  npx supabase logout
  npx supabase login
  ```

### Still not working?
- Make sure you're using `npx supabase` (not just `supabase`)
- Check you're in the project folder:
  ```bash
  cd "/home/aanenih/Cursor Projects/naijafreelance"
  ```


