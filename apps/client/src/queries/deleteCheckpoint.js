import gql from 'graphql-tag';

export const DELETE_CHECKPOINT = gql`
  mutation DeleteCheckpoint($id: Int!) {
    deleteCheckpoint(id: $id) {
      id
    }
  }
`;
