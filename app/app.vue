<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAvatar } from '~/composables/useAvatar'

const { loadAvatar } = useAvatar()

onMounted(() => {
  // Restaure le thème
  const saved = localStorage.getItem('tg-theme')
  if (saved && saved !== 'system') {
    document.documentElement.setAttribute('data-theme', saved)
  }
  // Restaure la photo de profil
  loadAvatar()
})
</script>
