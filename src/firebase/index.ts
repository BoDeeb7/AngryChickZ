'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

/**
 * تهيئة خدمات Firebase بشكل آمن.
 * في حال كان مفتاح API مفقوداً أو غير صالح، يتم إرجاع قيم فارغة (null) لمنع انهيار التطبيق بالكامل.
 */
export function initializeFirebase() {
  try {
    // التحقق من صلاحية الإعدادات قبل البدء
    const isConfigValid = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10);

    if (!isConfigValid) {
      console.warn("إعدادات Firebase غير مكتملة أو مفقودة. سيتم تعطيل ميزات المزامنة والمصادقة مؤقتاً.");
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
    console.error("خطأ أثناء تهيئة Firebase:", error);
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
