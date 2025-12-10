# Vercel Deployment Configuration

This document explains how to deploy Impact Engine (Vite React app) to Vercel.

## Issue

Vercel was auto-detecting the project as Next.js, but this is a **Vite React application**. The `vercel.json` configuration files fix this.

## ⚠️ IMPORTANT: Set Root Directory in Vercel

**You MUST set the Root Directory in Vercel project settings:**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. Find **Root Directory** setting
4. Set it to: `frontend`
5. Click **Save**

This tells Vercel to:
- Only look at the `frontend/` directory
- Use `frontend/package.json` (not backend)
- Use `frontend/vercel.json` configuration
- Avoid installing backend dependencies

## Configuration Files

### Root Directory = Frontend (REQUIRED)

When Root Directory is set to `frontend`:
- Vercel uses: `frontend/vercel.json`
- Builds only the frontend
- Installs only frontend dependencies

### Root Directory = Repository Root (Not Recommended)

If Root Directory is set to repository root:
- Vercel uses: `vercel.json` (at root)
- Builds from monorepo root
- May install backend dependencies unnecessarily

## Environment Variables

Set these in Vercel project settings (**Settings** → **Environment Variables**):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Build Configuration

The `vercel.json` files configure:

- **Framework**: `null` (explicitly not Next.js)
- **Build Command**: `npm run build` (runs Vite build)
- **Output Directory**: `dist` (Vite's default output)
- **Rewrites**: All routes → `index.html` (for React Router SPA)

## Deployment Steps

1. **Connect Repository to Vercel**
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

2. **Set Root Directory** (if using Option 1)
   - Settings → General → Root Directory: `frontend`

3. **Add Environment Variables**
   - Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Or trigger manual deployment

## Troubleshooting

### Error: "No Next.js version detected"

**Solution**: The `vercel.json` with `"framework": null` should fix this. Make sure:
- The correct `vercel.json` is in the root directory (if root is repo root)
- OR the `frontend/vercel.json` is used (if root is frontend folder)
- The Root Directory setting in Vercel matches your choice

### Build Fails: "Cannot find module"

**Solution**: Make sure the build command runs from the correct directory:
- If Root Directory = `frontend`: Build command is `npm run build`
- If Root Directory = repo root: Build command is `cd frontend && npm run build`

### Routes Not Working (404 on refresh)

**Solution**: The `rewrites` configuration in `vercel.json` should handle this. It routes all requests to `index.html` for client-side routing.

## Notes

- The backend (Node/Express) is **not** deployed to Vercel
- Only the frontend (Vite React app) is deployed
- Backend should be deployed separately (e.g., Railway, Render, Heroku)
- Or use Supabase Edge Functions for backend logic (after migration)

## After Supabase Migration

Once the migration to Supabase is complete:
- No backend deployment needed
- Frontend connects directly to Supabase
- All backend logic handled by Supabase (Auth, Database, Storage, Realtime)

