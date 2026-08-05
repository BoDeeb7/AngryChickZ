'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services securely.
 * If the API key is missing or invalid, it returns empty (null) values to prevent application crashes.
 */
export function initializeFirebase() {
  try {
    const isConfigValid = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10);

    if (!isConfigValid) {
      console.warn("Firebase configuration is incomplete or missing. Authentication and synchronization features will be temporarily disabled.");
      return { 
        app: null as unknown as FirebaseApp, 
        firestore: null as unknown as Firestore, 
        auth: null as unknown as Auth, 
        storage: null as unknown as FirebaseStorage 
      };
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    const storage = getStorage(app);
    
    return { app, firestore, auth, storage };
  } catch (error) {
    console.error("Error during Firebase initialization:", error);
    return { 
      app: null as unknown as FirebaseApp, 
      firestore: null as unknown as Firestore, 
      auth: null as unknown as Auth, 
      storage: null as unknown as FirebaseStorage 
    };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
