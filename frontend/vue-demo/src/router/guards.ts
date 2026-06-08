// src/router/guards.ts

import type { Router } from 'vue-router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'

const whiteList = ['/login']

export function setupGuards(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
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
        } catch {
          userStore.resetState()
          menuStore.resetMenuState()
          next(`/login?redirect=${to.path}`)
          return
        }
      }

      // 确保菜单已加载
      if (menuStore.menus.length === 0) {
        try {
          await menuStore.fetchMenus()
          // 从用户信息中同步权限
          const info = userStore.userInfo as UserInfo | null
          if (info?.permissions) {
            menuStore.setPermissions(info.permissions)
          }
          next({ ...to, replace: true })
          return
        } catch {
          userStore.resetState()
          menuStore.resetMenuState()
          next(`/login?redirect=${to.path}`)
          return
        }
      }

      next()
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
