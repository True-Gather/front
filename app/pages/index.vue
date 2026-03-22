<script setup lang="ts">
definePageMeta({
  layout: 'auth' as any
})

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/auth/me', {
      credentials: 'include'
    })

    const data = await response.json()

    if (data.authenticated) {
      await navigateTo('/meetings/create')
      return
    }

    await navigateTo('/auth/login')
  } catch (_error) {
    await navigateTo('/auth/login')
  }
})
</script>

<template>
  <section class="tg-auth-simple-page">
    <div class="tg-auth-simple-card">
      <span class="tg-auth-chip">TrueGather</span>

      <h1 class="tg-auth-title tg-auth-title--sm">Chargement</h1>

      <p class="tg-auth-description tg-auth-description--sm">
        Vérification de votre session...
      </p>
    </div>
  </section>
</template>

<style scoped>
.tg-auth-simple-page {
  width: 100%;
  display: flex;
  justify-content: center;
}

.tg-auth-simple-card {
  width: min(100%, 32rem);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(14px);
  text-align: center;
}

.tg-auth-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: rgba(45, 212, 191, 0.14);
  color: #99f6e4;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 1rem;
}

.tg-auth-title {
  margin: 0 0 0.75rem;
  color: #f8fafc;
}

.tg-auth-title--sm {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
}

.tg-auth-description {
  margin: 0;
  color: rgba(226, 232, 240, 0.78);
}

.tg-auth-description--sm {
  max-width: 32ch;
  margin-inline: auto;
}
</style>