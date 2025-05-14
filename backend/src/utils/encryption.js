const crypto = require('crypto');

// Validate encryption key
const ENCRYPTION_KEY = process.env.SALARY_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  console.error('SALARY_ENCRYPTION_KEY environment variable is not set!');
  process.exit(1);
}

if (ENCRYPTION_KEY.length !== 32) {
  console.error('SALARY_ENCRYPTION_KEY must be 32 characters long for AES-256!');
  process.exit(1);
}

const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Encrypts a string using AES-256-CBC
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text in format: iv:encryptedText
 * @throws {Error} If encryption fails
 */
function encrypt(text) {
  try {
    if (!text) return null;
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a string that was encrypted using AES-256-CBC
 * @param {string} text - The encrypted text in format: iv:encryptedText
 * @returns {string} - The decrypted text
 * @throws {Error} If decryption fails
 */
function decrypt(text) {
  try {
    if (!text) return null;
    
    const textParts = text.split(':');
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

module.exports = { encrypt, decrypt };