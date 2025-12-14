export interface Checkpoint {
  id: number;
  skipped: boolean;
  skip_reason: string | null;
  cp_id: number;
  cp_code: string | null;
  pending?: boolean;
  error?: Error;
}
