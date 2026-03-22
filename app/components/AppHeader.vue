<script setup lang="ts">
const route = useRoute()
const { authUser, initials, fetchMe, logout } = useAuth()

onMounted(async () => {
  if (!authUser.value) {
    await fetchMe()
  }
})

const pageTitle = computed(() => {
  if (route.path === '/meetings/create') {
    return 'Créer un meeting'
  }

  return 'TrueGather'
})

const pageEyebrow = computed(() => {
  if (route.path.startsWith('/meetings')) {
    return 'Workspace · TrueGather'
  }

  return 'Secure collaboration workspace'
})
</script>

<template>
  <header class="tg-header">
    <div class="tg-header-copy">
      <p class="tg-header-eyebrow">{{ pageEyebrow }}</p>
      <h1 class="tg-header-title">{{ pageTitle }}</h1>
    </div>

    <div class="tg-header-actions">
      <button class="tg-icon-btn" type="button" aria-label="Notifications">
        <span>🔔</span>
        <span class="tg-notification-dot" />
      </button>

      <button class="tg-icon-btn" type="button" aria-label="Favoris">
        <span>🔖</span>
      </button>

      <button class="tg-icon-btn" type="button" aria-label="Paramètres">
        <span>⚙️</span>
      </button>

      <button class="tg-profile-btn" type="button" @click="logout">
        <span class="tg-profile-avatar">{{ initials }}</span>
        <span class="tg-profile-copy">
          <strong>{{ authUser?.display_name || 'TrueGather User' }}</strong>
          <small>{{ authUser?.email || 'Secure workspace' }}</small>
        </span>
      </button>
    </div>
  </header>
</template>