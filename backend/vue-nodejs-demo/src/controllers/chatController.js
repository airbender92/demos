import * as chatService from '../services/chatService.js';

/**
 * POST /api/chat/stream
 * SSE stream endpoint for AI chat
 */
export async function chatStream(req, res) {
  const { sessionId, message, contextEnabled, contextConfig } = req.body;

  if (!message) {
    return res.status(400).json({
      code: 400,
      message: '缺少消息内容',
    });
  }

  // Handle SSE streaming
  chatService.handleChatStream(res, sessionId, message, {
    enabled: contextEnabled,
    ...contextConfig,
  });
}

/**
 * POST /api/chat/session
 * Save conversation after completion
 */
export async function saveSession(req, res) {
  try {
    const { sessionId, title, messages } = req.body;

    if (!sessionId || !title || !messages) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      });
    }

    const result = chatService.createSession(req.user.id, sessionId, title, req.body.contextConfig);

    // Save individual messages
    for (const msg of messages) {
      chatService.saveMessage(sessionId, msg.role, msg.content, msg.tokens || 0);
    }

    res.json({
      code: 200,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '保存对话失败',
    });
  }
}

/**
 * GET /api/chat/sessions
 * Get conversation list with pagination
 */
export async function getSessions(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const result = chatService.getSessions(req.user.id, page, pageSize);

    res.json({
      code: 200,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '获取对话列表失败',
    });
  }
}

/**
 * GET /api/chat/session/:id
 * Get conversation detail with messages
 */
export async function getSessionDetail(req, res) {
  try {
    const { id } = req.params;
    const session = chatService.getSessionDetail(id, req.user.id);

    if (!session) {
      return res.status(404).json({
        code: 404,
        message: '对话不存在',
      });
    }

    res.json({
      code: 200,
      data: session,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '获取对话详情失败',
    });
  }
}

/**
 * DELETE /api/chat/session/:id
 * Delete conversation
 */
export async function deleteSession(req, res) {
  try {
    const { id } = req.params;
    const success = chatService.deleteSession(id, req.user.id);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: '对话不存在或无权删除',
      });
    }

    res.json({
      code: 200,
      message: '删除成功',
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '删除对话失败',
    });
  }
}

/**
 * GET /api/chat/sessions/search
 * Search conversations
 */
export async function searchSessions(req, res) {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        code: 400,
        message: '缺少搜索关键词',
      });
    }

    const results = chatService.searchSessions(req.user.id, keyword);

    res.json({
      code: 200,
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '搜索对话失败',
    });
  }
}

/**
 * DELETE /api/chat/message/:messageId
 * Delete single message
 */
export async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;
    const success = chatService.deleteMessage(messageId, req.user.id);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: '消息不存在或无权删除',
      });
    }

    res.json({
      code: 200,
      message: '消息已删除',
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '删除消息失败',
    });
  }
}

/**
 * GET /api/chat/context-config
 * Get context config
 */
export async function getContextConfig(req, res) {
  try {
    const config = chatService.getContextConfig(req.user.id);

    res.json({
      code: 200,
      data: config,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '获取上下文配置失败',
    });
  }
}

/**
 * PUT /api/chat/context-config
 * Update context config
 */
export async function updateContextConfig(req, res) {
  try {
    const { maxTokens, maxMessages, strategy } = req.body;

    const config = chatService.updateContextConfig(req.user.id, {
      maxTokens: maxTokens || 4096,
      maxMessages: maxMessages || 10,
      strategy: strategy || 'sliding',
    });

    res.json({
      code: 200,
      message: '配置已保存',
      data: config,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '保存配置失败',
    });
  }
}
