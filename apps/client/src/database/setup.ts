import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { wrappedValidateZSchemaStorage } from 'rxdb/plugins/validate-z-schema';

// Add plugins
if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBUpdatePlugin);
// Note: GraphQL replication plugin doesn't need explicit registration

export const storage =
  process.env.NODE_ENV === 'development'
    ? wrappedValidateZSchemaStorage({ storage: getRxStorageDexie() })
    : getRxStorageDexie();

export async function createDatabase() {
  // Wrap storage with z-schema validator in development mode to catch schema errors early

  const db = await createRxDatabase({
    name: 'woodtime',
    storage, // Use validated storage in dev mode
    multiInstance: true, // For multi-tab support
    eventReduce: true, // Performance optimization
    closeDuplicates: process.env.NODE_ENV === 'development',
  });

  return db;
}
