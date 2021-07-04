import gql from 'graphql-tag';

export const GET_EVENT = gql`
  query ($id: Int!) {
    event(id: $id) {
      id
      name
      checkpoints {
        cp_id
        cp_code
        skipped
      }
    }
  }
`;
