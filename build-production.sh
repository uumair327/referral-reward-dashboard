#!/bin/bash

echo "========================================"
echo "  Production Build - Referral Dashboard"
echo "========================================"
echo

echo "Checking Node.js version..."
node --version
echo "Checking npm version..."
npm --version
echo

echo "Step 1: Cleaning previous builds..."
rm -rf dist coverage

echo
echo "Step 2: Installing/updating dependencies..."
echo "Note: Ignoring engine warnings for Angular 20 compatibility"
npm install --ignore-engines
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies!"
    echo
    echo "Troubleshooting:"
    echo "1. Ensure Node.js 20+ is installed"
    echo "2. Clear npm cache: npm cache clean --force"
    echo "3. Delete node_modules and try again"
    echo "4. See NODE_COMPATIBILITY.md for help"
    exit 1
fi

echo
echo "Step 3: Running Angular compilation cache..."
npx ngcc --packages @angular/common,@angular/core,@angular/forms 2>/dev/null || true

echo
echo "Step 4: Building for production..."
npm run build:prod
if [ $? -ne 0 ]; then
    echo "Production build failed!"
    echo
    echo "Troubleshooting:"
    echo "1. Check for TypeScript errors"
    echo "2. Ensure all dependencies are installed"
    echo "3. Try: npm run build (development build first)"
    exit 1
fi

echo
echo "Step 5: Creating SPA routing support..."
cp dist/referral-reward-dashboard/browser/index.html dist/referral-reward-dashboard/browser/404.html

echo
echo "Step 6: Creating .nojekyll for GitHub Pages..."
touch dist/referral-reward-dashboard/browser/.nojekyll

echo
echo "Step 7: Copying additional files..."
cp public/robots.txt dist/referral-reward-dashboard/browser/robots.txt 2>/dev/null || true
cp public/sitemap.xml dist/referral-reward-dashboard/browser/sitemap.xml 2>/dev/null || true

echo
echo "========================================"
echo "  Production Build Complete! ✅"
echo "========================================"
echo
echo "Build output: dist/referral-reward-dashboard/browser/"
echo "Size: $(du -sh dist/referral-reward-dashboard/browser/ | cut -f1)"
echo
echo "Next steps:"
echo "1. Test locally: npx http-server dist/referral-reward-dashboard/browser -p 8080"
echo "2. Deploy to GitHub Pages: Push to main branch (auto-deploy)"
echo "3. Or manually deploy the dist/ folder to your hosting provider"
echo
echo "Performance Tips:"
echo "- Enable gzip compression on your server"
echo "- Configure CDN caching headers"
echo "- Monitor with Lighthouse for performance metrics"
echo
echo "Need help? Check NODE_COMPATIBILITY.md for troubleshooting"