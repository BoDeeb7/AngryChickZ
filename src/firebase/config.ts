import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyALQxYKYvWgqcnzCT2N8_8e50q-jK60Z-0",
  authDomain: "studio-5735260457-8f30e.firebaseapp.com",
  projectId: "studio-5735260457-8f30e",
  storageBucket: "studio-5735260457-8f30e.firebasestorage.app",
  messagingSenderId: "934450348412",
  appId: "1:934450348412:web:14112201a666cbe89ba4f9"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
