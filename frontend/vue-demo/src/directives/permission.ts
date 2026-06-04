// src/directives/permission.ts

import type { Directive } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * 权限指令
 * v-permission="'user:add'"
 * v-permission="['user:add', 'user:edit']"
 */
export const permission: Directive<HTMLElement, string | string[]> = {
  mounted(el: HTMLElement, binding) {
    const userStore = useUserStore()
    const value = binding.value

    if (!value) return

    const permissions = userStore.permissions
    if (permissions.includes('*')) return

    const hasPermission = typeof value === 'string'
      ? permissions.includes(value)
      : value.some((p) => permissions.includes(p))

    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  },
}
