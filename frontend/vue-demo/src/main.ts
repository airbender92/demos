import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import pinia from './store'
import i18n, { elementLocales } from './i18n'
import { setupGuards } from './router/guards'
import { permission } from './directives/permission'

import './styles/global.scss'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册自定义指令
app.directive('permission', permission)

// 使用插件
app.use(pinia)
app.use(i18n)
app.use(router)
app.use(ElementPlus, {
  locale: elementLocales[i18n.global.locale.value],
})

// 设置路由守卫
setupGuards(router)

app.mount('#app')

export { i18n }
