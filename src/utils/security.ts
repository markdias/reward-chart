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

/**
 * Sanitizes generic user text input by:
 * 1. Stripping HTML tags (<script>, <iframe>, <b>, etc.)
 * 2. Stripping control characters and script/javascript: protocols
 * 3. Trimming leading and trailing whitespace
 * 4. Enforcing an optional maximum length limit
 */
export function sanitizeText(input: string | null | undefined, maxLength: number = 255): string {
  if (!input || typeof input !== 'string') return '';
  
  let cleaned = input
    // Strip HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Strip control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    // Strip dangerous inline protocols
    .replace(/(javascript|vbscript|data):/gi, '')
    .trim();

  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim();
  }

  return cleaned;
}

/**
 * Sanitizes an email address string.
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '';
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w.@+-]/g, '')
    .replace(/\s+/g, '');
}

/**
 * Sanitizes a 6-character short code / join code.
 */
export function sanitizeCode(code: string | null | undefined): string {
  if (!code || typeof code !== 'string') return '';
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);
}

/**
 * Validates and clamps numerical user input.
 */
export function sanitizeNumber(val: any, min: number = 0, max: number = 1000000, fallback: number = 0): number {
  const parsed = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(parsed) || !isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}
