// src/store/modules/app.ts

import { defineStore } from 'pinia'

interface AppState {
  sidebarCollapsed: boolean
  loading: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    loading: false,
  }),

  actions: {
    /** 切换侧边栏 */
    toggleSidebar(): void {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    /** 设置侧边栏状态 */
    setSidebarCollapsed(collapsed: boolean): void {
      this.sidebarCollapsed = collapsed
    },

    /** 设置全局加载状态 */
    setLoading(loading: boolean): void {
      this.loading = loading
    },
  },
})
