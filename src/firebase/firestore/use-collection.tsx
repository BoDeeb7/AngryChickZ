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
 * 1. Synchronous Hydration: Reads from localStorage during initial state setup (0ms).
 * 2. Stale-While-Revalidate: Renders cached data immediately while fetching live updates in background.
 * 3. Strict 1.5s Loading Cap: Forces 'loading' to false if the network is slow, releasing the UI.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey?: string) {
  // 1. SYNCHRONOUS HYDRATION
  // Initialize state directly from localStorage if cacheKey is provided
  const [data, setData] = useState<T[]>(() => {
    if (typeof window !== 'undefined' && cacheKey) {
      const saved = localStorage.getItem(cacheKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // Only show loading if we have NO data at all
  const [loading, setLoading] = useState(() => data.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!query) {
      setLoading(false);
      return;
    }

    // 2. STRICT 1.5s LOADING CAP
    // Ensures the UI is never stuck on a black screen or spinner
    const safetyTimer = setTimeout(() => {
      if (isMounted.current) {
        setLoading(false);
      }
    }, 1500);

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
          clearTimeout(safetyTimer);

          // Persist REAL data to cache for instant load next time
          if (cacheKey) {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(items));
            } catch (e) {
              // Handle QuotaExceededError by clearing old data
              console.warn('Storage quota exceeded, clearing cache');
              localStorage.removeItem(cacheKey);
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
