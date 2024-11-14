import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5VOP5nP64setyf3zLl08Iay8kcSbZecQ",
  authDomain: "tivo-social.firebaseapp.com",
  projectId: "tivo-social",
  storageBucket: "tivo-social.firebasestorage.app",
  messagingSenderId: "19904911754",
  appId: "1:19904911754:web:5d4fff9b0388e3ba9f5073",
  measurementId: "G-5XBNXPTN2Z"
};

// Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
const analytics = getAnalytics(FirebaseApp);
