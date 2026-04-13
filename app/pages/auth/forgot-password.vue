<template>
  <section class="tg-forgot-page">
    <div class="tg-auth-brand">
      <div class="tg-auth-brand-icon">T</div>
      <div class="tg-auth-brand-copy">
        <span class="tg-auth-brand-name">TrueGather</span>
        <span class="tg-auth-brand-subtitle">Secure collaboration workspace</span>
      </div>
    </div>

    <div class="tg-auth-shell">
      <div class="tg-auth-panel tg-auth-panel--content">
        <span class="tg-auth-chip">Sécurité du compte</span>

        <h1 class="tg-auth-title">Mot de passe oublié ?</h1>

        <p class="tg-auth-description">
          Entrez votre adresse email et nous vous enverrons un lien de confirmation
          pour réinitialiser votre mot de passe.
        </p>

        <form class="tg-auth-form" @submit.prevent="handleSubmit">
          <div class="tg-auth-field">
            <label for="email">Adresse email</label>

            <div class="tg-auth-input-wrap">
              <span class="tg-auth-input-icon">✉</span>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="email@exemple.com"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <button class="tg-auth-primary-btn" type="submit">
            Envoyer
          </button>

          <transition name="tg-fade-up">
            <div v-if="showSuccess" class="tg-auth-success">
              Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé.
            </div>
          </transition>
        </form>

        <NuxtLink to="/" class="tg-auth-secondary-link">
          ← Retour à la connexion
        </NuxtLink>
      </div>

      <div class="tg-auth-panel tg-auth-panel--visual">
        <div class="tg-auth-visual-badge">Account recovery</div>

        <div class="tg-auth-visual-icon-wrap">
          <div class="tg-auth-visual-icon">🔐</div>
        </div>

        <h2 class="tg-auth-visual-title">Accès protégé, récupération simple</h2>

        <p class="tg-auth-visual-text">
          TrueGather vous permet de restaurer l’accès à votre espace en gardant
          une expérience claire, fluide et rassurante.
        </p>

        <div class="tg-auth-visual-points">
          <div class="tg-auth-visual-point">
            <span class="tg-auth-visual-point-dot" />
            <span>Lien sécurisé envoyé par email</span>
          </div>

          <div class="tg-auth-visual-point">
            <span class="tg-auth-visual-point-dot" />
            <span>Flow pensé pour une app SaaS moderne</span>
          </div>

          <div class="tg-auth-visual-point">
            <span class="tg-auth-visual-point-dot" />
            <span>Template frontend uniquement</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

definePageMeta({
  layout: 'auth'
})

const email = ref('')
const showSuccess = ref(false)
let successTimer: ReturnType<typeof setTimeout> | null = null

const handleSubmit = () => {
  if (!email.value) return

  showSuccess.value = true

  successTimer = setTimeout(() => {
    showSuccess.value = false
  }, 3500)
}

onBeforeUnmount(() => {
  if (successTimer !== null) {
    clearTimeout(successTimer)
  }
})
</script>