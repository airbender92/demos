<template>
  <el-sub-menu v-if="menu.children?.length" :index="menu.path">
    <template #title>
      <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
      <span>{{ $t(menu.title) }}</span>
    </template>
    <menu-item
      v-for="child in menu.children"
      :key="child.id"
      :menu="child"
    />
  </el-sub-menu>
  <el-menu-item v-else :index="menu.path">
    <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
    <template #title>{{ $t(menu.title) }}</template>
  </el-menu-item>
</template>

<script setup lang="ts">
defineProps<{
  menu: MenuItem
}>()
</script>
