# RxDB Adoption Plan

## Overview

This document outlines a comprehensive plan to migrate the Woodtime client application from Apollo Client to RxDB with GraphQL replication. The migration will improve offline-first capabilities, real-time synchronization, and provide better multi-tab support while maintaining the existing GraphQL API.

## Current Architecture

### Current Data Loading Stack

The application currently uses:
- **Apollo Client 3.14.0** for GraphQL operations
- **InMemoryCache** for caching GraphQL responses
- **apollo3-cache-persist** for offline persistence using localStorage
- **@apollo/client/link/error** for error handling (authentication redirects)
- **createHttpLink** for HTTP transport with credentials

Key implementation details:
- Apollo Client initialized in `AppShell.tsx` with cache persistence
- GraphQL endpoint: `VITE_GRAPHQL_ENDPOINT` (defaults to https://localhost:8080/woodtime)
- Cache-first and cache-and-network fetch policies used
- Manual refetch queries after mutations (e.g., `refetchQueries: ['getEvents']`)
- Code generation via GraphQL Code Generator with typed-document-node

### Data Entities

The GraphQL schema includes:
- **Events** - Orienteering events with checkpoints
- **Checkpoints** - Event checkpoints with codes and status
- **Users** - User profiles and friends
- **VirtualChallenges** - Virtual orienteering challenges with coordinates
- **Me** - Current user profile

## Why RxDB?

### Benefits Over Current Approach

1. **True Offline-First Architecture**
   - Native offline support with local database
   - Conflict-free data replication
   - Better handling of offline mutations

2. **Real-Time Synchronization**
   - Automatic bi-directional sync with GraphQL backend
   - Live queries that automatically update on data changes
   - Multi-tab synchronization out of the box

3. **Advanced Querying**
   - RxDB's query engine for complex local queries
   - Observables for reactive data updates
   - Better performance for large datasets

4. **Built-in Conflict Resolution**
   - Automatic conflict detection and resolution strategies
   - CRDT-like capabilities with proper replication protocol

## RxDB Architecture

### Core Components

```
┌─────────────────────────────────────────────────────┐
│                    React Components                  │
│         (EventList, EventPage, etc.)                │
└─────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────┐
│              RxDB React Hooks Layer                  │
│        (useRxQuery, useRxDocument, etc.)            │
└─────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────┐
│                  RxDB Database                       │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Events     │  │  Checkpoints │                │
│  │  Collection  │  │  Collection  │  ...            │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   IndexedDB  │ │    GraphQL   │ │  Replication │
│   (Storage)  │ │  Replication │ │    Plugin    │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Migration Plan

### Phase 1: Setup and Infrastructure (Week 1)

#### Step 1.1: Install RxDB Dependencies

```bash
pnpm add rxdb rxjs
pnpm add @types/pouchdb-adapter-idb --save-dev
```

Required RxDB packages:
- `rxdb` - Core RxDB library
- `rxjs` - Required peer dependency for observables
- Storage adapter (IndexedDB recommended for browser)

#### Step 1.2: Create RxDB Database Configuration

Create `src/database/setup.ts`:

```typescript
import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

// Add plugins
if (process.env.NODE_ENV === 'development') {
  addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBUpdatePlugin);

export async function createDatabase() {
  const db = await createRxDatabase({
    name: 'woodtime',
    storage: getRxStorageDexie(),
    multiInstance: true, // For multi-tab support
    eventReduce: true, // Performance optimization
  });

  return db;
}
```

#### Step 1.3: Define RxDB Schemas

Create `src/database/schemas/` directory with schema definitions:

**`schemas/event.schema.ts`:**
```typescript
import { RxJsonSchema } from 'rxdb';

// Constants for schema validation
const MAX_EVENT_ID = 999999999; // Maximum event ID supported by the system

export const eventSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'number',
      minimum: 0,
      maximum: MAX_EVENT_ID
    },
    name: {
      type: 'string'
    },
    type: {
      type: 'number'
    },
    invite_token: {
      type: 'string'
    },
    checkpoint_count: {
      type: 'number'
    },
    created_at: {
      type: 'string',
      format: 'date-time'
    },
    updated_at: {
      type: 'string',
      format: 'date-time'
    },
    // GraphQL replication fields
    deleted: {
      type: 'boolean',
      default: false
    },
    _modified: {
      type: 'number'
    }
  },
  required: ['id', 'name', 'type', 'checkpoint_count', 'created_at', 'updated_at'],
  indexes: ['created_at', 'updated_at']
};
```

**Key schema considerations:**
- Map GraphQL types to RxDB JSON Schema
- Add `deleted` flag for soft deletes
- Add `_modified` timestamp for replication
- Define appropriate indexes for query performance
- Handle nested objects (checkpoints, participants) as separate collections with relationships

#### Step 1.4: Create Collections

Create `src/database/collections.ts`:

```typescript
import { eventSchema } from './schemas/event.schema';
import { checkpointSchema } from './schemas/checkpoint.schema';
import { userSchema } from './schemas/user.schema';
import { virtualChallengeSchema } from './schemas/virtualChallenge.schema';

