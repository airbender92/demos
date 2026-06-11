import { extractTokenFromHeader, verifyToken } from '../utils/token.js';

/**
 * JWT authentication middleware
 * Validates the Bearer token and attaches user info to req.user
 */
export function authenticate(req, res, next) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌',
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      code: 401,
      message: '无效的或已过期的认证令牌',
    });
  }

  // Attach user info to request
  req.user = {
    id: decoded.id,
    username: decoded.username,
    role: decoded.role,
  };

  next();
}

/**
 * Optional authentication - passes through even if no token
 * but attaches user if token is valid
 */
export function optionalAuth(req, res, next) {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };
    }
  }

  next();
}

/**
 * Admin role check middleware
 * Must be used after authenticate middleware
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      message: '需要管理员权限',
    });
  }

  next();
}
