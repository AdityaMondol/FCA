@echo off
cls
echo ========================================
echo   Farid Cadet Academy
echo   Full-Stack Application Launcher
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/4] Installing backend dependencies...
    call npm install
    echo.
) else (
    echo [1/4] Backend dependencies already installed
    echo.
)

REM Check if frontend/node_modules exists
if not exist "frontend\node_modules\" (
    echo [2/4] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
) else (
    echo [2/4] Frontend dependencies already installed
    echo.
)

REM Build frontend
echo [3/4] Building frontend...
cd frontend
call npm run build
cd ..
echo.

REM Start server
echo [4/4] Starting production server...
echo.
echo ========================================
echo   Server Starting...
echo ========================================
echo.

echo   Frontend and Backend: http://localhost:3000
echo   Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm start