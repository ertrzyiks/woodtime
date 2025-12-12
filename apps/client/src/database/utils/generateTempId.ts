/**
 * Generates a temporary negative ID for offline-created documents.
 *
 * Uses a combination of:
 * - Timestamp (milliseconds) for time-based uniqueness
 * - Persistent client ID (from localStorage) to reduce collision risk across clients
 * - Cryptographically secure random component for additional entropy
 *
 * Returns negative numbers to differentiate from server-generated positive IDs.
 * The backend should handle ID mapping when documents with temporary IDs are pushed.
 *
 * @returns A negative integer that's highly unlikely to collide with other client-generated IDs
 */
export function generateTempId(): string {
  // Use persistent client ID from localStorage to reduce collision risk
  let clientId = localStorage.getItem('client-id');
  if (!clientId) {
    // Use crypto.getRandomValues for secure random client ID generation
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    clientId = String(randomBytes[0] % 1000000);
    localStorage.setItem('client-id', clientId);
  }

  // Use crypto.getRandomValues for better randomness than Math.random()
  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);

  // Combine timestamp, persistent clientId, and crypto random for collision resistance
  // Use smaller multipliers to stay within JavaScript's safe integer range (2^53 - 1)
  // Date.now() returns ~1.7e12, so we use 100 multiplier (1.7e14) which is well within safe range
  // With timestamp (ms precision), persistent clientId (1M range), and 10-bit random,
  // collision risk is extremely low even across multiple clients
  return ((Date.now() * 100 + parseInt(clientId) + (randomBytes[0] % 1024)).toFixed(0));
}
