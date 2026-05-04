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

      <!-- Loader -->
      <div v-if="loading" class="loader-row">
        <div class="loader-spinner"></div>
        <span>Chargement de votre planning…</span>
      </div>

      <!-- Navigation semaine -->
      <div v-else class="week-nav">
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
      <div v-if="!loading" class="calendar-wrapper">

        <!-- Colonne heures -->
        <div class="hours-col">
          <div class="hour-header-spacer"></div>
          <div class="hours-list" ref="hoursList">
            <div v-for="hour in hours" :key="hour" class="hour-label">{{ hour }}</div>
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

              <div class="hour-lines">
                <div v-for="hour in hours" :key="hour" class="hour-line"></div>
              </div>

              <div class="day-cols">
                <div
                  v-for="(day, dayIndex) in weekDays"
                  :key="dayIndex"
                  class="day-col"
                  @click="openForm(day.date, dayIndex, $event)"
                >
                  <div
                    v-for="meeting in getMeetingsForDay(day.date)"
                    :key="meeting.meeting_id"
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

  <!-- Formulaire création meeting -->
  <Teleport to="body">
    <MeetingFormModal
      v-if="formOpen"
      :selected-date="selectedDate"
      :selected-hour="selectedHour"
      @close="formOpen = false"
      @created="onMeetingCreated"
    />
  </Teleport>

  <!-- Confirm delete -->
  <Teleport to="body">
    <div v-if="deleteTarget" class="overlay-sm" @click.self="deleteTarget = null">
      <div class="delete-modal">
        <h3>Supprimer ce meeting ?</h3>
        <p><strong>{{ deleteTarget.title }}</strong></p>
        <p>{{ deleteTarget.date }} · {{ deleteTarget.start }} → {{ deleteTarget.end }}</p>
        <div class="delete-actions">
          <button class="btn-cancel" @click="deleteTarget = null">Annuler</button>
          <button class="btn-delete" @click="doDelete" :disabled="deleting">
            {{ deleting ? 'Suppression…' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useMeetings } from '~/composables/useMeetings'
import MeetingFormModal from './MeetingFormModal.vue'
const gridScroll = ref<HTMLElement | null>(null)
const hoursList = ref<HTMLElement | null>(null)
const emit = defineEmits(['close'])

const { calendarMeetings, loading, fetchMeetings, deleteMeeting } = useMeetings()

onMounted(async () => {
  await fetchMeetings()
  await nextTick()
  gridScroll.value?.addEventListener('scroll', (e) => {
    hoursList.value!.scrollTop = (e.target as HTMLElement).scrollTop
  })
})

// ── Semaine ───────────────────────────────────────────────────────────────────
const currentMonday = ref(getMonday(new Date()))

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const weekDays = computed(() => {
  const days = []
  const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentMonday.value)
    d.setDate(d.getDate() + i)
    days.push({
      name: names[i],
      number: d.getDate(),
      date: d.toISOString().split('T')[0],
    })
  }
  return days
})

const weekLabel = computed(() => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  const s = new Date(start.date)
  const e = new Date(end.date)
  return `${s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
})

function previousWeek() {
  const d = new Date(currentMonday.value)
  d.setDate(d.getDate() - 7)
  currentMonday.value = d
}
function nextWeek() {
  const d = new Date(currentMonday.value)
  d.setDate(d.getDate() + 7)
  currentMonday.value = d
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

// ── Heures ────────────────────────────────────────────────────────────────────
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`)

