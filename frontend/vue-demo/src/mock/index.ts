// src/mock/index.ts
// Mock 数据模拟后台接口

import { decrypt } from '@/utils/crypto'

/** Mock 用户数据 */
const mockUsers: Record<string, { password: string; info: UserInfo; token: string }> = {
  admin: {
    password: '123456',
    info: {
      id: '1',
      username: 'admin',
      nickname: '管理员',
      avatar: '',
      roles: ['admin'],
      permissions: ['*'],
    },
    token: 'mock-token-admin',
  },
  user: {
    password: '123456',
    info: {
      id: '2',
      username: 'user',
      nickname: '普通用户',
      avatar: '',
      roles: ['user'],
      permissions: ['dashboard:view', 'user:view'],
    },
    token: 'mock-token-user',
  },
}

/** Mock SSO 令牌数据 */
const mockSSOTokens: Record<string, string> = {
  'sso-mock-token-admin': 'admin',
  'sso-mock-token-user': 'user',
}

/** Mock 菜单数据 - title 为 i18n key */
const mockMenus: Record<string, MenuItem[]> = {
  admin: [
    {
      id: '1',
      title: 'menu.dashboard',
      icon: 'HomeFilled',
      path: '/dashboard',
      name: 'Dashboard',
    },
    {
      id: '2',
      title: 'menu.userManage',
      icon: 'User',
      path: '/user',
      name: 'User',
      permission: 'user:view',
    },
    {
      id: '3',
      title: 'menu.settings',
      icon: 'Setting',
      path: '/settings',
      name: 'Settings',
      permission: 'setting:view',
      children: [
        {
          id: '3-1',
          title: 'menu.basicSettings',
          icon: 'Tools',
          path: '/settings/basic',
          name: 'SettingsBasic',
          permission: 'setting:basic',
        },
        {
          id: '3-2',
          title: 'menu.securitySettings',
          icon: 'Lock',
          path: '/settings/security',
          name: 'SettingsSecurity',
          permission: 'setting:security',
        },
      ],
    },
  ],
  user: [
    {
      id: '1',
      title: 'menu.dashboard',
      icon: 'HomeFilled',
      path: '/dashboard',
      name: 'Dashboard',
    },
    {
      id: '2',
      title: 'menu.profile',
      icon: 'User',
      path: '/profile',
      name: 'Profile',
    },
  ],
}

/** 延迟模拟 */
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Mock: 用户登录 - 支持 AES 加密参数 */
export async function mockLogin(encryptedUsername: string, encryptedPassword: string): Promise<LoginResponse> {
  await delay()

  // 解密参数
  let username: string, password: string
  try {
    username = decrypt(encryptedUsername)
    password = decrypt(encryptedPassword)
  } catch {
    // 如果解密失败，尝试使用原始值（兼容明文）
    username = encryptedUsername
    password = encryptedPassword
  }

  const user = mockUsers[username]
  if (!user || user.password !== password) {
    throw new Error('账号或密码错误')
  }

  return {
    token: user.token,
    refreshToken: `refresh-${user.token}`,
    expiresIn: 7200,
  }
}

/** Mock: SSO Token 验证 */
export async function mockSSOVerify(ssoToken: string): Promise<LoginResponse> {
  await delay()

  const username = mockSSOTokens[ssoToken]
  if (!username) {
    throw new Error('SSO Token 无效或已过期')
  }

  const user = mockUsers[username]
  if (!user) {
    throw new Error('用户不存在')
  }

  return {
    token: user.token,
    refreshToken: `refresh-${user.token}`,
    expiresIn: 7200,
  }
}

/** Mock: 获取用户信息 */
export async function mockGetUserInfo(): Promise<UserInfo> {
  await delay()
  return mockUsers.admin.info
}

/** Mock: 获取用户菜单 */
export async function mockGetUserMenus(): Promise<MenuItem[]> {
  await delay()
  return mockMenus.admin
}

/** Mock: 退出登录 */
export async function mockLogout(): Promise<void> {
  await delay()
}
