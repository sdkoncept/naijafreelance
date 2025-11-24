# Welcome to your Lovable project

## Project info

**URL**: https://naijafreelance.sdkoncept.com

## How can I edit this code?

There are several ways of editing your application.


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Quick Deploy (Recommended: Vercel)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel login
   vercel --prod
   ```

3. **Add Environment Variables** in Vercel Dashboard:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon key

4. **Redeploy** after adding environment variables

### Other Deployment Options

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- Vercel (Recommended)
- Netlify
- GitHub Pages
- Railway
- Render

### Supabase Setup

Before deploying, ensure:
- ✅ Supabase project is created
- ✅ Database migrations are applied (see `supabase/migrations/`)
- ✅ Environment variables are configured
- ✅ Auth redirect URLs are set in Supabase dashboard

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.
