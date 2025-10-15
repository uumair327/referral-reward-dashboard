# 🚀 GitHub Deployment Guide

## 📋 Complete Setup Instructions

### 🎯 Quick Setup (Automated)

1. **Run the setup script:**
   ```bash
   setup-github.bat
   ```
   
2. **Follow the prompts:**
   - Enter your GitHub username
   - Enter repository name (or use default)
   - Create the repository on GitHub when prompted
   
3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Select "GitHub Actions" as source
   
4. **Done!** Your app will be live at: `https://yourusername.github.io/repository-name/`

### 🔧 Manual Setup

#### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `referral-reward-dashboard` (or your preferred name)
3. Make it public for GitHub Pages
4. Don't initialize with README (we already have one)

#### Step 2: Update Configuration
Replace `yourusername` and `referral-reward-dashboard` in these files:
- `package.json` - build scripts
- `README.md` - all URLs and badges
- `src/index.html` - meta tags and URLs
- `src/environments/environment.prod.ts` - baseHref
- `public/sitemap.xml` - all URLs
- `public/robots.txt` - sitemap URL

#### Step 3: Connect Repository
```bash
git remote add origin https://github.com/yourusername/referral-reward-dashboard.git
git branch -M main
git push -u origin main
```

#### Step 4: Enable GitHub Pages
1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Under **Source**, select **"GitHub Actions"**
4. The deployment will start automatically

## 🔄 CI/CD Pipeline

### Automated Workflow
The GitHub Actions workflow automatically:

1. **🧪 Testing Phase:**
   - Runs ESLint for code quality
   - Executes unit tests with coverage
   - Runs E2E tests with Cypress
   - Uploads test artifacts

2. **🏗️ Build Phase:**
   - Builds production-optimized bundle
   - Prepares files for GitHub Pages
   - Creates deployment artifacts

3. **🚀 Deploy Phase:**
   - Deploys to GitHub Pages
   - Updates live application
   - Provides deployment URL

4. **🔍 Quality Assurance:**
   - Security scanning with CodeQL
   - Performance testing with Lighthouse
   - Accessibility validation

### Workflow Triggers
- **Push to main/master:** Full deployment
- **Pull requests:** Testing only
- **Manual trigger:** Available in Actions tab

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Lighthouse CI:** Automated performance testing
- **Core Web Vitals:** Real user metrics
- **Bundle Analysis:** Size optimization tracking

### Error Tracking
- **GitHub Actions logs:** Build and deployment issues
- **Browser DevTools:** Runtime error monitoring
- **Accessibility reports:** WCAG compliance checking

## 🛠️ Development Workflow

### Local Development
```bash
npm start                    # Development server
npm test                     # Unit tests
npm run e2e                  # E2E tests
npm run lint                 # Code linting
```

### Production Testing
```bash
npm run build:prod           # Production build
npm run build-production.bat # Complete production pipeline
npx http-server dist/referral-reward-dashboard/browser -p 8080
```

### Deployment
```bash
git add .
git commit -m "feat: add new feature"
git push origin main         # Triggers auto-deployment
```

## 🔧 Configuration Options

### Environment Variables
Update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  baseHref: '/your-repo-name/',
  // ... other config
};
```

### Custom Domain
1. Add `CNAME` file to `public/` folder:
   ```
   your-domain.com
   ```
2. Update GitHub Pages settings
3. Configure DNS with your domain provider

### Analytics Integration
Add to `src/index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🚨 Troubleshooting

### Common Issues

#### 1. 404 on Page Refresh
**Problem:** SPA routes return 404 when accessed directly
**Solution:** Ensure `404.html` is created (automated in build)

#### 2. Assets Not Loading
**Problem:** Incorrect base href or relative paths
**Solution:** Check `baseHref` in environment and build scripts

#### 3. Build Failures
**Problem:** Tests failing or build errors
**Solution:** Check GitHub Actions logs and fix issues locally first

#### 4. Deployment Not Updating
**Problem:** Changes not reflected on live site
**Solution:** 
- Check Actions tab for deployment status
- Clear browser cache
- Verify GitHub Pages source is set to "GitHub Actions"

### Debug Commands
```bash
# Check deployment status
check-deployment.bat

# Local production test
npm run build:prod
npx http-server dist/referral-reward-dashboard/browser -p 8080

# Test specific components
npm test -- --watch
npm run e2e -- --headed

# Analyze bundle size
npm run analyze
```

## 📞 Support Resources

### Documentation
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Angular Deployment Guide](https://angular.io/guide/deployment)

### Community
- [GitHub Issues](https://github.com/yourusername/referral-reward-dashboard/issues)
- [GitHub Discussions](https://github.com/yourusername/referral-reward-dashboard/discussions)
- [Angular Community](https://angular.io/community)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

## ✅ Deployment Checklist

Before going live:
- [ ] All tests passing locally
- [ ] Production build successful
- [ ] Responsive design tested
- [ ] Accessibility validated
- [ ] Performance optimized
- [ ] SEO meta tags updated
- [ ] Analytics configured
- [ ] Error monitoring setup
- [ ] Documentation updated
- [ ] Repository settings configured

## 🎉 Success!

Once deployed, your Referral & Rewards Dashboard will be:
- ✅ **Live and accessible** at your GitHub Pages URL
- ✅ **Automatically updated** on every push to main
- ✅ **Performance monitored** with Lighthouse
- ✅ **Security scanned** with CodeQL
- ✅ **Fully responsive** across all devices
- ✅ **PWA enabled** for app-like experience
- ✅ **SEO optimized** for search engines

**Your production-ready application is now live! 🚀**