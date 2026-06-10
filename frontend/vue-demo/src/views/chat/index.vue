<!-- src/views/chat/index.vue -->
<template>
  <div class="chat-container">
    <!-- 左侧对话列表 -->
    <div class="chat-sidebar">
      <div class="sidebar-header">
        <el-button
          type="primary"
          @click="handleNewChat"
          :disabled="chatStore.isStreaming"
          class="new-chat-btn"
        >
          <el-icon><Plus /></el-icon>
          {{ t('chat.newChat') }}
        </el-button>
      </div>

      <div class="session-list">
        <div
          v-for="session in chatStore.sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: session.id === chatStore.activeSessionId }"
          @click="handleSwitchSession(session.id)"
        >
          <div class="session-title">{{ session.title }}</div>
          <el-icon
            class="delete-icon"
            @click.stop="handleDeleteSession(session.id)"
          >
            <Delete />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 右侧对话区域 -->
    <div class="chat-main">
      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainerRef">
        <div v-if="chatStore.activeMessages.length === 0" class="empty-chat">
          <el-icon :size="64" color="#C0C4CC"><ChatDotRound /></el-icon>
          <p>{{ t('chat.emptyChat') }}</p>
        </div>

        <div
          v-for="msg in chatStore.activeMessages"
          :key="msg.id"
          class="message-item"
          :class="msg.role"
        >
          <div class="message-avatar">
            <el-avatar :size="32" :style="{ backgroundColor: msg.role === 'user' ? '#409EFF' : '#67C23A' }">
              {{ msg.role === 'user' ? 'U' : 'AI' }}
            </el-avatar>
          </div>
          <div class="message-content">
            <!-- 用户消息 -->
            <div v-if="msg.role === 'user'" class="user-message">{{ msg.content }}</div>

            <!-- AI 消息 -->
            <div v-else class="ai-message">
              <MarkdownRenderer :content="msg.content" />
              <div v-if="msg.status === 'error'" class="error-text">
                {{ t('chat.streamError') }}
              </div>
            </div>

            <!-- 消息操作按钮 -->
            <div class="message-actions">
              <el-button
                text
                size="small"
                @click="handleCopyMessage(msg.id)"
                v-if="msg.content"
              >
                <el-icon><CopyDocument /></el-icon>
                {{ t('chat.copy') }}
              </el-button>
              <el-button
                text
                size="small"
                @click="handleRegenerate"
                v-if="msg.role === 'assistant' && msg.status === 'done' && isLastMessage(msg.id)"
              >
                <el-icon><RefreshRight /></el-icon>
                {{ t('chat.regenerate') }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 打字指示器 -->
        <div v-if="chatStore.isStreaming" class="message-item assistant">
          <div class="message-avatar">
            <el-avatar :size="32" style="background-color: #67C23A">AI</el-avatar>
          </div>
          <div class="message-content">
            <div class="ai-message">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span class="loading-text">{{ t('chat.thinking') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <el-input
          v-model="inputText"
          type="textarea"
          :placeholder="t('chat.placeholder')"
          :autosize="{ minRows: 1, maxRows: 4 }"
          @keydown.enter.exact.prevent="handleSend"
          :disabled="chatStore.isStreaming"
          class="chat-input"
        />
        <div class="input-actions">
          <el-button
            v-if="!chatStore.isStreaming"
            type="primary"
            @click="handleSend"
            :disabled="!inputText.trim()"
            class="send-btn"
          >
            <el-icon><Promotion /></el-icon>
            {{ t('chat.send') }}
          </el-button>
          <el-button
            v-else
            type="danger"
            @click="handleStop"
            class="stop-btn"
          >
            <el-icon><VideoPause /></el-icon>
            {{ t('chat.stop') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/store/modules/chat'
import { mockSSEStream } from '@/utils/sse-client'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import {
  Plus,
  Delete,
  CopyDocument,
  RefreshRight,
  Loading,
  Promotion,
  VideoPause,
  ChatDotRound,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const { t } = useI18n()
const chatStore = useChatStore()

const inputText = ref('')
const messagesContainerRef = ref<HTMLElement>()
let abortController: AbortController | null = null

// 初始化时确保有活跃会话
onMounted(() => {
  if (!chatStore.activeSessionId) {
    chatStore.createSession()
  }
})

/** 滚动到底部 */
async function scrollToBottom() {
  await nextTick()
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
  }
}

/** 新建对话 */
function handleNewChat() {
  chatStore.createSession()
  inputText.value = ''
}

/** 切换对话 */
function handleSwitchSession(sessionId: string) {
  chatStore.switchSession(sessionId)
}

/** 删除对话 */
async function handleDeleteSession(sessionId: string) {
  try {
    await ElMessageBox.confirm(t('chat.confirmDelete'), t('chat.deleteTitle'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    })
    chatStore.deleteSession(sessionId)
    ElMessage.success(t('chat.deleteSuccess'))
  } catch {
    // 取消删除
  }
}

/** 发送消息 */
async function handleSend() {
  const text = inputText.value.trim()
  if (!text || chatStore.isStreaming) return

  inputText.value = ''

  // 添加用户消息
  chatStore.addUserMessage(text)
  await scrollToBottom()

  // 创建 AI 消息
  chatStore.createAssistantMessage()

  // 发起流式请求
  abortController = mockSSEStream(text, {
    onMessage: (chunk) => {
      chatStore.updateStreamingMessage(chunk)
      scrollToBottom()
    },
    onDone: () => {
      chatStore.finishStreamingMessage()
      abortController = null
    },
    onError: (error) => {
      if (error.message !== '请求已中断') {
        chatStore.setMessageError()
      }
      abortController = null
    },
  })
}

/** 停止生成 */
function handleStop() {
  if (abortController) {
    abortController.abort()
    ElMessage.info(t('chat.stopped'))
  }
}

/** 复制消息 */
async function handleCopyMessage(messageId: string) {
  const success = await chatStore.copyMessage(messageId)
  if (success) {
    ElMessage.success(t('chat.copySuccess'))
  } else {
    ElMessage.error(t('chat.copyFailed'))
  }
}

/** 重新生成 */
async function handleRegenerate() {
  const content = chatStore.regenerateLast()
  if (!content) return

  chatStore.createAssistantMessage()
  await scrollToBottom()

  abortController = mockSSEStream(content, {
    onMessage: (chunk) => {
      chatStore.updateStreamingMessage(chunk)
      scrollToBottom()
    },
    onDone: () => {
      chatStore.finishStreamingMessage()
      abortController = null
    },
    onError: (error) => {
      if (error.message !== '请求已中断') {
        chatStore.setMessageError()
      }
      abortController = null
    },
  })
}

/** 判断是否是最后一条消息 */
function isLastMessage(messageId: string): boolean {
  const messages = chatStore.activeMessages
  return messages.length > 0 && messages[messages.length - 1].id === messageId
}
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  height: 100%;
  background-color: var(--bg-color, #F5F7FA);
}

.chat-sidebar {
  width: 260px;
  background-color: var(--bg-card, #FFFFFF);
  border-right: 1px solid var(--border-color-light, #E4E7ED);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid var(--border-color-light, #E4E7ED);

    .new-chat-btn {
      width: 100%;
    }
  }

  .session-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;

    .session-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--bg-color, #F5F7FA);

        .delete-icon {
          opacity: 1;
        }
      }

      &.active {
        background-color: var(--theme-primary, #409EFF);
        color: #fff;

        .delete-icon {
          color: rgba(255, 255, 255, 0.8);
        }
      }

      .session-title {
        flex: 1;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .delete-icon {
        opacity: 0;
        transition: opacity 0.2s;
        cursor: pointer;
        color: #909399;
        font-size: 16px;

        &:hover {
          color: #F56C6C;
        }
      }
    }
  }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  .empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;

    p {
      margin-top: 16px;
      font-size: 16px;
    }
  }

  .message-item {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;

    &.user {
      flex-direction: row-reverse;

      .message-content {
        align-items: flex-end;
      }

      .user-message {
        background-color: var(--theme-primary, #409EFF);
        color: #fff;
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 70%;
        word-wrap: break-word;
        line-height: 1.5;
      }
    }

    &.assistant {
      .message-content {
        align-items: flex-start;
      }
    }

    .message-content {
      display: flex;
      flex-direction: column;
      max-width: 75%;
      min-width: 0;

      .ai-message {
        background-color: var(--bg-card, #FFFFFF);
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        .loading-icon {
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        .loading-text {
          color: #909399;
        }

        .error-text {
          color: #F56C6C;
          margin-top: 8px;
          font-size: 12px;
        }
      }

      .message-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;
        opacity: 0;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }
    }
  }
}

.input-area {
  padding: 16px 20px;
  background-color: var(--bg-card, #FFFFFF);
  border-top: 1px solid var(--border-color-light, #E4E7ED);

  .chat-input {
    :deep(.el-textarea__inner) {
      border: 1px solid var(--border-color, #DCDFE6);
      border-radius: 8px;
      padding: 12px;
      resize: none;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  .input-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;

    .send-btn,
    .stop-btn {
      min-width: 100px;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
