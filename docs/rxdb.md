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
    storage: getRxStorageDexie(), // Dexie.js provides a robust IndexedDB wrapper
    multiInstance: true, // For multi-tab support
    eventReduce: true, // Performance optimization
  });

  return db;
}
```

**Why Dexie Storage?**

Dexie is chosen as the storage adapter for RxDB in the browser for several reasons:

1. **Battle-tested IndexedDB wrapper**: Dexie.js is a mature, well-maintained library that abstracts away many of IndexedDB's quirks and browser inconsistencies
2. **Performance**: Dexie provides excellent query performance and optimized transactions
3. **Cross-browser compatibility**: Works consistently across all modern browsers (Chrome, Firefox, Safari, Edge)
4. **No external dependencies**: Pure JavaScript implementation that works offline
5. **Large storage capacity**: IndexedDB can store significantly more data than localStorage (typically 50MB+ depending on browser)
6. **Structured queries**: Supports complex queries with indexes, which is essential for efficient data retrieval

Alternative storage adapters exist (LokiJS, memory, etc.) but Dexie is the recommended choice for production browser applications due to its reliability and performance characteristics.

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

**Additional schema example - `schemas/checkpoint.schema.ts`:**
```typescript
import { RxJsonSchema } from 'rxdb';

export const checkpointSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'number',
      minimum: 0,
      maximum: 999999999
    },
    event_id: {
      type: 'number'
    },
    cp_id: {
      type: 'number'
    },
    cp_code: {
      type: 'string'
    },
    skipped: {
      type: 'boolean'
    },
    skip_reason: {
      type: ['string', 'null']
    },
    created_at: {
      type: 'string',
      format: 'date-time'
    },
    updated_at: {
      type: 'string',
      format: 'date-time'
    },
    deleted: {
      type: 'boolean',
      default: false
    },
    _modified: {
      type: 'number'
    }
  },
  required: ['id', 'event_id', 'cp_id', 'skipped', 'created_at', 'updated_at'],
  indexes: ['event_id', 'created_at', 'updated_at', '_modified']
};
```

**Note**: The `event_id` field creates a foreign key-like relationship. While RxDB doesn't enforce referential integrity like traditional databases, this field is indexed for efficient queries. You can query all checkpoints for an event using: `db.checkpoints.find({ selector: { event_id: eventId } })`

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

#### Step 2.1: Setup GraphQL Replication Plugin

The GraphQL replication functionality is included in the main RxDB package but requires explicit plugin registration:

```typescript
import { addRxPlugin } from 'rxdb';
import { RxDBReplicationGraphQLPlugin } from 'rxdb/plugins/replication-graphql';

// Register the GraphQL replication plugin
addRxPlugin(RxDBReplicationGraphQLPlugin);
```

**Note**: While the replication code is bundled with RxDB, you must explicitly import and register the plugin before using `replicateGraphQL()` in your application.

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

**How Event-Checkpoint Relationships Are Maintained:**

In RxDB, relationships are maintained through foreign key references, similar to relational databases, but without enforced referential integrity:

1. **Collection Separation**: Events and checkpoints are stored in separate collections, each with their own schema and replication configuration

2. **Foreign Key Pattern**: Each checkpoint document contains an `event_id` field that references its parent event:
   ```typescript
   checkpoint: {
     id: 123,
     event_id: 456,  // References the event
     cp_id: 1,
     // ... other fields
   }
   ```

3. **Indexed Queries**: The `event_id` field is indexed in the checkpoint schema for efficient lookups:
   ```typescript
   // Query all checkpoints for a specific event
   const checkpoints = await db.checkpoints
     .find({ selector: { event_id: eventId } })
     .exec();
   ```

4. **Instance Methods**: The event schema includes a helper method to fetch related checkpoints:
   ```typescript
   // From collections.ts
   events: {
     methods: {
       getCheckpoints() {
         return this.collection.database.checkpoints
           .find({ selector: { event_id: this.id } })
           .exec();
       }
     }
   }
   ```

5. **Replication Independence**: Events and checkpoints replicate separately, allowing for partial sync scenarios where checkpoints can sync without their parent event (though queries would need to handle this)

6. **Cascading Deletes** (optional): When deleting an event, you may want to soft-delete all associated checkpoints:
   ```typescript
   const event = await db.events.findOne(eventId).exec();
   const checkpoints = await event.getCheckpoints();
   
   // Soft delete all checkpoints
   await Promise.all(
     checkpoints.map(cp => cp.update({ $set: { deleted: true } }))
   );
   
   // Then soft delete the event
   await event.update({ $set: { deleted: true } });
   ```

This approach maintains flexibility while providing clear data relationships that can be efficiently queried.

**Backend implementation requirements:**
- Add `deleted` boolean column to all tables (events, checkpoints, users, virtualchallenges)
- Add `_modified` timestamp column (updated on every change via triggers or ORM hooks)
- Implement pull queries that return documents modified after checkpoint
- Implement push mutations that handle upsert operations
- Handle conflict resolution (last-write-wins or custom strategy)

**Database migration example for SQLite3** (located in `apps/api/migrations/`):

```sql
-- SQLite3 Migration: Add RxDB replication fields
ALTER TABLE events ADD COLUMN deleted INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE events ADD COLUMN _modified INTEGER DEFAULT 0 NOT NULL;

