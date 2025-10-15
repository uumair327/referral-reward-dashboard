@echo off
echo Building Referral Reward Dashboard for GitHub Pages...
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    exit /b 1
)

echo.
echo Step 2: Building for production...
call ng build --configuration production --base-href /referral-reward-dashboard/
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b 1
)

echo.
echo Step 3: Copying index.html to 404.html for SPA routing...
copy dist\referral-reward-dashboard\browser\index.html dist\referral-reward-dashboard\browser\404.html

echo.
echo Step 4: Creating .nojekyll file...
echo. > dist\referral-reward-dashboard\browser\.nojekyll

echo.
echo Step 5: Creating CNAME file (optional - update with your domain)...
echo referral-rewards.yourdomain.com > dist\referral-reward-dashboard\browser\CNAME

echo.
echo Build complete! 
echo.
echo Next steps:
echo 1. Push your code to GitHub
echo 2. Go to your repository settings
echo 3. Enable GitHub Pages from the 'dist/referral-reward-dashboard/browser' folder
echo 4. Your app will be available at: https://yourusername.github.io/referral-reward-dashboard/
echo.
pause