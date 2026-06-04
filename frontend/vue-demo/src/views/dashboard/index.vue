<template>
  <div class="dashboard-container">
    <el-row :gutter="16">
      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon primary">
              <el-icon :size="32"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">1,248</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon success">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">5,824</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon :size="32"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥126,560</div>
              <div class="stat-label">销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon :size="32"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">368</div>
              <div class="stat-label">待处理消息</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card shadow="never" class="quick-entry-card" style="margin-top: 16px">
      <template #header>
        <div class="card-header">
          <span>快捷入口</span>
        </div>
      </template>
      <el-row :gutter="16">
        <el-col :span="4" v-for="item in quickEntries" :key="item.name" class="quick-entry-item">
          <div class="entry-item" @click="handleEntry(item.path)">
            <el-icon :size="24" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
            <span class="entry-text">{{ item.name }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 项目信息 -->
    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>项目信息</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="框架版本">Vue 3.4.21</el-descriptions-item>
            <el-descriptions-item label="TypeScript">5.4.3</el-descriptions-item>
            <el-descriptions-item label="构建工具">Vite 5.2.7</el-descriptions-item>
            <el-descriptions-item label="状态管理">Pinia 2.1.7</el-descriptions-item>
            <el-descriptions-item label="UI 组件库">Element Plus 2.6.3</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>当前用户</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ username }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ roles.join(', ') || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="登录时间">{{ currentTime }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  UserFilled,
  Document,
  ShoppingCart,
  ChatDotRound,
  Setting,
  DataAnalysis,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

interface QuickEntry {
  name: string
  icon: unknown
  color: string
  path: string
}

const router = useRouter()
const userStore = useUserStore()

const username = computed(() => userStore.username)
const roles = computed(() => userStore.roles)
const currentTime = computed(() => new Date().toLocaleString('zh-CN'))

const quickEntries: QuickEntry[] = [
  { name: '用户管理', icon: UserFilled, color: '#409EFF', path: '/dashboard' },
  { name: '文档管理', icon: Document, color: '#67C23A', path: '/dashboard' },
  { name: '订单管理', icon: ShoppingCart, color: '#E6A23C', path: '/dashboard' },
  { name: '消息中心', icon: ChatDotRound, color: '#F56C6C', path: '/dashboard' },
  { name: '系统设置', icon: Setting, color: '#909399', path: '/dashboard' },
  { name: '数据报表', icon: DataAnalysis, color: '#409EFF', path: '/dashboard' },
]

function handleEntry(path: string) {
  router.push(path)
}
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 0;
}

.stat-card {
  :deep(.el-card__body) {
    padding: 20px;
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;

      &.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.success {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      }

      &.warning {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.danger {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }
    }

    .stat-info {
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: $text-primary;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 13px;
        color: $text-secondary;
        margin-top: 4px;
      }
    }
  }
}

.quick-entry-card {
  .card-header {
    font-size: 16px;
    font-weight: 600;
  }

  .quick-entry-item {
    margin-bottom: 8px;

    .entry-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: $bg-color;
      }

      .entry-text {
        margin-top: 8px;
        font-size: 13px;
        color: $text-regular;
      }
    }
  }
}
</style>
