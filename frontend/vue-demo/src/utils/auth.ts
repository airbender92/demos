// src/utils/auth.ts

import { getItem, setItem, removeItem } from './storage'

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_INFO_KEY = 'userInfo'

/** 获取 token */
export function getToken(): string | null {
  return getItem<string>(TOKEN_KEY)
}

/** 设置 token */
export function setToken(token: string): void {
  setItem(TOKEN_KEY, token)
}

/** 移除 token */
export function removeToken(): void {
  removeItem(TOKEN_KEY)
  removeItem(REFRESH_TOKEN_KEY)
  removeItem(USER_INFO_KEY)
}

/** 获取用户信息 */
export function getUserInfo(): UserInfo | null {
  return getItem<UserInfo>(USER_INFO_KEY)
}

/** 设置用户信息 */
export function setUserInfo(userInfo: UserInfo): void {
  setItem(USER_INFO_KEY, userInfo)
}
