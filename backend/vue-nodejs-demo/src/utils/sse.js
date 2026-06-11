/**
 * Helper to send SSE message event
 * @param {import('express').Response} res - Express response object
 * @param {object} data - Data to send
 */
export function sendSSEMessage(res, data) {
  res.write(`event: message\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Helper to send SSE done event
 * @param {import('express').Response} res - Express response object
 * @param {object} data - Final data
 */
export function sendSSEDone(res, data) {
  res.write(`event: done\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Helper to send SSE error event
 * @param {import('express').Response} res - Express response object
 * @param {string} message - Error message
 */
export function sendSSEError(res, message) {
  res.write(`event: error\n`);
  res.write(`data: ${JSON.stringify({ message })}\n\n`);
}

/**
 * Initialize SSE response headers
 * @param {import('express').Response} res - Express response object
 */
export function initSSEHeaders(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
}

/**
 * Generate mock AI response chunks for SSE streaming
 * @param {string} fullResponse - Complete response text
 * @param {number} chunkSize - Characters per chunk
 * @param {number} delay - Delay between chunks in ms
 * @returns {Promise<{chunks: string[], done: object}>}
 */
export async function* generateMockResponse(fullResponse, chunkSize = 2, delay = 50) {
  for (let i = 0; i < fullResponse.length; i += chunkSize) {
    const chunk = fullResponse.slice(i, i + chunkSize);
    yield { content: chunk, done: false };
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
