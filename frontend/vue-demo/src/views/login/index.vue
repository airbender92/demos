<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">{{ t('login.title') }}</h1>
        <p class="login-subtitle">{{ t('login.subtitle') }}</p>
      </div>
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :placeholder="t('login.usernamePlaceholder')"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="t('login.passwordPlaceholder')"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="rememberMe">{{ t('login.rememberMe') }}</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ t('login.loginBtn') }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <el-link type="info" @click="handleSSOLogin">{{ t('login.ssoLogin') }}</el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/user'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive<Credentials>({
  username: '',
  password: '',
})

// 初始化：读取记住的账号
const savedUsername = localStorage.getItem('vue_demo_saved_username')
if (savedUsername) {
  loginForm.username = savedUsername
  rememberMe.value = true
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
  ],
})

async function handleLogin() {
  const form = formRef.value
  if (!form) return

  await form.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await userStore.login(loginForm)
      // 记住账号
      if (rememberMe.value) {
        localStorage.setItem('vue_demo_saved_username', loginForm.username)
      } else {
        localStorage.removeItem('vue_demo_saved_username')
      }
      ElMessage.success(t('login.loginSuccess'))
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } catch (error: unknown) {
      const err = error as Error
      ElMessage.error(err.message || t('login.loginFailed'))
    } finally {
      loading.value = false
    }
  })
}

function handleSSOLogin() {
  // 单点登录跳转
  const ssoUrl = `${import.meta.env.VITE_API_BASE_URL}/sso/login?redirect=${encodeURIComponent(window.location.href)}`
  window.location.href = ssoUrl
}

/** 处理 SSO 回调 */
async function handleSSOCallback() {
  const ssoToken = route.query.sso_token as string
  if (!ssoToken) return

  loading.value = true
  try {
    await userStore.ssoLogin(ssoToken)
    ElMessage.success(t('login.loginSuccess'))
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (error: unknown) {
    const err = error as Error
    ElMessage.error(err.message || t('login.ssoCallbackFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 检查是否是 SSO 回调
  if (route.query.sso_token) {
    handleSSOCallback()
  }
})
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 40%);
  }
}

.login-card {
  width: 420px;
  padding: $spacing-xl * 2;
  background: rgba(255, 255, 255, 0.95);
  border-radius: $border-radius-lg;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;

  .login-title {
    font-size: 28px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8px;
  }

  .login-subtitle {
    font-size: 14px;
    color: $text-secondary;
  }
}

.login-form {
  .login-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }
}

.login-footer {
  text-align: center;
  margin-top: $spacing-md;
}
</style>
