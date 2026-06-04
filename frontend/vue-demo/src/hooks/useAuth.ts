// src/hooks/useAuth.ts

import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

/**
 * 认证相关 hook
 */
export function useAuth() {
  const userStore = useUserStore()

  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const roles = computed(() => userStore.roles)
  const permissions = computed(() => userStore.permissions)

  const hasRole = (role: string | string[]): boolean => {
    if (typeof role === 'string') {
      return roles.value.includes(role)
    }
    return role.some((r) => roles.value.includes(r))
  }

  const hasPermission = (permission: string | string[]): boolean => {
    if (permissions.value.includes('*')) return true
    if (typeof permission === 'string') {
      return permissions.value.includes(permission)
    }
    return permission.some((p) => permissions.value.includes(p))
  }

  return {
    isLoggedIn,
    roles,
    permissions,
    hasRole,
    hasPermission,
  }
}
