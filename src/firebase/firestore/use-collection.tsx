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
 * useCollection Hook - Optimized for Instant Hydration (0ms)
 * 
 * Logic:
 * 1. Synchronous Hydration: Immediately reads from localStorage during state initialization.
 * 2. Hard Safety Release: A 1.5s timer forces 'loading' to false if the network hangs.
 * 3. Silent Sync: Database synchronization happens in the background without blocking the UI.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey: string = 'idx_menu_cache') {
  // 1. INSTANT SYNCHRONOUS HYDRATION
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

  // Initialize loading based on cache presence
  const [loading, setLoading] = useState(() => data.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!query) {
      setLoading(false);
      return;
    }

    // 2. HARD SAFETY RELEASE (1.5s)
    // Ensures the UI never stays "black" or "loading" indefinitely
    const safetyTimer = setTimeout(() => {
      if (isMounted.current && loading) {
        setLoading(false);
      }
    }, 1500);

    // 3. SILENT BACKGROUND SYNCHRONIZATION
    const unsubscribe = onSnapshot(
      query,
      { includeMetadataChanges: false },
      (snapshot: QuerySnapshot<T>) => {
        clearTimeout(safetyTimer);
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as T));
        
        if (isMounted.current) {
          setData(items);
          setLoading(false);

          // Update cache for next instant load
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
        clearTimeout(safetyTimer);
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
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [query, cacheKey]);

  return { data, loading, error };
}
