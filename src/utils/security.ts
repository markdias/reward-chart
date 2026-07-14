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

export interface PasswordPolicy {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePassword(password: string): { policy: PasswordPolicy; strength: number; isValid: boolean } {
  const policy = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
  
  let strength = 0;
  if (policy.minLength) strength++;
  if (policy.hasUpper) strength++;
  if (policy.hasLower) strength++;
  if (policy.hasNumber) strength++;
  if (policy.hasSpecial) strength++;
  
  return {
    policy,
    strength,
    isValid: strength === 5
  };
}

/**
 * Generates a random 6-character alphanumeric code for sharing profiles.
 * It uses uppercase letters and numbers, avoiding ambiguous characters like 0, O, I, 1.
 */
export function generateShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
