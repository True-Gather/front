<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">

      <div class="modal-header">
        <h2>Paramètres</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
          {{ tab.label }}
        </button>
      </div>

      <div class="modal-body">

        <!-- ── Profil ── -->
        <template v-if="activeTab === 'profil'">

          <!-- Photo de profil -->
          <div class="avatar-section">
            <div class="avatar-preview" @click="triggerFileInput">
              <img v-if="avatarDataUrl" :src="avatarDataUrl" alt="Photo de profil" class="avatar-img" />
              <span v-else class="avatar-initials">{{ initials }}</span>
              <div class="avatar-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
            </div>
            <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onAvatarChange" />
            <div class="avatar-info">
              <span class="avatar-hint">Cliquer pour changer la photo</span>
              <span class="avatar-hint-sub">JPG, PNG — max 2 Mo</span>
              <button v-if="avatarDataUrl" class="avatar-remove" @click.stop="removeAvatar">Supprimer</button>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Nom affiché -->
          <div class="form-group">
            <label>Prénom</label>
            <input v-model="form.first_name" type="text" placeholder="Votre prénom" />
          </div>
          <div class="form-group">
            <label>Nom</label>
            <input v-model="form.last_name" type="text" placeholder="Votre nom" />
          </div>

          <button class="btn-save" :disabled="saving" @click="saveProfile">
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </template>

        <!-- ── Sécurité ── -->
        <template v-if="activeTab === 'securite'">
          <p class="section-label">Changer le mot de passe</p>
          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <input v-model="pwForm.new_password" type="password" placeholder="••••••••" autocomplete="new-password" />
          </div>
          <div class="form-group">
            <label>Confirmer le nouveau mot de passe</label>
            <input v-model="pwForm.confirm" type="password" placeholder="••••••••" autocomplete="new-password" />
          </div>
          <p v-if="pwError" class="pw-error">{{ pwError }}</p>
          <p v-if="pwSuccess" class="pw-success">{{ pwSuccess }}</p>
          <button class="btn-save" :disabled="pwSaving" @click="changePassword">
            {{ pwSaving ? 'Modification…' : 'Modifier le mot de passe' }}
          </button>
        </template>

        <!-- ── Apparence ── -->
        <template v-if="activeTab === 'apparence'">
          <div class="theme-section">
            <p class="section-label">Thème de l'interface</p>
            <div class="theme-options">
              <button
                v-for="option in themeOptions"
                :key="option.value"
                class="theme-card"
                :class="{ active: theme === option.value }"
                @click="setTheme(option.value)"
              >
                <div class="theme-preview" :class="'preview-' + option.value">
                  <div class="preview-bar"></div>
                  <div class="preview-content">
                    <div class="preview-line"></div>
                    <div class="preview-line short"></div>
                  </div>
                </div>
                <span class="theme-label">{{ option.label }}</span>
                <svg v-if="theme === option.value" class="theme-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Se déconnecter</span>
              <span class="setting-desc">Fermer la session sur cet appareil</span>
            </div>
            <button class="btn-danger" @click="logout">Se déconnecter</button>
          </div>
        </template>

        <!-- ── Notifications ── -->
        <template v-if="activeTab === 'notifications'">
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Rappels de réunion</span>
              <span class="setting-desc">Recevoir une notification avant chaque réunion</span>
            </div>
            <div class="toggle" :class="{ active: prefs.meetingReminders }" @click="prefs.meetingReminders = !prefs.meetingReminders">
              <div class="toggle-circle"></div>
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Sons de notification</span>
              <span class="setting-desc">Jouer un son lors des alertes</span>
            </div>
            <div class="toggle" :class="{ active: prefs.notifSound }" @click="prefs.notifSound = !prefs.notifSound">
              <div class="toggle-circle"></div>
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Invitations aux réunions</span>
              <span class="setting-desc">Être notifié quand quelqu'un vous invite</span>
            </div>
            <div class="toggle" :class="{ active: prefs.meetingInvites }" @click="prefs.meetingInvites = !prefs.meetingInvites">
              <div class="toggle-circle"></div>
            </div>
          </div>
        </template>

        <!-- ── Réunions ── -->
        <template v-if="activeTab === 'reunions'">
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Micro coupé par défaut</span>
              <span class="setting-desc">Rejoindre les réunions avec le micro désactivé</span>
            </div>
            <div class="toggle" :class="{ active: prefs.mutedByDefault }" @click="prefs.mutedByDefault = !prefs.mutedByDefault">
              <div class="toggle-circle"></div>
            </div>
          </div>
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-title">Caméra coupée par défaut</span>
              <span class="setting-desc">Rejoindre les réunions avec la caméra désactivée</span>
            </div>
            <div class="toggle" :class="{ active: prefs.cameraOffByDefault }" @click="prefs.cameraOffByDefault = !prefs.cameraOffByDefault">
              <div class="toggle-circle"></div>
            </div>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useAvatar } from '~/composables/useAvatar'

