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
 * useCollection Hook with Strict Zero-Delay Caching
 * 1. Immediate Hydration: Reads from localStorage during initialization to prevent flashes.
 * 2. 2s Safety Timeout: Force-stops the loading state if the network is slow.
 * 3. Stale-While-Revalidate: Renders cached data instantly, updates in background.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey?: string) {
  const internalCacheKey = cacheKey || (query ? 'firestore_cache_' + (query as any)._query?.path?.segments?.join('_') : null);
  
  // Get initial data from cache to prevent hydration delay
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
  // If we have cached data, we don't need a blocking loader
  const [loading, setLoading] = useState(cachedData.length === 0);
  const [error, setError] = useState<Error | null>(null);
  
  const isInitialFetch = useRef(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // STRICT 2-SECOND TIMEOUT: Stop the loading spinner even if DB is slow
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

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
        clearTimeout(safetyTimeout);
        isInitialFetch.current = false;

        // Persist to cache for next visit with error handling
        if (internalCacheKey) {
          try {
            localStorage.setItem(internalCacheKey, JSON.stringify(items));
          } catch (e: any) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('firestore_cache_')) localStorage.removeItem(key);
              });
              try { localStorage.setItem(internalCacheKey, JSON.stringify(items)); } catch (retryError) {}
            }
          }
        }
      },
      async (serverError: FirestoreError) => {
        clearTimeout(safetyTimeout);
        if (serverError.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'collection',
            operation: 'list',
          }));
        }
        setError(serverError);
        setLoading(false);
        isInitialFetch.current = false;
      }
    );

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [query, internalCacheKey]);

  return { data, loading, error };
}
