#!/bin/bash

# Firebase Deployment Script for Factory Order Management System
# This script deploys the enhanced security rules and configuration

echo "🚀 Starting Firebase deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

echo "✅ Firebase CLI is ready"

# Deploy Firestore security rules
echo "📋 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore indexes deployed successfully"
else
    echo "❌ Failed to deploy Firestore indexes"
    exit 1
fi

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Application built successfully"
else
    echo "❌ Failed to build application"
    exit 1
fi

# Deploy hosting
echo "🌐 Deploying to Firebase hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Hosting deployed successfully"
else
    echo "❌ Failed to deploy hosting"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📱 Your application is now live at: https://factory-order-management-eaa15.web.app"
echo ""
echo "🔒 Enhanced security features now active:"
echo "   - Role-based access control"
echo "   - Server-side validation"
echo "   - Optimized database queries"
echo ""
echo "⚠️  Important: Test all user roles to ensure they work correctly with the new rules" 