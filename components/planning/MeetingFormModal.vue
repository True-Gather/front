<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="form-modal">

      <!-- Header -->
      <div class="form-header">
        <h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
          Planifier un meeting
        </h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Alerte conflit hôte -->
      <div v-if="hostConflictMsg" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {{ hostConflictMsg }}
      </div>

      <!-- Alerte conflits participants -->
      <div v-if="participantConflicts.length" class="alert alert-warning">
        <div class="conflict-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <strong>Conflits d'agenda détectés</strong>
        </div>
        <div class="conflict-list">
          <div v-for="c in participantConflicts" :key="c.email" class="conflict-item">
            <span class="conflict-email">{{ c.display_name || c.email }}</span>
            a déjà <em>{{ c.conflicting_meeting_title }}</em>
            de {{ formatTime(c.conflicting_start) }} à {{ formatTime(c.conflicting_end) }}
          </div>
        </div>
        <div class="conflict-actions">
          <button class="btn-force" @click="submitForce">Planifier quand même</button>
          <button class="btn-cancel-small" @click="clearConflicts">Modifier l'heure</button>
        </div>
      </div>

      <!-- Corps du formulaire -->
      <div class="form-body">

        <!-- Badge date -->
        <div class="form-date-badge"> {{ formattedDate }}</div>

        <!-- Titre -->
        <div class="form-group">
          <label>Titre du meeting</label>
          <input v-model="form.title" type="text" placeholder="Ex : Sprint Review Q2" class="form-input" />
        </div>

        <!-- Horaires -->
        <div class="form-row">
          <div class="form-group">
            <label>Début</label>
            <select v-model="form.start" class="form-select">
              <option v-for="s in timeSlots" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Fin</label>
            <select v-model="form.end" class="form-select" :disabled="!form.start">
              <option v-for="s in timeSlotsAfterStart" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <!-- Participants par email -->
        <div class="form-group">
          <label>Inviter des participants</label>
          <div class="search-wrapper">
            <input
              v-model="emailInput"
              type="text"
              placeholder="Rechercher par nom ou email..."
              class="form-input"
              @input="onSearchInput"
              @keydown.enter.prevent="addEmail"
              @blur="hideSuggestionsDelayed"
            />
            <div v-if="showSuggestions" class="suggestions">
              <div v-if="searchLoading" class="suggestion-empty">Recherche...</div>
              <template v-else-if="suggestions.length">
                <div
                  v-for="u in suggestions"
                  :key="u.keycloak_id"
                  class="suggestion-item"
                  @mousedown.prevent="selectUser(u)"
                >
                  <div class="suggestion-avatar">{{ userInitials(u.display_name) }}</div>
                  <div class="suggestion-info">
                    <div class="suggestion-name">{{ u.display_name }}</div>
                    <div class="suggestion-email">{{ u.email }}</div>
                  </div>
                </div>
              </template>
              <div v-else class="suggestion-empty">Aucun utilisateur TrueGather trouvé.</div>
            </div>
          </div>
          <div v-if="form.participant_emails.length" class="chips">
            <span
              v-for="(e, i) in form.participant_emails"
              :key="i"
              class="chip"
            >
              {{ e }}
              <button @click="removeEmail(i)">×</button>
            </span>
          </div>
        </div>

        <!-- Groupes -->
        <div class="form-group">
          <label>Inviter un groupe</label>
          <div v-if="availableGroups.length" class="groups-selector">
            <button
              v-for="g in availableGroups"
              :key="g.group_id"
              class="group-btn"
              :class="{ selected: form.group_ids.includes(g.group_id) }"
              @click="toggleGroup(g.group_id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              {{ g.name }}
              <span class="group-count">{{ g.member_count }}</span>
            </button>
          </div>
          <p v-else class="no-groups">Aucun groupe disponible.</p>
        </div>

        <!-- IA -->
        <div class="form-group ia-row">
          <div class="ia-info">
            <span class="ia-label">Présence IA</span>
            <span class="ia-desc">L'IA prendra des notes et générera un résumé</span>
          </div>
          <button
            class="toggle-btn"
            :class="{ active: form.ai_enabled }"
            @click="form.ai_enabled = !form.ai_enabled"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>

      </div>

      <!-- Footer -->
      <div class="form-footer">
        <button class="btn-cancel" @click="$emit('close')">Annuler</button>
        <button
          class="btn-create"
          :disabled="!form.start || !form.end || submitting"
          @click="submit"
        >
          <span v-if="submitting">Planification…</span>
          <span v-else>Planifier le meeting</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMeetings, type ParticipantConflict } from '~/composables/useMeetings'

