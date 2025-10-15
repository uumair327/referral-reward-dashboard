@echo off
echo ========================================
echo   Production Build - Referral Dashboard
echo ========================================
echo.

echo Checking Node.js version...
node --version
echo Checking npm version...
npm --version
echo.

echo Step 1: Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist coverage rmdir /s /q coverage

echo.
echo Step 2: Installing/updating dependencies...
echo Note: Ignoring engine warnings for Angular 20 compatibility
call npm install --ignore-engines
if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    echo.
    echo Troubleshooting:
    echo 1. Ensure Node.js 20+ is installed
    echo 2. Clear npm cache: npm cache clean --force
    echo 3. Delete node_modules and try again
    echo 4. See NODE_COMPATIBILITY.md for help
    exit /b 1
)

echo.
echo Step 3: Running Angular compilation cache...
call npx ngcc --packages @angular/common,@angular/core,@angular/forms 2>nul

echo.
echo Step 4: Building for production...
call npm run build:prod
if %errorlevel% neq 0 (
    echo Production build failed!
    echo.
    echo Troubleshooting:
    echo 1. Check for TypeScript errors
    echo 2. Ensure all dependencies are installed
    echo 3. Try: npm run build (development build first)
    exit /b 1
)

echo.
echo Step 5: Creating SPA routing support...
copy dist\referral-reward-dashboard\browser\index.html dist\referral-reward-dashboard\browser\404.html

echo.
echo Step 6: Creating .nojekyll for GitHub Pages...
echo. > dist\referral-reward-dashboard\browser\.nojekyll

echo.
echo Step 7: Copying additional files...
copy public\robots.txt dist\referral-reward-dashboard\browser\robots.txt 2>nul
copy public\sitemap.xml dist\referral-reward-dashboard\browser\sitemap.xml 2>nul

echo.
echo ========================================
echo   Production Build Complete! ✅
echo ========================================
echo.
echo Build output: dist/referral-reward-dashboard/browser/
echo Size: 
dir dist\referral-reward-dashboard\browser /s /-c | find "File(s)"
echo.
echo Next steps:
echo 1. Test locally: npx http-server dist/referral-reward-dashboard/browser -p 8080
echo 2. Deploy to GitHub Pages: Push to main branch (auto-deploy)
echo 3. Or manually deploy the dist/ folder to your hosting provider
echo.
echo Performance Tips:
echo - Enable gzip compression on your server
echo - Configure CDN caching headers
echo - Monitor with Lighthouse for performance metrics
echo.
echo Need help? Check NODE_COMPATIBILITY.md for troubleshooting
pause