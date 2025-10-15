@echo off
echo ========================================
echo   🔧 GitHub Deployment Setup Wizard
echo ========================================
echo.

echo This script will help you configure the app for GitHub Pages deployment.
echo.

set /p username="Enter your GitHub username: "
if "%username%"=="" (
    echo ❌ GitHub username is required!
    pause
    exit /b 1
)

set /p reponame="Enter repository name (default: referral-reward-dashboard): "
if "%reponame%"=="" set reponame=referral-reward-dashboard

echo.
echo 🔧 Updating configuration files...

echo Updating README.md...
powershell -Command "(Get-Content README.md) -replace 'yourusername', '%username%' | Set-Content README.md"

echo Updating sitemap.xml...
powershell -Command "(Get-Content public/sitemap.xml) -replace 'yourusername', '%username%' | Set-Content public/sitemap.xml"
powershell -Command "(Get-Content public/sitemap.xml) -replace 'referral-reward-dashboard', '%reponame%' | Set-Content public/sitemap.xml"

echo Updating GitHub Actions workflow...
powershell -Command "(Get-Content .github/workflows/deploy.yml) -replace 'yourusername', '%username%' | Set-Content .github/workflows/deploy.yml"
powershell -Command "(Get-Content .github/workflows/deploy.yml) -replace 'referral-reward-dashboard', '%reponame%' | Set-Content .github/workflows/deploy.yml"

echo.
echo ✅ Configuration updated successfully!
echo.
echo 📋 Next steps:
echo.
echo 1. Create GitHub repository:
echo    https://github.com/new
echo    Repository name: %reponame%
echo    Make it PUBLIC (required for GitHub Pages)
echo.
echo 2. Run these commands:
echo    git remote add origin https://github.com/%username%/%reponame%.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Enable GitHub Pages:
echo    Go to repository Settings ^> Pages
echo    Source: Deploy from a branch
echo    Branch: main / root
echo.
echo 4. Your app will be live at:
echo    https://%username%.github.io/%reponame%/
echo.
echo 🔑 Admin access: /admin (password: admin123)
echo.
pause