export const collections = {
  events: {
    schema: eventSchema,
    methods: {
      // Instance methods
      getCheckpoints() {
        return this.collection.database.checkpoints
          .find({ selector: { event_id: this.id } })
          .exec();
      }
    },
    statics: {
      // Static methods
      getUpcoming() {
        return this.find({
          selector: {
            deleted: false
          },
          sort: [{ created_at: 'desc' }]
        });
      }
    }
  },
  checkpoints: {
    schema: checkpointSchema
  },
  users: {
    schema: userSchema
  },
  virtualchallenges: {
    schema: virtualChallengeSchema
  }
};
```

### Phase 2: GraphQL Replication Setup (Week 1-2)

#### Step 2.1: Install GraphQL Replication Plugin

The GraphQL replication functionality is included in the main RxDB package:

```bash
# RxDB replication is included in the main package
# No additional plugin installation needed for GraphQL replication
```

#### Step 2.2: Configure GraphQL Replication

Create `src/database/replication.ts`:

```typescript
import { replicateGraphQL } from 'rxdb/plugins/replication-graphql';
import { RxDatabase } from 'rxdb';

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 
  'https://localhost:8080/woodtime';

// Pull query for events
const pullQueryBuilder = (checkpoint: any, limit: number) => {
  if (!checkpoint) {
    // First pull - get all events
    return {
      query: `
        query PullEvents($limit: Int!, $minUpdatedAt: DateTime!) {
          pullEvents(limit: $limit, minUpdatedAt: $minUpdatedAt) {
            documents {
              id
              name
              type
              invite_token
              checkpoint_count
              created_at
              updated_at
              deleted
              _modified
            }
            checkpoint {
              lastModified
            }
          }
        }
      `,
      variables: {
        limit,
        minUpdatedAt: new Date(0).toISOString()
      }
    };
  }

  // Subsequent pulls - get only updated events
  return {
    query: `
      query PullEvents($limit: Int!, $minUpdatedAt: DateTime!) {
        pullEvents(limit: $limit, minUpdatedAt: $minUpdatedAt) {
          documents {
            id
            name
            type
            invite_token
            checkpoint_count
            created_at
            updated_at
            deleted
            _modified
          }
          checkpoint {
            lastModified
          }
        }
      }
    `,
    variables: {
      limit,
      minUpdatedAt: new Date(checkpoint.lastModified).toISOString()
    }
  };
};

// Push query for creating/updating events
const pushQueryBuilder = (docs: any[]) => {
  return {
    query: `
      mutation PushEvents($events: [EventInput!]!) {
        pushEvents(events: $events) {
          id
          name
          type
          invite_token
          checkpoint_count
          created_at
          updated_at
          deleted
          _modified
        }
      }
    `,
    variables: {
      events: docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        invite_token: doc.invite_token,
        checkpoint_count: doc.checkpoint_count,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        deleted: doc.deleted,
        _modified: doc._modified
      }))
    }
  };
};

export function setupReplication(db: RxDatabase) {
  // Replicate events collection
  const eventsReplication = replicateGraphQL({
    collection: db.events,
    url: {
      http: GRAPHQL_ENDPOINT
    },
    pull: {
      queryBuilder: pullQueryBuilder,
      modifier: (doc: any) => doc // Optional: transform data
    },
    push: {
      queryBuilder: pushQueryBuilder,
      modifier: (doc: any) => doc // Optional: transform data before push
    },
    deletedField: 'deleted',
    live: true, // Enable continuous replication
    retryTime: 5000, // Retry failed requests after 5s
    autoStart: true,
    fetch: (url, options) => {
      // Add authentication
      return fetch(url, {
        ...options,
        credentials: 'include'
      });
    }
  });

  // Handle replication errors
  eventsReplication.error$.subscribe(err => {
    console.error('Events replication error:', err);
  });

  // Replicate other collections
  // TODO: Add replication for checkpoints, users, virtualchallenges

  return {
    events: eventsReplication
  };
}
```

#### Step 2.3: Update Backend GraphQL Schema

The backend needs to support replication queries. Add to `apps/api/src/schema.graphql`:

```graphql
type EventDocument {
  id: Int!
  name: String!
  type: Int!
  invite_token: String
  checkpoint_count: Int!
  created_at: DateTime!
  updated_at: DateTime!
  deleted: Boolean!
  _modified: Float!
}

