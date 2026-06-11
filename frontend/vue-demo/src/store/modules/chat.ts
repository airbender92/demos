// src/store/modules/chat.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { saveSessions, loadSessions } from '@/utils/indexedDB'

export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageStatus = 'sending' | 'streaming' | 'done' | 'error'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  status: MessageStatus
  timestamp: number
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface ContextConfig {
  maxTokens: number
  maxMessages: number
  strategy: 'sliding' | 'truncate'
}

let messageIdCounter = 0

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++messageIdCounter}`
}

/** 估算文本 token 数（简单估算：中文 1 token ≈ 1.5 字符，英文 1 token ≈ 4 字符） */
function estimateTokens(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars / 1.5 + otherChars / 4)
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string>('')
  const isStreaming = ref(false)
  const contextConfig = ref<ContextConfig>({
    maxTokens: 4096,
    maxMessages: 20,
    strategy: 'sliding',
  })

  const activeSession = computed(() =>
    sessions.value.find((s) => s.id === activeSessionId.value)
  )

  const activeMessages = computed(() => activeSession.value?.messages || [])

  /** 获取上下文消息列表（用于发送给 AI） */
  const contextMessages = computed(() => {
    if (!activeSession.value) return []

    const messages = activeSession.value.messages
      .filter((m) => m.status === 'done' && m.content.trim())

    // 从后往前取，最多 maxMessages 条
    const selected = messages.slice(-contextConfig.value.maxMessages)

    // 滑动窗口：如果 token 数超限，从最前面截断
    let totalTokens = selected.reduce((sum, m) => sum + estimateTokens(m.content), 0)

    let result = selected
    while (totalTokens > contextConfig.value.maxTokens && result.length > 1) {
      result = result.slice(1)
      totalTokens = selected.slice(0, result.length + 1).reduce(
        (sum, m) => sum + estimateTokens(m.content), 0
      )
    }

    return result
  })

  /** 当前上下文 token 数 */
  const currentContextTokens = computed(() => {
    return contextMessages.value.reduce(
      (sum, m) => sum + estimateTokens(m.content), 0
    )
  })

  /** 自动持久化 */
  async function persistToDB() {
    try {
      await saveSessions({
        sessions: sessions.value,
        activeSessionId: activeSessionId.value,
      })
    } catch {
      // ignore
    }
  }

  /** 从 IndexedDB 加载历史 */
  async function loadFromDB(): Promise<boolean> {
    const data = await loadSessions()
    if (data && data.sessions.length > 0) {
      sessions.value = data.sessions
      activeSessionId.value = data.activeSessionId || data.sessions[0].id
      return true
    }
    return false
  }

  /** 新建对话 */
  async function createSession(): Promise<string> {
    const newSession: ChatSession = {
      id: generateId('session'),
      title: `新对话 ${sessions.value.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    sessions.value.unshift(newSession)
    activeSessionId.value = newSession.id
    await persistToDB()
    return newSession.id
  }

  /** 切换对话 */
  function switchSession(sessionId: string) {
    if (isStreaming.value) return
    activeSessionId.value = sessionId
  }

  /** 删除对话 */
  async function deleteSession(sessionId: string) {
    const index = sessions.value.findIndex((s) => s.id === sessionId)
    if (index === -1) return

    sessions.value.splice(index, 1)

    if (activeSessionId.value === sessionId) {
      activeSessionId.value = sessions.value.length > 0 ? sessions.value[0].id : ''
    }
    await persistToDB()
  }

  /** 添加用户消息 */
  async function addUserMessage(content: string): Promise<ChatMessage | null> {
    if (!activeSessionId.value) {
      await createSession()
    }
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return null

    const message: ChatMessage = {
      id: generateId('msg'),
      role: 'user',
      content,
      status: 'done',
      timestamp: Date.now(),
    }
    session.messages.push(message)
    session.updatedAt = Date.now()

    if (session.messages.length === 1) {
      session.title = content.slice(0, 20) + (content.length > 20 ? '...' : '')
    }

    await persistToDB()
    return message
  }

  /** 创建 AI 消息（流式开始） */
  async function createAssistantMessage(): Promise<ChatMessage | null> {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return null

    const message: ChatMessage = {
      id: generateId('msg'),
      role: 'assistant',
      content: '',
      status: 'streaming',
      timestamp: Date.now(),
    }
    session.messages.push(message)
    isStreaming.value = true
    return message
  }

  /** 更新流式消息内容 */
  async function updateStreamingMessage(content: string) {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return

    const lastMessage = session.messages[session.messages.length - 1]
    if (lastMessage && lastMessage.status === 'streaming') {
      lastMessage.content += content
      session.updatedAt = Date.now()
    }
  }

  /** 完成流式消息 */
  async function finishStreamingMessage() {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return

    const lastMessage = session.messages[session.messages.length - 1]
    if (lastMessage && lastMessage.status === 'streaming') {
      lastMessage.status = 'done'
      session.updatedAt = Date.now()
    }
    isStreaming.value = false
    await persistToDB()
  }

  /** 设置消息错误 */
  async function setMessageError() {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return

    const lastMessage = session.messages[session.messages.length - 1]
    if (lastMessage && lastMessage.status === 'streaming') {
      lastMessage.status = 'error'
      session.updatedAt = Date.now()
    }
    isStreaming.value = false
    await persistToDB()
  }

  /** 复制消息 */
  async function copyMessage(messageId: string) {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return false

    const message = session.messages.find((m) => m.id === messageId)
    if (!message) return false

    try {
      await navigator.clipboard.writeText(message.content)
      return true
    } catch {
      return false
    }
  }

  /** 删除单条消息 */
  async function deleteMessage(messageId: string): Promise<boolean> {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return false

    const index = session.messages.findIndex((m) => m.id === messageId)
    if (index === -1) return false

    session.messages.splice(index, 1)
    session.updatedAt = Date.now()
    await persistToDB()
    return true
  }

  /** 重新生成最后一条 AI 回复 */
  async function regenerateLast(): Promise<string | null> {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return null

    const lastUserMessage = [...session.messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMessage) return null

    const lastMsgIndex = session.messages.length - 1
    const lastMsg = session.messages[lastMsgIndex]
    if (lastMsg?.role === 'assistant') {
      session.messages.splice(lastMsgIndex, 1)
    }

    await persistToDB()
    return lastUserMessage.content
  }

  /** 更新上下文配置 */
  async function updateContextConfig(config: Partial<ContextConfig>) {
    contextConfig.value = { ...contextConfig.value, ...config }
    await persistToDB()
  }

  /** 初始化时加载历史 */
  async function init() {
    const loaded = await loadFromDB()
    if (!loaded && sessions.value.length === 0) {
      await createSession()
    }
  }

  return {
    sessions,
    activeSessionId,
    activeSession,
    activeMessages,
    isStreaming,
    contextConfig,
    contextMessages,
    currentContextTokens,
    init,
    createSession,
    switchSession,
    deleteSession,
    addUserMessage,
    createAssistantMessage,
    updateStreamingMessage,
    finishStreamingMessage,
    setMessageError,
    copyMessage,
    deleteMessage,
    regenerateLast,
    updateContextConfig,
  }
})