-- SQLite3 uses triggers slightly differently
CREATE TRIGGER events_modified_trigger
AFTER INSERT ON events
BEGIN
  UPDATE events 
  SET _modified = (strftime('%s', 'now') * 1000)
  WHERE id = NEW.id;
END;

CREATE TRIGGER events_modified_update_trigger
AFTER UPDATE ON events
BEGIN
  UPDATE events 
  SET _modified = (strftime('%s', 'now') * 1000)
  WHERE id = NEW.id;
END;

-- Create indexes for replication queries
CREATE INDEX idx_events_modified ON events(_modified);
CREATE INDEX idx_events_deleted ON events(deleted);

-- Repeat for checkpoints, users, virtualchallenges tables
```

**Key SQLite3 considerations:**
- Use `INTEGER` for boolean fields (0 = false, 1 = true)
- Use `INTEGER` for timestamp fields to store milliseconds
- SQLite requires separate INSERT and UPDATE triggers
- Use `strftime('%s', 'now') * 1000` for millisecond timestamps
- Logic goes directly in triggers (no stored procedures/functions)

**Alternative approach for SQLite3** (if you're using Knex.js migrations):
```javascript
// In your Knex migration file
exports.up = async function(knex) {
  await knex.schema.alterTable('events', (table) => {
    table.integer('deleted').defaultTo(0).notNullable();
    table.bigInteger('_modified').defaultTo(0).notNullable();
  });
  
  await knex.raw(`
    CREATE TRIGGER events_modified_trigger
    AFTER INSERT ON events
    BEGIN
      UPDATE events 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);
  
  await knex.raw(`
    CREATE TRIGGER events_modified_update_trigger
    AFTER UPDATE ON events
    BEGIN
      UPDATE events 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);
  
  await knex.raw('CREATE INDEX idx_events_modified ON events(_modified)');
  await knex.raw('CREATE INDEX idx_events_deleted ON events(deleted)');
};
```

### Phase 3: React Integration (Week 2)

#### Step 3.1: Create RxDB Provider

Create `src/database/RxDBProvider.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const dbRef = useRef<RxDatabase | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const database = await createDatabase();
        
        // Add collections
        await database.addCollections(collections);
        
        // Setup replication
        setupReplication(database);
        
        dbRef.current = database;
        setDb(database);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize RxDB:', error);
        setLoading(false);
      }
    }

    init();

    return () => {
      // Cleanup: destroy the database instance when component unmounts
      if (dbRef.current) {
        dbRef.current.destroy();
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
  }, [db]); // queryConstructor should be memoized by the caller

  return { data, loading, error };
}
```

**Important**: Callers should memoize the `queryConstructor` function using `useCallback` or `useMemo` to prevent unnecessary re-subscriptions:

```typescript
// In your component:
const query = useCallback(
  (db) => db.events.find({
    selector: { deleted: false },
    sort: [{ created_at: 'desc' }]
  }),
  [] // Add dependencies if query parameters change
);

const { data, loading, error } = useRxQuery(query);
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
// Uses timestamp + random component + persistent client ID to avoid collisions across clients
const generateTempId = () => {
  // Option 1: Timestamp-based with randomness and persistent client-specific prefix
  // Use negative numbers to differentiate from server IDs
  
  // Use persistent client ID from localStorage to reduce collision risk
  let clientId = localStorage.getItem('client-id');
  if (!clientId) {
    // Use crypto.getRandomValues for secure random client ID generation
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    clientId = String(randomBytes[0] % 1000000);
    localStorage.setItem('client-id', clientId);
  }
  
  // Use crypto.getRandomValues for better randomness than Math.random()
  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);
  
  // Combine timestamp, persistent clientId, and crypto random for collision resistance
  // Use smaller multipliers to stay within JavaScript's safe integer range (2^53 - 1)
  // Date.now() returns ~1.7e12, so we use 1000 multiplier (1.7e15) which is well within safe range
  // With timestamp (ms precision), persistent clientId (1M range), and 10-bit random,
  // collision risk is extremely low even across multiple clients
  return -(Date.now() * 1000 + parseInt(clientId) + (randomBytes[0] % 1024));
};

