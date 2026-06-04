// src/api/modules/auth.ts

import {
  mockLogin,
  mockGetUserInfo,
  mockGetUserMenus,
  mockLogout,
} from '@/mock'

/** 用户登录 */
export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const res = await mockLogin(data.username, data.password)
  return { code: 200, message: 'success', data: res }
}

/** 获取用户信息 */
export async function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  const res = await mockGetUserInfo()
  return { code: 200, message: 'success', data: res }
}

/** 获取用户菜单 */
export async function getUserMenus(): Promise<ApiResponse<MenuItem[]>> {
  const res = await mockGetUserMenus()
  return { code: 200, message: 'success', data: res }
}

/** 退出登录 */
export async function logout(): Promise<ApiResponse<void>> {
  await mockLogout()
  return { code: 200, message: 'success', data: undefined }
}
