@echo off
echo ⚡ INSTANT DEPLOYMENT - Maximum Speed Mode
echo.

REM Set timestamp for cache busting
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo 🕐 Deployment timestamp: %TIMESTAMP%
echo.

REM Update version service with current timestamp
echo 📝 Updating version timestamp...
powershell -Command "(Get-Content 'src/app/services/version.service.ts') -replace 'buildDate = ''.*''', 'buildDate = ''%date:~10,4%-%date:~4,2%-%date:~7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z''' | Set-Content 'src/app/services/version.service.ts'"
powershell -Command "(Get-Content 'src/app/services/version.service.ts') -replace 'buildNumber = ''.*''', 'buildNumber = ''%TIMESTAMP%''' | Set-Content 'src/app/services/version.service.ts'"

REM Update index.html with cache-busting timestamp
echo 🔄 Adding cache-busting headers...
powershell -Command "(Get-Content 'src/index.html') -replace '<meta http-equiv=\"Expires\" content=\"0\">', '<meta http-equiv=\"Expires\" content=\"0\"><meta name=\"build-time\" content=\"%TIMESTAMP%\">' | Set-Content 'src/index.html'"

echo 🔨 Building with maximum optimization...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

REM Create deployment timestamp file
echo %date% %time% > dist/referral-reward-dashboard/deployment-time.txt

echo 📝 Committing with instant deployment markers...
git add .
git commit -m "⚡ INSTANT DEPLOY [%TIMESTAMP%] - Immediate Cache Bust

🚀 Instant Deployment Features:
- Aggressive cache busting with timestamp: %TIMESTAMP%
- Force refresh mechanisms enabled
- Update notification system active
- Zero-cache headers implemented

⚡ Speed Optimizations:
- Fast GitHub Actions workflow
- Optimized build process
- Instant refresh service active
- Auto-update detection enabled

🔄 Cache Solutions:
- Hard refresh: Ctrl+F5
- Auto-refresh notifications
- Version tracking: %TIMESTAMP%
- Deployment time tracking

Ready for INSTANT visibility across all devices! 🎯"

echo 📤 Pushing with priority...
git push origin master
if %errorlevel% neq 0 (
    echo ❌ Push failed!
    pause
    exit /b 1
)

echo.
echo ✅ INSTANT DEPLOYMENT COMPLETE!
echo.
echo ⚡ INSTANT ACCESS METHODS:
echo.
echo 🌐 Primary URL:
echo https://uumair327.github.io/referral-reward-dashboard/
echo.
echo 🔄 Cache-Busted URLs (Use these for INSTANT access):
echo https://uumair327.github.io/referral-reward-dashboard/?t=%TIMESTAMP%
echo https://uumair327.github.io/referral-reward-dashboard/?v=%TIMESTAMP%&refresh=true
echo.
echo ⏱️  TIMING:
echo - GitHub Build: 2-3 minutes (optimized)
echo - Cache Bypass: IMMEDIATE with URLs above
echo - Auto-refresh: 30 seconds after deployment
echo.
echo 🔥 FOR INSTANT TESTING:
echo 1. Use cache-busted URLs above
echo 2. Hard refresh: Ctrl+F5
echo 3. Incognito mode: Ctrl+Shift+N
echo 4. Developer tools: F12 → Network → Disable cache
echo.
echo 📱 MOBILE INSTANT ACCESS:
echo - Long press refresh button → Hard refresh
echo - Private browsing mode
echo - Clear browser cache
echo.
echo 🎯 Build ID: %TIMESTAMP%
echo 📋 Check footer for version verification
echo.
pause