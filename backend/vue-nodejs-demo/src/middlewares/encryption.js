import { decrypt } from '../utils/crypto.js';

/**
 * Middleware to decrypt encrypted request body fields
 * Only processes if X-Encrypted header is set to true
 */
export function decryptRequestBody(req, res, next) {
  const isEncrypted = req.headers['x-encrypted'] === 'true';

  if (!isEncrypted || !req.body) {
    return next();
  }

  try {
    const decryptedBody = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string' && (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret'))) {
        decryptedBody[key] = decrypt(value);
      } else {
        decryptedBody[key] = value;
      }
    }
    req.body = decryptedBody;
    next();
  } catch (err) {
    return res.status(400).json({
      code: 400,
      message: '解密失败，请检查加密数据',
    });
  }
}
