import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsSs_uxRAnnoNgg5Dxzm62N682_pWkmcw",
  authDomain: "tivo-party.firebaseapp.com",
  projectId: "tivo-party",
  storageBucket: "tivo-party.firebasestorage.app",
  messagingSenderId: "494186078386",
  appId: "1:494186078386:web:f8352d4aebec2282a5e9ab",
  measurementId: "G-1JL8TL2JVP"
};

// Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
const analytics = getAnalytics(FirebaseApp);
