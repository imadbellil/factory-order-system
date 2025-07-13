import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found. Please contact administrator.');
    }
    
    const userData = userDoc.data();
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role: userData.role,
      displayName: userData.displayName
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const createUser = async (
  email: string, 
  password: string, 
  role: 'rouiba' | 'meftah' | 'hangar',
  displayName: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      email: firebaseUser.email,
      role,
      displayName,
      createdAt: new Date()
    });
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role,
      displayName
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

export const getCurrentUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role: userData.role,
      displayName: userData.displayName
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
};