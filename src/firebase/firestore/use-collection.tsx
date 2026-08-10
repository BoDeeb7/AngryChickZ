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
 * useCollection Hook - Zero-Latency Hydration Mode
 * 1. Immediate Hydration: Loads from localStorage synchronously during state initialization.
 * 2. Silent Revalidation: Updates data in background. 'loading' is only true if ZERO data (cache or server) exists.
 * 3. Persistence: Automatically caches results for instant future loads.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey?: string) {
  const internalCacheKey = cacheKey || (query ? 'firestore_cache_' + (query as any)._query?.path?.segments?.join('_') : null);
  
  // Instant Hydration from local storage
  const getCachedData = (): T[] => {
    if (typeof window === 'undefined' || !internalCacheKey) return [];
    try {
      const cached = localStorage.getItem(internalCacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  };

  const cachedData = getCachedData();
  const [data, setData] = useState<T[]>(cachedData);
  // Silent loading: Only true if we have absolutely nothing to show
  const [loading, setLoading] = useState(cachedData.length === 0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // Silent background synchronization
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

        // Update persistence layer silently
        if (internalCacheKey) {
          try {
            localStorage.setItem(internalCacheKey, JSON.stringify(items));
          } catch (e: any) {
            // Graceful cleanup on storage quota errors
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('firestore_cache_')) localStorage.removeItem(key);
              });
              try { localStorage.setItem(internalCacheKey, JSON.stringify(items)); } catch (retry) {}
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
