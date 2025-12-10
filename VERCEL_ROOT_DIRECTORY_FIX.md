# Fix: "Root Directory 'frontend' does not exist" Error

## The Problem

Vercel says: `The specified Root Directory "frontend" does not exist.`

This means Vercel can't find the `frontend` directory in your GitHub repository.

## Possible Causes

1. **Directory not committed to git** - The `frontend` folder might be in `.gitignore`
2. **Case sensitivity** - GitHub is case-sensitive, Windows is not
3. **Different directory name** - The folder might have a different name in the repo

## Solution 1: Verify Directory Exists in GitHub

1. **Check your GitHub repository:**
   - Go to: https://github.com/Jim-devENG/ispora-engine
   - Look at the root directory listing
   - Verify `frontend` folder exists and is visible

2. **If `frontend` is missing:**
   ```bash
   # Make sure frontend is committed
   git add frontend/
   git commit -m "Add frontend directory"
   git push
   ```

3. **Check for .gitignore:**
   - Look for `.gitignore` files that might exclude `frontend/`
   - Common patterns that would exclude it:
     ```
     frontend/
     */node_modules/
     dist/
     ```

## Solution 2: Use Root Directory = Repository Root

If you can't get the `frontend` directory recognized, use the root `vercel.json` instead:

1. **In Vercel Dashboard:**
   - Settings → General → Root Directory
   - **Clear/Remove** the Root Directory setting (leave it empty)
   - This will use the repository root

2. **The root `vercel.json` will handle it:**
   - It has: `"buildCommand": "cd frontend && npm install && npm run build"`
   - It has: `"outputDirectory": "frontend/dist"`

## Solution 3: Check Directory Name

Verify the exact directory name in your repository:

1. **On GitHub:**
   - Check if it's `frontend`, `Frontend`, `FRONTEND`, or something else
   - Use the exact case-sensitive name in Vercel settings

2. **Common variations:**
   - `frontend` ✅ (lowercase - most common)
   - `Frontend` (capitalized)
   - `src` (if renamed)
   - `app` (if renamed)

## Solution 4: Alternative - Deploy Frontend as Separate Repo

If the monorepo structure is causing issues:

1. **Create a separate repository** for frontend only
2. **Push frontend code** to the new repo
3. **Deploy that repo** to Vercel (no Root Directory needed)

## Quick Check Commands

Run these locally to verify:

```bash
# Check if frontend is tracked by git
git ls-files frontend/ | head -5

# Check if frontend is ignored
git check-ignore -v frontend/

# List all directories in repo
git ls-tree -d --name-only HEAD
```

## Recommended Action

**Try Solution 2 first** (use root directory with root `vercel.json`):

1. In Vercel: Clear Root Directory setting (set to empty/root)
2. The root `vercel.json` will build from `frontend/` automatically
3. Redeploy

This should work because the root `vercel.json` explicitly tells Vercel to:
- Run: `cd frontend && npm install && npm run build`
- Output to: `frontend/dist`

---

**Most Likely Issue:** The `frontend` directory isn't committed to your GitHub repository, or it's being ignored by `.gitignore`.

