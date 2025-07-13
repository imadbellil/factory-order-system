const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'factory-order-management'
});

async function createUserWithRole(email, password, displayName, role) {
  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName
    });

    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      role: role,
      displayName: displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Successfully created new user:', userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error('Error creating new user:', error);
    throw error;
  }
}

// Example usage
createUserWithRole(
  'newuser@example.com',
  'password123',
  'John Doe',
  'rouiba'
); 