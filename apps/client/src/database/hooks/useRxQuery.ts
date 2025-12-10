import { useEffect, useState } from 'react';
import { useRxDB } from '../RxDBProvider';
import type { RxQuery, RxDatabase } from 'rxdb';

export function useRxQuery<T>(
  queryConstructor: (db: RxDatabase) => RxQuery<T> | null
) {
  const { db } = useRxDB();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    setLoading(true);
    const query = queryConstructor(db);
    
    // Handle null query (e.g., when feature flag is off)
    if (!query) {
      setLoading(false);
      return;
    }
    
    const subscription = query.$.subscribe({
      next: (results) => {
        setData(results);
        setLoading(false);
      },
      error: (err) => {
        setError(err);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [db, queryConstructor]);

  return { data, loading, error };
}
