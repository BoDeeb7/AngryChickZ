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
 * useCollection Hook - Direct Client-Side SWR Implementation
 * 1. Synchronous Hydration: Reads from localStorage during initial state setup.
 * 2. Non-Blocking: returns data immediately (cached or empty) without setting a 'loading' block.
 * 3. Silent Sync: Revalidates against the database in the background.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey?: string) {
  // Generate a path-based cache key if one isn't provided
  const internalCacheKey = cacheKey || (query ? 'fs_swr_' + (query as any)._query?.path?.segments?.join('_') : null);
  
  // 1. Sync Cache Retrieval (Internal helper)
  const getInitialData = (): T[] => {
    if (typeof window === 'undefined' || !internalCacheKey) return [];
    try {
      const cached = localStorage.getItem(internalCacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  // 2. Initialize state with cached data for 0-second render
  const [data, setData] = useState<T[]>(getInitialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // 3. Background Revalidation (Non-blocking)
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

        // 4. Update Persistence Silently
        if (internalCacheKey) {
          try {
            localStorage.setItem(internalCacheKey, JSON.stringify(items));
          } catch (e: any) {
            // Cleanup on storage limits
            if (e.name === 'QuotaExceededError') {
              localStorage.clear(); 
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

    return () => unsubscribe();
  }, [query, internalCacheKey]);

  return { data, loading, error };
}
