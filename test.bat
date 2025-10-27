@echo off
echo Starting server test...
node src/server.js &
timeout /t 3 /nobreak > nul
echo Testing health endpoint...
curl -s http://localhost:5000/api/health
echo.
echo Test complete.
taskkill /f /im node.exe > nul 2>&1
