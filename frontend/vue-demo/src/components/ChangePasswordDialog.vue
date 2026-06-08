<!-- src/components/ChangePasswordDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('changePassword.title')"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item :label="t('changePassword.oldPassword')" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          show-password
          :placeholder="t('changePassword.oldPasswordPlaceholder')"
        />
      </el-form-item>
      <el-form-item :label="t('changePassword.newPassword')" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          :placeholder="t('changePassword.newPasswordPlaceholder')"
        />
      </el-form-item>
      <el-form-item :label="t('changePassword.confirmPassword')" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          :placeholder="t('changePassword.confirmPasswordPlaceholder')"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ t('changePassword.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { changePassword } from '@/api/modules/auth'
import { useUserStore } from '@/store/modules/user'
import router from '@/router'

const { t } = useI18n()
const userStore = useUserStore()

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validatePasswordStrength = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  if (!value) {
    callback()
    return
  }
  const hasLetter = /[a-zA-Z]/.test(value)
  const hasNumber = /\d/.test(value)
  if (!hasLetter || !hasNumber) {
    callback(new Error(t('changePassword.passwordStrength')))
  } else {
    callback()
  }
}

const validateConfirmPassword = (_rule: unknown, value: string, callback: (err?: Error) => void) => {
  if (!value) {
    callback()
    return
  }
  if (value !== form.newPassword) {
    callback(new Error(t('changePassword.passwordMismatch')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: t('changePassword.oldPasswordRequired'), trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: t('changePassword.newPasswordRequired'), trigger: 'blur' },
    { min: 6, message: t('changePassword.passwordMinLength'), trigger: 'blur' },
    { validator: validatePasswordStrength, trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: t('changePassword.confirmPasswordRequired'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
})

async function handleSubmit() {
  const formInstance = formRef.value
  if (!formInstance) return

  await formInstance.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })

      ElMessage.success(t('changePassword.changeSuccess'))
      handleClose()

      // 提示用户重新登录
      setTimeout(() => {
        userStore.resetState()
        router.push('/login')
      }, 1500)
    } catch (error: unknown) {
      const err = error as Error
      ElMessage.error(err.message || t('changePassword.changeFailed'))
    } finally {
      loading.value = false
    }
  })
}

function handleClose() {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 监听 visible 变化，重置表单
watch(dialogVisible, (val) => {
  if (!val) {
    handleClose()
  }
})
</script>

<style scoped lang="scss">
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>