// Option 2: Use crypto.randomUUID() for guaranteed uniqueness (requires backend support for string IDs)
// const generateTempId = () => `temp-${crypto.randomUUID()}`;

// Option 3: Use a dedicated ID generation library
// import { nanoid } from 'nanoid';
// const generateTempId = () => `temp-${nanoid()}`;

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

**Note**: The backend push resolver must handle ID mapping - when a document with a temporary (negative) ID is pushed, the server should:
1. Generate a real positive ID
2. Store the document with the real ID
3. Return the document with the real ID
4. RxDB will automatically update the local document with the new ID

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

**Important: Avoid Conditional Hook Calls**

React hooks cannot be called conditionally. Instead, use a wrapper component or adapter pattern:

**Option 1: Wrapper Component Pattern**
```typescript
// Create separate components for each implementation
// EventListRxDB.tsx
import { useRxQuery } from '../../database/hooks/useRxQuery';

export function EventListRxDB() {
  const { data, loading, error } = useRxQuery(
    (db) => db.events.find({
      selector: { deleted: false },
      sort: [{ created_at: 'desc' }]
    })
  );
  
  return <EventListView data={data} loading={loading} error={error} />;
}

// EventListApollo.tsx
import { useQuery } from '@apollo/client';
import { GetEventsDocument } from '../../queries/getEvents';

export function EventListApollo() {
  const { data, loading, error } = useQuery(GetEventsDocument);
  
  return <EventListView data={data?.events} loading={loading} error={error} />;
}

// EventList.tsx - Router decides which to use
const USE_RXDB = import.meta.env.VITE_USE_RXDB === 'true';

export default function EventList() {
  return USE_RXDB ? <EventListRxDB /> : <EventListApollo />;
}
```

**Option 2: Data Adapter Pattern**
```typescript
// hooks/useEvents.ts
import { useQuery } from '@apollo/client';
import { useRxQuery } from '../../database/hooks/useRxQuery';
import { GetEventsDocument } from '../../queries/getEvents';
import { useCallback } from 'react';

const USE_RXDB = import.meta.env.VITE_USE_RXDB === 'true';

export function useEvents() {
  // Call both hooks unconditionally
  const apolloResult = useQuery(GetEventsDocument, {
    skip: USE_RXDB // Skip query if using RxDB
  });
  
  // Memoize the query constructor to prevent unnecessary re-subscriptions
  const rxdbQuery = useCallback(
    (db) => {
      if (!db) return null;
      return db.events.find({
        selector: { deleted: false },
        sort: [{ created_at: 'desc' }]
      });
    },
    []
  );
  
  const rxdbResult = useRxQuery(rxdbQuery);
  
  // Return the active implementation's result
  if (USE_RXDB) {
    return {
      data: rxdbResult.data,
      loading: rxdbResult.loading,
      error: rxdbResult.error
    };
  }
  
  return {
    data: apolloResult.data?.events,
    loading: apolloResult.loading,
    error: apolloResult.error
  };
}

// Then in your component:
const { data, loading, error } = useEvents();
```

**Note**: The `useRxQuery` hook should handle null queries gracefully by returning empty data. If your hook implementation doesn't support this, use Option 1 (wrapper components) instead, which is the cleanest approach for migration.

**Option 3: Separate Providers (Recommended)**
```typescript
// AppShell.tsx
const USE_RXDB = import.meta.env.VITE_USE_RXDB === 'true';

function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PwaUpdateNotification />
      {USE_RXDB ? (
        <RxDBProvider>
          {children}
        </RxDBProvider>
      ) : (
        <ApolloProvider client={apolloClient}>
          {children}
        </ApolloProvider>
      )}
    </>
  );
}
```

The wrapper component pattern (Option 1) is cleanest for migration as it maintains clear separation and doesn't require modifying hooks to handle both implementations.

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

### Phase 7: Future Optimizations (Post-Migration)

This phase captures optimization opportunities identified during the migration that should be considered after the initial RxDB adoption is complete and stable.

#### Optimization 7.1: Consolidate Timestamp Fields

**Current State:**
- Both `updated_at` (string, ISO format) and `_modified` (numeric, milliseconds) fields exist
- `updated_at` is manually maintained by application code
- `_modified` is automatically maintained by database triggers for replication

