// API Key encryption service using AES-256-GCM
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { env } from '../env.js';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex'); // 32 bytes

export interface EncryptedData {
  encrypted: Buffer;
  nonce: Buffer;
  authTag: Buffer;
}

/**
 * Encrypt data using AES-256-GCM
 */
export function encrypt(data: string): EncryptedData {
  const nonce = randomBytes(12); // 96 bits for GCM
  const cipher = createCipheriv(ALGORITHM, KEY, nonce);

  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return { encrypted, nonce, authTag };
}

/**
 * Decrypt data using AES-256-GCM
 */
export function decrypt(encrypted: Buffer, nonce: Buffer, authTag: Buffer): string {
  const decipher = createDecipheriv(ALGORITHM, KEY, nonce);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Encrypt API keys object
 */
export function encryptApiKeys(apiKeys: Record<string, string>): {
  encrypted: Buffer;
  nonce: Buffer;
} {
  const data = JSON.stringify(apiKeys);
  const { encrypted, nonce, authTag } = encrypt(data);

  // Combine encrypted data with auth tag for storage
  const combined = Buffer.concat([authTag, encrypted]);

  return { encrypted: combined, nonce };
}

/**
 * Decrypt API keys object
 */
export function decryptApiKeys(combined: Buffer, nonce: Buffer): Record<string, string> {
  // Extract auth tag (first 16 bytes) and encrypted data
  const authTag = combined.subarray(0, 16);
  const encrypted = combined.subarray(16);

  const decrypted = decrypt(encrypted, nonce, authTag);
  return JSON.parse(decrypted);
}