const props = defineProps<{
  selectedDate: string
  selectedHour?: string
}>()

const emit = defineEmits(['close', 'created'])

const { createMeeting } = useMeetings()

const runtimeConfig = useRuntimeConfig()
const backendBaseUrl = computed(() => runtimeConfig.public.backendBaseUrl || 'http://localhost:8080')

// ── Date affichée ─────────────────────────────────────────────────────────────
const formattedDate = computed(() => {
  if (!props.selectedDate) return ''
  const [y, m, d] = props.selectedDate.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
})

// ── Créneaux 5 min ────────────────────────────────────────────────────────────
const timeSlots = computed(() => {
  const slots: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    }
  }
  return slots
})

const timeSlotsAfterStart = computed(() =>
  form.value.start
    ? timeSlots.value.filter(s => s > form.value.start)
    : timeSlots.value
)

// ── Formulaire ────────────────────────────────────────────────────────────────
const form = ref({
  title: '',
  start: props.selectedHour || '',
  end: '',
  participant_emails: [] as string[],
  group_ids: [] as string[],
  ai_enabled: false,
})

const emailInput = ref('')
const submitting = ref(false)
const hostConflictMsg = ref<string | null>(null)
const participantConflicts = ref<ParticipantConflict[]>([])

const suggestions = ref<any[]>([])
const searchLoading = ref(false)
const showSuggestions = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// ── Emails ────────────────────────────────────────────────────────────────────
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  const q = emailInput.value.trim()
  if (q.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  showSuggestions.value = true
  searchLoading.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`${backendBaseUrl.value}/api/v1/users/search?q=${encodeURIComponent(q)}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        suggestions.value = data.users ?? data
      }
    } catch {}
    searchLoading.value = false
  }, 250)
}

function selectUser(u: any) {
  if (!form.value.participant_emails.includes(u.email)) {
    form.value.participant_emails.push(u.email)
  }
  emailInput.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

function hideSuggestionsDelayed() {
  setTimeout(() => { showSuggestions.value = false }, 150)
}

function userInitials(name: string) {
  if (!name) return '?'
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
}

function addEmail() {
  const val = emailInput.value.trim()
  if (val && !form.value.participant_emails.includes(val)) {
    form.value.participant_emails.push(val)
  }
  emailInput.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

function removeEmail(index: number) {
  form.value.participant_emails.splice(index, 1)
}

// ── Groupes ───────────────────────────────────────────────────────────────────
const availableGroups = ref<any[]>([])

onMounted(async () => {
  try {
    const res = await fetch('/api/v1/groups', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      availableGroups.value = data.groups ?? data
    }
  } catch {}
})

function toggleGroup(id: string) {
  const idx = form.value.group_ids.indexOf(id)
  if (idx === -1) form.value.group_ids.push(id)
  else form.value.group_ids.splice(idx, 1)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function clearConflicts() {
  participantConflicts.value = []
  hostConflictMsg.value = null
}

// ── Payload ───────────────────────────────────────────────────────────────────
function buildPayload() {
  return {
    title: form.value.title || `Meeting ${props.selectedDate}`,
    date: props.selectedDate,
    start: form.value.start,
    end: form.value.end,
    participant_emails: form.value.participant_emails,
    group_ids: form.value.group_ids,
    ai_enabled: form.value.ai_enabled,
  }
}

// ── Submit normal ─────────────────────────────────────────────────────────────
async function submit() {
  clearConflicts()
  submitting.value = true
  const result = await createMeeting(buildPayload())
  submitting.value = false

  if (result.success) {
    emit('created', result.meeting)
    emit('close')
    return
  }

  // Conflits participants → afficher dans l'UI
  if ('conflict' in result && result.conflict) {
    participantConflicts.value = result.conflict.conflicts
    return
  }

  // Autre erreur (ex: hôte en conflit)
  if ('error' in result) {
    hostConflictMsg.value = result.error ?? 'Erreur inconnue'
  }
}

// ── Submit forcé (ignorer les conflits participants) ──────────────────────────
// On passe un flag pour que le back ignore la vérification côté participants
// Ici on simule en ajoutant un header custom, à adapter selon votre back
async function submitForce() {
  clearConflicts()
  submitting.value = true
  // Retire les participants en conflit pour forcer la création
  // Alternative : ajouter ?force=true à l'URL et gérer côté back
  const conflictEmails = participantConflicts.value.map(c => c.email)
  const cleanedEmails = form.value.participant_emails.filter(e => !conflictEmails.includes(e))
  const originalEmails = form.value.participant_emails
  form.value.participant_emails = cleanedEmails

  const result = await createMeeting(buildPayload())
  form.value.participant_emails = originalEmails
  submitting.value = false

  if (result.success) {
    emit('created', result.meeting)
    emit('close')
  } else if ('error' in result) {
hostConflictMsg.value = String(result.error ?? 'Erreur inconnue')  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.form-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0,0,0,0.25);
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  gap: 12px;
}

.form-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}
.close-btn:hover { background: #f3f4f6; }

/* Alertes */
.alert {
  margin: 0 16px;
  margin-top: 12px;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
}
.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
}
.alert-warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}
.conflict-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}
.conflict-item {
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(251,191,36,0.15);
  border-radius: 6px;
}
.conflict-email { font-weight: 600; }
.conflict-actions {
  display: flex;
  gap: 8px;
}
.btn-force {
  padding: 6px 14px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}
.btn-cancel-small {
  padding: 6px 14px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}

/* Corps */
.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-date-badge {
  background: linear-gradient(135deg, #f0fdfa, #cffafe);
  border: 1px solid #99f6e4;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #0d9488;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }

.form-input {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
}
.form-input:focus { border-color: #14b8a6; }

.form-select {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* Search wrapper / autocomplete */
.search-wrapper { position: relative; }

.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
  max-height: 220px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.suggestion-item:hover { background: #f0fdf4; }

.suggestion-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggestion-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.suggestion-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.suggestion-email {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.suggestion-empty {
  padding: 12px 14px;
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}

.no-groups { font-size: 13px; color: #9ca3af; margin: 0; }

/* Email chips */
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 20px;
  font-size: 12px;
  color: #0d9488;
}
.chip button {
  background: none;
  border: none;
  cursor: pointer;
  color: #0d9488;
  font-size: 14px;
  padding: 0;
  line-height: 1;
}

/* Groupes */
.groups-selector { display: flex; flex-wrap: wrap; gap: 8px; }
.group-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.group-btn.selected {
  background: linear-gradient(135deg, #f0fdfa, #cffafe);
  border-color: #14b8a6;
  color: #0d9488;
  font-weight: 600;
}
.group-count {
  background: #e5e7eb;
  border-radius: 20px;
  padding: 1px 6px;
  font-size: 11px;
}
.group-btn.selected .group-count { background: #99f6e4; }

/* IA toggle */
.ia-row { flex-direction: row; align-items: center; justify-content: space-between; }
.ia-info { display: flex; flex-direction: column; gap: 2px; }
.ia-label { font-size: 14px; font-weight: 600; color: #374151; }
.ia-desc { font-size: 12px; color: #9ca3af; }

.toggle-btn {
  width: 44px; height: 24px;
  border-radius: 12px;
  border: none;
  background: #e5e7eb;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-btn.active { background: linear-gradient(135deg, #14b8a6, #0891b2); }
.toggle-knob {
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-btn.active .toggle-knob { transform: translateX(20px); }

/* Footer */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
}
.btn-cancel:hover { background: #f9fafb; }

.btn-create {
  padding: 10px 24px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.btn-create:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-create:not(:disabled):hover { opacity: 0.9; }
</style>