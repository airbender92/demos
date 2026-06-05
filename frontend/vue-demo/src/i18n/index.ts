import { createI18n } from 'vue-i18n'
import zhCn from './locales/zh'
import en from './locales/en'
import zhCnElement from 'element-plus/es/locale/lang/zh-cn'
import enElement from 'element-plus/es/locale/lang/en'

const messages = {
  zh: zhCn,
  en,
}

/** Element Plus locale 映射 */
export const elementLocales: Record<string, unknown> = {
  zh: zhCnElement,
  en: enElement,
}

/** 从本地存储读取语言设置 */
function getLocale(): string {
  return localStorage.getItem('vue_demo_locale') || 'zh'
}

export const i18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'zh',
  messages,
})

export default i18n
