import gql from 'graphql-tag';

export const ENROLL_VIRTUAL_CHALLENGE = gql`
  mutation EnrollVirtualChallenge($id: Int!) {
    enrollVirtualChallenge(id: $id) {
      success
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
