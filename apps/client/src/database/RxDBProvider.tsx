import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { RxDatabase } from 'rxdb';
import { createDatabase } from './setup';
import { collections } from './collections';
import { setupReplication } from './replication';

interface RxDBContextType {
  db: RxDatabase | null;
  loading: boolean;
}

const RxDBContext = createContext<RxDBContextType>({
  db: null,
  loading: true,
});

export const useRxDB = () => {
  const context = useContext(RxDBContext);
  if (!context) {
    throw new Error('useRxDB must be used within RxDBProvider');
  }
  return context;
};

export const RxDBProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<RxDatabase | null>(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef<boolean>(false);

  useEffect(() => {
    if (initRef.current) {
      return;
    }
    initRef.current = true;

    async function init() {
      try {
        const database = await createDatabase();

        // Add collections
        await database.addCollections(collections);

        // Setup replication
        // Note: Replication instances are returned but not stored for cleanup.
        // RxDB handles replication lifecycle automatically, and the instances
        // continue running until the database is destroyed.
        setupReplication(database);

        setDb(database);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize RxDB:', error);
        setLoading(false);
      }
    }

    init();

    return () => {
      // Cleanup: RxDB databases are designed to be persistent and typically
      // don't need explicit cleanup in React apps. The database will be
      // reused across page reloads via IndexedDB.
    };
  }, []);

  return (
    <RxDBContext.Provider value={{ db, loading }}>
      {children}
    </RxDBContext.Provider>
  );
};
