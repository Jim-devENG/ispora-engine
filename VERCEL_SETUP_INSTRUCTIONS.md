# Vercel Setup Instructions - Fix "Next.js Detection" Error

## What Vercel Should Detect

Vercel should detect your project as: **Vite** (not Next.js)

### Detection Indicators (All Present ✅)

Your `frontend/package.json` has:
- ✅ `"vite": "^5.0.0"` in devDependencies
- ✅ `"build": "tsc && vite build"` script
- ✅ `vite.config.ts` file exists

Vercel should automatically detect this as a **Vite** application.

---

## The Problem

Vercel is trying to detect Next.js because:
1. **Root Directory is NOT set to `frontend`** in Vercel dashboard
2. Vercel is scanning the repository root (which has no `package.json`)
3. Without clear indicators, Vercel defaults to Next.js detection

---

## ⚠️ CRITICAL: Root Directory Setting

**DO NOT set Root Directory to `"vercel.json"`** - that's a file, not a directory!

**Correct Options:**
1. **Leave Root Directory EMPTY** (recommended) - Uses root `vercel.json`
2. **Set to `"."`** - Same as empty, uses root
3. **Set to `"frontend"`** - Only if `frontend/` exists in your GitHub repo

## ⚠️ IMPORTANT: If You Get "Root Directory 'frontend' does not exist"

If Vercel says the `frontend` directory doesn't exist:

1. **Check GitHub repository** - Verify `frontend/` folder exists in your repo
2. **Check .gitignore** - Make sure `frontend/` isn't ignored
3. **Alternative:** Clear Root Directory setting and use root `vercel.json` instead

See `VERCEL_ROOT_DIRECTORY_FIX.md` for detailed troubleshooting.

## Solution: Set Root Directory in Vercel Dashboard (Recommended)

### ⚠️ CRITICAL: You MUST Set Root Directory

The error shows Vercel is building from the root and running the backend build script. You **must** set Root Directory to `frontend` in Vercel dashboard.

### Step-by-Step Fix

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `ispora-engine`

2. **Open Project Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **General** in the left sidebar

3. **Set Root Directory** ⚠️ THIS IS REQUIRED
   - Find **Root Directory** setting
   - Click **Edit**
   - Enter: `frontend`
   - Click **Save**

4. **Verify Build Settings**
   - In the same Settings → General page
   - Verify:
     - **Framework Preset:** Should show "Vite" (or "Other")
     - **Build Command:** Should be `npm run build`
     - **Output Directory:** Should be `dist`
   - If these are wrong, click **Override** and set them manually

5. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - OR push a new commit to trigger a new deployment

---

## What Happens After Setting Root Directory

Once Root Directory is set to `frontend`:

✅ Vercel will:
- Look at `frontend/package.json` (not root)
- See `vite` in dependencies
- See `vite.config.ts`
- Detect framework as **Vite** automatically
- Use `frontend/vercel.json` configuration
- Build command: `npm run build`
- Output directory: `dist`

❌ Vercel will NOT:
- Try to detect Next.js
- Install backend dependencies
- Look for `next.config.js`

---

## Verification

After setting Root Directory and redeploying, you should see in build logs:

```
✓ Detected Vite
✓ Running "npm run build"
✓ Output Directory: dist
```

Instead of:
```
✗ Error: No Next.js version detected
```

---

## Alternative: If You Can't Set Root Directory

If for some reason you can't set Root Directory in Vercel dashboard, the root `vercel.json` will work, but it's less optimal:

- Uses: `vercel.json` (at repository root)
- Build command: `cd frontend && npm ci && npm run build`
- Output directory: `frontend/dist`

However, **setting Root Directory to `frontend` is strongly recommended** as it's cleaner and more efficient.

---

## Environment Variables

Don't forget to set these in Vercel:

**Settings** → **Environment Variables**:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Summary

**What Vercel Should Detect:** Vite ✅  
**What It's Currently Detecting:** Next.js ❌  
**Fix:** Set Root Directory to `frontend` in Vercel dashboard

This is a **Vercel dashboard setting issue**, not a code issue. The code is correctly configured for Vite.