type EventCheckpoint {
  lastModified: Float!
}

type PullEventsResponse {
  documents: [EventDocument!]!
  checkpoint: EventCheckpoint!
}

input EventInput {
  id: Int!
  name: String!
  type: Int!
  invite_token: String
  checkpoint_count: Int!
  created_at: DateTime!
  updated_at: DateTime!
  deleted: Boolean!
  _modified: Float!
}

extend type Query {
  pullEvents(limit: Int!, minUpdatedAt: DateTime!): PullEventsResponse!
  pullCheckpoints(limit: Int!, minUpdatedAt: DateTime!): PullCheckpointsResponse!
  pullVirtualChallenges(limit: Int!, minUpdatedAt: DateTime!): PullVirtualChallengesResponse!
}

extend type Mutation {
  pushEvents(events: [EventInput!]!): [EventDocument!]!
  pushCheckpoints(checkpoints: [CheckpointInput!]!): [CheckpointDocument!]!
  pushVirtualChallenges(challenges: [VirtualChallengeInput!]!): [VirtualChallengeDocument!]!
}
```

**Backend implementation requirements:**
- Add `deleted` boolean column to all tables (events, checkpoints, users, virtualchallenges)
- Add `_modified` timestamp column (updated on every change via triggers or ORM hooks)
- Implement pull queries that return documents modified after checkpoint
- Implement push mutations that handle upsert operations
- Handle conflict resolution (last-write-wins or custom strategy)

**Database migration example** (located in `apps/api/migrations/`):
```sql
-- Migration: Add RxDB replication fields
ALTER TABLE events 
  ADD COLUMN deleted BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN _modified BIGINT DEFAULT 0 NOT NULL;

-- Create trigger to update _modified on every change
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW._modified = EXTRACT(EPOCH FROM NOW()) * 1000;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_modified_trigger
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

-- Create index for replication queries
CREATE INDEX idx_events_modified ON events(_modified);
CREATE INDEX idx_events_deleted ON events(deleted);

-- Repeat for checkpoints, users, virtualchallenges tables
```

### Phase 3: React Integration (Week 2)

#### Step 3.1: Create RxDB Provider

Create `src/database/RxDBProvider.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
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
  loading: true
});

export const useRxDB = () => {
  const context = useContext(RxDBContext);
  if (!context) {
    throw new Error('useRxDB must be used within RxDBProvider');
  }
  return context;
};

export const RxDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<RxDatabase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const database = await createDatabase();
        
        // Add collections
        await database.addCollections(collections);
        
        // Setup replication
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
      if (db) {
        db.destroy();
      }
    };
  }, []);

  return (
    <RxDBContext.Provider value={{ db, loading }}>
      {children}
    </RxDBContext.Provider>
  );
};
```

#### Step 3.2: Create Custom Hooks

Create `src/database/hooks/useRxQuery.ts`:

```typescript
import { useEffect, useState } from 'react';
import { useRxDB } from '../RxDBProvider';
import { RxQuery } from 'rxdb';

export function useRxQuery<T>(
  queryConstructor: (db: any) => RxQuery<T>
) {
  const { db } = useRxDB();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) return;

    setLoading(true);
    const query = queryConstructor(db);
    
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
```

Create `src/database/hooks/useRxDocument.ts`:

```typescript
import { useEffect, useState } from 'react';
import { useRxDB } from '../RxDBProvider';