// ── Meetings du jour ──────────────────────────────────────────────────────────
function getMeetingsForDay(date: string) {
  return calendarMeetings.value.filter(m => m.date === date)
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function getMeetingStyle(meeting: any) {
  const top = (timeToMinutes(meeting.start) / 60) * 60
  const height = ((timeToMinutes(meeting.end) - timeToMinutes(meeting.start)) / 60) * 60
  return { top: `${top}px`, height: `${Math.max(height, 20)}px` }
}

// ── Formulaire ────────────────────────────────────────────────────────────────
const formOpen = ref(false)
const selectedDate = ref('')
const selectedHour = ref('')

function openForm(date: string, _dayIndex: number, e: MouseEvent) {
  const gridEl = (e.currentTarget as HTMLElement)
  const rect = gridEl.getBoundingClientRect()
  const relY = e.clientY - rect.top
  const h = Math.floor(relY / 60)
  const m = relY % 60 < 30 ? '00' : '30'
  selectedDate.value = date
  selectedHour.value = `${String(h).padStart(2,'0')}:${m}`
  formOpen.value = true
}

function onMeetingCreated() {
  formOpen.value = false
  // Le composable a déjà mis à jour meetings.value
}

// ── Suppression ───────────────────────────────────────────────────────────────
const deleteTarget = ref<any>(null)
const deleting = ref(false)

function confirmDelete(m: any) {
  deleteTarget.value = m
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  await deleteMeeting(deleteTarget.value.meeting_id)
  deleting.value = false
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.modal-title { display: flex; align-items: center; gap: 10px; }
.modal-title h2 {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.close-btn {
  background: none; border: none; font-size: 20px;
  cursor: pointer; color: #9ca3af; padding: 6px;
  border-radius: 8px;
}
.close-btn:hover { background: #f3f4f6; }

.loader-row {
  display: flex; align-items: center; gap: 12px;
  padding: 32px 28px; color: #6b7280; font-size: 14px;
}
.loader-spinner {
  width: 20px; height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.week-nav {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 28px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
}
.nav-arrow {
  background: none; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 6px; cursor: pointer; display: flex; align-items: center;
  transition: background 0.2s;
}
.nav-arrow:hover { background: #f3f4f6; }
.week-label { font-weight: 600; color: #374151; flex: 1; text-align: center; }

.calendar-wrapper {
  flex: 1; display: flex; overflow: hidden;
}

.hours-col {
  width: 52px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #e5e7eb;
}
.hour-header-spacer { height: 48px; flex-shrink: 0; border-bottom: 1px solid #e5e7eb; }
.hours-list {
  flex: 1;
  overflow-y: scroll;
  scrollbar-width: none;
}

.hours-list::-webkit-scrollbar {
  display: none;
}
.hour-label {
  height: 60px; display: flex; align-items: flex-start; justify-content: center;
  padding-top: 4px; font-size: 11px; color: #9ca3af; box-sizing: border-box;
}

.days-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.days-headers {
  display: grid; grid-template-columns: repeat(7, 1fr);
  height: 48px; flex-shrink: 0; border-bottom: 1px solid #e5e7eb;
}
.day-header {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 2px; border-right: 1px solid #f3f4f6;
}
.day-name { font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: 600; }
.day-number {
  font-size: 15px; font-weight: 700; color: #374151;
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%;
}
.day-number.today { background: linear-gradient(135deg, #14b8a6, #0891b2); color: white; }

.grid-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; }
.grid-body { position: relative; height: calc(60px * 24); }
.hour-lines { position: absolute; inset: 0; pointer-events: none; }
.hour-line { height: 60px; border-bottom: 1px solid #f3f4f6; box-sizing: border-box; }
.day-cols {
  position: absolute; inset: 0;
  display: grid; grid-template-columns: repeat(7, 1fr);
}
.day-col {
  position: relative; border-right: 1px solid #f3f4f6;
  cursor: pointer; transition: background 0.15s;
}
.day-col:hover { background: rgba(240, 253, 250, 0.5); }

.meeting-block {
  position: absolute; left: 2px; right: 2px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 6px; padding: 4px 6px;
  cursor: pointer; display: flex; flex-direction: column;
  overflow: hidden; transition: opacity 0.2s; z-index: 2; box-sizing: border-box;
}
.meeting-block:hover { opacity: 0.85; }
.meeting-block-title { font-size: 10px; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meeting-block-time { font-size: 9px; color: rgba(255,255,255,0.85); }

/* Delete */
.overlay-sm {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 1200; display: flex; align-items: center; justify-content: center;
}
.delete-modal {
  background: white; border-radius: 16px; padding: 32px;
  max-width: 380px; width: 100%; text-align: center;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
}
.delete-modal h3 { font-size: 20px; color: #111827; margin-bottom: 12px; }
.delete-modal p { color: #6b7280; font-size: 14px; margin-bottom: 6px; }
.delete-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
.btn-cancel {
  padding: 10px 24px; border: 1px solid #d1d5db; background: white;
  border-radius: 10px; cursor: pointer; font-size: 14px; color: #374151;
}
.btn-cancel:hover { background: #f3f4f6; }
.btn-delete {
  padding: 10px 24px; background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white; border: none; border-radius: 10px; cursor: pointer;
  font-size: 14px; font-weight: 600;
}
.btn-delete:disabled { opacity: 0.6; cursor: not-allowed; }
</style>