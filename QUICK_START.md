# 🚀 Quick Start Guide

## Automatic Setup Complete! ✅

All setup tasks have been completed automatically:

✅ Backend dependencies installed  
✅ Environment files created  
✅ Directories set up  
✅ API client created  
✅ Frontend integration started  

## Start the Application

### Windows (PowerShell)
```powershell
.\start-dev.ps1
```

### Linux/Mac
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/health

## Test the Setup

1. **Check Backend Health:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Register a Test User:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}'
   ```

3. **Login:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## What's Ready

- ✅ Complete backend API (all endpoints from FRONTEND_EXPECTATIONS.md)
- ✅ JWT Authentication
- ✅ File Upload Service
- ✅ WebSocket for Real-time Features
- ✅ Frontend API Client (`frontend/src/utils/api.ts`)
- ✅ ProfileContext integrated with API
- ✅ Development Scripts

## Next Steps

1. Start both servers using the scripts above
2. Open http://localhost:5173 in your browser
3. Register/login to test authentication
4. Explore the API using the frontend

## Documentation

- **Complete API Docs:** `FRONTEND_EXPECTATIONS.md`
- **Backend README:** `backend/README.md`
- **Setup Details:** `SETUP_COMPLETE.md`

## Troubleshooting

**Backend won't start?**
- Check if port 3001 is available
- Verify `backend/.env` exists
- Check `backend/data/` directory exists

**Frontend can't connect?**
- Ensure backend is running on port 3001
- Check browser console for errors
- Verify CORS settings in `backend/.env`

**Need to reset?**
- Delete `backend/data/database.json` to reset database
- Delete `backend/uploads/` to clear uploaded files

---

🎉 **You're all set! Start the servers and begin developing!**

