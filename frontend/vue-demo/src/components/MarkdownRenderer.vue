<!-- src/components/MarkdownRenderer.vue -->
<template>
  <div
    class="markdown-body"
    v-html="renderedHtml"
  />
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const props = defineProps<{
  content: string
}>()

const md = shallowRef<MarkdownIt>(null as unknown as MarkdownIt)

md.value = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`
      } catch (_error) {
        // ignore
      }
    }
    return `<pre class="hljs"><code>${md.value.utils.escapeHtml(str)}</code></pre>`
  },
})

const renderedHtml = computed(() => {
  // 流式渲染时处理不完整标签
  let text = props.content

  // 关闭未关闭的代码块
  const codeBlockCount = (text.match(/```/g) || []).length
  if (codeBlockCount % 2 !== 0) {
    text += '\n```'
  }

  // 关闭未关闭的粗体标记
  const boldCount = (text.match(/\*\*/g) || []).length
  if (boldCount % 2 !== 0) {
    text += '**'
  }

  // 关闭未关闭的斜体标记
  const italicCount = (text.match(/(?<!\*)\*(?!\*)/g) || []).length
  if (italicCount % 2 !== 0) {
    text += '*'
  }

  return md.value.render(text)
})
</script>

<style scoped>
.markdown-body {
  line-height: 1.6;
  word-wrap: break-word;
}

.markdown-body :deep(h1) {
  font-size: 1.5em;
  margin: 0.5em 0;
  border-bottom: 1px solid var(--border-color-light, #E4E7ED);
  padding-bottom: 0.3em;
}

.markdown-body :deep(h2) {
  font-size: 1.3em;
  margin: 0.5em 0;
  border-bottom: 1px solid var(--border-color-light, #E4E7ED);
  padding-bottom: 0.3em;
}

.markdown-body :deep(h3) {
  font-size: 1.1em;
  margin: 0.5em 0;
}

.markdown-body :deep(p) {
  margin: 0.5em 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-body :deep(li) {
  margin: 0.2em 0;
}

.markdown-body :deep(code) {
  background-color: var(--bg-card, #F5F5F5);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background-color: #282c34;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  color: #abb2bf;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
  overflow-x: auto;
  display: block;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--border-color, #DCDFE6);
  padding: 0.5em 1em;
  text-align: left;
}

.markdown-body :deep(th) {
  background-color: var(--bg-card, #F5F5F5);
  font-weight: 600;
}

.markdown-body :deep(tr:nth-child(even)) {
  background-color: var(--bg-card, #FAFAFA);
}

.markdown-body :deep(a) {
  color: var(--theme-primary, #409EFF);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--theme-primary, #409EFF);
  padding: 0.5em 1em;
  margin: 0.5em 0;
  color: var(--text-secondary, #909399);
  background-color: var(--bg-card, #F5F5F5);
}
</style>
