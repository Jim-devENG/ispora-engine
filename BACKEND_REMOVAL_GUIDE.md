# Backend Removal Guide

## Overview

This guide documents the removal of the Node/Express backend after successful migration to Supabase.

## Migration Status

✅ **All functionality has been migrated to Supabase:**
- ✅ Authentication → Supabase Auth
- ✅ Database → Supabase PostgreSQL
- ✅ Real-time updates → Supabase Realtime
- ✅ File uploads → Supabase Storage
- ✅ All CRUD operations → Supabase queries/mutations

## What Can Be Removed

### Backend Directory Structure

The entire `backend/` directory can be removed:
```
backend/
├── src/              # All source files (deprecated)
├── dist/             # Compiled files (deprecated)
├── data/             # JSON database (deprecated)
├── uploads/          # Local file storage (deprecated)
├── node_modules/     # Backend dependencies (deprecated)
├── package.json      # Backend package config (deprecated)
├── tsconfig.json     # TypeScript config (deprecated)
└── ...               # All other backend files
```

### Backend Dependencies (No Longer Needed)

- `express` - API server
- `cors` - CORS middleware
- `jsonwebtoken` - JWT tokens (Supabase handles this)
- `bcryptjs` - Password hashing (Supabase handles this)
- `multer` - File uploads (Supabase Storage handles this)
- `ws` - WebSocket server (Supabase Realtime handles this)
- All related TypeScript types

### Frontend Cleanup

#### Files to Update:
1. **`frontend/src/utils/api.ts`**
   - Remove `API_BASE_URL` constant
   - Remove `apiRequest()` function (or mark as deprecated)
   - Remove all legacy API endpoint functions
   - Keep only Supabase utilities

2. **`frontend/src/utils/websocket.ts`**
   - Can be removed entirely (replaced by Supabase Realtime)

3. **`frontend/src/utils/sse.ts`**
   - Can be removed entirely (replaced by Supabase Realtime)

4. **Environment Variables**
   - Remove `VITE_API_BASE_URL` from `.env` files
   - Keep only Supabase environment variables

#### Components to Update:
- Remove all fallback logic to legacy API
- Remove all `workspaceAPI`, `projectAPI`, `feedAPI`, etc. calls
- Use only Supabase queries and mutations

## Cleanup Steps

### Step 1: Verify Migration Completeness

Before removing the backend, verify:
- [ ] All features work with Supabase only
- [ ] No critical errors in production
- [ ] All data has been migrated to Supabase
- [ ] All file uploads work with Supabase Storage
- [ ] Real-time updates work with Supabase Realtime

### Step 2: Remove Backend Directory

```bash
# Remove entire backend directory
rm -rf backend/
```

Or on Windows:
```powershell
Remove-Item -Recurse -Force backend\
```

### Step 3: Update Frontend Code

1. Remove legacy API imports
2. Remove fallback logic
3. Update error handling to only use Supabase
4. Remove WebSocket/SSE code

### Step 4: Update Documentation

- Update README.md
- Remove backend setup instructions
- Update deployment guides
- Update environment variable documentation

### Step 5: Update CI/CD

- Remove backend build steps
- Remove backend deployment steps
- Update Vercel configuration (already done)

## Files to Keep (For Reference)

You may want to keep these files for reference:
- `backend/README.md` - Historical documentation
- `backend/SETUP.md` - Setup instructions (for reference)
- `backend/data/database.json` - Sample data structure (for reference)

## Migration Checklist

- [x] Phase 1: Schema + Supabase Client Setup
- [x] Phase 2: Move Auth to Supabase Auth
- [x] Phase 3: Read Paths (GET) → Supabase
- [x] Phase 4: Write Paths (POST/PUT/DELETE) → Supabase
- [x] Phase 5: Realtime via Supabase Realtime
- [x] Phase 6: File Uploads → Supabase Storage
- [ ] Phase 7: Remove Node/Express Backend (In Progress)

## Post-Removal Verification

After removing the backend:
1. Test all features work correctly
2. Verify no console errors
3. Check that all data loads from Supabase
4. Verify file uploads work
5. Test real-time updates
6. Check authentication flow

## Rollback Plan

If issues arise after removal:
1. Restore backend from git history
2. Re-enable fallback logic in frontend
3. Investigate and fix Supabase issues
4. Re-attempt removal after fixes

## Notes

- The backend can be kept in git history for reference
- Consider archiving the backend code in a separate branch
- All functionality is now handled by Supabase
- No server infrastructure needed - fully serverless!

