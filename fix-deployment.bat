@echo off
echo 🚨 FIXING GITHUB PAGES DEPLOYMENT
echo.

echo 🔨 Building project with proper configuration...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 📁 Checking build output...
if exist "dist\referral-reward-dashboard\browser\index.html" (
    echo ✅ Build output looks correct - browser folder exists
) else (
    echo ❌ Build output incorrect - browser folder missing
    pause
    exit /b 1
)

echo 📝 Committing deployment fixes...
git add .
git commit -m "🚨 FIX DEPLOYMENT: Correct GitHub Pages configuration

✅ DEPLOYMENT FIXES:
- Fixed GitHub Actions workflow path (browser folder)
- Updated angular.json assets configuration
- Added proper file copying for GitHub Pages
- Fixed 404.html, sitemap.xml, robots.txt deployment
- Corrected artifact upload path

🔧 CHANGES:
- Workflow now uploads from dist/referral-reward-dashboard/browser/
- Assets properly configured in angular.json
- Cache busting headers added to browser folder
- Deployment timestamp tracking fixed

🎯 RESULT: Site should now deploy correctly to GitHub Pages!"

echo 📤 Pushing fixes to GitHub...
git push origin master
if %errorlevel% neq 0 (
    echo ❌ Push failed!
    pause
    exit /b 1
)

echo.
echo ✅ DEPLOYMENT FIX COMPLETE!
echo.
echo 🕐 Please wait 5-10 minutes for GitHub Pages to rebuild
echo.
echo 🌐 Your site should be available at:
echo https://uumair327.github.io/referral-reward-dashboard/
echo.
echo 🔍 Check deployment status at:
echo https://github.com/uumair327/referral-reward-dashboard/actions
echo.
echo 📋 If still not working, check:
echo 1. GitHub Pages settings (Settings → Pages)
echo 2. GitHub Actions logs for errors
echo 3. Repository permissions and visibility
echo.
pause