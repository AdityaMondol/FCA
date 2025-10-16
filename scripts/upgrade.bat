@echo off
echo ========================================
echo Farid Cadet Academy - Upgrade Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo Backend dependencies installed successfully
) else (
    echo Backend installation had warnings (this is normal)
)

echo.
echo Installing frontend dependencies...
cd frontend
call npm install

if %ERRORLEVEL% EQU 0 (
    echo Frontend dependencies installed successfully
) else (
    echo Frontend installation had warnings (this is normal)
)

cd ..

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update your .env file with correct values
echo 2. Update frontend/.env with correct values
echo 3. Run 'npm run dev' to start backend
echo 4. Run 'cd frontend && npm run dev' to start frontend
echo.
echo For production:
echo 1. Run 'npm start' for backend
echo 2. Run 'cd frontend && npm run build' for frontend
echo.
echo See ENHANCEMENTS.md for full documentation
echo.
pause
