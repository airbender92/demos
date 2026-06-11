import * as authService from '../services/authService.js';

/**
 * POST /api/auth/sso-login
 * SSO login (mock SSO verification)
 */
export async function ssoLogin(req, res) {
  try {
    const { sso_token } = req.body;

    if (!sso_token) {
      return res.status(400).json({
        code: 400,
        message: '缺少 sso_token 参数',
      });
    }

    const result = await authService.ssoLogin(sso_token);

    res.json({
      code: 200,
      message: 'success',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || 'SSO登录失败',
    });
  }
}

/**
 * POST /api/auth/login
 * Regular login with password
 */
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '缺少用户名或密码',
      });
    }

    const user = await authService.authenticateUser(username, password);

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    const result = await authService.loginUser(user);

    res.json({
      code: 200,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '登录失败',
    });
  }
}

/**
 * POST /api/auth/refresh
 * Token refresh
 */
export async function refresh(req, res) {
  try {
    const result = await authService.refreshAccessToken(req.user);

    res.json({
      code: 200,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '刷新令牌失败',
    });
  }
}

/**
 * POST /api/auth/logout
 * Logout (invalidate token)
 */
export async function logout(req, res) {
  try {
    await authService.logoutUser(req.user.id);

    res.json({
      code: 200,
      message: '登出成功',
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '登出失败',
    });
  }
}

/**
 * GET /api/auth/current-user
 * Get current user info
 */
export async function getCurrentUser(req, res) {
  try {
    const user = await authService.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.json({
      code: 200,
      data: authService.sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '获取用户信息失败',
    });
  }
}
