@echo off
echo ========================================
echo   Deployment Status Checker
echo ========================================
echo.

set /p GITHUB_USERNAME="Enter your GitHub username: "
set /p REPO_NAME="Enter repository name (default: referral-reward-dashboard): "
if "%REPO_NAME%"=="" set REPO_NAME=referral-reward-dashboard

echo.
echo Checking deployment status for %GITHUB_USERNAME%/%REPO_NAME%...
echo.

echo 📋 Deployment Checklist:
echo.

echo ✅ Repository Setup:
echo    - Repository URL: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo    - GitHub Pages URL: https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/
echo.

echo 🔧 Configuration Files:
echo    - GitHub Actions workflow: .github/workflows/deploy.yml
echo    - Package.json scripts: build:prod, deploy:github-pages
echo    - Environment configuration: src/environments/environment.prod.ts
echo    - PWA manifest: public/manifest.webmanifest
echo    - Service worker config: ngsw-config.json
echo.

echo 📱 SEO & PWA Files:
echo    - Sitemap: public/sitemap.xml
echo    - Robots.txt: public/robots.txt
echo    - PWA icons: public/icons/
echo    - Meta tags: src/index.html
echo.

echo 🧪 Testing Setup:
echo    - Unit tests: npm test
echo    - E2E tests: npm run e2e
echo    - Lighthouse config: lighthouserc.json
echo    - Accessibility testing: cypress-axe
echo.

echo 📊 Monitoring & Analytics:
echo    - GitHub Actions CI/CD
echo    - Lighthouse performance monitoring
echo    - CodeQL security scanning
echo    - Automated dependency updates
echo.

echo.
echo 🚀 Quick Commands:
echo.
echo Local Development:
echo    npm start                    # Start dev server
echo    npm test                     # Run unit tests
echo    npm run e2e                  # Run E2E tests
echo.
echo Production Build:
echo    npm run build:prod           # Build for production
echo    npm run build-production.bat # Complete production build
echo.
echo Deployment:
echo    git push origin main         # Trigger auto-deployment
echo    npm run deploy:github-pages  # Manual deployment
echo.

echo 🔍 Useful Links:
echo    - Repository: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo    - Live App: https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/
echo    - Actions: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/actions
echo    - Settings: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/settings
echo    - Pages: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/settings/pages
echo    - Issues: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%/issues
echo.

echo 📞 Troubleshooting:
echo    - Check GitHub Actions logs for build errors
echo    - Verify GitHub Pages is enabled in repository settings
echo    - Ensure base-href is correctly set in build scripts
echo    - Check browser console for runtime errors
echo    - Validate all links and assets load correctly
echo.

pause