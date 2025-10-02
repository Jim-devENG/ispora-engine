# iSpora Python Backend

A Python FastAPI backend for the iSpora application, replacing the Node.js backend.

## Features

- ✅ **FastAPI** - Modern, fast Python web framework
- ✅ **SQLite Database** - Lightweight, file-based database
- ✅ **CORS Support** - Properly configured for frontend
- ✅ **Auto Documentation** - Swagger UI at `/docs`
- ✅ **Type Safety** - Pydantic models for data validation
- ✅ **Easy Setup** - Simple installation and run

## Quick Start

### 1. Install Python Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 2. Run the Backend

```bash
# Option 1: Using the run script
python run.py

# Option 2: Using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

### 3. Test the Backend

- **Health Check**: http://localhost:3001/health
- **API Docs**: http://localhost:3001/docs
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

## Development

The backend runs with auto-reload enabled, so changes to the code will automatically restart the server.

## Troubleshooting

### Port Already in Use
If port 3001 is already in use:
```bash
# Find and kill the process
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Python Not Found
Make sure Python 3.8+ is installed and in your PATH.

### Dependencies Issues
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```
