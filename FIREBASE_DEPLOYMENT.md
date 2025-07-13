# 🔥 Firebase Deployment Guide

This guide explains how to deploy the enhanced Firebase security rules and configuration for the Factory Order Management System.

## 📋 What's Been Enhanced

### 🔒 Security Improvements
- **Role-based Access Control**: Server-side validation of user roles
- **Data Protection**: Users can only access and modify data they're authorized for
- **Order Workflow Security**: Each role can only perform specific actions on orders
- **User Profile Protection**: Users can only access their own profiles

### ⚡ Performance Improvements
- **Optimized Indexes**: Added Firestore indexes for better query performance
- **Efficient Queries**: Structured indexes for common data access patterns

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)

**For Windows:**
```bash
deploy-firebase.bat
```

**For Mac/Linux:**
```bash
chmod +x deploy-firebase.sh
./deploy-firebase.sh
```

### Option 2: Manual Deployment

1. **Deploy Security Rules:**
```bash
firebase deploy --only firestore:rules
```

2. **Deploy Indexes:**
```bash
firebase deploy --only firestore:indexes
```

3. **Build Application:**
```bash
npm run build
```

4. **Deploy Hosting:**
```bash
firebase deploy --only hosting
```

## 🔧 Prerequisites

1. **Firebase CLI Installation:**
```bash
npm install -g firebase-tools
```

2. **Firebase Login:**
```bash
firebase login
```

3. **Project Setup:**
```bash
firebase use factory-order-management-eaa15
```

## 📊 Security Rules Breakdown

### User Access Control
```javascript
// Users can only access their own profile
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null && request.auth.uid == userId;
  allow update: if request.auth != null && request.auth.uid == userId;
  allow delete: if false; // Prevent user deletion
}
```

### Order Management by Role

**Rouiba Users:**
- ✅ Create new orders
- ✅ Update their own pending orders
- ✅ Delete their own pending orders
- ❌ Cannot modify accepted/rejected orders

**Meftah Users:**
- ✅ View all orders
- ✅ Accept orders (change status to 'accepted')
- ✅ Reject orders (change status to 'rejected')
- ❌ Cannot create or delete orders

**Hangar Users:**
- ✅ View accepted orders
- ✅ Update production status ('en_cours', 'fini', 'charge')
- ❌ Cannot create, delete, or accept/reject orders

## 🗄️ Database Indexes

The following indexes have been added for optimal performance:

1. **Orders by Status and Update Time:**
   - Used for filtering orders by status
   - Optimizes real-time updates

2. **Orders by Creator and Creation Time:**
   - Used for user-specific order lists
   - Optimizes personal dashboard queries

3. **Orders by Status and Creation Time:**
   - Used for status-based filtering
   - Optimizes order management views

4. **Notifications by Timestamp:**
   - Used for notification feeds
   - Optimizes real-time notifications

## 🧪 Testing the Deployment

After deployment, test each user role:

### Test Rouiba User
1. Login as Rouiba user
2. Create a new order
3. Edit the order (should work)
4. Delete the order (should work)
5. Try to edit an accepted order (should fail)

### Test Meftah User
1. Login as Meftah user
2. View pending orders
3. Accept an order (should work)
4. Reject an order with reason (should work)
5. Try to create an order (should fail)

### Test Hangar User
1. Login as Hangar user
2. View accepted orders
3. Update order status to 'en_cours' (should work)
4. Update order status to 'fini' (should work)
5. Update order status to 'charge' (should work)
6. Try to accept/reject orders (should fail)

## 🔍 Monitoring Deployment

### Check Deployment Status
```bash
firebase projects:list
firebase use --add
```

### View Firestore Rules
```bash
firebase firestore:rules:get
```

### View Indexes
```bash
firebase firestore:indexes
```

## 🚨 Troubleshooting

### Common Issues

1. **Permission Denied Errors:**
   - Ensure you're logged in with the correct Firebase account
   - Verify you have admin access to the project

2. **Index Build Failures:**
   - Check if there are conflicting indexes
   - Wait for existing indexes to finish building

3. **Rules Validation Errors:**
   - Check the Firestore rules syntax
   - Ensure all helper functions are properly defined

### Debug Commands
```bash
# Test rules locally
firebase emulators:start --only firestore

# View project configuration
firebase projects:list

# Check deployment status
firebase hosting:channel:list
```

## 📞 Support

If you encounter issues:

1. Check the Firebase Console for error messages
2. Review the deployment logs
3. Test with Firebase emulators first
4. Contact your Firebase project administrator

## 🔄 Rollback Plan

If you need to rollback to the previous rules:

1. **Restore Previous Rules:**
```bash
git checkout HEAD~1 -- firestore.rules
firebase deploy --only firestore:rules
```

2. **Remove Indexes:**
```bash
# Edit firestore.indexes.json to remove new indexes
firebase deploy --only firestore:indexes
```

---

**⚠️ Important:** Always test thoroughly in a development environment before deploying to production. 