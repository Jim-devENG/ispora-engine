from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from datetime import datetime, timedelta
import json
import sqlite3
from contextlib import asynccontextmanager

# Database setup
DATABASE_URL = "sqlite:///./ispora.db"

class Database:
    def __init__(self):
        self.conn = sqlite3.connect("ispora.db", check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.init_db()
    
    def init_db(self):
        cursor = self.conn.cursor()
        
        # Create tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                avatar_url TEXT,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'active',
                creator_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                scheduled_at TIMESTAMP NOT NULL,
                duration INTEGER DEFAULT 60,
                status TEXT DEFAULT 'upcoming',
                type TEXT DEFAULT 'video',
                meeting_link TEXT,
                location TEXT,
                is_public BOOLEAN DEFAULT 0,
                max_participants INTEGER,
                tags TEXT,
                agenda TEXT,
                notes TEXT,
                creator_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (creator_id) REFERENCES users (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'pending',
                priority TEXT DEFAULT 'medium',
                assignee_id TEXT,
                due_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (assignee_id) REFERENCES users (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT,
                type TEXT DEFAULT 'info',
                is_read BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        self.conn.commit()
    
    def get_connection(self):
        return self.conn

# Global database instance
db = Database()

# Pydantic models
class User(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    role: str = "user"
    created_at: datetime

class Project(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str = "active"
    creator_id: Optional[str] = None
    created_at: datetime

class Session(BaseModel):
    id: str
    project_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    scheduled_at: datetime
    duration: int = 60
    status: str = "upcoming"
    type: str = "video"
    meeting_link: Optional[str] = None
    location: Optional[str] = None
    is_public: bool = False
    max_participants: Optional[int] = None
    tags: Optional[str] = None
    agenda: Optional[str] = None
    notes: Optional[str] = None
    creator_id: Optional[str] = None
    created_at: datetime

class Task(BaseModel):
    id: str
    project_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    created_at: datetime

class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: Optional[str] = None
    type: str = "info"
    is_read: bool = False
    created_at: datetime

# FastAPI app
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 iSpora Python Backend starting up...")
    yield
    # Shutdown
    print("🛑 iSpora Python Backend shutting down...")

app = FastAPI(
    title="iSpora Backend API",
    description="Python FastAPI backend for iSpora application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - MUST be first
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:3000",
        "https://ispora.app",
        "https://www.ispora.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": "running"
    }

# CORS test endpoint
@app.get("/api/cors-test")
async def cors_test():
    return {
        "success": True,
        "message": "CORS test successful!",
        "timestamp": datetime.now().isoformat()
    }

# Feed endpoints
@app.get("/api/feed")
async def get_feed(page: int = 1, limit: int = 50):
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get feed items (simplified for now)
        cursor.execute("""
            SELECT 'project' as type, id, title, description, created_at 
            FROM projects 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        """, (limit, (page - 1) * limit))
        
        items = []
        for row in cursor.fetchall():
            items.append({
                "id": row["id"],
                "type": row["type"],
                "title": row["title"],
                "description": row["description"],
                "created_at": row["created_at"]
            })
        
        return {
            "success": True,
            "data": items,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(items)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Projects endpoints
@app.get("/api/projects")
async def get_projects(mine: bool = False):
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        if mine:
            # For now, return all projects (in real app, filter by user)
            cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
        else:
            cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
        
        projects = []
        for row in cursor.fetchall():
            projects.append(dict(row))
        
        return {"success": True, "data": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/projects")
async def create_project(project: Project):
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        project_id = f"proj_{int(datetime.now().timestamp() * 1000)}"
        
        cursor.execute("""
            INSERT INTO projects (id, title, description, status, creator_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            project_id,
            project.title,
            project.description,
            project.status,
            project.creator_id,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        
        return {"success": True, "data": {"id": project_id}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Sessions endpoints
@app.get("/api/sessions")
async def get_sessions(projectId: Optional[str] = None, status: Optional[str] = None):
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM sessions"
        params = []
        
        if projectId:
            query += " WHERE project_id = ?"
            params.append(projectId)
        
        if status and status != "all":
            if projectId:
                query += " AND status = ?"
            else:
                query += " WHERE status = ?"
            params.append(status)
        
        query += " ORDER BY scheduled_at DESC"
        
        cursor.execute(query, params)
        sessions = []
        for row in cursor.fetchall():
            sessions.append(dict(row))
        
        return {"success": True, "data": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sessions")
async def create_session(session_data: dict):
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        session_id = f"sess_{int(datetime.now().timestamp() * 1000)}"
        
        cursor.execute("""
            INSERT INTO sessions (
                id, project_id, title, description, scheduled_at, duration,
                status, type, meeting_link, location, is_public, max_participants,
                tags, agenda, notes, creator_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            session_data.get("projectId"),
            session_data.get("title"),
            session_data.get("description"),
            session_data.get("scheduledDate"),
            session_data.get("duration", 60),
            "upcoming",
            session_data.get("type", "video"),
            session_data.get("meetingLink"),
            session_data.get("location"),
            session_data.get("isPublic", False),
            session_data.get("maxParticipants"),
            session_data.get("tags", ""),
            session_data.get("agenda", ""),
            None,
            session_data.get("creatorId"),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        
        return {"success": True, "data": {"id": session_id}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Tasks endpoints
@app.get("/api/tasks")
async def get_tasks(projectId: Optional[str] = None):
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        if projectId:
            cursor.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC", (projectId,))
        else:
            cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
        
        tasks = []
        for row in cursor.fetchall():
            tasks.append(dict(row))
        
        return {"success": True, "data": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tasks")
async def create_task(task_data: dict):
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        task_id = f"task_{int(datetime.now().timestamp() * 1000)}"
        
        cursor.execute("""
            INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, due_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            task_id,
            task_data.get("projectId"),
            task_data.get("title"),
            task_data.get("description"),
            task_data.get("status", "pending"),
            task_data.get("priority", "medium"),
            task_data.get("assigneeId"),
            task_data.get("dueDate"),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        
        return {"success": True, "data": {"id": task_id}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Notifications endpoints
@app.get("/api/notifications")
async def get_notifications(filter: str = "all"):
    try:
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # For now, return mock notifications
        notifications = [
            {
                "id": "notif_1",
                "user_id": "user_1",
                "title": "Welcome to iSpora!",
                "message": "Your account has been created successfully.",
                "type": "info",
                "is_read": False,
                "created_at": datetime.now().isoformat()
            },
            {
                "id": "notif_2", 
                "user_id": "user_1",
                "title": "New Project Created",
                "message": "You have created a new project: 'My First Project'",
                "type": "success",
                "is_read": False,
                "created_at": datetime.now().isoformat()
            }
        ]
        
        return {"success": True, "data": notifications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Development endpoints
@app.get("/api/dev/verify")
async def verify_dev_key(x_dev_key: str = None):
    if x_dev_key == "CHANGE_ME_STRONG_KEY":
        return {"success": True, "message": "Dev access granted"}
    else:
        raise HTTPException(status_code=401, detail="Invalid dev key")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info"
    )
