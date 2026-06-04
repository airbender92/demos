<template>
  <div class="default-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside :width="sidebarWidth" class="layout-aside">
        <div class="logo-wrapper">
          <svg-icon v-if="!collapsed" name="logo" class="logo-icon" />
          <span v-if="!collapsed" class="logo-text">Vue Demo</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          class="sidebar-menu"
        >
          <menu-item
            v-for="menu in visibleMenus"
            :key="menu.id"
            :menu="menu"
          />
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="main-container">
        <!-- 顶部导航 -->
        <el-header class="layout-header" height="56px">
          <div class="header-left">
            <el-icon
              class="collapse-btn"
              @click="toggleSidebar"
            >
              <Fold v-if="!collapsed" />
              <Expand v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item
                v-for="item in breadcrumbs"
                :key="item.path"
                :to="item.path"
              >
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="28" class="user-avatar">
                  {{ username.charAt(0).toUpperCase() }}
                </el-avatar>
                <span class="username">{{ username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区 -->
        <el-main class="layout-main">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useMenuStore } from '@/store/modules/menu'
import { useUserStore } from '@/store/modules/user'
import { Fold, Expand, Monitor } from '@element-plus/icons-vue'

interface BreadcrumbItem {
  path: string
  title: string
}

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const menuStore = useMenuStore()
const userStore = useUserStore()

const collapsed = computed(() => appStore.sidebarCollapsed)
const sidebarWidth = computed(() => (collapsed.value ? '64px' : '220px'))
const visibleMenus = computed(() => menuStore.visibleMenus)
const activeMenu = computed(() => route.path)
const username = computed(() => userStore.username)

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter((item) => item.meta?.title)
  return matched.map((item) => ({
    path: item.path,
    title: item.meta.title as string,
  }))
})

function toggleSidebar() {
  appStore.toggleSidebar()
}

async function handleCommand(command: string) {
  if (command === 'logout') {
    await userStore.logout()
  }
}
</script>

<style scoped lang="scss">
.default-layout {
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  height: 100%;
}

.layout-aside {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;

  .logo-wrapper {
    height: $header-height;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .sidebar-menu {
    border-right: none;
    background-color: transparent;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      color: rgba(255, 255, 255, 0.65);

      &:hover {
        background-color: rgba(255, 255, 255, 0.08);
        color: #fff;
      }
    }

    :deep(.el-menu-item.is-active) {
      background-color: $primary-color;
      color: #fff;
    }
  }
}

.main-container {
  display: flex;
  flex-direction: column;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-lg;
  background-color: $bg-white;
  border-bottom: 1px solid $border-color-light;
  box-shadow: $shadow-light;

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: $primary-color;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .user-avatar {
        background-color: $primary-color;
        color: #fff;
      }

      .username {
        font-size: 14px;
        color: $text-primary;
      }
    }
  }
}

.layout-main {
  background-color: $bg-color;
  padding: $spacing-lg;
  overflow-y: auto;
}
</style>
