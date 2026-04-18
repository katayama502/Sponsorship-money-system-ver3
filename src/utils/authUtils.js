/**
 * Generates login credentials using cryptographically secure random values.
 * Excludes visually ambiguous characters (0/O, 1/I/l) for readability.
 */
export const generateCredentials = (_name = '') => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const gen = (len) => {
    const arr = new Uint8Array(len * 2); // extra bytes to ensure enough after modulo bias reduction
    crypto.getRandomValues(arr);
    let result = '';
    for (let i = 0; i < arr.length && result.length < len; i++) {
      const idx = arr[i] % chars.length;
      // Reject values that would create modulo bias (simple rejection sampling)
      if (arr[i] < Math.floor(256 / chars.length) * chars.length) {
        result += chars[idx];
      }
    }
    // Fallback: if rejection sampling didn't yield enough chars (extremely rare), pad simply
    while (result.length < len) {
      const b = new Uint8Array(1);
      crypto.getRandomValues(b);
      if (b[0] < Math.floor(256 / chars.length) * chars.length) {
        result += chars[b[0] % chars.length];
      }
    }
    return result;
  };
  return {
    student: { id: gen(6), pw: gen(8) },
    parent:  { id: gen(6), pw: gen(8) },
  };
};
