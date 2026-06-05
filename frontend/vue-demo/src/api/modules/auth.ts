// src/api/modules/auth.ts

import {
  mockLogin,
  mockGetUserInfo,
  mockGetUserMenus,
  mockLogout,
  mockSSOVerify,
} from '@/mock'
import { encryptFields } from '@/utils/crypto'

/** 用户登录 - 自动 AES 加密参数 */
export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const encrypted = encryptFields(data, ['username', 'password'])
  const res = await mockLogin(encrypted.username, encrypted.password)
  return { code: 200, message: 'success', data: res }
}

/** SSO 登录验证 */
export async function ssoVerify(token: string): Promise<ApiResponse<LoginResponse>> {
  const res = await mockSSOVerify(token)
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
