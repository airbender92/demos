import db from '../config/database.js';
import { cacheGet, cacheSet, cacheDel } from '../config/redis.js';

/**
 * Get menu list for user based on role
 */
export async function getMenuList(role) {
  const cacheKey = `menu:list:${role}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return cached;
  }

  // Get all menus, filter by role
  const stmt = db.prepare(`
    SELECT * FROM menus ORDER BY sort ASC, id ASC
  `);
  const allMenus = stmt.all();

  // Filter menus based on role
  // admin gets all menus, user gets menus excluding system management
  const filteredMenus = role === 'admin'
    ? allMenus
    : allMenus.filter((m) => m.name !== 'System' && !m.path?.startsWith('/system'));

  // Build tree structure
  const menuTree = buildMenuTree(filteredMenus);

  // Cache for 1 hour
  await cacheSet(cacheKey, menuTree, 3600);

  return menuTree;
}

/**
 * Get route permissions for user based on role
 */
export async function getRoutePermissions(role) {
  const menuList = await getMenuList(role);
  return extractRoutes(menuList);
}

/**
 * Build hierarchical menu tree from flat list
 */
function buildMenuTree(menus) {
  const menuMap = new Map();
  const tree = [];

  // First pass: create map
  for (const menu of menus) {
    menuMap.set(menu.id, { ...menu, children: [] });
  }

  // Second pass: build tree
  for (const menu of menus) {
    const node = menuMap.get(menu.id);
    if (menu.parent_id && menuMap.has(menu.parent_id)) {
      menuMap.get(menu.parent_id).children.push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
}

/**
 * Extract route paths from menu tree
 */
function extractRoutes(menuTree) {
  const routes = [];

  function traverse(nodes) {
    for (const node of nodes) {
      if (node.path) {
        routes.push(node.path);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(menuTree);
  return routes;
}

/**
 * Clear menu cache for all roles
 */
export async function clearMenuCache() {
  await cacheDel('menu:list:admin');
  await cacheDel('menu:list:user');
}
