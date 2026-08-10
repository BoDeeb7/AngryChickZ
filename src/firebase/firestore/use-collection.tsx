'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData,
  FirestoreError 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * useCollection Hook - Optimized for 0ms Hydration
 * 
 * Logic:
 * 1. Initialize state synchronously from localStorage (0ms wait).
 * 2. If cache exists, set loading to false immediately.
 * 3. Perform silent background revalidation via onSnapshot.
 * 4. Update cache and UI seamlessly when fresh data arrives.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey: string = 'restaurant_menu_cache') {
  // 1. INSTANT HYDRATION FROM LOCAL STORAGE
  const [data, setData] = useState<T[]>(() => {
    if (typeof window !== 'undefined' && cacheKey) {
      try {
        const saved = localStorage.getItem(cacheKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Loading is only true if we have no cached data at all
  const [loading, setLoading] = useState(() => data.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!query) {
      setLoading(false);
      return;
    }

    // 2. SILENT BACKGROUND REVALIDATION
    const unsubscribe = onSnapshot(
      query,
      { includeMetadataChanges: false },
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as T));
        
        if (isMounted.current) {
          setData(items);
          setLoading(false);

          // Update cache silently for next visit
          if (cacheKey) {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(items));
            } catch (e) {
              console.warn("Storage quota exceeded, cache not updated");
            }
          }
        }
      },
      async (serverError: FirestoreError) => {
        if (serverError.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'collection',
            operation: 'list',
          }));
        }
        if (isMounted.current) {
          setError(serverError);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, [query, cacheKey]);

  return { data, loading, error };
}
