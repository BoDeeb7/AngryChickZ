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
 * useCollection Hook - Optimized for Instant UI Response
 * 1. Immediate Return: Returns current state instantly.
 * 2. 1.5s Hard Cap: Forces 'loading' to false if the network is slow.
 * 3. Non-Blocking: Does not wait for full synchronization to allow UI interaction.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!query) {
      setLoading(false);
      return;
    }

    // STRICT 1.5s LOADING CAP
    // This ensures that even if Firestore is slow to connect/handshake,
    // the UI is released and the skeletons/empty states are resolved.
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
          clearTimeout(safetyTimer);
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
  }, [query]);

  return { data, loading, error };
}
