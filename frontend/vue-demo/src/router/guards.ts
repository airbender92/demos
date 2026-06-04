// src/router/guards.ts

import type { Router } from 'vue-router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'

const whiteList = ['/login']

export function setupGuards(router: Router): void {
  router.beforeEach(async (to, from, next) => {
    const token = getToken()
    const userStore = useUserStore()
    const menuStore = useMenuStore()

    if (token) {
      // 已登录，访问登录页时重定向到首页
      if (to.path === '/login') {
        next({ path: '/' })
        return
      }

      // 初始化用户信息
      if (!userStore.userInfo) {
        try {
          userStore.initUserInfo()
          if (!userStore.userInfo) {
            await userStore.fetchUserInfo()
          }
          // 获取菜单并同步权限
          await menuStore.fetchMenus()
          // 从用户信息中同步权限
          if (userStore.userInfo?.permissions) {
            menuStore.setPermissions(userStore.userInfo.permissions)
          }
          next({ ...to, replace: true })
        } catch {
          userStore.resetState()
          menuStore.resetMenuState()
          next(`/login?redirect=${to.path}`)
        }
      } else {
        next()
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
      }
    }
  })
}
