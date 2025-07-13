@echo off
REM Firebase Deployment Script for Factory Order Management System
REM This script deploys the enhanced security rules and configuration

echo 🚀 Starting Firebase deployment...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

REM Check if user is logged in
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Firebase. Please login first:
    echo firebase login
    pause
    exit /b 1
)

echo ✅ Firebase CLI is ready

REM Deploy Firestore security rules
echo 📋 Deploying Firestore security rules...
firebase deploy --only firestore:rules
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy Firestore rules
    pause
    exit /b 1
)
echo ✅ Firestore rules deployed successfully

REM Deploy Firestore indexes
echo 📊 Deploying Firestore indexes...
firebase deploy --only firestore:indexes
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy Firestore indexes
    pause
    exit /b 1
)
echo ✅ Firestore indexes deployed successfully

REM Build the application
echo 🔨 Building the application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build application
    pause
    exit /b 1
)
echo ✅ Application built successfully

REM Deploy hosting
echo 🌐 Deploying to Firebase hosting...
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ❌ Failed to deploy hosting
    pause
    exit /b 1
)
echo ✅ Hosting deployed successfully

echo 🎉 Deployment completed successfully!
echo 📱 Your application is now live at: https://factory-order-management-eaa15.web.app
echo.
echo 🔒 Enhanced security features now active:
echo    - Role-based access control
echo    - Server-side validation
echo    - Optimized database queries
echo.
echo ⚠️  Important: Test all user roles to ensure they work correctly with the new rules
pause 