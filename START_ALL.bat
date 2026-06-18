@echo off
REM ========================================
REM Car Insurance Prediction - Startup Script
REM ========================================
REM This script opens 3 terminals for:
REM 1. Flask ML API (Python)
REM 2. Node.js Backend  
REM 3. React Frontend

echo.
echo ========================================
echo 🚗 Car Insurance Claim Prediction
echo ========================================
echo.
echo Starting all services...
echo.

REM Terminal 1: Flask ML API (UPDATED PATH)
echo [1/3] Starting Flask ML API on port 5001...
start "ML API (Python)" cmd /k "cd E:\PROJECTS\car\ml_api && python app.py"
timeout /t 3

REM Terminal 2: Node.js Backend
echo [2/3] Starting Node.js Backend on port 5000...
start "Node Backend" cmd /k "cd E:\PROJECTS\car\backend && npm start"
timeout /t 3

REM Terminal 3: React Frontend
echo [3/3] Starting React Frontend on port 3000...
start "React Frontend" cmd /k "cd E:\PROJECTS\car && npm start"

echo.
echo ========================================
echo ✅ All services started!
echo ========================================
echo.
echo Access the application at: http://localhost:3000
echo.
echo Services Running:
echo 📊 ML API (Flask):      http://127.0.0.1:5001
echo 🔌 Backend (Node.js):   http://localhost:5000
echo 🎨 Frontend (React):    http://localhost:3000
echo.
echo Press any key to close this window...
pause
