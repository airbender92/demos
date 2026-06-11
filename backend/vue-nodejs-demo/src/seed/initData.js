import db from '../config/database.js';
import bcrypt from 'bcrypt';
import { initializeDatabase } from '../models/init.sqlite.js';

const SALT_ROUNDS = 10;

async function seedDatabase() {
  console.log('Starting database seed...');

  // Ensure tables exist
  initializeDatabase();

  // Clear existing data
  db.exec('DELETE FROM chat_messages');
  db.exec('DELETE FROM chat_sessions');
  db.exec('DELETE FROM user_context_config');
  db.exec('DELETE FROM menus');
  db.exec('DELETE FROM users');

  // Reset autoincrement
  db.exec("DELETE FROM sqlite_sequence WHERE name='users'");

  // Seed users
  console.log('Seeding users...');
  const hashedPassword = await bcrypt.hash('123456', SALT_ROUNDS);

  const users = [
    { username: 'admin', password: hashedPassword, nickname: '管理员', role: 'admin', email: 'admin@example.com', phone: '13800138000' },
    { username: 'user1', password: hashedPassword, nickname: '测试用户1', role: 'user', email: 'user1@example.com', phone: '13800138001' },
    { username: 'user2', password: hashedPassword, nickname: '测试用户2', role: 'user', email: 'user2@example.com', phone: '13800138002' },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (username, password, nickname, email, phone, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertUserTx = db.transaction((users) => {
    for (const user of users) {
      insertUser.run(user.username, user.password, user.nickname, user.email, user.phone, user.role);
    }
  });

  insertUserTx(users);
  console.log(`  Created ${users.length} users`);

  // Seed menus
  console.log('Seeding menus...');
  const menus = [
    { id: '1', name: 'Dashboard', title: '首页', icon: 'Odometer', path: '/dashboard', parent_id: null, sort: 1 },
    { id: '2', name: 'Chat', title: 'AI 对话', icon: 'ChatDotRound', path: '/chat', parent_id: null, sort: 2 },
    { id: '3', name: 'System', title: '系统设置', icon: 'Setting', path: '/system', parent_id: null, sort: 3 },
    { id: '3-1', name: 'UserCenter', title: '个人中心', icon: 'User', path: '/profile', parent_id: '3', sort: 1 },
    { id: '3-2', name: 'UserManagement', title: '用户管理', icon: 'UserFilled', path: '/system/user-management', parent_id: '3', sort: 2 },
  ];

  const insertMenu = db.prepare(`
    INSERT INTO menus (id, name, title, icon, path, parent_id, sort)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMenuTx = db.transaction((menus) => {
    for (const menu of menus) {
      insertMenu.run(menu.id, menu.name, menu.title, menu.icon, menu.path, menu.parent_id, menu.sort);
    }
  });

  insertMenuTx(menus);
  console.log(`  Created ${menus.length} menus`);

  // Seed default context configs for users
  console.log('Seeding context configs...');
  const insertConfig = db.prepare(`
    INSERT INTO user_context_config (user_id, config)
    VALUES (?, ?)
  `);

  for (let i = 1; i <= 3; i++) {
    insertConfig.run(i, JSON.stringify({
      maxTokens: 4096,
      maxMessages: 10,
      strategy: 'sliding',
    }));
  }
  console.log('  Created context configs for 3 users');

  console.log('Database seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('  admin / 123456 (admin role)');
  console.log('  user1 / 123456 (user role)');
  console.log('  user2 / 123456 (user role)');
}

seedDatabase().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
