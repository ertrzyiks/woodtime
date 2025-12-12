import { replicateGraphQL } from 'rxdb/plugins/replication-graphql';
import type { RxDatabase, RxError } from 'rxdb';

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://localhost:8080/woodtime';

// Type definitions for replication
interface ReplicationCheckpoint {
  lastModified: number;
}

// Pull query for events
const pullEventsQueryBuilder = (
  checkpoint: ReplicationCheckpoint | null | undefined,
  limit: number,
) => {
  if (!checkpoint) {
    // First pull - get all events
    return {
      operationName: 'PullEvents',
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
    operationName: 'PullEvents',
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
    operationName: 'PushEvents',
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
        }
      }
    `,
    variables: {
      events: docs.map(({ newDocumentState }) => ({
        id: newDocumentState.id,
        name: newDocumentState.name,
        type: newDocumentState.type,
        checkpoint_count: newDocumentState.checkpoint_count,
        created_at: newDocumentState.created_at,
        updated_at: newDocumentState.updated_at,
        deleted: newDocumentState.deleted,
      })),
    },
  };
};

// Pull query for checkpoints
const pullCheckpointsQueryBuilder = (
  checkpoint: ReplicationCheckpoint | null | undefined,
  limit: number,
) => {
  if (!checkpoint) {
    return {
      operationName: 'PullCheckpoints',
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
    operationName: 'PullCheckpoints',
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
    operationName: 'PushCheckpoints',
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
        }
      }
    `,
    variables: {
      checkpoints: docs.map(({ newDocumentState }) => ({
        id: newDocumentState.id,
        event_id: newDocumentState.event_id,
        cp_id: newDocumentState.cp_id,
        cp_code: newDocumentState.cp_code,
        skipped: newDocumentState.skipped,
        skip_reason: newDocumentState.skip_reason,
        created_at: newDocumentState.created_at,
        updated_at: newDocumentState.updated_at,
        deleted: newDocumentState.deleted,
      })),
    },
  };
};

// Pull query for virtual challenges
const pullVirtualChallengesQueryBuilder = (
  checkpoint: ReplicationCheckpoint | null | undefined,
  limit: number,
) => {
  if (!checkpoint) {
    return {
      operationName: 'PullVirtualChallenges',
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
    operationName: 'PullVirtualChallenges',
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
  docs: Array<Record<string, any>>,
) => {
  return {
    operationName: 'PushVirtualChallenges',
    query: `
      mutation PushVirtualChallenges($challenges: [VirtualChallengeInput!]!) {
        pushVirtualChallenges(challenges: $challenges) {
          id
          name
          checkpoints
          created_at
          updated_at
          deleted

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
      })),
    },
  };
};

function handleUnauthenticated(err: RxError) {
  const { parameters } = err;

  if (!parameters || !parameters.errors) {
    return;
  }

  if (window.location.pathname.startsWith('/sign-in')) {
    return;
  }

  if (
    parameters.errors.find((e: any) => e.extensions?.code === 'UNAUTHENTICATED')
  ) {
    window.location.href =
      '/sign-in?redirect_url=' + encodeURIComponent(window.location.href);
  }
}

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
      batchSize: 20,
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
    handleUnauthenticated(err);
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
      batchSize: 20,
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
    handleUnauthenticated(err);
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
      batchSize: 20,
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
    handleUnauthenticated(err);
  });

  return {
    events: eventsReplication,
    checkpoints: checkpointsReplication,
    virtualchallenges: virtualChallengesReplication,
  };
}
