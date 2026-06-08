# vue-demo 项目版本迭代规划

## 项目简介
基于 Vue3 + TypeScript + Vite + Element Plus 的前端后台管理系统 Demo，逐步迭代实现完整的 AI 能力前端应用。

## 当前状态
- [x] V1.0 - 登录模块（SSO登录、国际化、请求加密）
- [x] V1.1 - 登录模块（与V1.0相同）

## 版本路线图

| 版本 | 主题 | 核心功能 | 状态 |
|------|------|----------|------|
| V1.0 | 登录与安全 | SSO登录、请求加密、国际化 | ✅ 已完成 |
| V1.1 | 登录与安全 | SSO登录、请求加密、国际化 | ✅ 已完成 |
| V1.2 | 权限与路由 | 动态路由、权限指令、角色菜单 | ⬜ 待开发 |
| V1.3 | 用户与个人中心 | 用户信息管理、密码修改、头像上传 | ⬜ 待开发 |
| V2.0 | AI 对话基础 | SSE流式输出、对话管理、Markdown渲染 | ⬜ 待开发 |
| V2.1 | AI 对话增强 | 流式中断控制、对话历史、上下文窗口管理 | ⬜ 待开发 |
| V2.2 | AI BFF 代理层 | Node.js中间层、API代理、LRU缓存、密钥管理 | ⬜ 待开发 |
| V3.0 | AI Agent 能力 | 工具调用、Agent循环、流式进度展示 | ⬜ 待开发 |
| V3.1 | AI 本地向量检索 | Transformers.js、IndexedDB、本地相似度匹配 | ⬜ 待开发 |
| V3.2 | AI 工程化 | 性能监控、错误上报、CI/CD流水线 | ⬜ 待开发 |

## 技术栈

### 已使用
- Vue 3 + Composition API
- TypeScript
- Vite
- Element Plus
- Vue Router
- Vuex / Pinia
- vue-i18n
- SCSS / Tailwind CSS

### 后续计划引入
- Markdown 渲染（markdown-it）
- Node.js BFF（Express/Koa）
- SSE/ReadableStream 流式处理
- Transformers.js（浏览器端AI推理）
- IndexedDB（本地向量存储）
- Sentry/Bugsnag（错误监控）

---

> 本规划基于"前端AI工程师3个月学习路径"制定，每个版本聚焦一个核心技术点。
> 详细需求文档见各版本迭代文件：`迭代vX.X.md`
