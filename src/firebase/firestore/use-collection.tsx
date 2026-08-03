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

export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use a ref to track if we've already done an initial fetch for this query
  const isInitialFetch = useRef(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // Only set loading to true if we don't have data or if the query actually changed significantly
    // Firestore's onSnapshot is very fast if data is already in cache
    if (isInitialFetch.current) {
      setLoading(true);
    }

    const unsubscribe = onSnapshot(
      query,
      { includeMetadataChanges: false }, // Avoid double triggers on metadata
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as T));
        setData(items);
        setLoading(false);
        isInitialFetch.current = false;
      },
      async (serverError: FirestoreError) => {
        if (serverError.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'collection',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
        setError(serverError);
        setLoading(false);
        isInitialFetch.current = false;
      }
    );

    return () => {
      unsubscribe();
    };
  }, [query]);

  return { data, loading, error };
}