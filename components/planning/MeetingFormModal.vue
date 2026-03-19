<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="form-modal">

      <div class="form-header">
        <h3>Nouveau meeting</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="form-body">

        <!-- Date affichée -->
        <div class="form-date-badge">
          📅 {{ formattedDate }}
        </div>

        <!-- Début -->
        <div class="form-group">
          <label>Début du meeting</label>
          <select v-model="form.start">
            <option value="" disabled>Choisir un créneau</option>
            <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
          </select>
        </div>

        <!-- Fin -->
        <div class="form-group">
          <label>Fin du meeting</label>
          <select v-model="form.end">
            <option value="" disabled>Choisir un créneau</option>
            <option v-for="slot in timeSlotsAfterStart" :key="slot" :value="slot">{{ slot }}</option>
          </select>
        </div>

        <!-- Emails invités -->
        <div class="form-group">
          <label>Qui sera dans le meeting ?</label>
          <div class="email-input-row">
            <input
              v-model="emailInput"
              type="email"
              placeholder="Ajouter un email..."
              @keyup.enter="addEmail"
            />
            <button class="add-btn" @click="addEmail">+</button>
          </div>
          <div class="tags">
            <span v-for="(email, i) in form.participants" :key="i" class="tag">
              {{ email }}
              <button @click="form.participants.splice(i, 1)">✕</button>
            </span>
          </div>
        </div>

        <!-- Inviter un groupe -->
        <div class="form-group">
          <label>Inviter un groupe</label>
          <button class="groups-toggle" @click="groupsOpen = !groupsOpen">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Sélectionner un groupe
          </button>

          <div v-if="groupsOpen" class="groups-list">
            <div
              v-for="group in availableGroups"
              :key="group.id"
              class="group-item"
              :class="{ selected: form.groupIds.includes(group.id) }"
              @click="toggleGroup(group)"
            >
              <span class="group-avatar">{{ group.name[0] }}</span>
              <div>
                <div class="group-name">{{ group.name }}</div>
                <div class="group-count">{{ group.memberCount }} membres</div>
              </div>
              <svg v-if="form.groupIds.includes(group.id)"
                xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="#14b8a6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>

        <!-- IA Toggle -->
        <div class="form-group ia-group">
          <div class="ia-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10"></path>
              <path d="M12 8v4l3 3"></path>
            </svg>
            <div>
              <div class="ia-title">Présence IA</div>
              <div class="ia-desc">L'IA rejoindra et assistera le meeting</div>
            </div>
          </div>
          <button
            class="toggle-btn"
            :class="{ active: form.iaEnabled }"
            @click="form.iaEnabled = !form.iaEnabled"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>

      </div>

      <!-- Actions -->
      <div class="form-footer">
        <button class="btn-cancel" @click="$emit('close')">Annuler</button>
        <button class="btn-create" @click="submit" :disabled="!form.start || !form.end">
          Planifier le meeting
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selectedDate: String,
  selectedHour: String
})

const emit = defineEmits(['close', 'created'])

// ── Date affichée ──────────────────────────────────────────
const formattedDate = computed(() => {
  if (!props.selectedDate) return ''
  return new Date(props.selectedDate).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
})

// ── Créneaux 5 min ─────────────────────────────────────────
const timeSlots = computed(() => {
  const slots = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    }
  }
  return slots
})

const timeSlotsAfterStart = computed(() => {
  if (!form.value.start) return timeSlots.value
  return timeSlots.value.filter(s => s > form.value.start)
})

// ── Formulaire ─────────────────────────────────────────────
const form = ref({
  start: props.selectedHour || '',
  end: '',
  participants: [],
  groupIds: [],
  iaEnabled: false
})

// ── Emails ─────────────────────────────────────────────────
const emailInput = ref('')

function addEmail() {
  const val = emailInput.value.trim()
  if (val && !form.value.participants.includes(val)) {
    form.value.participants.push(val)
  }
  emailInput.value = ''
}

// ── Groupes (à remplacer par appel API) ───────────────────
const groupsOpen = ref(false)
const availableGroups = ref([
  // TODO: fetch depuis GET /groups
  { id: 1, name: 'Équipe Dev', memberCount: 6 },
  { id: 2, name: 'Design', memberCount: 3 },
  { id: 3, name: 'Management', memberCount: 4 },
])

function toggleGroup(group) {
  const idx = form.value.groupIds.indexOf(group.id)
  if (idx === -1) form.value.groupIds.push(group.id)
  else form.value.groupIds.splice(idx, 1)
}

// ── Submit ─────────────────────────────────────────────────
function submit() {
  // TODO: POST /meetings avec le body ci-dessous
  emit('created', {
    title: `Meeting ${props.selectedDate}`,
    date: props.selectedDate,
    start: form.value.start,
    end: form.value.end,
    participants: form.value.participants,
    groupIds: form.value.groupIds,
    iaEnabled: form.value.iaEnabled
  })
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
}

.form-header h3 {
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
}
.close-btn:hover { background: #f3f4f6; }

.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-date-badge {
  background: linear-gradient(135deg, #f0fdfa, #cffafe);
  border: 1px solid #99f6e4;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #0d9488;
  text-transform: capitalize;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-group select,
.form-group input[type="email"] {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: border 0.2s;
}
.form-group select:focus,
.form-group input[type="email"]:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20,184,166,0.1);
}

/* Email */
.email-input-row {
  display: flex;
  gap: 8px;
}

.email-input-row input { flex: 1; }

.add-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  color: #0d9488;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 11px;
  color: #0d9488;
  padding: 0;
}

/* Groupes */
.groups-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s;
}
.groups-toggle:hover {
  border-color: #14b8a6;
  color: #14b8a6;
}

.groups-list {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f3f4f6;
}
.group-item:last-child { border-bottom: none; }
.group-item:hover { background: #f0fdfa; }
.group-item.selected { background: #f0fdfa; }

.group-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.group-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.group-count {
  font-size: 12px;
  color: #9ca3af;
}

.group-item svg { margin-left: auto; }

/* IA Toggle */
.ia-group {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
  border-radius: 12px;
  padding: 14px 16px;
}

.ia-label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #374151;
}

.ia-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.ia-desc {
  font-size: 12px;
  color: #9ca3af;
}

.toggle-btn {
  width: 48px;
  height: 26px;
  background: #d1d5db;
  border: none;
  border-radius: 13px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
  flex-shrink: 0;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(22px);
}

/* Footer */
.form-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background 0.2s;
}
.btn-cancel:hover { background: #f3f4f6; }

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
.btn-create:hover:not(:disabled) { opacity: 0.85; }
.btn-create:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
