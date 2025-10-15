@echo off
echo Starting Referral Reward Dashboard E2E Tests...
echo.

echo Step 1: Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Exiting...
    exit /b 1
)

echo.
echo Step 2: Starting the application server...
start /b npm run start

echo Waiting for server to start...
timeout /t 10 /nobreak > nul

echo.
echo Step 3: Running E2E tests...
call npx cypress run

echo.
echo Step 4: Stopping the server...
taskkill /f /im node.exe > nul 2>&1

echo.
echo E2E tests completed!
pause