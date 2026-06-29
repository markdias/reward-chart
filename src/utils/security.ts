/**
 * Computes a salted SHA-256 hash of a password using the email address as a salt.
 * This is used for storing and verifying local offline credentials securely.
 * 
 * @param password The plaintext password to hash.
 * @param email The parent email to use as the salt.
 * @returns A promise resolving to the hex-encoded SHA-256 hash.
 */
export async function hashPassword(password: string, email: string): Promise<string> {
  const salt = email.trim().toLowerCase();
  const input = `${salt}:${password}`;
  const msgBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
