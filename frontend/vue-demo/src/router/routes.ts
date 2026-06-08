// src/router/routes.ts

import type { RouteRecordRaw } from 'vue-router'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true,
      requiresAuth: false,
    },
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '控制台',
          icon: 'HomeFilled',
          requiresAuth: true,
        },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          title: '个人中心',
          icon: 'User',
          requiresAuth: true,
        },
      },
    ],
  },
]

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/error/NotFound.vue'),
        meta: {
          title: '404',
          hidden: true,
        },
      },
    ],
  },
]
