// src/hooks/usePermission.ts

import { useMenuStore } from '@/store/modules/menu'

/**
 * 权限相关 hook
 */
export function usePermission() {
  const menuStore = useMenuStore()

  const hasPermission = (permission: string | string[]): boolean => {
    return menuStore.hasPermission(typeof permission === 'string' ? permission : permission[0])
  }

  return {
    hasPermission,
  }
}