export function useRxDocument<T>(
  collection: string,
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
      .findOne(id)
      .$.subscribe({
        next: (doc: any) => {
          setData(doc ? doc.toJSON() : null);
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
```

#### Step 3.3: Update AppShell.tsx

Replace Apollo Provider with RxDB Provider:

```typescript
// Old:
// import { ApolloProvider } from '@apollo/client';

// New:
import { RxDBProvider } from './database/RxDBProvider';

function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PwaUpdateNotification />
      <RxDBProvider>
        <InitialNavigationDetector>
          <CheckpointsService>
            <Executor />
            <ErrorReporter />
            {children}
          </CheckpointsService>
        </InitialNavigationDetector>
      </RxDBProvider>
    </>
  );
}
```

### Phase 4: Migrate Queries and Mutations (Week 2-3)

#### Step 4.1: Convert Read Queries

**Before (Apollo Client):**
```typescript
// EventList.tsx
import { useQuery } from '@apollo/client';
import { GetEventsDocument } from '../../queries/getEvents';

const { loading, error, data } = useQuery(GetEventsDocument, {
  fetchPolicy: isInitialNavigation ? 'cache-and-network' : undefined,
});

const events = data?.events ?? [];
```

**After (RxDB):**
```typescript
// EventList.tsx
import { useRxQuery } from '../../database/hooks/useRxQuery';

const { data: events, loading, error } = useRxQuery(
  (db) => db.events.find({
    selector: {
      deleted: false
    },
    sort: [{ created_at: 'desc' }]
  })
);
```

#### Step 4.2: Convert Mutations

**Before (Apollo Client):**
```typescript
const [deleteEvent] = useMutation(DeleteEventDocument, {
  refetchQueries: ['getEvents'],
  awaitRefetchQueries: true,
});

const handleDeleteClick = (eventId: number) => {
  return deleteEvent({ variables: { id: eventId } });
};
```

**After (RxDB):**
```typescript
import { useRxDB } from '../../database/RxDBProvider';

const { db } = useRxDB();

const handleDeleteClick = async (eventId: number) => {
  const event = await db.events.findOne(eventId).exec();
  if (event) {
    // Soft delete - will be synced via replication
    await event.update({
      $set: {
        deleted: true,
        _modified: Date.now()
      }
    });
  }
};
```

**For create operations:**
```typescript
// Helper function to generate temporary IDs for offline-created documents
// Uses timestamp + random component to avoid collisions
const generateTempId = () => {
  // Use negative timestamp-based ID to avoid collision with server IDs
  // Format: -[timestamp][random] ensures uniqueness and ordering
  return -(Date.now() * 1000 + Math.floor(Math.random() * 1000));
};

// Alternative: Use UUIDs if backend supports string IDs
// import { v4 as uuidv4 } from 'uuid';
// const generateTempId = () => `temp-${uuidv4()}`;

const handleCreateEvent = async (eventData: any) => {
  await db.events.insert({
    ...eventData,
    id: generateTempId(), // Use temporary ID
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted: false,
    _modified: Date.now()
  });
  // RxDB replication will sync to server and update with real ID
};
```

#### Step 4.3: Handle Relationships

For queries with relationships (e.g., event with checkpoints):

```typescript
const { data: event, loading } = useRxDocument('events', eventId);
const { data: checkpoints } = useRxQuery(
  (db) => db.checkpoints.find({
    selector: {
      event_id: eventId,
      deleted: false
    },
    sort: [{ cp_id: 'asc' }]
  })
);

// Combine data
const eventWithCheckpoints = event ? {
  ...event,
  checkpoints
} : null;
```

### Phase 5: Migration Strategy (Week 3)

#### Step 5.1: Parallel Running Phase

Run both Apollo Client and RxDB simultaneously:

1. Keep Apollo Client code
2. Add RxDB alongside
3. Feature flag to switch between implementations
4. Compare data consistency
5. Monitor performance metrics

```typescript
const USE_RXDB = import.meta.env.VITE_USE_RXDB === 'true';

if (USE_RXDB) {
  // Use RxDB
  const { data, loading } = useRxQuery(/* ... */);
} else {
  // Use Apollo Client
  const { data, loading } = useQuery(/* ... */);
}
```

#### Step 5.2: Data Migration

1. On first RxDB initialization, pull all data from server
2. Clear old Apollo cache (localStorage)
3. Mark migration complete in localStorage

```typescript
async function migrateFromApollo() {
  const migrated = localStorage.getItem('rxdb-migrated');
  if (migrated) return;

  // Clear Apollo cache
  localStorage.removeItem('apollo-cache-persist');
  
  // RxDB will pull all data on first sync
  localStorage.setItem('rxdb-migrated', 'true');
}
```

#### Step 5.3: Testing Phase

1. Unit test RxDB schemas
2. Integration test replication
3. E2E test offline scenarios
4. Load testing with large datasets
5. Multi-tab synchronization testing

### Phase 6: Remove Apollo Client (Week 4)

#### Step 6.1: Cleanup

1. Remove Apollo Client dependencies:
```bash
pnpm remove @apollo/client apollo3-cache-persist
pnpm remove @graphql-codegen/cli @graphql-codegen/typed-document-node
```

2. Delete Apollo-related files:
   - `support/storybook/getMockedApolloClient.tsx`
   - GraphQL query files (`.graphql` files)
   - Generated query TypeScript files

3. Update imports throughout codebase

4. Remove GraphQL Code Generator scripts from `package.json`

#### Step 6.2: Update Documentation

1. Update README.md with RxDB setup instructions
2. Document new query patterns
3. Add troubleshooting guide
4. Update Storybook mocks to use RxDB

## Offline Behavior

### Current Behavior (Apollo Client)
- Cache persists to localStorage
- No conflict resolution
- Manual refetch on reconnection
- Limited offline mutation queue

### New Behavior (RxDB)
- Full offline database with IndexedDB
- Automatic conflict resolution
- Automatic sync on reconnection
- Robust offline mutation queue
- Multi-tab coordination

## Performance Considerations

### Optimization Strategies

1. **Lazy Collection Loading**
   - Only load collections when needed
   - Use dynamic imports for large schemas

2. **Indexing Strategy**
   - Index frequently queried fields
   - Compound indexes for complex queries

3. **Data Pruning**
   - Implement cleanup for old data
   - Archive deleted documents after sync

4. **Replication Batch Size**
   - Tune pull/push batch sizes
   - Balance initial load vs. incremental updates

## Error Handling

### Authentication Errors
```typescript
const replicationState = setupReplication(db);

replicationState.events.error$.subscribe(err => {
  if (err.status === 401) {
    // Redirect to sign-in
    window.location.href = '/sign-in?redirect_url=' + 
      encodeURIComponent(window.location.href);
  }
});
```

### Conflict Resolution
```typescript
// Custom conflict handler
const conflictHandler = (
  realMasterState: any,
  newDocumentState: any
) => {
  // Last-write-wins based on _modified timestamp
  if (newDocumentState._modified > realMasterState._modified) {
    return newDocumentState;
  }
  return realMasterState;
};
```

## Testing Strategy

### Unit Tests
- Schema validation
- Database initialization
- Query construction
- Data transformations

### Integration Tests
- Replication functionality
- Conflict resolution
- Offline/online transitions
- Multi-collection queries

### E2E Tests
- Full user workflows
- Network interruption scenarios
- Multi-tab synchronization
- Data consistency checks

## Rollback Plan

### Immediate Rollback (if critical issues found)

1. Set feature flag `VITE_USE_RXDB=false`
2. Deploy hotfix
3. Apollo Client still in codebase, will activate immediately

### Full Rollback (if needed after cleanup)

1. Revert to commit before RxDB changes
2. Restore Apollo Client dependencies
3. Clear client storage (force refresh)
4. Monitor for data consistency

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Setup | Week 1 | RxDB installed, schemas defined |
| Phase 2: Replication | Week 1-2 | GraphQL replication configured, backend updated |
| Phase 3: React Integration | Week 2 | Providers and hooks created |
| Phase 4: Query Migration | Week 2-3 | All queries/mutations converted |
| Phase 5: Testing & Parallel Run | Week 3 | Feature complete, both systems running |
| Phase 6: Cleanup | Week 4 | Apollo Client removed, documentation updated |

**Total Estimated Time: 4 weeks**

## Success Metrics

- [ ] All GraphQL queries migrated to RxDB
- [ ] Offline functionality working correctly
- [ ] Real-time sync operational
- [ ] Multi-tab support verified
- [ ] Performance equal or better than Apollo Client
- [ ] Zero data loss during migration
- [ ] Test coverage maintained or improved

## Resources

- [RxDB Documentation](https://rxdb.info/)
- [RxDB GraphQL Replication](https://rxdb.info/replication-graphql.html)
- [RxDB Schema](https://rxdb.info/rx-schema.html)
- [RxDB React Integration](https://rxdb.info/react-database.html)

## Open Questions

1. **Temporary IDs**: How to handle temporary IDs for offline-created documents? 
   - Solution: Use negative IDs or UUIDs, map to real IDs on sync

2. **Large Datasets**: What's the strategy for events with many checkpoints?
   - Solution: Implement pagination or virtual scrolling

3. **Real-time Updates**: How frequently should replication pull?
   - Solution: Use live replication with WebSocket fallback

4. **Schema Versioning**: How to handle schema migrations?
   - Solution: Implement RxDB migration strategies

5. **File Attachments**: How to handle checkpoint photos or attachments?
   - Solution: Use separate blob storage with references in RxDB

## Conclusion

Migrating from Apollo Client to RxDB with GraphQL replication will significantly improve the Woodtime application's offline capabilities and real-time synchronization. The phased approach allows for careful testing and validation at each step, with a clear rollback plan if issues arise. The estimated 4-week timeline provides adequate time for implementation, testing, and refinement while minimizing risk to the production application.
