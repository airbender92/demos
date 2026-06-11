import * as menuService from '../services/menuService.js';

/**
 * GET /api/menu/list
 * Get user's menus based on role
 */
export async function getMenuList(req, res) {
  try {
    const menus = await menuService.getMenuList(req.user.role);

    res.json({
      code: 200,
      data: menus,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '获取菜单失败',
    });
  }
}

/**
 * GET /api/menu/routes
 * Get user's route permissions
 */
export async function getRoutePermissions(req, res) {
  try {
    const routes = await menuService.getRoutePermissions(req.user.role);

    res.json({
      code: 200,
      data: routes,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message || '获取路由权限失败',
    });
  }
}
