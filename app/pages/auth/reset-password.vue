<template>
  <section class="tg-reset-page">
    <div class="tg-auth-brand">
      <div class="tg-auth-brand-icon">T</div>
      <div class="tg-auth-brand-copy">
        <span class="tg-auth-brand-name">TrueGather</span>
        <span class="tg-auth-brand-subtitle">Secure collaboration workspace</span>
      </div>
    </div>

    <div class="tg-auth-shell">
      <div class="tg-auth-panel tg-auth-panel--content">
        <span class="tg-auth-chip">Réinitialisation sécurisée</span>

        <h1 class="tg-auth-title">Créer un nouveau mot de passe</h1>

        <p class="tg-auth-description">
          Définissez un nouveau mot de passe pour retrouver l’accès à votre espace
          TrueGather. Ce template simule uniquement le rendu frontend.
        </p>

        <form class="tg-auth-form" @submit.prevent="handleSubmit">
          <div class="tg-auth-field">
            <label for="new-password">Nouveau mot de passe</label>

            <div class="tg-auth-input-wrap tg-auth-input-wrap--password">
              <span class="tg-auth-input-icon" aria-hidden="true">🔒</span>
              <input
                id="new-password"
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Entrez votre nouveau mot de passe"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="tg-password-toggle"
                aria-label="Afficher ou masquer le mot de passe"
                @click="showNewPassword = !showNewPassword"
              >
                {{ showNewPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="tg-auth-field">
            <label for="confirm-password">Confirmer le mot de passe</label>

            <div class="tg-auth-input-wrap tg-auth-input-wrap--password">
              <span class="tg-auth-input-icon" aria-hidden="true">🔐</span>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Retapez votre mot de passe"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="tg-password-toggle"
                aria-label="Afficher ou masquer le mot de passe"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <transition name="tg-fade-up">
            <div
              v-if="passwordState !== 'idle'"
              class="tg-auth-feedback"
              :class="{
                'tg-auth-feedback--success': passwordState === 'match',
                'tg-auth-feedback--error': passwordState === 'mismatch'
              }"
            >
              {{
                passwordState === 'match'
                  ? 'Les deux mots de passe correspondent.'
                  : 'Les mots de passe ne correspondent pas encore.'
              }}
            </div>
          </transition>

          <button class="tg-auth-primary-btn" type="submit">
            Confirmer
          </button>

          <transition name="tg-fade-up">
            <div v-if="showSuccess" class="tg-auth-success">
              Votre nouveau mot de passe a bien été pris en compte côté interface.
              La logique backend sera branchée plus tard.
            </div>
          </transition>
        </form>

        <NuxtLink to="/login" class="tg-auth-secondary-link">
          ← Retour à la connexion
        </NuxtLink>
      </div>

      <div class="tg-auth-panel tg-auth-panel--visual">
        <div class="tg-auth-visual-badge">Password update</div>

        <div class="tg-auth-visual-icon-wrap">
          <div class="tg-auth-visual-icon">🛡️</div>
        </div>

        <h2 class="tg-auth-visual-title">Un accès remis à neuf</h2>

        <p class="tg-auth-visual-text">
          Mettez à jour votre mot de passe avec une expérience claire, rassurante
          et alignée avec l’univers premium de TrueGather.
        </p>

        <div class="tg-auth-visual-points">
          <div class="tg-auth-visual-point">
            <span class="tg-auth-visual-point-dot" />
            <span>Confirmation visuelle instantanée</span>
          </div>

          <div class="tg-auth-visual-point">
            <span class="tg-auth-visual-point-dot" />
            <span>UI auth cohérente avec le reste du produit</span>
          </div>

          <div class="tg-auth-visual-point">
            <span class="tg-auth-visual-point-dot" />
            <span>Template frontend prêt à brancher</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

definePageMeta({
  layout: 'auth'
})

const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const showSuccess = ref(false)
let successTimer: ReturnType<typeof setTimeout> | null = null

const passwordState = computed<'idle' | 'match' | 'mismatch'>(() => {
  if (!newPassword.value && !confirmPassword.value) {
    return 'idle'
  }

  if (!newPassword.value || !confirmPassword.value) {
    return 'mismatch'
  }

  return newPassword.value === confirmPassword.value ? 'match' : 'mismatch'
})

const handleSubmit = () => {
  if (newPassword.value && confirmPassword.value && newPassword.value === confirmPassword.value) {
    showSuccess.value = true

    successTimer = setTimeout(() => {
      showSuccess.value = false
    }, 3500)
    return
  }

  showSuccess.value = false
}

onBeforeUnmount(() => {
  if (successTimer !== null) {
    clearTimeout(successTimer)
  }
})
</script>