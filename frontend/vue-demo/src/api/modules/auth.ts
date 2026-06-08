// src/api/modules/auth.ts

import {
  mockLogin,
  mockGetUserInfo,
  mockGetUserMenus,
  mockLogout,
  mockSSOVerify,
  mockUpdateUserProfile,
  mockChangePassword,
  mockUploadAvatar,
} from '@/mock'
import { encryptFields } from '@/utils/crypto'

/** 用户登录 - 自动 AES 加密参数 */
export async function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const encrypted = encryptFields(data as unknown as Record<string, unknown>, ['username', 'password'])
  const res = await mockLogin(encrypted.username as string, encrypted.password as string)
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

/** 更新用户资料 */
export async function updateUserProfile(data: {
  nickname: string
  email: string
  phone: string
}): Promise<ApiResponse<UserInfo>> {
  const res = await mockUpdateUserProfile(data)
  return { code: 200, message: 'success', data: res }
}

/** 修改密码 - 加密敏感字段 */
export async function changePassword(data: {
  oldPassword: string
  newPassword: string
}): Promise<ApiResponse<void>> {
  const encrypted = encryptFields(data as unknown as Record<string, unknown>, ['oldPassword', 'newPassword'])
  await mockChangePassword({
    oldPassword: encrypted.oldPassword as string,
    newPassword: encrypted.newPassword as string,
  })
  return { code: 200, message: 'success', data: undefined }
}

/** 上传头像 */
export async function uploadAvatar(file: File): Promise<ApiResponse<string>> {
  const res = await mockUploadAvatar(file)
  return { code: 200, message: 'success', data: res }
}
