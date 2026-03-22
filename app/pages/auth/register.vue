<script setup lang="ts">
definePageMeta({
  layout: 'auth' as any
})

const goToBackendRegister = () => {
  window.location.href = 'http://localhost:8080/api/v1/auth/register'
}
</script>

<template>
  <section class="tg-auth-simple-page">
    <div class="tg-auth-simple-card">
      <span class="tg-auth-chip">Inscription sécurisée</span>

      <h1 class="tg-auth-title tg-auth-title--sm">Créer un compte</h1>

      <p class="tg-auth-description tg-auth-description--sm">
        La création de compte est gérée de manière sécurisée via Keycloak.
      </p>

      <button class="tg-auth-primary-btn" type="button" @click="goToBackendRegister">
        Créer mon compte
      </button>

      <p class="tg-auth-bottom-text">
        Déjà un compte ?
        <NuxtLink to="/auth/login" class="tg-auth-inline-link">
          Se connecter
        </NuxtLink>
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
  margin: 0 0 1.5rem;
  color: rgba(226, 232, 240, 0.78);
}

.tg-auth-description--sm {
  max-width: 32ch;
}

.tg-auth-primary-btn {
  width: 100%;
  border: 0;
  border-radius: 0.95rem;
  padding: 1rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #14b8a6, #06b6d4);
  color: #ecfeff;
}

.tg-auth-bottom-text {
  margin: 1rem 0 0;
  text-align: center;
  color: rgba(226, 232, 240, 0.78);
}

.tg-auth-inline-link {
  color: #99f6e4;
  font-weight: 600;
  text-decoration: none;
}
</style>