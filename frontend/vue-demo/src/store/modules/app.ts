// src/store/modules/app.ts

import { defineStore } from 'pinia'

interface AppState {
  sidebarCollapsed: boolean
  loading: boolean
  locale: string
  theme: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    loading: false,
    locale: localStorage.getItem('vue_demo_locale') || 'zh',
    theme: localStorage.getItem('vue_demo_theme') || 'default',
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

    /** 设置主题 */
    setTheme(theme: string): void {
      this.theme = theme
      localStorage.setItem('vue_demo_theme', theme)
      this.applyTheme(theme)
    },

    /** 应用主题 */
    applyTheme(theme: string): void {
      if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme')
      } else {
        document.documentElement.setAttribute('data-theme', theme)
      }
    },

    /** 初始化主题 */
    initTheme(): void {
      this.applyTheme(this.theme)
    },
  },
})
