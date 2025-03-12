// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDyw1g1A6jVgPOpo4DzbyvuF-WOG5GtMyM',
  authDomain: 'cs4530-fa24-205-firebase.firebaseapp.com',
  projectId: 'cs4530-fa24-205-firebase',
  storageBucket: 'cs4530-fa24-205-firebase.firebasestorage.app',
  messagingSenderId: '438464221334',
  appId: '1:438464221334:web:1decaa46ab13d5b979f2b7',
  measurementId: 'G-HXGYECKR38',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
