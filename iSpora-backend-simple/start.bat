@echo off
echo 🚀 Starting iSpora Simple Backend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

echo.
echo 🚀 Starting server...
echo 📊 Health check: http://localhost:3001/health
echo 🌍 Environment: development
echo 🔗 Frontend URL: http://localhost:5173
echo.

node server.js

pause
