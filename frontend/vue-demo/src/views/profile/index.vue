<!-- src/views/profile/index.vue -->
<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">{{ t('profile.title') }}</span>
        </div>
      </template>

      <div class="profile-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <div class="avatar-label">{{ t('profile.avatar') }}</div>
          <AvatarUpload
            v-model="userInfo.avatar"
            @success="handleAvatarSuccess"
          />
        </div>

        <el-divider />

        <!-- 基本信息 -->
        <div class="info-section">
          <div class="section-header">
            <span class="section-title">{{ t('profile.basicInfo') }}</span>
            <el-button type="primary" text @click="toggleEdit">
              {{ isEditing ? t('common.cancel') : t('common.edit') }}
            </el-button>
          </div>

          <el-form
            ref="formRef"
            :model="editForm"
            :rules="rules"
            label-width="100px"
            label-position="right"
            :disabled="!isEditing"
          >
            <el-form-item :label="t('profile.username')">
              <el-input v-model="userInfo.username" disabled />
            </el-form-item>

            <el-form-item :label="t('profile.nickname')" prop="nickname">
              <el-input
                v-model="editForm.nickname"
                :placeholder="t('profile.nicknamePlaceholder')"
              />
            </el-form-item>

            <el-form-item :label="t('profile.email')" prop="email">
              <el-input
                v-model="editForm.email"
                :placeholder="t('profile.emailPlaceholder')"
              />
            </el-form-item>

            <el-form-item :label="t('profile.phone')" prop="phone">
              <el-input
                v-model="editForm.phone"
                :placeholder="t('profile.phonePlaceholder')"
              />
            </el-form-item>

            <el-form-item :label="t('profile.role')">
              <el-tag v-for="role in userInfo.roles" :key="role" class="role-tag">
                {{ role }}
              </el-tag>
            </el-form-item>

            <el-form-item v-if="isEditing">
              <el-button type="primary" :loading="saveLoading" @click="handleSave">
                {{ t('profile.save') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-divider />

        <!-- 安全设置 -->
        <div class="security-section">
          <div class="section-header">
            <span class="section-title">{{ t('menu.securitySettings') }}</span>
          </div>
          <el-button type="primary" plain @click="showChangePassword = true">
            {{ t('changePassword.title') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 修改密码弹窗 -->
    <ChangePasswordDialog v-model:visible="showChangePassword" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/user'
import { updateUserProfile } from '@/api/modules/auth'
import AvatarUpload from '@/components/AvatarUpload.vue'
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'

const { t } = useI18n()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const isEditing = ref(false)
const saveLoading = ref(false)
const showChangePassword = ref(false)

const userInfo = reactive({
  id: '',
  username: '',
  nickname: '',
  avatar: '',
  email: '',
  phone: '',
  roles: [] as string[],
})

const editForm = reactive({
  nickname: '',
  email: '',
  phone: '',
})

const rules = reactive<FormRules>({
  nickname: [
    { required: true, message: t('profile.nicknameRequired'), trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: t('profile.emailInvalid'), trigger: 'blur' },
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: t('profile.phoneInvalid'), trigger: 'blur' },
  ],
})

function toggleEdit() {
  if (isEditing.value) {
    // 取消编辑，恢复表单
    editForm.nickname = userInfo.nickname
    editForm.email = userInfo.email || ''
    editForm.phone = userInfo.phone || ''
    isEditing.value = false
  } else {
    // 进入编辑模式
    editForm.nickname = userInfo.nickname
    editForm.email = userInfo.email || ''
    editForm.phone = userInfo.phone || ''
    isEditing.value = true
  }
}

async function handleSave() {
  const formInstance = formRef.value
  if (!formInstance) return

  await formInstance.validate(async (valid) => {
    if (!valid) return

    saveLoading.value = true
    try {
      const { data } = await updateUserProfile(editForm)
      // 更新 store 和本地数据
      userInfo.nickname = data.nickname
      userInfo.email = data.email || ''
      userInfo.phone = data.phone || ''
      userStore.userInfo = data

      ElMessage.success(t('profile.saveSuccess'))
      isEditing.value = false
    } catch (error: unknown) {
      const err = error as Error
      ElMessage.error(err.message || t('profile.saveFailed'))
    } finally {
      saveLoading.value = false
    }
  })
}

function handleAvatarSuccess(url: string) {
  userInfo.avatar = url
  if (userStore.userInfo) {
    userStore.userInfo.avatar = url
  }
}

function syncEditForm() {
  editForm.nickname = userInfo.nickname
  editForm.email = userInfo.email || ''
  editForm.phone = userInfo.phone || ''
}

onMounted(() => {
  const info = userStore.userInfo
  if (info) {
    userInfo.id = info.id
    userInfo.username = info.username
    userInfo.nickname = info.nickname
    userInfo.avatar = info.avatar || ''
    userInfo.email = info.email || ''
    userInfo.phone = info.phone || ''
    userInfo.roles = info.roles
  }
  // 初始化同步编辑表单
  syncEditForm()
})
</script>

<style scoped lang="scss">
.profile-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  :deep(.el-card__header) {
    padding: 16px 24px;
    border-bottom: 1px solid #ebeef5;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.profile-content {
  padding: 16px 0;
}

.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.avatar-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  padding-top: 8px;
  min-width: 100px;
  text-align: right;
}

.info-section,
.security-section {
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
}

.role-tag {
  margin-right: 8px;
}

.el-divider {
  margin: 24px 0;
}
</style>
