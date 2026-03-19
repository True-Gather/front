<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">

      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
          <h2>Marquer mon planning</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Navigation semaine -->
      <div class="week-nav">
        <button class="nav-arrow" @click="previousWeek">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span class="week-label">{{ weekLabel }}</span>
        <button class="nav-arrow" @click="nextWeek">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Calendrier -->
      <div class="calendar-wrapper">

        <!-- Colonne heures -->
        <div class="hours-col">
          <!-- Placeholder aligné avec le header des jours -->
          <div class="hour-header-spacer"></div>
          <div class="hours-list" ref="hoursList">
            <div v-for="hour in hours" :key="hour" class="hour-label">
              {{ hour }}
            </div>
          </div>
        </div>

        <!-- Zone jours -->
        <div class="days-area">

          <!-- Headers jours (fixes) -->
          <div class="days-headers">
            <div
              v-for="(day, i) in weekDays"
              :key="i"
              class="day-header"
            >
              <span class="day-name">{{ day.name }}</span>
              <span class="day-number" :class="{ today: isToday(day.date) }">{{ day.number }}</span>
            </div>
          </div>

          <!-- Grille scrollable -->
          <div class="grid-scroll" ref="gridScroll">
            <div class="grid-body">

              <!-- Lignes horaires (background) -->
              <div class="hour-lines">
                <div v-for="hour in hours" :key="hour" class="hour-line"></div>
              </div>

              <!-- Colonnes cliquables -->
              <div class="day-cols">
                <div
                  v-for="(day, dayIndex) in weekDays"
                  :key="dayIndex"
                  class="day-col"
                  @click="onColClick(day.date, $event)"
                >
                  <!-- Meeting blocks positionnés absolument -->
                  <div
                    v-for="meeting in getMeetingsForDay(day.date)"
                    :key="meeting.id"
                    class="meeting-block"
                    :style="getMeetingStyle(meeting)"
                    @click.stop="confirmDelete(meeting)"
                  >
                    <span class="meeting-block-title">{{ meeting.title }}</span>
                    <span class="meeting-block-time">{{ meeting.start }} - {{ meeting.end }}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  </div>

  <!-- Popup création -->
  <MeetingFormModal
    v-if="formOpen"
    :selected-date="selectedDate"
    :selected-hour="selectedHour"
    @close="formOpen = false"
    @created="onMeetingCreated"
  />
<!-- Alerte conflict -->
<Teleport to="body">
  <div v-if="conflictAlert" class="alert-overlay">
    <div class="alert-box">
      <div class="alert-icon">⚠️</div>
      <h3>Créneau indisponible</h3>
      <p>Ce créneau est déjà occupé par un autre meeting.</p>
      <button class="alert-btn" @click="conflictAlert = false">OK</button>
    </div>
  </div>
</Teleport>
  <!-- Popup suppression -->
  <div class="overlay" v-if="deleteTarget" @click.self="deleteTarget = null">
    <div class="delete-modal">
      <h3>Supprimer ce meeting ?</h3>
      <p><strong>{{ deleteTarget.title }}</strong></p>
      <p>{{ deleteTarget.date }} · {{ deleteTarget.start }} - {{ deleteTarget.end }}</p>
      <div class="delete-actions">
        <button class="btn-cancel" @click="deleteTarget = null">Annuler</button>
        <button class="btn-delete" @click="deleteMeeting">Supprimer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MeetingFormModal from './MeetingFormModal.vue'

const emit = defineEmits(['close'])

const HOUR_H = 60

// ── Semaine ───────────────────────────────────────────────
const weekOffset = ref(0)

const currentMonday = computed(() => {
  const today = new Date()
  const day = today.getDay() || 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - day + 1 + weekOffset.value * 7)
  return monday
})

const weekDays = computed(() => {
  return ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((name, i) => {
    const d = new Date(currentMonday.value)
    d.setDate(d.getDate() + i)
    return { name, number: d.getDate(), date: d.toISOString().split('T')[0] }
  })
})

const weekLabel = computed(() => {
  const s = new Date(weekDays.value[0].date)
  const e = new Date(weekDays.value[6].date)
  const opts = { day: 'numeric', month: 'long' }
  return `${s.toLocaleDateString('fr-FR', opts)} – ${e.toLocaleDateString('fr-FR', { ...opts, year: 'numeric' })}`
})

function previousWeek() { weekOffset.value-- }
function nextWeek()     { weekOffset.value++ }
function isToday(d)     { return d === new Date().toISOString().split('T')[0] }

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

// ── Meetings ─────────────────────────────────────────────
const meetings = ref([])

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function getMeetingsForDay(date) {
  return meetings.value.filter(m => m.date === date)
}

function getMeetingStyle(meeting) {
  const startMin = timeToMinutes(meeting.start)
  const endMin   = timeToMinutes(meeting.end)
  const top      = (startMin / 60) * HOUR_H
  const height   = Math.max(((endMin - startMin) / 60) * HOUR_H, 20)
  return { top: `${top}px`, height: `${height}px` }
}

