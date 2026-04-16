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
          <h2>Mon planning</h2>
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
          <div class="hour-header-spacer"></div>
          <div class="hours-list" ref="hoursList">
            <div v-for="hour in hours" :key="hour" class="hour-label">
              {{ hour }}
            </div>
          </div>
        </div>

        <!-- Zone jours -->
        <div class="days-area">

          <!-- Headers jours -->
          <div class="days-headers">
            <div v-for="(day, i) in weekDays" :key="i" class="day-header">
              <span class="day-name">{{ day.name }}</span>
              <span class="day-number" :class="{ today: isToday(day.date) }">{{ day.number }}</span>
            </div>
          </div>

          <!-- Grille scrollable -->
          <div class="grid-scroll" ref="gridScroll">
            <div class="grid-body">

              <!-- Lignes horaires -->
              <div class="hour-lines">
                <div v-for="hour in hours" :key="hour" class="hour-line"></div>
              </div>

              <!-- Colonnes -->
              <div class="day-cols">
                <div
                  v-for="(day, dayIndex) in weekDays"
                  :key="dayIndex"
                  class="day-col"
                >
                  <!-- Meeting blocks -->
                  <div
                    v-for="meeting in getMeetingsForDay(day.date)"
                    :key="meeting.id"
                    class="meeting-block"
                    :class="{ past: isPast(meeting) }"
                    :style="getMeetingStyle(meeting)"
                    @click="openDetail(meeting)"
                  >
                    <span class="meeting-block-title">{{ meeting.title }}</span>
                    <span class="meeting-block-time">{{ meeting.start }} - {{ meeting.end }}</span>
                  </div>

                  <!-- Indicateur vide -->
                  <div v-if="getMeetingsForDay(day.date).length === 0 && isToday(day.date)" class="empty-today">
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Modale détail meeting -->
  <Teleport to="body">
    <div v-if="selectedMeeting" class="detail-overlay" @click.self="selectedMeeting = null">
      <div class="detail-modal">

        <!-- Header -->
        <div class="detail-header">
          <div class="detail-title-row">
            <div class="detail-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </div>
            <h3>{{ selectedMeeting.title }}</h3>
          </div>
          <button class="close-btn" @click="selectedMeeting = null">✕</button>
        </div>

        <!-- Body -->
        <div class="detail-body">

          <!-- Titre -->
          <div class="detail-section">
            <div class="detail-row">
              <div class="detail-row-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="14" y1="12" y2="12"></line>
                  <line x1="4" x2="18" y1="18" y2="18"></line>
                </svg>
              </div>
              <div>
                <div class="detail-row-label">Titre</div>
                <div class="detail-row-value">{{ selectedMeeting.title }}</div>
              </div>
            </div>
          </div>

          <div class="detail-divider"></div>

          <!-- Date & heure -->
          <div class="detail-section">
            <div class="detail-row">
              <div class="detail-row-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="16" x2="16" y1="2" y2="6"></line>
                  <line x1="8" x2="8" y1="2" y2="6"></line>
                  <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
              </div>
              <div>
                <div class="detail-row-label">Date</div>
                <div class="detail-row-value">{{ formatDate(selectedMeeting.date) }}</div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-row-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <div class="detail-row-label">Horaire</div>
                <div class="detail-row-value">{{ selectedMeeting.start }} → {{ selectedMeeting.end }}</div>
              </div>
            </div>
          </div>

          <div class="detail-divider"></div>

          <!-- Participants -->
          <div class="detail-section" v-if="selectedMeeting.participants?.length || selectedMeeting.groupIds?.length">
            <div class="detail-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Participants
            </div>

            <!-- Emails -->
            <div v-if="selectedMeeting.participants?.length" class="participants-list">
              <div
                v-for="(email, i) in selectedMeeting.participants"
                :key="i"
                class="participant-chip"
              >
                <div class="participant-avatar">{{ email[0].toUpperCase() }}</div>
                <span>{{ email }}</span>
              </div>
            </div>

            <!-- Groupes -->
            <div v-if="selectedMeeting.groupIds?.length" class="groups-chips">
              <div
                v-for="id in selectedMeeting.groupIds"
                :key="id"
                class="group-chip"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {{ getGroupName(id) }}
              </div>
            </div>
          </div>

          <!-- Aucun participant -->
          <div v-else class="detail-section">
            <div class="detail-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              Participants
            </div>
            <p class="no-participants">Aucun participant ajouté</p>
          </div>

          <div class="detail-divider"></div>

          <!-- IA -->
          <div class="detail-section">
            <div class="ia-status" :class="{ active: selectedMeeting.iaEnabled }">
              <div class="ia-status-left">
                <div class="ia-status-icon" :class="{ active: selectedMeeting.iaEnabled }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10"></path>
                    <path d="M12 8v4l3 3"></path>
                  </svg>
                </div>
                <div>
                  <div class="ia-status-title">Présence IA</div>
                  <div class="ia-status-desc">
                    {{ selectedMeeting.iaEnabled ? "L'IA participera à ce meeting" : "Pas d'IA dans ce meeting" }}
                  </div>
                </div>
              </div>
              <div class="ia-badge" :class="{ active: selectedMeeting.iaEnabled }">
                {{ selectedMeeting.iaEnabled ? 'Activée' : 'Désactivée' }}
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="detail-footer">
          <button class="btn-close-detail" @click="selectedMeeting = null">Fermer</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  meetings: {
    type: Array,
    default: () => []
  }
})

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

