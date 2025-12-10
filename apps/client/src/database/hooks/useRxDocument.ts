import { useEffect, useState } from 'react';
import { useRxDB } from '../RxDBProvider';
import type { RxDocument } from 'rxdb';

// Define valid collection names based on our collections
type CollectionName = 'events' | 'checkpoints' | 'users' | 'virtualchallenges';

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
