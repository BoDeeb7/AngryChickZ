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
  
  // Use a ref to track if the initial fetch is happening to avoid flickering
  const isInitialFetch = useRef(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    if (isInitialFetch.current) {
      setLoading(true);
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items);
        setLoading(false);
        isInitialFetch.current = false;
      },
      async (serverError: FirestoreError) => {
        // Only emit if it's a real permission error
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

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
