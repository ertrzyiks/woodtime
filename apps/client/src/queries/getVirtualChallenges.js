import gql from 'graphql-tag';

export const GET_VIRTUAL_CHALLENGES = gql`
  query getVirtualChallenges {
    virtualChallenges {
      nodes {
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
  }
`;
