// src/utils/sse-client.ts
// SSE 客户端封装（Mock 模式：模拟流式响应）

interface SSEClientOptions {
  onMessage?: (text: string) => void
  onDone?: () => void
  onError?: (error: Error) => void
}

/**
 * 模拟预置回答
 * 实际项目中替换为真实 SSE 请求
 */
const MOCK_RESPONSES: Record<string, string> = {
  '你好': `你好！我是你的 AI 助手，很高兴为你服务。

我可以帮助你：

- 📝 回答问题
- 💻 编写代码
- 🔍 分析数据
- 📊 生成报告

有什么我可以帮助你的吗？`,

  'hello': `Hello! I'm your AI assistant. How can I help you today?

I can help with:

- Answering questions
- Writing code
- Analyzing data
- Generating reports

Feel free to ask me anything!`,

  '代码': `以下是一个简单的 JavaScript 排序示例：

\`\`\`javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr
  
  const pivot = arr[Math.floor(arr.length / 2)]
  const left = arr.filter(x => x < pivot)
  const middle = arr.filter(x => x === pivot)
  const right = arr.filter(x => x > pivot)
  
  return [...quickSort(left), ...middle, ...quickSort(right)]
}

// 使用示例
console.log(quickSort([3, 6, 8, 10, 1, 2, 1]))
// 输出: [1, 1, 2, 3, 6, 8, 10]
\`\`\`

**时间复杂度**: O(n log n) 平均情况
**空间复杂度**: O(n)

你也可以使用内置方法：

\`\`\`javascript
const sorted = [3, 6, 8, 10, 1, 2, 1].sort((a, b) => a - b)
\`\`\``,

  'Vue': `Vue 3 是一个渐进式 JavaScript 框架，以下是核心特性：

## 核心特性

1. **Composition API** — 更灵活的逻辑复用
2. **响应式系统** — 基于 Proxy 的响应式
3. **Teleport** — 将组件渲染到 DOM 的其他位置
4. **Suspense** — 异步组件加载

## 示例代码

\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <button @click="increment">Count: {{ count }}</button>
</template>
\`\`\`

更多详情可访问 [Vue 官方文档](https://vuejs.org/)`,

  'default': `感谢你的提问！以下是我的回答：

## 分析

根据你的输入，我提供以下信息：

### 关键点

1. 这是模拟的 AI 响应
2. 支持 Markdown 渲染
3. 包含代码高亮

### 示例表格

| 特性 | 支持 |
|------|------|
| Markdown | ✅ |
| 代码高亮 | ✅ |
| 流式输出 | ✅ |
| 表格渲染 | ✅ |

### 代码示例

\`\`\`python
def fibonacci(n):
    """计算斐波那契数列第 n 项"""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print(fibonacci(10))  # 输出: 55
\`\`\`

\`\`\`sql
SELECT users.name, COUNT(orders.id) AS order_count
FROM users
LEFT JOIN orders ON users.id = orders.user_id
GROUP BY users.name
ORDER BY order_count DESC;
\`\`\`

希望这个回答对你有帮助！如果有更多问题，随时告诉我。`
}

/**
 * 获取匹配的预置回答
 */
function getMockResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const [key, value] of Object.entries(MOCK_RESPONSES)) {
    if (key !== 'default' && lower.includes(key)) {
      return value
    }
  }
  return MOCK_RESPONSES['default']
}

/**
 * 模拟 SSE 流式请求
 * 使用 AbortController 支持中断
 */
export function mockSSEStream(
  userMessage: string,
  options: SSEClientOptions = {}
): AbortController {
  const controller = new AbortController()
  const { onMessage, onDone, onError } = options

  const response = getMockResponse(userMessage)
  const chars = response.split('')
  let index = 0

  // 模拟网络延迟和抖动
  const baseDelay = 30
  const jitter = () => Math.random() * 20

  function sendNextChunk() {
    if (controller.signal.aborted) {
      onError?.(new Error('请求已中断'))
      return
    }

    if (index >= chars.length) {
      onDone?.()
      return
    }

    // 每次发送 1-3 个字符，模拟真实流式效果
    const chunkSize = Math.floor(Math.random() * 3) + 1
    const chunk = chars.slice(index, index + chunkSize).join('')
    index += chunkSize

    onMessage?.(chunk)

    // 随机延迟模拟打字机效果
    const delay = baseDelay + jitter()
    setTimeout(sendNextChunk, delay)
  }

  sendNextChunk()

  return controller
}
