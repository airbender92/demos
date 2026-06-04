// src/store/modules/menu.ts

import { defineStore } from 'pinia'
import { getUserMenus } from '@/api/modules/auth'

interface MenuState {
  menus: MenuItem[]
  permissions: string[]
  activeMenu: string
}

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    menus: [],
    permissions: [],
    activeMenu: '',
  }),

  getters: {
    // 获取可见菜单
    visibleMenus: (state) => state.menus.filter((menu) => !menu.hidden),
  },

  actions: {
    /** 获取菜单 */
    async fetchMenus(): Promise<void> {
      const { data } = await getUserMenus()
      this.menus = data
    },

    /** 设置权限 */
    setPermissions(permissions: string[]): void {
      this.permissions = permissions
    },

    /** 设置激活菜单 */
    setActiveMenu(path: string): void {
      this.activeMenu = path
    },

    /** 检查是否有权限 */
    hasPermission(permission: string): boolean {
      if (this.permissions.includes('*')) return true
      return this.permissions.includes(permission)
    },

    /** 重置菜单状态 */
    resetMenuState(): void {
      this.menus = []
      this.permissions = []
      this.activeMenu = ''
    },
  },
})
