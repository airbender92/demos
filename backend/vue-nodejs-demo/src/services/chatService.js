import db from '../config/database.js';
import { cacheGet, cacheSet } from '../config/redis.js';
import { initSSEHeaders, sendSSEMessage, sendSSEDone, sendSSEError, generateMockResponse } from '../utils/sse.js';
// Default mock AI responses based on keywords
const MOCK_RESPONSES = {
  '你好': '你好！我是AI助手，很高兴为你服务。有什么我可以帮你的吗？',
  '介绍': '我是一个基于大型语言模型的AI助手，可以帮助你回答问题、编写代码、分析数据、提供建议等。我支持多轮对话，可以理解上下文，并尽力给出准确的回答。',
  '代码': '我可以帮你编写、审查和调试代码。支持多种编程语言，包括JavaScript、Python、Java、C++、Go等。请告诉我你需要什么帮助！',
  '再见': '再见！如果你有任何问题，随时可以回来找我。祝你今天愉快！',
  'default': '这是一个AI助手的模拟回复。在实际生产环境中，这里会接入真实的AI模型API（如OpenAI、Claude等），提供智能的对话回复。',
};

/**
 * Generate a mock AI response based on user message
 */
function getMockResponse(message) {
  const msg = message.toLowerCase();
  for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
    if (keyword !== 'default' && msg.includes(keyword)) {
      return response;
    }
  }
  return MOCK_RESPONSES['default'];
}

/**
 * Handle SSE streaming chat
 */
export async function handleChatStream(res, sessionId, message, contextConfig) {
  initSSEHeaders(res);

  try {
    // Get context (previous messages) if context is enabled
    let context = [];
    if (contextConfig?.enabled && sessionId) {
      context = getRecentMessages(sessionId, contextConfig.maxMessages || 10);
    }

    // Generate mock response
    const fullResponse = getMockResponse(message);
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Save user message
    saveMessage(sessionId || `session_${Date.now()}`, 'user', message);

    // Stream response chunks
    let fullContent = '';
    let tokenCount = 0;

    for await (const chunk of generateMockResponse(fullResponse, 2, 30)) {
      sendSSEMessage(res, chunk);
      fullContent += chunk.content;
      tokenCount++;
    }

    // Save assistant message
    saveMessage(sessionId || `session_${Date.now()}`, 'assistant', fullContent, tokenCount);

    // Send done event
    sendSSEDone(res, {
      messageId,
      content: fullContent,
      tokens: tokenCount,
    });

    res.end();
  } catch (err) {
    console.error('[Chat Stream Error]', err);
    sendSSEError(res, '服务暂时不可用');
    res.end();
  }
}

/**
 * Create a new chat session
 */
export function createSession(userId, sessionId, title, contextConfig) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO chat_sessions (id, user_id, title, context_config, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  stmt.run(
    sessionId,
    userId,
    title || '新对话',
    JSON.stringify(contextConfig || {})
  );

  return { sessionId, createdAt: new Date().toISOString() };
}

/**
 * Get chat sessions list with pagination
 */
export function getSessions(userId, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;

  // Get total count
  const countStmt = db.prepare(`
    SELECT COUNT(*) as total FROM chat_sessions WHERE user_id = ?
  `);
  const { total } = countStmt.get(userId);

  // Get sessions with last message
  const sessionsStmt = db.prepare(`
    SELECT
      cs.id,
      cs.title,
      cs.context_config,
      cs.created_at,
      cs.updated_at,
      COUNT(cm.id) as messageCount,
      (SELECT content FROM chat_messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as lastMessage
    FROM chat_sessions cs
    LEFT JOIN chat_messages cm ON cs.id = cm.session_id
    WHERE cs.user_id = ?
    GROUP BY cs.id
    ORDER BY cs.updated_at DESC
    LIMIT ? OFFSET ?
  `);

  const list = sessionsStmt.all(userId, pageSize, offset);

  return {
    list: list.map((s) => ({
      ...s,
      context_config: s.context_config ? JSON.parse(s.context_config) : null,
    })),
    total,
    page,
    pageSize,
  };
}

/**
 * Get single session detail with messages
 */
export function getSessionDetail(sessionId, userId) {
  const sessionStmt = db.prepare(`
    SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?
  `);
  const session = sessionStmt.get(sessionId, userId);

  if (!session) {
    return null;
  }

  const messagesStmt = db.prepare(`
    SELECT id, session_id, role, content, tokens, created_at
    FROM chat_messages
    WHERE session_id = ?
    ORDER BY created_at ASC
  `);
  const messages = messagesStmt.all(sessionId);

  return {
    ...session,
    context_config: session.context_config ? JSON.parse(session.context_config) : null,
    messages,
  };
}

/**
 * Delete a chat session and its messages
 */
export function deleteSession(sessionId, userId) {
  // Delete messages first
  const msgStmt = db.prepare('DELETE FROM chat_messages WHERE session_id = ?');
  msgStmt.run(sessionId);

  // Delete session
  const sessionStmt = db.prepare('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?');
  const result = sessionStmt.run(sessionId, userId);

  return result.changes > 0;
}

/**
 * Search conversations
 */
export function searchSessions(userId, keyword) {
  const stmt = db.prepare(`
    SELECT
      cs.id,
      cs.title,
      cs.updated_at,
      cm.content as matchedContent
    FROM chat_sessions cs
    INNER JOIN chat_messages cm ON cs.id = cm.session_id
    WHERE cs.user_id = ? AND (cs.title LIKE ? OR cm.content LIKE ?)
    ORDER BY cs.updated_at DESC
    LIMIT 50
  `);

  const pattern = `%${keyword}%`;
  return stmt.all(userId, pattern, pattern);
}

/**
 * Delete a single message
 */
export function deleteMessage(messageId, userId) {
  const stmt = db.prepare(`
    DELETE FROM chat_messages
    WHERE id = ? AND session_id IN (SELECT id FROM chat_sessions WHERE user_id = ?)
  `);
  const result = stmt.run(messageId, userId);
  return result.changes > 0;
}

/**
 * Get recent messages for context
 */
function getRecentMessages(sessionId, maxMessages) {
  const stmt = db.prepare(`
    SELECT role, content FROM chat_messages
    WHERE session_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);
  return stmt.all(sessionId, maxMessages).reverse();
}

/**
 * Save a message
 */
export function saveMessage(sessionId, role, content, tokens = 0) {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO chat_messages (id, session_id, role, content, tokens, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  stmt.run(messageId, sessionId, role, content, tokens);
  return messageId;
}

/**
 * Get user context config
 */
export function getContextConfig(userId) {
  const stmt = db.prepare('SELECT config FROM user_context_config WHERE user_id = ?');
  const result = stmt.get(userId);

  if (result) {
    return JSON.parse(result.config);
  }

  // Return default config
  return {
    maxTokens: 4096,
    maxMessages: 10,
    strategy: 'sliding',
  };
}

/**
 * Update user context config
 */
export function updateContextConfig(userId, config) {
  const stmt = db.prepare(`
    INSERT INTO user_context_config (user_id, config)
    VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET config = ?
  `);

  const configJson = JSON.stringify(config);
  stmt.run(userId, configJson, configJson);

  return config;
}
