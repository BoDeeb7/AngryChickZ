'use client';

import { useState, useEffect } from 'react';
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
 * 2. Background Revalidation: Firestore syncs silently.
 * 3. Quota Safety: Automatically manages localStorage limits.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey?: string) {
  // Generate a stable cache key based on the query path
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

  const [data, setData] = useState<T[]>(getCachedData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // Start Firestore listener
    const unsubscribe = onSnapshot(
      query,
      { includeMetadataChanges: true },
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as T));
        
        setData(items);
        setLoading(false);

        // Update persistence silently
        if (internalCacheKey) {
          try {
            localStorage.setItem(internalCacheKey, JSON.stringify(items));
          } catch (e: any) {
            if (e.name === 'QuotaExceededError') {
              localStorage.clear(); // Emergency purge if full
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
        setError(serverError);
        setLoading(false);
      }
    );

    // Safety timeout: If live sync takes > 2s, stop the loading state and show what we have (cache)
    const timer = setTimeout(() => setLoading(false), 2000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [query, internalCacheKey]);

  return { data, loading, error };
}
