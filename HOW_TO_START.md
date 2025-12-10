# How to Start Backend and Frontend

## Method 1: Using the Startup Script (Easiest)

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

This will open two PowerShell windows:
- One for Backend (port 3001)
- One for Frontend (port 5173)

## Method 2: Manual Start (Two Terminals)

### Terminal 1 - Backend

```powershell
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:3001
📡 WebSocket server running on ws://localhost:3001/ws
```

### Terminal 2 - Frontend

```powershell
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Method 3: Start Each Server Separately

### Start Backend Only

```powershell
cd backend
npm run dev
```

### Start Frontend Only

```powershell
cd frontend
npm run dev
```

## Verify Servers Are Running

### Backend Health Check
Open in browser: http://localhost:3001/health
Or run: `curl http://localhost:3001/health`

Should return: `{"status":"ok","timestamp":"..."}`

### Frontend
Open in browser: http://localhost:5173

## Troubleshooting

### Backend Won't Start?
1. Check if port 3001 is already in use
2. Verify `backend/.env` file exists
3. Check `backend/data/` directory exists
4. Look for errors in the terminal

### Frontend Won't Start?
1. Check if port 5173 is already in use
2. Verify `frontend/node_modules` exists (run `npm install` if needed)
3. Check for TypeScript errors
4. Look for errors in the terminal

### Port Already in Use?
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will automatically use next available port

## Quick Commands Reference

```powershell
# Backend
cd backend
npm install          # Install dependencies (first time only)
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Frontend
cd frontend
npm install          # Install dependencies (first time only)
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

