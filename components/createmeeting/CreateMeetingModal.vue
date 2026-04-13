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

      <!-- Body -->
      <div class="modal-body">

        <!-- Inviter par mail -->
        <div class="field">
          <label>Inviter par email</label>
          <div class="email-input-row">
            <input
              v-model="emailInput"
              type="email"
              placeholder="exemple@email.com"
              @keyup.enter="addEmail"
            />
            <button class="add-btn" @click="addEmail">+</button>
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
          <select v-model="selectedGroup">
            <option value="">-- Aucun groupe --</option>
            <option value="equipe-dev">Équipe Dev</option>
            <option value="equipe-design">Équipe Design</option>
            <option value="direction">Direction</option>
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

      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">Annuler</button>
        <button class="start-btn" @click="startMeeting">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 8-6 4 6 4V8Z"></path>
            <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
          </svg>
          Démarrer l'appel
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close'])

const emailInput = ref('')
const emails = ref([])
const selectedGroup = ref('')
const useAI = ref(true)
const micOn = ref(true)
const camOn = ref(true)

function addEmail() {
  const val = emailInput.value.trim()
  if (val && !emails.value.includes(val)) {
    emails.value.push(val)
  }
  emailInput.value = ''
}

function removeEmail(i) {
  emails.value.splice(i, 1)
}

function startMeeting() {
  console.log({
    emails: emails.value,
    group: selectedGroup.value,
    useAI: useAI.value,
    mic: micOn.value,
    cam: camOn.value
  })
  emit('close')
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

/* Header */
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

/* Body */
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
}

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

/* Toggles */
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

/* Footer */
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

.start-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.5);
}
</style>
