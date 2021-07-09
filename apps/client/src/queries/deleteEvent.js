import gql from 'graphql-tag';

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: Int!) {
    deleteEvent(id: $id) {
      id
    }
  }
`;
