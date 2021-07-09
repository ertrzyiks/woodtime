import gql from 'graphql-tag';

export const CREATE_CHECKPOINT = gql`
  mutation CreateCheckpoint(
    $eventId: Int!
    $cpId: Int!
    $cpCode: String
    $skipped: Boolean
    $skipReason: String
  ) {
    createCheckpoint(
      event_id: $eventId
      cp_id: $cpId
      cp_code: $cpCode
      skipped: $skipped
      skip_reason: $skipReason
    ) {
      checkpoint {
        id
        event_id
        cp_id
        cp_code
        skipped
        skip_reason
        created_at
        updated_at
      }
    }
  }
`;
