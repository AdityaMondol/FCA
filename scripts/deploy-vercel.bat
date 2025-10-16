@echo off
echo ========================================
echo Deploying Farid Cadet Academy to Vercel
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI is not installed
    echo Install it with: npm install -g vercel
    pause
    exit /b 1
)

echo Step 1: Installing dependencies...
cd frontend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo Dependencies installed
echo.

echo Step 2: Setting up environment variables...
echo Please set these environment variables in Vercel dashboard:
echo.
echo VITE_SUPABASE_URL=https://husfemrigonousvtuyvf.supabase.co
echo VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1c2ZlbXJpZ29ub3VzdnR1eXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTYxMjAsImV4cCI6MjA3NTU3MjEyMH0.0imHOgQzLen4KfZ_L_i_tvzsj0phRwpES4oceZq2GXE
echo VITE_API_URL=https://fca-3oz1.onrender.com
echo VITE_APP_NAME=Farid Cadet Academy
echo VITE_APP_VERSION=2.0.0
echo VITE_ENABLE_ANALYTICS=true
echo VITE_ENABLE_REALTIME=true
echo VITE_ENABLE_NOTIFICATIONS=true
echo VITE_NODE_ENV=production
echo.

echo Step 3: Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed
    pause
    exit /b 1
)

echo Build successful
echo.

echo Step 4: Deploying to Vercel...
call vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Deployment successful!
    echo ========================================
    echo.
    echo Your application is now live!
    echo Check your Vercel dashboard for the URL
) else (
    echo Deployment failed
    pause
    exit /b 1
)

cd ..
pause