// ── Scroll sync ───────────────────────────────────────────
const gridScroll = ref(null)
const hoursList = ref(null)

function syncScroll() {
  if (hoursList.value) {
    hoursList.value.scrollTop = gridScroll.value.scrollTop
  }
}

onMounted(() => {
  if (gridScroll.value) {
    gridScroll.value.addEventListener('scroll', syncScroll)
  }
})

onUnmounted(() => {
  if (gridScroll.value) {
    gridScroll.value.removeEventListener('scroll', syncScroll)
  }
})

// ── Clic sur colonne ─────────────────────────────────────
function onColClick(date, event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const scrollTop = event.currentTarget.closest('.grid-scroll').scrollTop
  const y = event.clientY - rect.top + scrollTop
  const totalMinutes = Math.floor((y / HOUR_H) * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = Math.floor(totalMinutes / 30) % 2 === 0 ? '00' : '30'
  selectedDate.value = date
  selectedHour.value = `${String(h).padStart(2,'0')}:${m}`
  formOpen.value = true
}

// ── Formulaire ────────────────────────────────────────────
const formOpen     = ref(false)
const selectedDate = ref('')
const selectedHour = ref('')

function onMeetingCreated(meeting) {
  const newStart = timeToMinutes(meeting.start)
  const newEnd   = timeToMinutes(meeting.end)
  const conflict = meetings.value.some(m => {
    if (m.date !== meeting.date) return false
    const s = timeToMinutes(m.start)
    const e = timeToMinutes(m.end)
    return newStart < e && newEnd > s
  })
  if (conflict) {
    conflictAlert.value = true
    return
  }
  meetings.value.push({ ...meeting, id: Date.now() })
  formOpen.value = false
}
const conflictAlert = ref(false)

// ── Supprimer ─────────────────────────────────────────────
const deleteTarget = ref(null)
function confirmDelete(m) { deleteTarget.value = m }
function deleteMeeting() {
  meetings.value = meetings.value.filter(m => m.id !== deleteTarget.value.id)
  deleteTarget.value = null
}
</script>


<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 960px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal-title h2 {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.modal-title svg { color: #14b8a6; }
.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}
.close-btn:hover { background: #f3f4f6; color: #374151; }

/* Navigation */
.week-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 14px 28px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.hours-list {
  overflow: hidden;
  flex: 1;
}

.week-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  min-width: 260px;
  text-align: center;
}
.nav-arrow {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
}
.nav-arrow:hover { background: #f0fdfa; border-color: #14b8a6; color: #14b8a6; }

/* Layout calendrier */
.calendar-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Colonne heures */
.hours-col {
  width: 56px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
}

.hour-header-spacer {
  height: 48px;  /* même hauteur que .days-headers */
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}

.hours-list {
  overflow: hidden;  /* suit le scroll de .grid-scroll via JS si besoin */
  flex: 1;
}

.hour-label {
  height: 60px;   /* = HOUR_H */
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  font-size: 11px;
  color: #9ca3af;
  box-sizing: border-box;
}

.alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.alert-box {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.alert-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.alert-box h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}
.alert-box p {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 24px;
}
.alert-btn {
  padding: 10px 32px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.alert-btn:hover { opacity: 0.85; }


/* Zone jours */
.days-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.days-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-right: 1px solid #f3f4f6;
}
.day-name {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 600;
}
.day-number {
  font-size: 15px;
  font-weight: 700;
  color: #374151;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.day-number.today {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
}

/* Scroll principal */
.grid-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* Synchronise le scroll des heures */
}

/* Grille intérieure */
.grid-body {
  position: relative;
  height: calc(60px * 24);  /* HOUR_H * 24 */
}

/* Lignes horizontales */
.hour-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hour-line {
  height: 60px;
  border-bottom: 1px solid #f3f4f6;
  box-sizing: border-box;
}

/* Colonnes */
.day-cols {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-col {
  position: relative;
  border-right: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.15s;
}
.day-col:hover { background: rgba(240, 253, 250, 0.5); }

/* Meeting block */
.meeting-block {
  position: absolute;
  left: 2px;
  right: 2px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 6px;
  padding: 4px 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: opacity 0.2s;
  z-index: 2;
  box-sizing: border-box;
}
.meeting-block:hover { opacity: 0.85; }

.meeting-block-title {
  font-size: 10px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.meeting-block-time {
  font-size: 9px;
  color: rgba(255,255,255,0.85);
}

/* Delete modal */
.delete-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
}
.delete-modal h3 { font-size: 20px; color: #111827; margin-bottom: 12px; }
.delete-modal p  { color: #6b7280; font-size: 14px; margin-bottom: 6px; }
.delete-actions  { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background 0.2s;
}
.btn-cancel:hover { background: #f3f4f6; }

.btn-delete {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.btn-delete:hover { opacity: 0.85; }
</style>
