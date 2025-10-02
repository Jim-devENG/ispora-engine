@echo off
echo 🚀 Starting iSpora PHP Backend...
echo.

REM Check if PHP is available
php --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PHP is not installed or not in PATH
    echo Please install PHP from https://php.net/downloads.php
    echo Or use XAMPP/WAMP which includes PHP
    pause
    exit /b 1
)

echo ✅ PHP is available
echo 📦 Starting PHP development server...
echo.
echo 🚀 iSpora PHP Backend Server starting...
echo 📊 Health check: http://localhost:3001/health
echo 🌍 Environment: development
echo 🔗 Frontend URL: http://localhost:5173
echo.

REM Start PHP development server
php -S localhost:3001 -t .

echo.
echo 🛑 Server stopped
pause
