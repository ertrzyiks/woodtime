import gql from 'graphql-tag';

export const GET_EVENT = gql`
  query getEvent($id: Int!) {
    event(id: $id) {
      id
      name
      checkpoint_count
      checkpoints {
        cp_id
        cp_code
        event_id
        skipped
        skip_reason
      }
    }
  }
`;
