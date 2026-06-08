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
            <!-- 语言切换 -->
            <el-dropdown trigger="click" @command="handleLangChange">
              <div class="lang-switch">
                <el-icon><Monitor /></el-icon>
                <span class="lang-text">{{ currentLangLabel }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="lang in langOptions"
                    :key="lang.value"
                    :command="lang.value"
                    :disabled="lang.value === appStore.locale"
                  >
                    {{ lang.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- 主题切换 -->
            <el-dropdown trigger="click" @command="handleThemeChange">
              <div class="theme-switch">
                <el-icon><Brush /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="theme in themeOptions"
                    :key="theme.value"
                    :command="theme.value"
                    :disabled="theme.value === appStore.theme"
                  >
                    {{ theme.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="28" class="user-avatar">
                  {{ username.charAt(0).toUpperCase() }}
                </el-avatar>
                <span class="username">{{ username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">{{ t('common.profile') }}</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>{{ t('common.logout') }}</el-dropdown-item>
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
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/modules/app'
import { useMenuStore } from '@/store/modules/menu'
import { useUserStore } from '@/store/modules/user'
import { Fold, Expand, Monitor, Brush } from '@element-plus/icons-vue'
import { i18n, elementLocales } from '@/i18n'
import { ElMessage } from 'element-plus'

interface BreadcrumbItem {
  path: string
  title: string
}

const { t } = useI18n()

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

/** 语言选项 */
const langOptions = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
]

const currentLangLabel = computed(() => {
  const opt = langOptions.find((l) => l.value === appStore.locale)
  return opt?.label || '中文'
})

/** 主题选项 */
const themeOptions = [
  { label: '默认', value: 'default' },
  { label: '深色', value: 'dark' },
  { label: '蓝色', value: 'blue' },
]

/** 切换语言 */
function handleLangChange(lang: string) {
  i18n.global.locale.value = lang as 'zh' | 'en'
  appStore.setLocale(lang)
  // 同步切换 Element Plus locale
  const elementLocale = elementLocales[lang]
  if (elementLocale) {
    // Element Plus 重新设置 locale
    // 通过重新配置来实现，实际项目中可以使用 provide/inject 方案
    window.location.reload()
  }
  ElMessage.success(t('toast.switchLangSuccess'))
}

/** 切换主题 */
function handleThemeChange(theme: string) {
  appStore.setTheme(theme)
  ElMessage.success(t('toast.switchThemeSuccess'))
}

function toggleSidebar() {
  appStore.toggleSidebar()
}

async function handleCommand(command: string) {
  if (command === 'logout') {
    await userStore.logout()
  } else if (command === 'profile') {
    router.push('/profile')
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
  background-color: var(--bg-sidebar, #001529);
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
    --el-menu-bg-color: transparent;
    --el-menu-text-color: var(--text-sidebar, rgba(255, 255, 255, 0.65));
    --el-menu-hover-bg-color: var(--bg-sidebar-hover, rgba(255, 255, 255, 0.08));
    --el-menu-item-hover-fill: var(--bg-sidebar-hover, rgba(255, 255, 255, 0.08));
    --el-menu-active-color: var(--theme-primary, #409EFF);

    :deep(.el-sub-menu .el-menu-item),
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      color: var(--text-sidebar, rgba(255, 255, 255, 0.65));

      &:hover {
        background-color: var(--bg-sidebar-hover, rgba(255, 255, 255, 0.08));
        color: var(--text-sidebar-hover, #fff);
      }
    }

    :deep(.el-sub-menu .el-sub-menu__title):hover {
      background-color: var(--bg-sidebar-hover, rgba(255, 255, 255, 0.08));
    }

    :deep(.el-menu-item.is-active) {
      background-color: var(--bg-sidebar-active, #409EFF);
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
  background-color: var(--bg-header, #FFFFFF);
  border-bottom: 1px solid var(--border-color-light, #E4E7ED);
  box-shadow: var(--shadow-light, 0 2px 12px 0 rgba(0, 0, 0, 0.1));

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--theme-primary, #409EFF);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .lang-switch {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      color: var(--text-regular, #606266);
      transition: color 0.2s;

      &:hover {
        color: var(--theme-primary, #409EFF);
      }

      .lang-text {
        font-size: 14px;
      }
    }

    .theme-switch {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: var(--text-regular, #606266);
      transition: color 0.2s;

      &:hover {
        color: var(--theme-primary, #409EFF);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .user-avatar {
        background-color: var(--theme-primary, #409EFF);
        color: #fff;
      }

      .username {
        font-size: 14px;
        color: var(--text-primary, #303133);
      }
    }
  }
}

.layout-main {
  background-color: var(--bg-color, #F5F7FA);
  padding: $spacing-lg;
  overflow-y: auto;
}
</style>
