// src/mock/index.ts
// Mock 数据模拟后台接口

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

/** Mock 菜单数据 */
const mockMenus: Record<string, MenuItem[]> = {
  admin: [
    {
      id: '1',
      title: '控制台',
      icon: 'HomeFilled',
      path: '/dashboard',
      name: 'Dashboard',
    },
    {
      id: '2',
      title: '用户管理',
      icon: 'User',
      path: '/user',
      name: 'User',
      permission: 'user:view',
    },
    {
      id: '3',
      title: '系统设置',
      icon: 'Setting',
      path: '/settings',
      name: 'Settings',
      permission: 'setting:view',
      children: [
        {
          id: '3-1',
          title: '基础设置',
          icon: 'Tools',
          path: '/settings/basic',
          name: 'SettingsBasic',
          permission: 'setting:basic',
        },
        {
          id: '3-2',
          title: '安全设置',
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
      title: '控制台',
      icon: 'HomeFilled',
      path: '/dashboard',
      name: 'Dashboard',
    },
    {
      id: '2',
      title: '个人中心',
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

/** Mock: 用户登录 */
export async function mockLogin(username: string, password: string): Promise<LoginResponse> {
  await delay()

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
