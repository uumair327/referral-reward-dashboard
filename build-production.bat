@echo off
echo ========================================
echo   Production Build - Referral Dashboard
echo ========================================
echo.

echo Step 1: Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist coverage rmdir /s /q coverage

echo.
echo Step 2: Installing/updating dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    exit /b 1
)

echo.
echo Step 3: Running linting...
call npm run lint
if %errorlevel% neq 0 (
    echo Linting failed! Please fix errors before building.
    exit /b 1
)

echo.
echo Step 4: Running unit tests...
call npm run test:ci
if %errorlevel% neq 0 (
    echo Unit tests failed! Please fix tests before building.
    exit /b 1
)

echo.
echo Step 5: Building for production...
call npm run build:prod
if %errorlevel% neq 0 (
    echo Production build failed!
    exit /b 1
)

echo.
echo Step 6: Creating SPA routing support...
copy dist\referral-reward-dashboard\browser\index.html dist\referral-reward-dashboard\browser\404.html

echo.
echo Step 7: Creating .nojekyll for GitHub Pages...
echo. > dist\referral-reward-dashboard\browser\.nojekyll

echo.
echo Step 8: Copying additional files...
copy public\robots.txt dist\referral-reward-dashboard\browser\robots.txt 2>nul
copy public\sitemap.xml dist\referral-reward-dashboard\browser\sitemap.xml 2>nul

echo.
echo Step 9: Running bundle analysis...
call npm run analyze 2>nul

echo.
echo ========================================
echo   Production Build Complete! ✅
echo ========================================
echo.
echo Build output: dist/referral-reward-dashboard/browser/
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
pause