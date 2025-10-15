# 🚀 Deployment Guide

This guide covers deploying the Referral & Rewards Dashboard to various platforms.

## 📋 Pre-deployment Checklist

- [ ] Update `baseHref` in environment files
- [ ] Update GitHub repository URL in README
- [ ] Update domain in sitemap.xml and robots.txt
- [ ] Test production build locally
- [ ] Run all tests (unit + E2E)
- [ ] Check accessibility compliance
- [ ] Verify responsive design

## 🔄 GitHub Pages (Recommended)

### Automatic Deployment

1. **Fork/Clone** this repository
2. **Update configuration**:
   ```bash
   # Update repository name in:
   # - angular.json (baseHref)
   # - environment.prod.ts (baseHref)
   # - package.json (build:prod script)
   # - .github/workflows/deploy.yml
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings
   - Navigate to Pages section
   - Select "GitHub Actions" as source

4. **Push to main branch** - deployment happens automatically

5. **Access your app** at: `https://yourusername.github.io/referral-reward-dashboard/`

### Manual Deployment

```bash
# Build for GitHub Pages
npm run build:github-pages

# The dist/ folder is ready for deployment
# Upload contents to your GitHub Pages repository
```

## 🌐 Other Platforms

### Netlify

1. **Build the app**:
   ```bash
   npm run build:prod
   ```

2. **Deploy**:
   - Drag & drop `dist/referral-reward-dashboard/browser/` to Netlify
   - Or connect GitHub repository for automatic deployments

3. **Configure redirects** (create `_redirects` file in `public/`):
   ```
   /*    /index.html   200
   ```

### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   npm run build:prod
   vercel --prod
   ```

3. **Configure** (vercel.json):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```

3. **Configure** (firebase.json):
   ```json
   {
     "hosting": {
       "public": "dist/referral-reward-dashboard/browser",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run build:prod
   firebase deploy
   ```

### AWS S3 + CloudFront

1. **Build the app**:
   ```bash
   npm run build:prod
   ```

2. **Upload to S3**:
   ```bash
   aws s3 sync dist/referral-reward-dashboard/browser/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront** for SPA routing:
   - Error Pages: 404 → /index.html (200)
   - Error Pages: 403 → /index.html (200)

### Docker Deployment

1. **Create Dockerfile**:
   ```dockerfile
   FROM nginx:alpine
   COPY dist/referral-reward-dashboard/browser /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**:
   ```nginx
   events {}
   http {
     include /etc/nginx/mime.types;
     server {
       listen 80;
       root /usr/share/nginx/html;
       index index.html;
       location / {
         try_files $uri $uri/ /index.html;
       }
     }
   }
   ```

3. **Build and run**:
   ```bash
   npm run build:prod
   docker build -t referral-dashboard .
   docker run -p 80:80 referral-dashboard
   ```

## 🔧 Configuration Updates

### Custom Domain

1. **Update baseHref** in all configuration files
2. **Update CNAME** file in `public/` folder
3. **Update sitemap.xml** and **robots.txt**
4. **Configure DNS** with your domain provider

### Environment Variables

Update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  baseHref: '/your-app-name/',
  apiUrl: 'https://your-api-domain.com',
  // ... other config
};
```

### Analytics Integration

Add Google Analytics to `src/index.html`:

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

## 🧪 Testing Deployment

### Local Production Testing

```bash
# Build for production
npm run build:prod

# Serve locally (install http-server globally)
npx http-server dist/referral-reward-dashboard/browser -p 8080

# Test at http://localhost:8080
```

### Performance Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Test performance
lighthouse https://your-deployed-app.com --view
```

### Accessibility Testing

```bash
# Run accessibility tests
npm run test:a11y

# Or use axe-cli
npx axe-cli https://your-deployed-app.com
```

## 🔍 Troubleshooting

### Common Issues

1. **404 on page refresh**:
   - Configure server for SPA routing
   - Ensure 404.html redirects to index.html

2. **Assets not loading**:
   - Check baseHref configuration
   - Verify relative paths in build

3. **Service Worker issues**:
   - Clear browser cache
   - Check ngsw-config.json

4. **Performance issues**:
   - Enable gzip compression
   - Configure CDN caching
   - Optimize images

### Debug Commands

```bash
# Check build output
npm run build:prod -- --verbose

# Analyze bundle size
npm run analyze

# Test service worker
npm run build:prod && npx http-server dist/referral-reward-dashboard/browser -p 8080
```

## 📊 Monitoring

### Performance Monitoring

- **Google PageSpeed Insights**
- **GTmetrix**
- **WebPageTest**
- **Lighthouse CI**

### Error Monitoring

- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for user behavior

### Uptime Monitoring

- **UptimeRobot**
- **Pingdom**
- **StatusCake**

## 🔄 CI/CD Pipeline

The included GitHub Actions workflow automatically:

1. ✅ Installs dependencies
2. ✅ Runs tests
3. ✅ Builds for production
4. ✅ Deploys to GitHub Pages
5. ✅ Notifies on success/failure

### Customizing CI/CD

Edit `.github/workflows/deploy.yml` to:
- Add additional testing steps
- Deploy to multiple environments
- Run security scans
- Send notifications

## 📞 Support

If you encounter deployment issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review platform-specific documentation
3. Open an issue on GitHub
4. Contact support team

---

**Happy Deploying! 🚀**