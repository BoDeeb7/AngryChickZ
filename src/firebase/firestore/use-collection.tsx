
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
 * useCollection Hook with Persistent Caching
 * 1. Hydrates instantly from localStorage for < 1s initial render.
 * 2. Synchronizes with Firestore in background (SWR pattern).
 * 3. Prevents UI flickering by prioritizing cached data.
 * 4. Resilient to LocalStorage QuotaExceeded errors.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null, cacheKey?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const isInitialFetch = useRef(true);
  const internalCacheKey = cacheKey || (query ? 'firestore_cache_' + (query as any)._query?.path?.segments?.join('_') : null);

  // Initial Hydration from LocalStorage for instant load
  useEffect(() => {
    if (internalCacheKey) {
      const cached = localStorage.getItem(internalCacheKey);
      if (cached) {
        try {
          setData(JSON.parse(cached));
          setLoading(false); // Mark as not loading because we have data
        } catch (e) {
          console.warn("Failed to parse firestore cache", e);
        }
      }
    }
  }, [internalCacheKey]);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // Safety Timeout to prevent stuck loading states
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

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

        // Persist to cache for next visit with error handling for quota limits
        if (internalCacheKey) {
          try {
            localStorage.setItem(internalCacheKey, JSON.stringify(items));
          } catch (e: any) {
            // Handle QuotaExceededError gracefully
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
              console.warn("Firestore cache quota exceeded. Attempting to clear space.");
              // Clear only the firestore cache keys to make room, rather than everything
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('firestore_cache_')) {
                  localStorage.removeItem(key);
                }
              });
              // Try one last time after clearing space
              try {
                localStorage.setItem(internalCacheKey, JSON.stringify(items));
              } catch (retryError) {
                // If it's still too big (e.g. single item > 5MB), just stop caching for this session
                console.error("Item list too large for local storage even after clearing cache.");
              }
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
