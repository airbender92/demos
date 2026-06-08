<!-- src/components/AvatarUpload.vue -->
<template>
  <el-upload
    class="avatar-uploader"
    :show-file-list="false"
    :before-upload="handleBeforeUpload"
    :http-request="handleUpload"
    accept="image/jpeg,image/png,image/gif"
    drag
  >
    <div v-if="imageUrl" class="avatar-preview">
      <img :src="imageUrl" class="avatar-img" alt="avatar" />
      <div class="avatar-mask">
        <el-icon :size="24"><Upload /></el-icon>
        <span>{{ t('avatar.upload') }}</span>
      </div>
    </div>
    <div v-else class="avatar-placeholder">
      <el-icon :size="40" class="avatar-icon"><Plus /></el-icon>
      <div class="avatar-text">{{ t('avatar.upload') }}</div>
      <div class="avatar-tip">{{ t('avatar.limit') }}</div>
    </div>
  </el-upload>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { uploadAvatar } from '@/api/modules/auth'

const { t } = useI18n()

interface Props {
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'success', url: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const imageUrl = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  (val) => {
    imageUrl.value = val || ''
  }
)

const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']

function handleBeforeUpload(file: File): boolean {
  const isImage = ALLOWED_TYPES.includes(file.type)
  if (!isImage) {
    ElMessage.error(t('avatar.wrongFormat'))
    return false
  }

  const isLt2M = file.size < MAX_SIZE
  if (!isLt2M) {
    ElMessage.error(t('avatar.tooLarge'))
    return false
  }

  return true
}

async function handleUpload(options: { file: File }): Promise<void> {
  try {
    const { data } = await uploadAvatar(options.file)
    imageUrl.value = data
    emit('update:modelValue', data)
    emit('success', data)
    ElMessage.success(t('avatar.uploadSuccess'))
  } catch (error: unknown) {
    const err = error as Error
    ElMessage.error(err.message || t('avatar.uploadFailed'))
  }
}
</script>

<style scoped lang="scss">
.avatar-uploader {
  width: 150px;
  height: 150px;

  :deep(.el-upload) {
    width: 100%;
    height: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    height: 100%;
    padding: 0;
    border-radius: 50%;
    overflow: hidden;
  }
}

.avatar-preview {
  width: 150px;
  height: 150px;
  position: relative;
  border-radius: 50%;
  overflow: hidden;

  &:hover .avatar-mask {
    opacity: 1;
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8c939d;
}

.avatar-icon {
  color: #c0c4cc;
}

.avatar-text {
  font-size: 14px;
}

.avatar-tip {
  font-size: 12px;
  color: #a8abb2;
}
</style>
