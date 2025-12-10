# How to Start Backend and Frontend Servers

## ⚠️ Important: Use `npm run dev` NOT `npm start`

The `npm start` command requires the code to be built first. For development, always use `npm run dev`.

## Quick Start (Two Terminals)

### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```

### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```

## What Each Command Does

### Backend Commands
- `npm run dev` - ✅ **Use this for development** - Runs TypeScript directly with `tsx watch`
- `npm run build` - Builds TypeScript to JavaScript in `dist/` folder
- `npm start` - ❌ **Don't use this** - Requires build first, runs from `dist/server.js`

### Frontend Commands
- `npm run dev` - ✅ **Use this for development** - Starts Vite dev server
- `npm run build` - Builds for production
- `npm run preview` - Preview production build

## Expected Output

### Backend (Terminal 1)
```
🚀 Server running on http://localhost:3001
📡 WebSocket server running on ws://localhost:3001/ws
📁 Upload directory: C:\Users\...\backend\uploads
```

### Frontend (Terminal 2)
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Verify Servers

- **Backend:** http://localhost:3001/health
- **Frontend:** http://localhost:5173

## Troubleshooting

### Error: "Cannot find module 'dist/server.js'"
**Solution:** Use `npm run dev` instead of `npm start`

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will auto-use next available port

### Dependencies Not Installed
```powershell
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

