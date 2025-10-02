# iSpora Simple Backend

A simplified Node.js backend for the iSpora application that's more reliable and easier to debug.

## Features

- ✅ **Express.js** - Simple, reliable web framework
- ✅ **SQLite Database** - Lightweight, file-based database
- ✅ **CORS Support** - Properly configured for frontend
- ✅ **Simple Setup** - Just run and go
- ✅ **No Complex Dependencies** - Minimal package.json

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Backend

```bash
# Option 1: Using the batch file (Windows)
start.bat

# Option 2: Direct command
node server.js
```

### 3. Test the Backend

- **Health Check**: http://localhost:3001/health
- **CORS Test**: http://localhost:3001/api/cors-test

## API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /api/cors-test` - CORS test
- `GET /api/feed` - Get feed items
- `GET /api/projects` - Get projects
- `POST /api/projects` - Create project
- `GET /api/sessions` - Get sessions
- `POST /api/sessions` - Create session
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task
- `GET /api/notifications` - Get notifications

## Database

The backend uses SQLite with the following tables:
- `users` - User accounts
- `projects` - User projects
- `sessions` - Mentorship sessions
- `tasks` - Project tasks
- `notifications` - User notifications

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:5173` (Frontend)
- `http://localhost:5174` (Alternative frontend port)
- `http://localhost:5175` (Alternative frontend port)
- `https://ispora.app` (Production)
- `https://www.ispora.app` (Production)

## Troubleshooting

### Port Already in Use
If port 3001 is already in use:
```bash
# Find and kill the process
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Node.js Not Found
Make sure Node.js is installed and in your PATH.

### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
npm install
```

## Why This Backend is Better

1. **Simpler Code** - No complex middleware or dependencies
2. **Better Error Handling** - Clear error messages and logging
3. **Reliable CORS** - Properly configured from the start
4. **Easy Debugging** - Simple structure makes issues easy to find
5. **Minimal Dependencies** - Less chance of version conflicts
