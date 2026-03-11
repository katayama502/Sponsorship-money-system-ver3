import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyArYfL-wE_F0OF3QNl5_jh_B7ZXr7Ev5fg",
  authDomain: "creatte-sponser-app.firebaseapp.com",
  projectId: "creatte-sponser-app",
  storageBucket: "creatte-sponser-app.firebasestorage.app",
  messagingSenderId: "753873131194",
  appId: "1:753873131194:web:e8e73547f530509c7e1483",
  measurementId: "G-2XXBZJDCXE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'clayette-edu-system';
