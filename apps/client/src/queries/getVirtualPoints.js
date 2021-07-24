import gql from 'graphql-tag';

export const GET_VIRTUAL_POINTS = gql`
  query getVirtualPoints ($input: PointsNearbyInput!) {
    pointsNearby(input: $input) {
      points {
        lat
        lng
      }
    }
  }
`;
