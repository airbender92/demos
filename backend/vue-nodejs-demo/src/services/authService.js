import db from '../config/database.js';
import bcrypt from 'bcrypt';
import { generateToken, generateRefreshToken } from '../utils/token.js';
import { cacheSet, cacheDel } from '../config/redis.js';

const SALT_ROUNDS = 10;

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Find user by username
 */
export function findUserByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

/**
 * Find user by ID
 */
export function findUserById(id) {
  const stmt = db.prepare('SELECT id, username, nickname, avatar, email, phone, role, created_at, updated_at FROM users WHERE id = ?');
  return stmt.get(id);
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(username, password) {
  const user = findUserByUsername(username);
  if (!user) {
    return null;
  }

  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) {
    return null;
  }

  return user;
}

/**
 * Login user and return tokens
 */
export async function loginUser(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const token = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Cache token in Redis/memory cache (7 days)
  await cacheSet(`token:${user.id}`, token, 7 * 24 * 3600);

  // Clear user profile cache
  await cacheDel(`user:profile:${user.id}`);

  return {
    token,
    refreshToken,
    user: sanitizeUser(user),
  };
}

/**
 * Mock SSO login
 */
export async function ssoLogin(ssoToken) {
  // In development, mock SSO verification
  // In production, this would call the real SSO service
  console.log('[SSO] Mock SSO verification for token:', ssoToken.slice(0, 10) + '...');

  // Find or create user based on SSO token
  // For demo purposes, default to admin user
  const user = findUserByUsername('admin');
  if (!user) {
    throw new Error('SSO用户不存在');
  }

  return loginUser(user);
}

/**
 * Logout user (invalidate token)
 */
export async function logoutUser(userId) {
  await cacheDel(`token:${userId}`);
  await cacheDel(`user:profile:${userId}`);
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const newToken = generateToken(payload);
  await cacheSet(`token:${user.id}`, newToken, 7 * 24 * 3600);

  return { token: newToken };
}

/**
 * Remove sensitive fields from user object
 */
export function sanitizeUser(user) {
  const { password, ...sanitized } = user;
  return sanitized;
}
