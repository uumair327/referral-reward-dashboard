#!/bin/bash

# Referral & Rewards Dashboard Deployment Script

set -e

echo "🚀 Starting deployment process..."

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  Warning: You're not on the main/master branch. Current branch: $CURRENT_BRANCH"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Build for production
echo "🏗️  Building for production..."
npm run build:prod

# Check if build was successful
if [ ! -d "dist/referral-reward-dashboard" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build artifacts are in: dist/referral-reward-dashboard"

# Optional: Deploy to server (uncomment and configure as needed)
# echo "🚀 Deploying to server..."
# rsync -avz --delete dist/referral-reward-dashboard/ user@server:/path/to/deployment/

echo "🎉 Deployment process completed!"