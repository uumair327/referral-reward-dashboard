# 🟢 Node.js Compatibility Guide

## Current Requirements

This project uses **Angular 20** which requires:
- **Node.js**: `^20.19.0 || ^22.12.0 || >=24.0.0`
- **npm**: `^6.11.0 || ^7.5.6 || >=8.0.0`

## 🚨 Common Issues & Solutions

### Issue: "Unsupported engine" warnings
**Problem**: Using Node.js 18.x with Angular 20
**Solution**: Upgrade to Node.js 20+ or use Angular 18

### Issue: "ngcc: not found" error
**Problem**: Angular Ivy compilation cache issues
**Solution**: Remove postinstall script or run manually

## 🔧 Quick Fixes

### Option 1: Upgrade Node.js (Recommended)

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Using n (macOS/Linux)
sudo n 20

# Using fnm
fnm install 20
fnm use 20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x+
```

### Option 2: Use Compatible Angular Version

If you must use Node.js 18, downgrade Angular:

```bash
# Uninstall current Angular
npm uninstall @angular/core @angular/cli @angular/common

# Install Angular 18 (compatible with Node.js 18)
npm install @angular/core@^18.0.0 @angular/cli@^18.0.0 @angular/common@^18.0.0
```

### Option 3: Force Installation (Not Recommended)

```bash
# Force install with warnings (may cause issues)
npm install --force

# Or ignore engine checks
npm install --ignore-engines
```

## 🐳 Docker Solution

Use Docker to ensure consistent Node.js version:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=0 /app/dist/referral-reward-dashboard/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔍 Troubleshooting

### Check Current Versions
```bash
node --version
npm --version
ng version
```

### Clear npm Cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Manual ngcc Run
```bash
# If ngcc fails during install
npx ngcc --packages @angular/common,@angular/core,@angular/forms
```

## 🌐 CI/CD Environments

### GitHub Actions
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Use Node.js 20
    cache: 'npm'
```

### Netlify
```toml
# netlify.toml
[build.environment]
  NODE_VERSION = "20"
```

### Vercel
```json
{
  "engines": {
    "node": "20.x"
  }
}
```

### Heroku
```json
{
  "engines": {
    "node": "20.x",
    "npm": "10.x"
  }
}
```

## 📋 Version Matrix

| Angular Version | Node.js Version | Status |
|----------------|-----------------|--------|
| Angular 20     | Node.js 20+     | ✅ Supported |
| Angular 19     | Node.js 18+     | ✅ Supported |
| Angular 18     | Node.js 18+     | ✅ Supported |
| Angular 17     | Node.js 18+     | ✅ Supported |

## 🚀 Recommended Setup

1. **Install Node.js 20** using nvm or official installer
2. **Update npm** to latest version: `npm install -g npm@latest`
3. **Clear cache**: `npm cache clean --force`
4. **Fresh install**: `rm -rf node_modules && npm install`
5. **Verify**: `npm run build:prod`

## 📞 Need Help?

If you're still having issues:

1. Check [Node.js official website](https://nodejs.org/) for installation
2. Review [Angular CLI documentation](https://angular.io/cli)
3. Open an issue with your Node.js version and error details

---

**💡 Pro Tip**: Use nvm (Node Version Manager) to easily switch between Node.js versions for different projects!