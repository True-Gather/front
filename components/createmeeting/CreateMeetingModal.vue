<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">

      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title">
          <div class="modal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 8-6 4 6 4V8Z"></path>
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
            </svg>
          </div>
          <h2>Créer un meeting</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">✖</button>
      </div>

      <!-- Success state -->
      <div v-if="meetingLink" class="modal-body success-body">
        <div class="success-icon">✓</div>
        <p class="success-title">Réunion créée !</p>
        <p class="success-subtitle">Partagez ce lien avec vos participants</p>
        <div class="link-box">
          <span class="link-text">{{ meetingLink }}</span>
          <button class="copy-btn" @click="copyLink">{{ copied ? 'Copié !' : 'Copier' }}</button>
        </div>
        <div class="room-code">Code : <strong>{{ roomCode }}</strong></div>
        <button class="start-btn full-width" @click="$emit('close')">Fermer</button>
      </div>

      <!-- Form state -->
      <template v-else>
        <div class="modal-body">

          <!-- Titre -->
          <div class="field">
            <label>Titre de la réunion</label>
            <input v-model="title" type="text" placeholder="Ex: Réunion d'équipe" />
          </div>

          <!-- Inviter par mail -->
          <div class="field">
            <label>Inviter des participants</label>
            <div class="search-wrapper">
              <input
                v-model="emailInput"
                type="text"
                placeholder="Rechercher par nom ou email..."
                @input="onSearchInput"
                @keyup.enter="addEmail"
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
            <div class="tags" v-if="emails.length">
              <span class="tag" v-for="(email, i) in emails" :key="i">
                {{ email }}
                <span class="tag-remove" @click="removeEmail(i)">×</span>
              </span>
            </div>
          </div>

          <!-- Inviter un groupe -->
          <div class="field">
            <label>Inviter un groupe</label>
            <select v-model="selectedGroupId">
              <option value="">-- Aucun groupe --</option>
              <option v-for="g in groups" :key="g.group_id" :value="g.group_id">
                {{ g.name }}
              </option>
            </select>
          </div>

          <!-- Toggle IA -->
          <div class="field toggle-row">
            <div class="toggle-info">
              <span class="toggle-label">Assistant IA</span>
              <span class="toggle-desc">Transcription et résumé automatique</span>
            </div>
            <div class="toggle" :class="{ active: useAI }" @click="useAI = !useAI">
              <div class="toggle-thumb"></div>
            </div>
          </div>

          <!-- Toggle Micro -->
          <div class="field toggle-row">
            <div class="toggle-info">
              <div class="toggle-label-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
                <span class="toggle-label">Microphone</span>
              </div>
              <span class="toggle-desc">Activer le micro au démarrage</span>
            </div>
            <div class="toggle" :class="{ active: micOn }" @click="micOn = !micOn">
              <div class="toggle-thumb"></div>
            </div>
          </div>

          <!-- Toggle Caméra -->
          <div class="field toggle-row">
            <div class="toggle-info">
              <div class="toggle-label-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m22 8-6 4 6 4V8Z"></path>
                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
                </svg>
                <span class="toggle-label">Caméra</span>
              </div>
              <span class="toggle-desc">Activer la caméra au démarrage</span>
            </div>
            <div class="toggle" :class="{ active: camOn }" @click="camOn = !camOn">
              <div class="toggle-thumb"></div>
            </div>
          </div>

          <!-- Erreur -->
          <p v-if="error" class="error-msg">{{ error }}</p>

        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="cancel-btn" @click="$emit('close')">Annuler</button>
          <button class="start-btn" :disabled="loading" @click="startMeeting">
            <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 8-6 4 6 4V8Z"></path>
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
            </svg>
            {{ loading ? 'Création...' : 'Démarrer l\'appel' }}
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const runtimeConfig = useRuntimeConfig()
const backendBaseUrl = computed(() => runtimeConfig.public.backendBaseUrl || 'http://localhost:8080')

