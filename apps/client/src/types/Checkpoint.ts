export interface Checkpoint {
  id: number;
  skipped: boolean;
  skip_reason?: string;
  cp_id: number;
  cp_code?: string;
}
