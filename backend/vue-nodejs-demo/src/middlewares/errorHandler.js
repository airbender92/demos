/**
 * Global error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      code: 400,
      message: '文件过大，最大允许 2MB',
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      code: 413,
      message: '请求体过大',
    });
  }

  // SQLite errors
  if (err.message && err.message.includes('SQLITE_CONSTRAINT')) {
    return res.status(409).json({
      code: 409,
      message: '数据冲突',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: '无效的令牌',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: '令牌已过期',
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    code: statusCode,
    message: process.env.NODE_ENV === 'development' ? message : '服务器内部错误',
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    code: 404,
    message: `接口 ${req.method} ${req.originalUrl} 不存在`,
  });
}
