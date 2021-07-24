import gql from 'graphql-tag';

export const CREATE_VIRTUAL_CHALLENGE = gql`
  mutation CreateVirtualChallenge(
    $input: CreateVirtualChallengeInput!
  ) {
    createVirtualChallenge(
      input: $input
    ) {
      success
      virtualChallenge {
        id
        name
        checkpoints {
          points {
            lat
            lng
          }
          totalCount
        }
      }
    }
  }
`;
