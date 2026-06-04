// src/types/menu.d.ts

/** 菜单项 */
interface MenuItem {
  id: string
  title: string
  icon?: string
  path: string
  name: string
  redirect?: string
  children?: MenuItem[]
  permission?: string
  hidden?: boolean
  alwaysShow?: boolean
}

/** 路由元信息 */
interface RouteMeta {
  title?: string
  icon?: string
  hidden?: boolean
  keepAlive?: boolean
  permissions?: string[]
  requiresAuth?: boolean
}
