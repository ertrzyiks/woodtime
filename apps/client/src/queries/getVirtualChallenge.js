import gql from 'graphql-tag';

export const GET_VIRTUAL_CHALLENGE = gql`
  query getVirtualChallenge($id: Int!) {
    virtualChallenge(id: $id) {
      id
      name
      createdAt: created_at
      checkpoints {
        totalCount
        points {
          lat
          lng
        }
      }
    }
  }
`;
