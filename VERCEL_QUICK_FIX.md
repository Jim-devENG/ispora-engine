# Vercel Quick Fix - Root Directory Error

## Current Error

```
The specified Root Directory "vercel.json" does not exist.
```

## The Problem

You set Root Directory to `"vercel.json"` in Vercel dashboard, but:
- `vercel.json` is a **file**, not a directory
- Vercel is looking for a directory named "vercel.json" which doesn't exist

## The Fix (30 seconds)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project: `ispora-engine`

2. **Open Settings**
   - Click **Settings** tab
   - Click **General** in left sidebar

3. **Fix Root Directory**
   - Find **Root Directory** setting
   - Click **Edit**
   - **DELETE/CLEAR the value** (make it empty)
   - OR set it to: `.` (just a dot)
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment

## Why This Works

When Root Directory is **empty** (or `.`):
- Vercel uses the repository root
- Reads `vercel.json` from root
- The `vercel.json` file has:
  ```json
  {
    "buildCommand": "cd frontend && npm install && npm run build",
    "outputDirectory": "frontend/dist"
  }
  ```
- This tells Vercel to build from `frontend/` automatically

## Summary

**Wrong:** Root Directory = `"vercel.json"` ❌  
**Correct:** Root Directory = empty or `"."` ✅

That's it! Clear the Root Directory field and redeploy.

