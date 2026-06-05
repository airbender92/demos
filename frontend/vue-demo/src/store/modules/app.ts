// src/store/modules/app.ts

import { defineStore } from 'pinia'

interface AppState {
  sidebarCollapsed: boolean
  loading: boolean
  locale: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    loading: false,
    locale: localStorage.getItem('vue_demo_locale') || 'zh',
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

    /** 切换语言 */
    setLocale(locale: string): void {
      this.locale = locale
      localStorage.setItem('vue_demo_locale', locale)
    },
  },
})