// ── Meetings ──────────────────────────────────────────────
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function getMeetingsForDay(date) {
  return props.meetings.filter(m => m.date === date)
}

function getMeetingStyle(meeting) {
  const startMin = timeToMinutes(meeting.start)
  const endMin   = timeToMinutes(meeting.end)
  const top      = (startMin / 60) * HOUR_H
  const height   = Math.max(((endMin - startMin) / 60) * HOUR_H, 20)
  return { top: `${top}px`, height: `${height}px` }
}

function isPast(meeting) {
  const now = new Date()
  const meetingEnd = new Date(`${meeting.date}T${meeting.end}`)
  return meetingEnd < now
}

// ── Scroll sync ───────────────────────────────────────────
const gridScroll = ref(null)
const hoursList  = ref(null)

function syncScroll() {
  if (hoursList.value) hoursList.value.scrollTop = gridScroll.value.scrollTop
}

onMounted(() => {
  gridScroll.value?.addEventListener('scroll', syncScroll)
  // Scroll vers l'heure actuelle
  if (gridScroll.value) {
    const currentHour = new Date().getHours()
    gridScroll.value.scrollTop = currentHour * HOUR_H - HOUR_H * 2
  }
})
onUnmounted(() => gridScroll.value?.removeEventListener('scroll', syncScroll))

// ── Détail meeting ────────────────────────────────────────
const selectedMeeting = ref(null)

function openDetail(meeting) {
  selectedMeeting.value = meeting
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

// Groupes (même mock que MeetingFormModal — à remplacer par API)
const availableGroups = ref([
  { id: 1, name: 'Équipe Dev' },
  { id: 2, name: 'Design' },
  { id: 3, name: 'Management' },
])

function getGroupName(id) {
  return availableGroups.value.find(g => g.id === id)?.name ?? `Groupe #${id}`
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

/* ── Header ── */
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

/* ── Week nav ── */
.week-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 14px 28px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
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

/* ── Calendrier ── */
.calendar-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.hours-col {
  width: 56px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
}
.hour-header-spacer {
  height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}
.hours-list {
  overflow: hidden;
  flex: 1;
}
.hour-label {
  height: 60px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  font-size: 11px;
  color: #9ca3af;
  box-sizing: border-box;
}

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

.grid-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
.grid-body {
  position: relative;
  height: calc(60px * 24);
}
.hour-lines { position: absolute; inset: 0; pointer-events: none; }
.hour-line  { height: 60px; border-bottom: 1px solid #f3f4f6; box-sizing: border-box; }

.day-cols {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.day-col {
  position: relative;
  border-right: 1px solid #f3f4f6;
}

/* ── Meeting block ── */
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
  transition: all 0.2s;
  z-index: 2;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(20,184,166,0.3);
}
.meeting-block:hover {
  opacity: 0.9;
  transform: scale(1.01);
  box-shadow: 0 4px 14px rgba(20,184,166,0.45);
}
.meeting-block.past {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  box-shadow: none;
}
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

/* ── Modale détail ── */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.detail-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0,0,0,0.25);
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}
.detail-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.detail-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}
.detail-header h3 {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
}

.detail-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.detail-row-icon {
  width: 34px;
  height: 34px;
  background: #f0fdfa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #14b8a6;
  flex-shrink: 0;
}
.detail-row-label {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.detail-row-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  text-transform: capitalize;
}

.detail-divider {
  height: 1px;
  background: #f3f4f6;
}

/* Participants */
.participants-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.participant-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
}
.participant-avatar {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.participant-chip span {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.groups-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.group-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #0d9488;
}

.no-participants {
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

/* IA status */
.ia-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}
.ia-status.active {
  background: #f0fdfa;
  border-color: #99f6e4;
}
.ia-status-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ia-status-icon {
  width: 36px;
  height: 36px;
  background: #e5e7eb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: all 0.2s;
}
.ia-status-icon.active {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
}
.ia-status-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.ia-status-desc {
  font-size: 12px;
  color: #9ca3af;
}
.ia-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  background: #e5e7eb;
  color: #9ca3af;
  transition: all 0.2s;
}
.ia-badge.active {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
}

/* Footer */
.detail-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}
.btn-close-detail {
  padding: 10px 28px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.btn-close-detail:hover { opacity: 0.85; }
</style>
