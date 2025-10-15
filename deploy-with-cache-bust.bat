@echo off
echo 🚀 Deploying Referral Dashboard with Cache Busting...
echo.

REM Update version timestamp
echo 📅 Updating version timestamp...
powershell -Command "(Get-Content 'src/app/services/version.service.ts') -replace 'buildDate = ''.*''', 'buildDate = ''%date:~10,4%-%date:~4,2%-%date:~7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z''' | Set-Content 'src/app/services/version.service.ts'"
powershell -Command "(Get-Content 'src/app/services/version.service.ts') -replace 'buildNumber = Date.now\(\).toString\(\)', 'buildNumber = ''%random%%random%''' | Set-Content 'src/app/services/version.service.ts'"

echo 🔨 Building production version...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 📝 Committing changes...
git add .
git commit -m "🚀 Deploy with cache busting - %date% %time%

✅ Features:
- Updated build timestamp for cache busting
- Version tracking for deployment verification
- Cache control headers for fresh content
- Force refresh mechanisms

🔄 Cache Solutions:
- Hard refresh: Ctrl+F5
- Clear browser cache if needed
- Version display in footer for verification"

echo 📤 Pushing to GitHub...
git push origin master
if %errorlevel% neq 0 (
    echo ❌ Push failed!
    pause
    exit /b 1
)

echo.
echo ✅ Deployment Complete!
echo.
echo 🌐 Your site will be available at:
echo https://uumair327.github.io/referral-reward-dashboard/
echo.
echo ⏱️  Please wait 5-10 minutes for GitHub Pages to update
echo.
echo 🔄 If changes don't appear on other devices:
echo 1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
echo 2. Clear browser cache
echo 3. Try incognito/private mode
echo 4. Check version number in footer
echo.
echo 📋 Troubleshooting guide: CACHE_TROUBLESHOOTING.md
echo.
pause