const emit = defineEmits(['close'])

const emailInput = ref('')
const emails = ref([])
const selectedGroupId = ref('')
const useAI = ref(true)
const micOn = ref(true)
const camOn = ref(true)
const title = ref('')
const groups = ref([])
const loading = ref(false)
const error = ref('')
const meetingLink = ref('')
const roomCode = ref('')
const copied = ref(false)

const suggestions = ref([])
const searchLoading = ref(false)
const showSuggestions = ref(false)
let searchTimeout = null

onMounted(async () => {
  const defaultDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  title.value = `Réunion du ${defaultDate}`

  try {
    const res = await fetch('/api/v1/groups')
    if (res.ok) {
      const data = await res.json()
      groups.value = data.groups ?? data
    }
  } catch {}
})

function onSearchInput() {
  clearTimeout(searchTimeout)
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

function selectUser(u) {
  if (!emails.value.includes(u.email)) {
    emails.value.push(u.email)
  }
  emailInput.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

function hideSuggestionsDelayed() {
  setTimeout(() => { showSuggestions.value = false }, 150)
}

function userInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function addEmail() {
  const val = emailInput.value.trim()
  if (val && !emails.value.includes(val)) {
    emails.value.push(val)
  }
  emailInput.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

function removeEmail(i) {
  emails.value.splice(i, 1)
}

async function startMeeting() {
  error.value = ''
  if (!title.value.trim()) {
    error.value = 'Le titre est requis.'
    return
  }

  loading.value = true
  try {
    const body = {
      title: title.value.trim(),
      participant_emails: emails.value,
      group_id: selectedGroupId.value || null,
      ai_enabled: useAI.value,
      microphone_enabled: micOn.value,
      camera_enabled: camOn.value,
    }

    const res = await fetch('/api/v1/meetings/instant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      error.value = data.message || 'Impossible de créer la réunion.'
      return
    }

    const data = await res.json()
    meetingLink.value = data.meeting_link
    roomCode.value = data.room_code
  } catch {
    error.value = 'Erreur réseau. Réessayez.'
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(meetingLink.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 480px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.modal-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

input[type="text"],
input[type="email"],
select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
  background: white;
  box-sizing: border-box;
}

input[type="text"]:focus,
input[type="email"]:focus,
select:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.email-input-row {
  display: flex;
  gap: 8px;
}

.email-input-row input {
  flex: 1;
}

.add-btn {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  border-radius: 10px;
  width: 40px;
  font-size: 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.add-btn:hover {
  opacity: 0.85;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #ccfbf1;
  color: #0f766e;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag-remove {
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  color: #0f766e;
}

.tag-remove:hover {
  color: #ef4444;
}

.toggle-row {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
  border-radius: 12px;
  padding: 14px 16px;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.toggle-desc {
  font-size: 12px;
  color: #6b7280;
}

.toggle {
  width: 48px;
  height: 26px;
  background: #d1d5db;
  border-radius: 20px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
  flex-shrink: 0;
}

.toggle.active {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: left 0.3s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.toggle.active .toggle-thumb {
  left: 25px;
}

.error-msg {
  color: #ef4444;
  font-size: 13px;
  margin: 0;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cancel-btn {
  background: none;
  border: 1px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f3f4f6;
}

.start-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.5);
}

.full-width {
  width: 100%;
  justify-content: center;
}

/* Success */
.success-body {
  align-items: center;
  text-align: center;
  padding: 40px 24px;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
}

.success-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px;
}

.success-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px;
}

.link-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 10px 14px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 12px;
}

.link-text {
  flex: 1;
  font-size: 13px;
  color: #374151;
  word-break: break-all;
  text-align: left;
}

.copy-btn {
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.room-code {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
}

.search-wrapper {
  position: relative;
}

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

.suggestion-item:hover {
  background: #f0fdf4;
}

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

.suggestion-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

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
</style>
