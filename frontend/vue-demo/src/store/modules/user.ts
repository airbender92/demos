// src/store/modules/user.ts

import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo as getUserInfoApi, logout as logoutApi, ssoVerify as ssoVerifyApi } from '@/api/modules/auth'
import { setToken, removeToken, setUserInfo, getUserInfo } from '@/utils/auth'
import router from '@/router'

interface UserState {
  token: string | null
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: null,
    userInfo: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.nickname || state.userInfo?.username || '',
    roles: (state) => state.userInfo?.roles || [],
    permissions: (state) => state.userInfo?.permissions || [],
  },

  actions: {
    /** 初始化用户信息 */
    initUserInfo(): void {
      const userInfo = getUserInfo()
      if (userInfo) {
        this.userInfo = userInfo
      }
    },

    /** 登录 */
    async login(credentials: Credentials): Promise<void> {
      const { data } = await loginApi(credentials)
      this.token = data.token
      setToken(data.token)
      await this.fetchUserInfo()
    },

    /** SSO 登录 */
    async ssoLogin(ssoToken: string): Promise<void> {
      const { data } = await ssoVerifyApi(ssoToken)
      this.token = data.token
      setToken(data.token)
      await this.fetchUserInfo()
    },

    /** 获取用户信息 */
    async fetchUserInfo(): Promise<void> {
      const { data } = await getUserInfoApi()
      this.userInfo = data
      setUserInfo(data)
    },

    /** 退出登录 */
    async logout(): Promise<void> {
      try {
        await logoutApi()
      } catch {
        // 忽略接口错误
      } finally {
        this.resetState()
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
        }
      }
    },

    /** 重置状态 */
    resetState(): void {
      this.token = null
      this.userInfo = null
      removeToken()
    },
  },
})
