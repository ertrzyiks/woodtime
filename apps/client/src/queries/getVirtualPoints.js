import gql from 'graphql-tag';

export const GET_VIRTUAL_POINTS = gql`
  query getVirtualPoints ($input: VirtualCheckpontsInput!) {
    virtualCheckpoints(input: $input) {
      points {
        lat
        lng
      }
    }
  }
`;
