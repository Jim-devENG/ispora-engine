@echo off
echo 🚀 Starting iSpora Python Backend...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

echo 📦 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📦 Installing dependencies...
pip install -r requirements.txt

echo.
echo 🚀 Starting server...
echo 📊 Health check: http://localhost:3001/health
echo 🌍 Environment: development
echo 🔗 Frontend URL: http://localhost:5173
echo.

python run.py

pause
