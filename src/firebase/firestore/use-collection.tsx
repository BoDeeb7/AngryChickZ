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
  
  const isInitialFetch = useRef(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    // Defensive timeout to ensure UI is never stuck on "loading"
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

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
  }, [query]);

  return { data, loading, error };
}
