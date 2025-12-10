# Backend Server Restart Instructions

## Problem
The workspace routes are returning 404 errors even though they're defined in the code.

## Solution
The backend server needs to be **completely restarted** to load the new workspace routes.

## Steps to Fix

### 1. Stop the Current Backend Server
- Find the terminal/command prompt where the backend is running
- Press `Ctrl+C` to stop it
- **Wait for it to fully stop** (you should see the command prompt return)

### 2. Verify the Server is Stopped
- Check that no Node process is running on port 3001
- You can verify by trying to access `http://localhost:3001/health` - it should fail

### 3. Restart the Backend Server
```bash
cd backend
npm run dev
```

### 4. Verify Routes are Loaded
When the server starts, you should see these messages in the console:
```
✅ Workspace routes module loaded
✅ Workspace routes registered at /api/workspace
✅ Workspace routes object: object exists
🚀 Server running on http://localhost:3001
```

### 5. Test the Routes
Open a new terminal and test:
```bash
# Test the test route (no auth required)
curl http://localhost:3001/api/workspace/test

# Should return:
# {"message":"Workspace routes are working!","timestamp":"..."}
```

### 6. Check Request Logging
When you make requests to workspace routes, you should see logs like:
```
[GET] /api/workspace/1/voice-notes {} {}
[Workspace] GET /1/voice-notes
[Workspace] Returning 0 voice notes
```

## If Routes Still Don't Work

### Check for Import Errors
Look in the backend console for any errors like:
- `Cannot find module './routes/workspace.routes.js'`
- `SyntaxError` or `TypeError`
- Any red error messages

### Verify File Exists
```bash
cd backend
ls src/routes/workspace.routes.ts
# Should show the file exists
```

### Check TypeScript Compilation
```bash
cd backend
npm run build
# Should compile without errors
```

### Manual Route Test
Try accessing the route directly with authentication:
```bash
# Get your auth token from browser localStorage
# Then test:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/workspace/1/voice-notes
```

## Expected Behavior After Restart

1. **All workspace routes should return 200 OK** (or empty arrays `[]` if no data)
2. **No more 404 errors** in the browser console
3. **Request logs appear** in the backend console for each workspace API call
4. **Workroom tabs load** without errors (they'll show empty states if no data exists)

## Common Issues

### Issue: Routes still return 404 after restart
**Solution:** Check the backend console for the loading messages. If they don't appear, there's an import/compilation error.

### Issue: "Cannot find module" error
**Solution:** Make sure you're in the `backend` directory when running `npm run dev`

### Issue: Routes load but return 401 Unauthorized
**Solution:** This is expected - make sure you're logged in and the auth token is being sent.

### Issue: Routes load but return empty arrays
**Solution:** This is correct behavior when there's no data. Create some data through the UI to test.

## Next Steps After Restart

Once the routes are working:
1. Open the workroom in the frontend
2. Navigate to different tabs
3. Check the browser console - you should see successful API calls (200 status)
4. Check the backend console - you should see request logs
5. Try creating some data (sessions, tasks, etc.) to verify POST routes work

