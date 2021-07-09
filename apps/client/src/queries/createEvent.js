import gql from 'graphql-tag';

export const CREATE_EVENT = gql`
  mutation CreateEvent($name: String!, $checkpointCount: Int!) {
    createEvent(name: $name, checkpointCount: $checkpointCount) {
      event {
        id
        name
        checkpoint_count
        created_at
        updated_at
      }
    }
  }
`;
