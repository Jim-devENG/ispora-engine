# Impact Engine

A full-stack application for connecting diaspora communities, managing projects, opportunities, and mentorship programs.

## 🎉 Migration Complete!

**The application has been successfully migrated to Supabase!** All functionality is now powered by Supabase services (Auth, Database, Storage, Realtime).

## Project Structure

```
impact-engine/
├── frontend/          # React + TypeScript + Vite frontend
├── supabase/          # Supabase migrations and configuration
│   └── migrations/   # Database schema and policies
├── backend/           # ⚠️ DEPRECATED - Ready for removal (see BACKEND_REMOVAL_GUIDE.md)
├── FRONTEND_EXPECTATIONS.md  # Complete API documentation
└── README.md          # This file
```

## Architecture

### Current Stack (Supabase-Powered)
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Deployment**: Vercel (Frontend only)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

## Quick Start

### Prerequisites

1. **Supabase Project**
   - Create a project at https://app.supabase.com
   - Get your project URL and anon key

2. **Environment Variables**
   - Copy `frontend/env.example.txt` to `frontend/.env.local`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Apply Database Migrations**
   - Run all SQL files from `supabase/migrations/` in Supabase SQL Editor
   - Order: 001 → 002 → 003 → 004 → 005

### Start Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)

Create `backend/.env` with:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d
DATABASE_URL=./data/database.json
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:5173
WS_PORT=3002
```

### Frontend

Create `frontend/.env` (optional):
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Features

### Backend API
- ✅ RESTful API with Express.js
- ✅ JWT Authentication
- ✅ File Upload (images, documents, videos, audio)
- ✅ WebSocket for real-time features
- ✅ JSON file-based database (easily replaceable)

### Frontend
- ✅ React 18 with TypeScript
- ✅ Vite for fast development
- ✅ Tailwind CSS for styling
- ✅ Radix UI components
- ✅ Complete UI matching Figma design

## Database Setup

1. **Apply Migrations**
   - Run SQL files from `supabase/migrations/` in Supabase SQL Editor
   - Order: `001_initial_schema.sql` → `002_create_profile_trigger.sql` → `003_rls_policies.sql` → `004_enable_realtime.sql` → `005_create_storage_buckets.sql`

2. **Verify Setup**
   - Check Supabase Dashboard → Database → Tables
   - Check Supabase Dashboard → Storage → Buckets
   - Check Supabase Dashboard → Database → Replication (Realtime)

## Development

### Frontend Commands
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Migration Documentation

- **`MIGRATION_COMPLETE.md`** - Complete migration overview
- **`MIGRATION_SUMMARY.md`** - Quick summary
- **`BACKEND_REMOVAL_GUIDE.md`** - Backend cleanup instructions
- **`SUPABASE_MIGRATION_GUIDE.md`** - Detailed migration guide
- **`PHASE_*_COMPLETE.md`** - Individual phase summaries

## Troubleshooting

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase Dashboard for project status
- Verify migrations have been applied

### Authentication Issues
- Check Supabase Auth settings
- Verify email confirmation settings
- Check RLS policies are active

### Real-time Not Working
- Verify Realtime is enabled in Supabase Dashboard
- Check migration `004_enable_realtime.sql` was applied
- Verify RLS policies allow access

### File Upload Issues
- Check storage buckets exist in Supabase Dashboard
- Verify storage policies are active
- Check file size limits and MIME type restrictions

## License

ISC

