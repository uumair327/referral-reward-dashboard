# 🔧 Enable GitHub Pages - Quick Fix

## The Issue
Your GitHub Actions are failing because GitHub Pages isn't enabled for your repository yet.

## Quick Fix Steps

### 1. Enable GitHub Pages in Repository Settings
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
5. Click **Save**

### 2. Push the Fixed Workflows
The workflows have been updated to:
- ✅ Use Node.js 20.x and 22.x (removed 18.x)
- ✅ Added proper GitHub Pages environment configuration
- ✅ Added Node.js engine requirements to package.json

### 3. Trigger a New Deployment
After enabling GitHub Pages, push any small change to trigger the workflow:

```bash
git add .
git commit -m "fix: Update Node.js version and GitHub Pages configuration"
git push origin main
```

## What Was Fixed

### 1. Node.js Version Issue
**Before:** CI was testing with Node.js 18.x
**After:** Now testing with Node.js 20.x and 22.x only

### 2. GitHub Pages Configuration
**Before:** Missing environment configuration
**After:** Added proper environment and enablement settings

### 3. Engine Requirements
**Before:** No Node.js version specified
**After:** Added engines requirement for Node.js >=20.19.0

## Expected Result
After these changes, your deployment should:
- ✅ Pass all tests with Node.js 20.x/22.x
- ✅ Successfully deploy to GitHub Pages
- ✅ Be accessible at: `https://yourusername.github.io/referral-reward-dashboard/`

## If You Still Have Issues
1. Check the **Actions** tab for detailed error logs
2. Ensure your repository is **public** (required for free GitHub Pages)
3. Verify the **Pages** setting is set to **GitHub Actions** (not branch deployment)