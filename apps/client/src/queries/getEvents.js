import gql from 'graphql-tag';

export const GET_EVENTS = gql`
  query getEvents {
    events {
      id
      name
      checkpoint_count
      created_at
    }
  }
`;
