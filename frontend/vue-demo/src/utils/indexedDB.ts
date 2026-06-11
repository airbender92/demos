// src/utils/indexedDB.ts
// IndexedDB 持久化工具

export interface ChatStoreData {
  sessions: any[]
  activeSessionId: string
}

const DB_NAME = 'vue-demo-chat'
const STORE_NAME = 'chat-sessions'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/** 保存会话数据 */
export async function saveSessions(data: ChatStoreData): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    await store.clear()

    await Promise.all(
      data.sessions.map((session) => store.put(session))
    )

    await store.put({ id: '__active__', sessionId: data.activeSessionId })
  } catch (error) {
    console.warn('IndexedDB save failed:', error)
  }
}

/** 加载会话数据 */
export async function loadSessions(): Promise<ChatStoreData | null> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)

    const sessions: any[] = []
    let activeSessionId = ''

    return new Promise((resolve, reject) => {
      const request = store.openCursor()

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          if (cursor.value.id === '__active__') {
            activeSessionId = cursor.value.sessionId
          } else {
            sessions.push(cursor.value)
          }
          cursor.continue()
        } else {
          sessions.sort((a, b) => b.updatedAt - a.updatedAt)
          resolve(sessions.length > 0 ? { sessions, activeSessionId } : null)
        }
      }

      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.warn('IndexedDB load failed:', error)
    return null
  }
}

/** 搜索会话 */
export async function searchSessions(keyword: string): Promise<any[]> {
  try {
    const data = await loadSessions()
    if (!data) return []

    const lowerKeyword = keyword.toLowerCase()
    return data.sessions.filter((session) => {
      const titleMatch = session.title.toLowerCase().includes(lowerKeyword)
      const contentMatch = session.messages.some((msg: any) =>
        msg.content.toLowerCase().includes(lowerKeyword)
      )
      return titleMatch || contentMatch
    })
  } catch {
    return []
  }
}

/** 清除所有会话数据 */
export async function clearSessions(): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    await store.clear()
  } catch (error) {
    console.warn('IndexedDB clear failed:', error)
  }
}