const emit = defineEmits(['close'])

const { authUser, initials, logout } = useAuth()
const { avatarDataUrl, saveAvatar } = useAvatar()

type Theme = 'light' | 'dark' | 'system'
const themeOptions: { value: Theme; label: string }[] = [
  { value: 'light',  label: 'Clair' },
  { value: 'dark',   label: 'Sombre' },
  { value: 'system', label: 'Système' },
]
const theme = ref<Theme>('system')

function applyTheme(value: Theme) {
  if (value === 'system') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', value)
  }
  localStorage.setItem('tg-theme', value)
}

function setTheme(value: Theme) {
  theme.value = value
  applyTheme(value)
}

onMounted(() => {
  const saved = localStorage.getItem('tg-theme') as Theme | null
  if (saved) {
    theme.value = saved
    applyTheme(saved)
  }
})

const tabs = [
  { id: 'profil', label: 'Profil' },
  { id: 'apparence', label: 'Apparence' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'reunions', label: 'Réunions' },
  { id: 'securite', label: 'Sécurité' },
]
const activeTab = ref('profil')

// Profil
const fileInputRef = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const form = ref({
  first_name: authUser.value?.first_name ?? '',
  last_name: authUser.value?.last_name ?? '',
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('La photo ne doit pas dépasser 2 Mo.')
    return
  }
  const reader = new FileReader()
  reader.onload = (ev) => {
    saveAvatar(ev.target?.result as string)
  }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  saveAvatar(null)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function saveProfile() {
  saving.value = true
  // TODO: appel API PUT /api/v1/users/me
  await new Promise(r => setTimeout(r, 800))
  saving.value = false
}

// Préférences
const prefs = ref({
  meetingReminders: true,
  notifSound: true,
  meetingInvites: true,
  mutedByDefault: false,
  cameraOffByDefault: false,
})

// Changement de mot de passe
const pwForm = ref({ new_password: '', confirm: '' })
const pwSaving = ref(false)
const pwError = ref('')
const pwSuccess = ref('')

async function changePassword() {
  pwError.value = ''
  pwSuccess.value = ''

  if (pwForm.value.new_password.length < 14) {
    pwError.value = 'Le nouveau mot de passe doit contenir au moins 14 caractères.'
    return
  }
  if (pwForm.value.new_password !== pwForm.value.confirm) {
    pwError.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  pwSaving.value = true
  try {
    const runtimeConfig = useRuntimeConfig()
    const backendBaseUrl = runtimeConfig.public.backendBaseUrl || 'http://localhost:8082'
    await $fetch(`${backendBaseUrl}/api/v1/auth/password`, {
      method: 'PUT',
      credentials: 'include',
      body: {
        new_password: pwForm.value.new_password,
        confirm_password: pwForm.value.confirm,
      },
    })
    pwSuccess.value = 'Mot de passe modifié avec succès. Un email de confirmation vous a été envoyé.'
    pwForm.value = { new_password: '', confirm: '' }
  } catch (e: any) {
    const raw: string = e?.data?.message || 'Erreur lors du changement de mot de passe.'
    // Supprimer les préfixes techniques ajoutés par le backend ("Bad request: ", etc.)
    pwError.value = raw.replace(/^(Bad request|Upstream error|Internal server error|Validation error):\s*/i, '')
  } finally {
    pwSaving.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-container {
  background: var(--bg-card);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
}

.modal-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 6px;
}
.close-btn:hover { background: var(--item-hover); }

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  padding: 16px 24px 0;
  border-bottom: 1px solid var(--border-color);
}

.tab-btn {
  background: none;
  border: none;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  border-radius: 6px 6px 0 0;
  transition: all 0.15s;
}
.tab-btn:hover { color: #14b8a6; }
.tab-btn.active {
  color: #14b8a6;
  border-bottom-color: #14b8a6;
  font-weight: 600;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Avatar */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: white;
  font-size: 22px;
  font-weight: 800;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.avatar-preview:hover .avatar-overlay { opacity: 1; }

.avatar-hint {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}
.avatar-hint-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.avatar-remove {
  background: none;
  border: none;
  font-size: 12px;
  color: #ef4444;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}
.avatar-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}

/* Form */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-group input {
  padding: 10px 14px;
  border: 1.5px solid var(--input-border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--input-bg);
  outline: none;
  transition: border-color 0.15s;
}
.form-group input:focus { border-color: #14b8a6; }
.input-disabled {
  background: var(--item-hover) !important;
  color: var(--text-muted) !important;
  cursor: not-allowed;
}

.field-note {
  font-size: 12px;
  color: #9ca3af;
}

.pw-error {
  font-size: 13px;
  color: #dc2626;
  margin: 0;
}

.pw-success {
  font-size: 13px;
  color: #16a34a;
  margin: 0;
}

.btn-save {
  margin-top: 4px;
  padding: 11px 20px;
  background: linear-gradient(135deg, var(--accent-from), var(--accent-to));
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-save:not(:disabled):hover { opacity: 0.9; }

/* Sécurité */
.info-block {
  display: flex;
  gap: 12px;
  background: var(--accent-light-bg);
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
}
.info-block svg { flex-shrink: 0; margin-top: 2px; }

.btn-danger {
  padding: 8px 16px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-danger:hover { background: #fecaca; }

/* Settings rows */
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}
.setting-row:last-child { border-bottom: none; }

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.setting-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 12px;
  color: #9ca3af;
}

/* Toggle */
.toggle {
  width: 44px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 999px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle.active { background: var(--accent-from); }

.toggle-circle {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.toggle.active .toggle-circle { transform: translateX(20px); }

/* Thème */
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.theme-options {
  display: flex;
  gap: 12px;
}

.theme-card {
  flex: 1;
  border: 2px solid var(--input-border);
  border-radius: 12px;
  padding: 10px 6px;
  background: var(--bg-card);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
  position: relative;
}
.theme-card:hover { border-color: var(--accent-border); }
.theme-card.active { border-color: var(--accent-text); background: var(--accent-light-bg); }

.theme-preview {
  width: 100%;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-light  { background: #f9fafb; }
.preview-dark   { background: #1f2937; }
.preview-system { background: linear-gradient(135deg, #f9fafb 50%, #1f2937 50%); }

/* Barre accent toujours teal pour rester cohérent avec le logo */
.preview-bar { height: 12px; background: rgba(20, 184, 166, 0.4); }

.preview-line { height: 4px; border-radius: 2px; background: #d1d5db; }
.preview-dark .preview-line { background: #4b5563; }
.preview-line.short { width: 60%; }

.preview-content {
  flex: 1;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-line {
  height: 4px;
  border-radius: 2px;
  background: #d1d5db;
}
.preview-dark   .preview-line { background: #4b5563; }
.preview-minuit .preview-line { background: #2d2560; }
.preview-foret  .preview-line { background: #166534; }
.preview-line.short { width: 60%; }

.theme-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.theme-check { color: var(--accent-text); }

.theme-check {
  position: absolute;
  top: 6px;
  right: 6px;
}
</style>
