@echo off
cls
echo ========================================
echo   Farid Cadet Academy
echo   Development Mode Launcher
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing backend dependencies...
    call npm install
    echo.
)

REM Check if frontend-svelte/node_modules exists
if not exist "frontend-svelte\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend-svelte
    call npm install
    cd ..
    echo.
)

echo ========================================
echo   Development Servers Starting...
echo ========================================
echo.
echo   Frontend Dev Server: http://localhost:5173
echo   Backend API Server: http://localhost:3000
echo.
echo   Press Ctrl+C to stop the servers
echo.
echo ========================================
echo.

REM Start both servers in new windows
start "Backend Server" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul
start "Frontend Dev Server" cmd /k "cd frontend-svelte && npm run dev"

echo.
echo Both development servers are starting in separate windows.
echo Close this window or press any key to exit this launcher.
pause >nul
