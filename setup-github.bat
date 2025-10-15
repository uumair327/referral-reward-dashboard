@echo off
echo ========================================
echo   GitHub Repository Setup Script
echo ========================================
echo.

echo This script will help you set up your GitHub repository for deployment.
echo.

set /p GITHUB_USERNAME="Enter your GitHub username: "
set /p REPO_NAME="Enter repository name (default: referral-reward-dashboard): "
if "%REPO_NAME%"=="" set REPO_NAME=referral-reward-dashboard

echo.
echo Step 1: Creating GitHub repository...
echo Please create a new repository on GitHub with the name: %REPO_NAME%
echo Repository URL will be: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.
pause

echo.
echo Step 2: Updating configuration files...

REM Update package.json
powershell -Command "(Get-Content package.json) -replace 'yourusername', '%GITHUB_USERNAME%' -replace 'referral-reward-dashboard', '%REPO_NAME%' | Set-Content package.json"

REM Update README.md
powershell -Command "(Get-Content README.md) -replace 'yourusername', '%GITHUB_USERNAME%' -replace 'referral-reward-dashboard', '%REPO_NAME%' | Set-Content README.md"

REM Update sitemap.xml
powershell -Command "(Get-Content public\sitemap.xml) -replace 'yourusername', '%GITHUB_USERNAME%' -replace 'referral-reward-dashboard', '%REPO_NAME%' | Set-Content public\sitemap.xml"

REM Update index.html
powershell -Command "(Get-Content src\index.html) -replace 'yourusername', '%GITHUB_USERNAME%' -replace 'referral-reward-dashboard', '%REPO_NAME%' | Set-Content src\index.html"

REM Update environment.prod.ts
powershell -Command "(Get-Content src\environments\environment.prod.ts) -replace 'referral-reward-dashboard', '%REPO_NAME%' | Set-Content src\environments\environment.prod.ts"

echo Configuration files updated!

echo.
echo Step 3: Setting up Git remote...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo.
echo Step 4: Committing configuration changes...
git add .
git commit -m "🔧 Configure repository for %GITHUB_USERNAME%/%REPO_NAME%

- Updated all configuration files with correct repository name
- Updated GitHub Pages URLs and base href
- Ready for deployment to GitHub Pages"

echo.
echo Step 5: Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo   GitHub Setup Complete! ✅
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/settings/pages
echo 2. Under "Source", select "GitHub Actions"
echo 3. The deployment will start automatically
echo 4. Your app will be available at: https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/
echo.
echo Additional setup:
echo - Enable branch protection rules (recommended)
echo - Set up issue templates (already included)
echo - Configure repository settings
echo - Add collaborators if needed
echo.
pause