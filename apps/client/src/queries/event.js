import gql from 'graphql-tag';

export const GET_EVENT = gql`
  query getEvent($id: Int!) {
    event(id: $id) {
      id
      name
      type
      checkpoint_count
      virtual_challenge {
        id
      }
      checkpoints {
        id
        cp_id
        cp_code
        event_id
        skipped
        skip_reason
      }
    }
  }
`;
