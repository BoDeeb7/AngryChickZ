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
 * useCollection Hook - Optimized Zero-Wait Architecture
 * 1. Synchronous Hydration: State is initialized directly from localStorage.
 * 2. Immediate Release: If cache exists, loading state is disabled instantly.
 * 3. Strict Timing: Enforces a 1.5s maximum wait for live synchronization.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey?: string) {
  // Generate a stable cache key
  const internalCacheKey = cacheKey || (query ? 'fs_cache_' + (query as any)._query?.path?.segments?.join('_') : null);
  
  // Helper to get cached data synchronously
  const getCachedData = (): T[] => {
    if (typeof window === 'undefined' || !internalCacheKey) return [];
    try {
      const cached = localStorage.getItem(internalCacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  const initialData = getCachedData();
  const [data, setData] = useState<T[]>(initialData);
  // If we have cached data, we are technically not "loading" the UI shell
  const [loading, setLoading] = useState(initialData.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (!query) {
      setLoading(false);
      return;
    }

    // Safety Timeout: Force release loading state after 1.5 seconds regardless of network
    const safetyTimer = setTimeout(() => {
      if (isMounted.current) setLoading(false);
    }, 1500);

    const unsubscribe = onSnapshot(
      query,
      { includeMetadataChanges: true },
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as T));
        
        if (isMounted.current) {
          setData(items);
          setLoading(false);
          
          // Update persistence silently
          if (internalCacheKey) {
            try {
              localStorage.setItem(internalCacheKey, JSON.stringify(items));
            } catch (e: any) {
              if (e.name === 'QuotaExceededError') {
                localStorage.clear();
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
