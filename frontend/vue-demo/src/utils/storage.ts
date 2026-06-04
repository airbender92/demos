// src/utils/storage.ts

/** 本地存储封装 */

const STORAGE_PREFIX = 'vue_demo_'

export function setItem(key: string, value: unknown): void {
  const data = JSON.stringify(value)
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, data)
}

export function getItem<T = unknown>(key: string): T | null {
  const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
  if (!data) return null
  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
}

export function clearStorage(): void {
  localStorage.clear()
}
