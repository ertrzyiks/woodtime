import { useEffect, useState } from 'react';
import { useRxDB } from '../RxDBProvider';
import type { RxDocument } from 'rxdb';

// Define valid collection names based on our collections
// TODO: Consider generating this type from collections.ts for better maintainability
type CollectionName = 'events' | 'checkpoints' | 'users' | 'virtualchallenges';

/**
 * Custom hook for querying a single RxDB document with reactive updates.
 * 
 * @param collection - Name of the collection to query
 * @param id - Primary key of the document to fetch
 * @returns Object with data, loading, and error states
 * 
 * @example
 * ```tsx
 * const { data: event, loading } = useRxDocument('events', eventId);
 * ```
 */
export function useRxDocument<T>(
  collection: CollectionName,
  id: string | number
) {
  const { db } = useRxDB();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !id) return;

    setLoading(true);
    
    const subscription = db[collection]
      .findOne({
        selector: {
          id: id
        }
      })
      .$.subscribe({
        next: (doc: RxDocument<T> | null) => {
          setData(doc ? doc.toJSON() as T : null);
          setLoading(false);
        },
        error: (err: Error) => {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [db, collection, id]);

  return { data, loading, error };
}
