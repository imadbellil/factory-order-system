import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getCurrentUserProfile } from '../services/auth';
import { User } from '../types';
import { requestNotificationPermission } from '../services/notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userProfile = await getCurrentUserProfile(firebaseUser);
        setUser(userProfile);
        // Request notification permission and save token
        const token = await requestNotificationPermission();
        if (token) {
          await updateDoc(doc(db, 'users', firebaseUser.uid), { fcmToken: token });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};