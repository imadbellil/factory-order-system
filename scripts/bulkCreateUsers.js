const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'factory-order-management'
});

const usersToCreate = [
  {
    email: 'rouiba1@factory.com',
    password: 'password123',
    displayName: 'Rouiba User 1',
    role: 'rouiba'
  },
  {
    email: 'meftah1@factory.com',
    password: 'password123',
    displayName: 'Meftah User 1',
    role: 'meftah'
  },
  {
    email: 'hangar1@factory.com',
    password: 'password123',
    displayName: 'Hangar User 1',
    role: 'hangar'
  }
];

async function bulkCreateUsers(users) {
  const results = [];
  
  for (const userData of users) {
    try {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName
      });

      // Create user profile in Firestore
      await admin.firestore().collection('users').doc(userRecord.uid).set({
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      results.push({
        success: true,
        uid: userRecord.uid,
        email: userData.email
      });

      console.log(`✅ Created user: ${userData.email}`);
    } catch (error) {
      results.push({
        success: false,
        email: userData.email,
        error: error.message
      });
      console.error(`❌ Failed to create user ${userData.email}:`, error.message);
    }
  }

  return results;
}

// Run the bulk creation
bulkCreateUsers(usersToCreate)
  .then(results => {
    console.log('\n📊 Summary:');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
  })
  .catch(error => {
    console.error('Script error:', error);
  }); 