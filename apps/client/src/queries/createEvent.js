import gql from 'graphql-tag';

export const CREATE_EVENT = gql`
  mutation CreateEvent($name: String!, $checkpointCount: Int!, $type: Int!) {
    createEvent(name: $name, checkpointCount: $checkpointCount, type: $type) {
      event {
        id
        name
        type
        checkpoint_count
        created_at
        updated_at
      }
    }
  }
`;
