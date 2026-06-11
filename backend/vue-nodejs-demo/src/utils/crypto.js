import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  'hex'
);
const ENCRYPTION_IV = Buffer.from(
  process.env.ENCRYPTION_IV || 'abcdef0123456789abcdef0123456789',
  'hex'
);

/**
 * Encrypt data using AES-256-CBC
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Hex encoded encrypted string
 */
export function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, ENCRYPTION_IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypt data using AES-256-CBC
 * @param {string} encryptedText - Hex encoded encrypted string
 * @returns {string} - Decrypted plain text
 */
export function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, ENCRYPTION_IV);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
