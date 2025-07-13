// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvFQHoCvygnrB26HOdhqhut2y7SD4UNZA",
  authDomain: "factory-order-management-eaa15.firebaseapp.com",
  projectId: "factory-order-management-eaa15",
  storageBucket: "factory-order-management-eaa15.firebasestorage.app",
  messagingSenderId: "696384476027",
  appId: "1:696384476027:web:3239684f8d91b16b87e3de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);