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
 * useCollection Hook - Optimized for Instant UI (0s Delay)
 * 1. Synchronous Hydration: State initializes from localStorage during the first render.
 * 2. Instant Loading Release: If cache exists, 'loading' is false immediately.
 * 3. Hard Sync Cap: A 1.5s timeout ensures the UI never hangs waiting for Firestore.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey?: string) {
  // Generate a stable cache key based on the query path
  const internalCacheKey = cacheKey || (query ? 'fs_cache_' + (query as any)._query?.path?.segments?.join('_') : null);
  
  // Synchronous Cache Reader
  const getCachedData = (): T[] => {
    if (typeof window === 'undefined' || !internalCacheKey) return [];
    try {
      const cached = localStorage.getItem(internalCacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  // 1. Initial State from Cache (0ms delay)
  // We use the functional initializer to ensure this only runs once and happens synchronously.
  const [data, setData] = useState<T[]>(() => getCachedData());
  const [loading, setLoading] = useState(() => {
    // If we have cached data, we don't need to show a blocking loader.
    const cached = getCachedData();
    return cached.length === 0;
  });
  
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // 2. Instant Release
    // If we have data from cache, we are effectively not "loading" from the user's perspective
    if (data.length > 0) {
      setLoading(false);
    }

    if (!query) {
      setLoading(false);
      return;
    }

    // 3. The 1.5s Hard Sync Cap
    // This timer ensures the UI is released no matter how long the Firestore network handshake takes.
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
          clearTimeout(safetyTimer); // Clear if network was fast
          
          // Persist REAL database items to local storage
          if (internalCacheKey) {
            try {
              localStorage.setItem(internalCacheKey, JSON.stringify(items));
            } catch (e: any) {
              if (e.name === 'QuotaExceededError') {
                localStorage.clear(); // Emergency space management
              }
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
  }, [query, internalCacheKey]);

  return { data, loading, error };
}
