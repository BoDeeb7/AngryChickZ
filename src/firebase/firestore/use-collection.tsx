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
 * useCollection Hook - Optimized for Instant UI Response
 * 
 * Performance Architecture:
 * 1. Synchronous Hydration: State initializes directly from localStorage (0ms wait).
 * 2. Stale-While-Revalidate: UI shows cached data immediately while fetching updates silently.
 * 3. Non-Resetting 1.5s Safety Cap: Forces loading to false after 1.5s to ensure UI interactivity.
 * 4. Silent Cache Refresh: Updates localStorage and UI only when database changes are detected.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey?: string) {
  // 1. SYNCHRONOUS HYDRATION
  // Initialize state during the very first render cycle from local cache
  const [data, setData] = useState<T[]>(() => {
    if (typeof window !== 'undefined' && cacheKey) {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // Start with loading true ONLY if we have no cached data at all
  const [loading, setLoading] = useState(() => data.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const resolvedRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    resolvedRef.current = false;

    // 3. STRICT 1.5s LOADING CAP
    // Protects against "Black Screens" by releasing the loading state if DB is slow
    const safetyTimer = setTimeout(() => {
      if (isMounted.current && !resolvedRef.current) {
        setLoading(false);
      }
    }, 1500);

    if (!query) {
      // If DB is not ready, we still respect the safetyTimer to release empty UI
      return () => {
        isMounted.current = false;
        clearTimeout(safetyTimer);
      };
    }

    const unsubscribe = onSnapshot(
      query,
      { includeMetadataChanges: false },
      (snapshot: QuerySnapshot<T>) => {
        resolvedRef.current = true;
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as T));
        
        if (isMounted.current) {
          setData(items);
          setLoading(false);
          clearTimeout(safetyTimer);

          // 4. SILENT CACHE REFRESH
          if (cacheKey) {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(items));
            } catch (e) {
              // Handle full storage by purging old cache
              console.warn('Storage quota exceeded, clearing cache');
              localStorage.removeItem(cacheKey);
            }
          }
        }
      },
      async (serverError: FirestoreError) => {
        resolvedRef.current = true;
        if (serverError.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'collection',
            operation: 'list',
          }));
        }
        if (isMounted.current) {
          setError(serverError);
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      }
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, [query, cacheKey]);

  return { data, loading, error };
}
