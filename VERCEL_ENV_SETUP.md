# Vercel Environment Variables Setup

## Required Environment Variables

Your application needs the following environment variables set in Vercel:

### Supabase Configuration

1. **`VITE_SUPABASE_URL`**
   - Your Supabase project URL
   - Format: `https://xxxxx.supabase.co`
   - Find it in: Supabase Dashboard → Settings → API → Project URL

2. **`VITE_SUPABASE_ANON_KEY`**
   - Your Supabase anonymous/public key
   - Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Find it in: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

## How to Set Environment Variables in Vercel

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `ispora-engine`

2. **Open Project Settings**
   - Click on your project
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add Environment Variables**
   - Click **Add New**
   - For each variable:
     - **Name**: `VITE_SUPABASE_URL`
     - **Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
     - **Environment**: Select all (Production, Preview, Development)
     - Click **Save**
   
   - Repeat for:
     - **Name**: `VITE_SUPABASE_ANON_KEY`
     - **Value**: Your Supabase anon key

4. **Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger automatic redeployment

## Verification

After setting the environment variables and redeploying:

1. The app should load without the "Missing Supabase environment variables" error
2. You should be able to sign in/up
3. Data should load from Supabase

## Important Notes

- ⚠️ **Never commit** `.env` files with real credentials to Git
- ✅ Environment variables set in Vercel are automatically injected during build
- ✅ Variables prefixed with `VITE_` are exposed to the browser (this is expected for Supabase)
- ✅ The `anon` key is safe to expose - it's protected by Row Level Security (RLS) policies

## Troubleshooting

### Error: "Missing Supabase environment variables"
- **Solution**: Make sure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel
- **Solution**: Make sure you selected all environments (Production, Preview, Development)
- **Solution**: Redeploy after adding variables

### Error: "Invalid API key"
- **Solution**: Verify you're using the `anon` `public` key, not the `service_role` key
- **Solution**: Check that the key hasn't been rotated in Supabase

### Build succeeds but app doesn't work
- **Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Solution**: Check browser console for specific error messages

