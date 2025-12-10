import { replicateGraphQL } from 'rxdb/plugins/replication-graphql';
import type { RxDatabase } from 'rxdb';

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  'https://localhost:8080/woodtime';

// Type definitions for replication
interface ReplicationCheckpoint {
  lastModified: number;
}

// Pull query for events
const pullEventsQueryBuilder = (
  checkpoint: ReplicationCheckpoint | null | undefined,
  limit: number
) => {
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
        minUpdatedAt: new Date(0).toISOString(),
      },
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
      minUpdatedAt: new Date(checkpoint.lastModified).toISOString(),
    },
  };
};

// Push query for creating/updating events
const pushEventsQueryBuilder = (docs: Array<Record<string, any>>) => {
  return {
    query: `
      mutation PushEvents($events: [EventInput!]!) {
        pushEvents(events: $events) {
          id
          name
          type
          checkpoint_count
          created_at
          updated_at
          deleted
          _modified
        }
      }
    `,
    variables: {
      events: docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        checkpoint_count: doc.checkpoint_count,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        deleted: doc.deleted,
        _modified: doc._modified,
      })),
    },
  };
};

// Pull query for checkpoints
const pullCheckpointsQueryBuilder = (
  checkpoint: ReplicationCheckpoint | null | undefined,
  limit: number
) => {
  if (!checkpoint) {
    return {
      query: `
        query PullCheckpoints($limit: Int!, $minUpdatedAt: DateTime!) {
          pullCheckpoints(limit: $limit, minUpdatedAt: $minUpdatedAt) {
            documents {
              id
              event_id
              cp_id
              cp_code
              skipped
              skip_reason
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
        minUpdatedAt: new Date(0).toISOString(),
      },
    };
  }

  return {
    query: `
      query PullCheckpoints($limit: Int!, $minUpdatedAt: DateTime!) {
        pullCheckpoints(limit: $limit, minUpdatedAt: $minUpdatedAt) {
          documents {
            id
            event_id
            cp_id
            cp_code
            skipped
            skip_reason
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
      minUpdatedAt: new Date(checkpoint.lastModified).toISOString(),
    },
  };
};

// Push query for checkpoints
const pushCheckpointsQueryBuilder = (docs: Array<Record<string, any>>) => {
  return {
    query: `
      mutation PushCheckpoints($checkpoints: [CheckpointInput!]!) {
        pushCheckpoints(checkpoints: $checkpoints) {
          id
          event_id
          cp_id
          cp_code
          skipped
          skip_reason
          created_at
          updated_at
          deleted
          _modified
        }
      }
    `,
    variables: {
      checkpoints: docs.map((doc) => ({
        id: doc.id,
        event_id: doc.event_id,
        cp_id: doc.cp_id,
        cp_code: doc.cp_code,
        skipped: doc.skipped,
        skip_reason: doc.skip_reason,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        deleted: doc.deleted,
        _modified: doc._modified,
      })),
    },
  };
};

// Pull query for virtual challenges
const pullVirtualChallengesQueryBuilder = (
  checkpoint: ReplicationCheckpoint | null | undefined,
  limit: number
) => {
  if (!checkpoint) {
    return {
      query: `
        query PullVirtualChallenges($limit: Int!, $minUpdatedAt: DateTime!) {
          pullVirtualChallenges(limit: $limit, minUpdatedAt: $minUpdatedAt) {
            documents {
              id
              name
              checkpoints
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
        minUpdatedAt: new Date(0).toISOString(),
      },
    };
  }

  return {
    query: `
      query PullVirtualChallenges($limit: Int!, $minUpdatedAt: DateTime!) {
        pullVirtualChallenges(limit: $limit, minUpdatedAt: $minUpdatedAt) {
          documents {
            id
            name
            checkpoints
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
      minUpdatedAt: new Date(checkpoint.lastModified).toISOString(),
    },
  };
};

// Push query for virtual challenges
const pushVirtualChallengesQueryBuilder = (
  docs: Array<Record<string, any>>
) => {
  return {
    query: `
      mutation PushVirtualChallenges($challenges: [VirtualChallengeInput!]!) {
        pushVirtualChallenges(challenges: $challenges) {
          id
          name
          checkpoints
          created_at
          updated_at
          deleted
          _modified
        }
      }
    `,
    variables: {
      challenges: docs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        checkpoints: doc.checkpoints,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        deleted: doc.deleted,
        _modified: doc._modified,
      })),
    },
  };
};

export function setupReplication(db: RxDatabase) {
  // Replicate events collection
  const eventsReplication = replicateGraphQL({
    replicationIdentifier: 'events-replication',
    collection: db.events,
    url: {
      http: GRAPHQL_ENDPOINT,
    },
    pull: {
      queryBuilder: pullEventsQueryBuilder,
    },
    push: {
      queryBuilder: pushEventsQueryBuilder,
    },
    deletedField: 'deleted',
    live: true, // Enable continuous replication
    retryTime: 5000, // Retry failed requests after 5s
    autoStart: true,
    fetch: (url, options) => {
      // Add authentication
      return fetch(url, {
        ...options,
        credentials: 'include',
      });
    },
  });

  // Handle replication errors
  eventsReplication.error$.subscribe((err) => {
    console.error('Events replication error:', err);
  });

  // Replicate checkpoints collection
  const checkpointsReplication = replicateGraphQL({
    replicationIdentifier: 'checkpoints-replication',
    collection: db.checkpoints,
    url: {
      http: GRAPHQL_ENDPOINT,
    },
    pull: {
      queryBuilder: pullCheckpointsQueryBuilder,
    },
    push: {
      queryBuilder: pushCheckpointsQueryBuilder,
    },
    deletedField: 'deleted',
    live: true,
    retryTime: 5000,
    autoStart: true,
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        credentials: 'include',
      });
    },
  });

  checkpointsReplication.error$.subscribe((err) => {
    console.error('Checkpoints replication error:', err);
  });

  // Replicate virtual challenges collection
  const virtualChallengesReplication = replicateGraphQL({
    replicationIdentifier: 'virtualchallenges-replication',
    collection: db.virtualchallenges,
    url: {
      http: GRAPHQL_ENDPOINT,
    },
    pull: {
      queryBuilder: pullVirtualChallengesQueryBuilder,
    },
    push: {
      queryBuilder: pushVirtualChallengesQueryBuilder,
    },
    deletedField: 'deleted',
    live: true,
    retryTime: 5000,
    autoStart: true,
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        credentials: 'include',
      });
    },
  });

  virtualChallengesReplication.error$.subscribe((err) => {
    console.error('Virtual challenges replication error:', err);
  });

  return {
    events: eventsReplication,
    checkpoints: checkpointsReplication,
    virtualchallenges: virtualChallengesReplication,
  };
}