**Proposed Optimization:**
1. Remove the `updated_at` column from all database tables
2. Use `_modified` as the single source of truth for modification timestamps
3. Add computed fields in GraphQL resolvers to convert `_modified` → ISO string format when needed
4. Update all application code that currently sets `updated_at` manually (~15+ locations)
5. Ensure triggers maintain `_modified` on any update operation

**Benefits:**
- Reduces storage overhead (eliminates redundant timestamp field)
- Eliminates risk of timestamp inconsistency between fields
- Simplifies code maintenance (one less field to manage)
- Leverages automatic trigger maintenance for accuracy

**Considerations:**
- Requires changes across multiple layers (database, GraphQL, application)
- Need to verify performance impact of converting numeric timestamps to ISO strings
- Should be done after RxDB migration is stable and verified

#### Optimization 7.2: Generate CollectionName Type from collections.ts

**Current State:**
- The `CollectionName` type in `useRxDocument.ts` is manually defined as a union type: `'events' | 'checkpoints' | 'users' | 'virtualchallenges'`
- This type must be manually updated whenever collections are added or removed
- Risk of type/runtime mismatch if collections change but the type isn't updated

**Proposed Optimization:**
1. Create a type utility that extracts collection names from the `collections` object in `collections.ts`
2. Export this type from `collections.ts` for use in hooks
3. Update `useRxDocument.ts` to import and use the generated type instead of the hardcoded union

**Example Implementation:**
```typescript
// In collections.ts
export type CollectionName = keyof typeof collections;

// In useRxDocument.ts
import type { CollectionName } from '../collections';
```

**Benefits:**
- Eliminates manual type maintenance
- Ensures type safety matches runtime collections exactly
- Reduces risk of bugs when adding/removing collections
- Single source of truth for collection names

**Considerations:**
- Simple change with minimal impact
- Can be done anytime after Phase 3 is complete
- Should be documented for future developers

#### Optimization 7.3: Additional Performance Improvements

**Ideas to Explore:**
- Implement lazy loading for collection schemas
- Add compound indexes for frequently-used query combinations
- Optimize replication batch sizes based on network conditions
- Implement data pruning strategies for old/deleted documents
- Consider compression for large document fields

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
// Custom conflict handler with enhanced conflict resolution
const conflictHandler = (
  realMasterState: any,
  newDocumentState: any
) => {
  // Last-write-wins based on _modified timestamp
  if (newDocumentState._modified > realMasterState._modified) {
    // Log conflict for monitoring/debugging
    console.warn('Conflict resolved: new document is newer', {
      masterId: realMasterState.id,
      masterModified: realMasterState._modified,
      newModified: newDocumentState._modified
    });
    return newDocumentState;
  }
  
  // Log when keeping master state
  console.warn('Conflict resolved: master is newer', {
    masterId: realMasterState.id,
    masterModified: realMasterState._modified,
    newModified: newDocumentState._modified
  });
  
  return realMasterState;
};
```

**Note on Conflict Resolution:**

For most applications, RxDB's GraphQL replication plugin handles conflicts automatically using last-write-wins based on the `_modified` timestamp. Custom conflict handlers are typically only needed for:

1. **Field-level merging**: When you need to merge changes from both versions (e.g., combining arrays, merging non-overlapping field updates)
2. **Business logic**: When certain fields should always win regardless of timestamp (e.g., status changes)
3. **Conflict logging**: When you need to track conflicts for analysis or manual resolution

For critical applications where data loss is unacceptable, consider:
- Using operational transformation (OT) or CRDTs for automatic field-level merging
- Implementing a conflict queue for manual resolution by users
- Adding conflict metadata to documents for audit trails

Example of field-level merging:
```typescript
const conflictHandlerWithMerging = (
  realMasterState: any,
  newDocumentState: any
) => {
  // Start with the newer document's base
  const newerDoc = newDocumentState._modified > realMasterState._modified 
    ? newDocumentState 
    : realMasterState;
  const olderDoc = newDocumentState._modified > realMasterState._modified 
    ? realMasterState 
    : newDocumentState;
  
  // Merge specific fields (example: combine tags from both versions)
  if (newerDoc.tags && olderDoc.tags) {
    newerDoc.tags = [...new Set([...newerDoc.tags, ...olderDoc.tags])];
  }
  
  return newerDoc;
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
| Phase 7: Future Optimizations | Post-Migration | Identified optimization opportunities to pursue after migration is stable |

**Total Estimated Time: 4 weeks (Phases 1-6)**

**Phase 7** is a living document of optimization ideas to be pursued incrementally after the core migration is complete and stable.

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
- [RxDB with React](https://rxdb.info/articles/react-database.html)

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
