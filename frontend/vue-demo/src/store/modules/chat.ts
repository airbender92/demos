// src/store/modules/chat.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

let messageIdCounter = 0

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++messageIdCounter}`
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string>('')
  const isStreaming = ref(false)

  const activeSession = computed(() =>
    sessions.value.find((s) => s.id === activeSessionId.value)
  )

  const activeMessages = computed(() => activeSession.value?.messages || [])

  /** 新建对话 */
  function createSession(): string {
    const newSession: ChatSession = {
      id: generateId('session'),
      title: `新对话 ${sessions.value.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    sessions.value.unshift(newSession)
    activeSessionId.value = newSession.id
    return newSession.id
  }

  /** 切换对话 */
  function switchSession(sessionId: string) {
    if (isStreaming.value) return
    activeSessionId.value = sessionId
  }

  /** 删除对话 */
  function deleteSession(sessionId: string) {
    const index = sessions.value.findIndex((s) => s.id === sessionId)
    if (index === -1) return

    sessions.value.splice(index, 1)

    if (activeSessionId.value === sessionId) {
      activeSessionId.value = sessions.value.length > 0 ? sessions.value[0].id : ''
    }
  }

  /** 添加用户消息 */
  function addUserMessage(content: string): ChatMessage | null {
    if (!activeSessionId.value) {
      createSession()
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

    // 如果是对话的第一条消息，自动更新标题
    if (session.messages.length === 1) {
      session.title = content.slice(0, 20) + (content.length > 20 ? '...' : '')
    }

    return message
  }

  /** 创建 AI 消息（流式开始） */
  function createAssistantMessage(): ChatMessage | null {
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
  function updateStreamingMessage(content: string) {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return

    const lastMessage = session.messages[session.messages.length - 1]
    if (lastMessage && lastMessage.status === 'streaming') {
      lastMessage.content += content
      session.updatedAt = Date.now()
    }
  }

  /** 完成流式消息 */
  function finishStreamingMessage() {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return

    const lastMessage = session.messages[session.messages.length - 1]
    if (lastMessage && lastMessage.status === 'streaming') {
      lastMessage.status = 'done'
      session.updatedAt = Date.now()
    }
    isStreaming.value = false
  }

  /** 设置消息错误 */
  function setMessageError() {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return

    const lastMessage = session.messages[session.messages.length - 1]
    if (lastMessage && lastMessage.status === 'streaming') {
      lastMessage.status = 'error'
      session.updatedAt = Date.now()
    }
    isStreaming.value = false
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
  function deleteMessage(messageId: string): boolean {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return false

    const index = session.messages.findIndex((m) => m.id === messageId)
    if (index === -1) return false

    session.messages.splice(index, 1)
    session.updatedAt = Date.now()
    return true
  }

  /** 重新生成最后一条 AI 回复 */
  function regenerateLast(): string | null {
    const session = sessions.value.find((s) => s.id === activeSessionId.value)
    if (!session) return null

    const lastUserMessage = [...session.messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMessage) return null

    // 删除最后一条 AI 消息
    const lastMsgIndex = session.messages.length - 1
    const lastMsg = session.messages[lastMsgIndex]
    if (lastMsg?.role === 'assistant') {
      session.messages.splice(lastMsgIndex, 1)
    }

    return lastUserMessage.content
  }

  // 初始化时创建一个默认会话
  if (sessions.value.length === 0) {
    createSession()
  }

  return {
    sessions,
    activeSessionId,
    activeSession,
    activeMessages,
    isStreaming,
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
  }
})
