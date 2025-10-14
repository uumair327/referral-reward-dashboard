@echo off
REM Referral & Rewards Dashboard Deployment Script for Windows

echo 🚀 Starting deployment process...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Run linting (optional - comment out if not configured)
REM echo 🔍 Running linting...
REM call npm run lint
REM if %errorlevel% neq 0 (
REM     echo ❌ Linting failed
REM     exit /b 1
REM )

REM Run tests (optional - comment out if not configured)
REM echo 🧪 Running tests...
REM call npm run test:ci
REM if %errorlevel% neq 0 (
REM     echo ❌ Tests failed
REM     exit /b 1
REM )

REM Build for production
echo 🏗️  Building for production...
call npm run build:prod
if %errorlevel% neq 0 (
    echo ❌ Build failed
    exit /b 1
)

REM Check if build was successful
if not exist "dist\referral-reward-dashboard" (
    echo ❌ Build failed - dist directory not found
    exit /b 1
)

echo ✅ Build completed successfully!
echo 📁 Build artifacts are in: dist\referral-reward-dashboard

echo 🎉 Deployment process completed!
pause