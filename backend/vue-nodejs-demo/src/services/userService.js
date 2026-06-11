import db from '../config/database.js';
import bcrypt from 'bcrypt';
import { findUserById, sanitizeUser, comparePassword, hashPassword } from './authService.js';
import { cacheSet, cacheDel } from '../config/redis.js';

const SALT_ROUNDS = 10;

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId) {
  // Check cache first
  const cached = await require('../config/redis.js').cacheGet(`user:profile:${userId}`);
  if (cached) {
    return cached;
  }

  const user = findUserById(userId);
  if (!user) {
    return null;
  }

  // Cache for 1 hour
  await cacheSet(`user:profile:${userId}`, user, 3600);

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updates) {
  const allowedFields = ['nickname', 'email', 'phone'];
  const validUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      validUpdates[field] = updates[field];
    }
  }

  if (Object.keys(validUpdates).length === 0) {
    throw new Error('没有可更新的字段');
  }

  // Build update query
  const setClauses = Object.keys(validUpdates).map((field) => `${field} = ?`);
  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  const values = [...Object.values(validUpdates), userId];

  const stmt = db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);

  if (result.changes === 0) {
    throw new Error('用户不存在');
  }

  // Clear cache
  await cacheDel(`user:profile:${userId}`);

  return getUserProfile(userId);
}

/**
 * Change user password
 */
export async function changePassword(userId, oldPassword, newPassword) {
  const user = findUserById(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  // Verify old password - need to get full user with password hash
  const fullUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const validPassword = await comparePassword(oldPassword, fullUser.password);
  if (!validPassword) {
    throw new Error('旧密码不正确');
  }

  // Hash and update new password
  const hashedPassword = await hashPassword(newPassword);
  const stmt = db.prepare(`
    UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  const result = stmt.run(hashedPassword, userId);

  if (result.changes === 0) {
    throw new Error('密码更新失败');
  }

  // Clear all caches
  await cacheDel(`user:profile:${userId}`);
  await cacheDel(`token:${userId}`);
}

/**
 * Update user avatar
 */
export async function updateAvatar(userId, avatarPath) {
  const stmt = db.prepare(`
    UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  const result = stmt.run(avatarPath, userId);

  if (result.changes === 0) {
    throw new Error('用户不存在');
  }

  await cacheDel(`user:profile:${userId}`);

  return { avatar: avatarPath };
}
