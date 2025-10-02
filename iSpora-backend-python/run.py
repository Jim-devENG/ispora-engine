#!/usr/bin/env python3
"""
iSpora Python Backend Runner
Simple script to start the FastAPI server
"""

import uvicorn
import os
from main import app

if __name__ == "__main__":
    print("🚀 Starting iSpora Python Backend...")
    print("📊 Health check: http://localhost:3001/health")
    print("🌍 Environment: development")
    print("🔗 Frontend URL: http://localhost:5173")
    print("✅ Database: SQLite")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3001,
        reload=True,
        log_level="info"
    )
