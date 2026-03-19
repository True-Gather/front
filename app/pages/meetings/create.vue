<template>
  <section class="create-meeting-page">
    <div class="tg-page-hero">
      <div class="tg-page-hero-copy">
        <span class="tg-page-chip">Visioconférence</span>
        <h2>Préparez votre prochaine réunion</h2>
        <p>
          Donnez un nom à votre meeting, ajoutez les participants et lancez
          votre salle en quelques secondes.
        </p>
      </div>
    </div>

    <div class="tg-create-grid single-column">
      <div class="tg-card tg-form-card">
        <div class="tg-section-head">
          <div>
            <h3>Détails du meeting</h3>
            <p>
              Configurez rapidement votre réunion avant le passage à l’interface visio.
            </p>
          </div>
          <span class="tg-status-pill">Brouillon</span>
        </div>

        <form class="tg-meeting-form" @submit.prevent="startMeeting">
          <div class="tg-field">
            <label for="meeting-name">Nom du meeting</label>
            <input
              id="meeting-name"
              v-model="meetingName"
              type="text"
              placeholder="Ex. Sprint planning – équipe produit"
            />
          </div>

          <div class="tg-field">
            <label for="participants">Emails des participants</label>
            <textarea
              id="participants"
              v-model="participants"
              rows="5"
              placeholder="alice@truegather.io, bob@truegather.io, claire@truegather.io"
            />
            <p class="tg-field-help">
              Séparez les emails par une virgule ou un retour à la ligne.
            </p>
          </div>

          <div class="tg-preview-chips">
            <span
              v-for="person in parsedParticipants"
              :key="person.email"
              class="tg-participant-chip"
            >
              <span class="tg-participant-avatar">{{ person.initials }}</span>
              <span class="tg-participant-text">
                <strong>{{ person.displayName }}</strong>
                <small>{{ person.email }}</small>
              </span>
            </span>
          </div>

          <div class="tg-form-actions">
            <button class="tg-secondary-btn" type="button">
              Enregistrer comme brouillon
            </button>

            <button class="tg-primary-btn" type="submit">
              Démarrer une réunion
            </button>
          </div>

          <transition name="tg-fade-up">
            <div v-if="showFeedback" class="tg-inline-feedback">
              Réunion prête à être lancée. Cette action est simulée pour le template.
            </div>
          </transition>
        </form>
      </div>

      <aside class="tg-side-stack">
        <div class="tg-card tg-summary-card">
          <div class="tg-section-head tight">
            <div>
              <h3>Résumé rapide</h3>
              <p>Vue compacte de ce qui sera créé</p>
            </div>
          </div>

          <div class="tg-summary-list">
            <div class="tg-summary-item">
              <span class="tg-summary-label">Meeting</span>
              <strong>{{ meetingName || 'Nouveau meeting TrueGather' }}</strong>
            </div>

            <div class="tg-summary-item">
              <span class="tg-summary-label">Participants</span>
              <strong>{{ participantCount }} invité(s)</strong>
            </div>

            <div class="tg-summary-item">
              <span class="tg-summary-label">Mode suivant</span>
              <strong>Pré-room visio</strong>
            </div>

            <div class="tg-summary-item">
              <span class="tg-summary-label">Assistant</span>
              <strong>Disponible</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const meetingName = ref('Kickoff produit – TrueGather')
const participants = ref(
  'alice@truegather.io, mathis@truegather.io, lea@truegather.io'
)
const showFeedback = ref(false)
let feedbackTimer: ReturnType<typeof setTimeout> | null = null

const parsedParticipants = computed(() => {
  return participants.value
    .split(/[\n,]+/)
    .map(item => item.trim())
    .filter(item => item.includes('@'))
    .map(email => {
      const localPart = email.split('@')[0] ?? ''
      const parts = localPart.split(/[._-]/)
      const initials = parts
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase() ?? '')
        .join('')
      const displayName = parts
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ')
      return { email, initials, displayName }
    })
})

const participantCount = computed(() => parsedParticipants.value.length)

const startMeeting = () => {
  showFeedback.value = true

  feedbackTimer = setTimeout(() => {
    showFeedback.value = false
  }, 2500)
}

onBeforeUnmount(() => {
  if (feedbackTimer !== null) {
    clearTimeout(feedbackTimer)
  }
})
</script>