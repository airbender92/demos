import * as userService from '../services/userService.js';

/**
 * GET /api/user/profile
 * Get user profile
 */
export async function getProfile(req, res) {
  try {
    const user = await userService.getUserProfile(req.user.id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.json({
      code: 200,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '获取用户信息失败',
    });
  }
}

/**
 * PUT /api/user/profile
 * Update user profile
 */
export async function updateProfile(req, res) {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);

    res.json({
      code: 200,
      message: '更新成功',
      data: updatedUser,
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: err.message || '更新失败',
    });
  }
}

/**
 * PUT /api/user/password
 * Change password
 */
export async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '缺少旧密码或新密码',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '密码长度不能少于6位',
      });
    }

    await userService.changePassword(req.user.id, oldPassword, newPassword);

    res.json({
      code: 200,
      message: '密码修改成功，请重新登录',
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: err.message || '密码修改失败',
    });
  }
}

/**
 * POST /api/user/avatar
 * Upload avatar
 */
export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传头像文件',
      });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const result = await userService.updateAvatar(req.user.id, avatarPath);

    res.json({
      code: 200,
      message: '上传成功',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '头像上传失败',
    });
  }
}
