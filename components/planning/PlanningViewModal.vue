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

        <div class="hours-col">
          <div class="hour-header-spacer"></div>
          <div class="hours-list" ref="hoursList">
            <div v-for="hour in hours" :key="hour" class="hour-label">{{ hour }}</div>
          </div>
        </div>

        <div class="days-area">

          <div class="days-headers">
            <div v-for="(day, i) in weekDays" :key="i" class="day-header">
              <span class="day-name">{{ day.name }}</span>
              <span class="day-number" :class="{ today: isToday(day.date) }">{{ day.number }}</span>
            </div>
          </div>

          <div class="grid-scroll" ref="gridScroll">
            <div class="grid-body">

              <div class="hour-lines">
                <div v-for="hour in hours" :key="hour" class="hour-line"></div>
              </div>

              <div class="day-cols">
                <div v-for="(day, dayIndex) in weekDays" :key="dayIndex" class="day-col">
                  <div
                    v-for="meeting in getMeetingsForDay(day.date)"
                    :key="meeting.meeting_id"
                    class="meeting-block"
                    :class="{ past: isPast(meeting) }"
                    :style="getMeetingStyle(meeting)"
                    @click="openDetail(meeting)"
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

  <!-- Détail meeting -->
  <Teleport to="body">
    <div v-if="selectedMeeting" class="detail-overlay" @click.self="selectedMeeting = null">
      <div class="detail-modal">

        <div class="detail-header">
          <div class="detail-title-row">
            <div class="detail-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 8-6 4 6 4V8Z"></path>
                <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
              </svg>
            </div>
            <h3 class="detail-title">{{ selectedMeeting.title }}</h3>
          </div>
          <button class="detail-close" @click="selectedMeeting = null">✕</button>
        </div>

        <div class="detail-body">
          <div class="detail-rows">
            <div class="detail-row">
              <div class="detail-row-icon"></div>
              <div>
                <div class="detail-row-label">Date</div>
                <div class="detail-row-value">{{ formatDate(selectedMeeting.date) }}</div>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-row-icon"></div>
              <div>
                <div class="detail-row-label">Horaire</div>
                <div class="detail-row-value">{{ selectedMeeting.start }} → {{ selectedMeeting.end }}</div>
              </div>
            </div>
            <div class="detail-row" v-if="selectedMeeting.description">
              <div class="detail-row-icon"></div>
              <div>
                <div class="detail-row-label">Description</div>
                <div class="detail-row-value">{{ selectedMeeting.description }}</div>
              </div>
            </div>
          </div>

          <div class="detail-divider"></div>

          <!-- Participants -->
          <div class="detail-section" v-if="selectedMeeting.participants?.length">
            <div class="detail-section-title">Participants</div>
            <div class="participants-list">
              <div
  v-for="p in selectedMeeting.participants"
  :key="p.keycloak_id"
  class="participant-chip">

  <div class="participant-avatar">{{ (p.display_name || p.email)[0].toUpperCase() }}</div>
  <div class="participant-info">
    <span class="participant-name">{{ p.display_name || p.email }}</span>
  </div>
  <span v-if="p.role === 'host'" class="participant-status joined">Hôte</span>
</div>
              
            </div>
          </div>
          <div v-else class="detail-section">
            <div class="detail-section-title">Participants</div>
            <p class="no-participants">Aucun participant ajouté</p>
          </div>

          <div class="detail-divider"></div>

          <!-- IA -->
          <div class="ia-status" :class="{ active: selectedMeeting.ai_enabled }">
            <span class="ia-status-title">{{ selectedMeeting.ai_enabled ? 'IA activée' : 'Pas d\'IA' }}</span>
            <span class="ia-status-desc">
              {{ selectedMeeting.ai_enabled ? "L'IA participera et générera un résumé" : "Pas d'IA dans ce meeting" }}
            </span>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useMeetings } from '~/composables/useMeetings'

const gridScroll = ref<HTMLElement | null>(null)
const hoursList = ref<HTMLElement | null>(null)

const emit = defineEmits(['close'])

const { calendarMeetings, loading, fetchMeetings } = useMeetings()

onMounted(() => {
  fetchMeetings().then(() => {
    nextTick(() => {
      gridScroll.value?.addEventListener('scroll', () => {
        if (hoursList.value) {
          hoursList.value.scrollTop = gridScroll.value!.scrollTop
        }
      })
    })
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
  const names = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const pad = (n: number) => String(n).padStart(2, '0')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday.value)
    d.setDate(d.getDate() + i)
    return { name: names[i], number: d.getDate(), date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
  })
})

const weekLabel = computed(() => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  if (!start || !end) return ''
  const [sy, sm, sd] = start.date.split('-').map(Number)
  const [ey, em, ed] = end.date.split('-').map(Number)
  const s = new Date(sy!, sm! - 1, sd!)
  const e = new Date(ey!, em! - 1, ed!)
  return `${s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
})

function previousWeek() {
  const d = new Date(currentMonday.value); d.setDate(d.getDate() - 7); currentMonday.value = d
}
function nextWeek() {
  const d = new Date(currentMonday.value); d.setDate(d.getDate() + 7); currentMonday.value = d
}

function isToday(dateStr: string) {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return dateStr === `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`)

function getMeetingsForDay(date: string) {
  return calendarMeetings.value.filter(m => m.date === date)
}

function timeToMinutes(t: string) {
  const [h = 0, m = 0] = t.split(':').map(Number); return h * 60 + m
}

function getMeetingStyle(meeting: any) {
  const top = (timeToMinutes(meeting.start) / 60) * 60
  const height = ((timeToMinutes(meeting.end) - timeToMinutes(meeting.start)) / 60) * 60
  return { top: `${top}px`, height: `${Math.max(height, 20)}px` }
}

function isPast(meeting: any) {
  const now = new Date()
  const meetingEnd = new Date(`${meeting.date}T${meeting.end}`)
  return meetingEnd < now
}

// ── Détail ────────────────────────────────────────────────────────────────────
const selectedMeeting = ref<any>(null)
function openDetail(m: any) { selectedMeeting.value = m }

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    invited: 'Invité', joined: 'Accepté', declined: 'Refusé', absent: 'Absent', left: 'A quitté'
  }
  return map[status] || status
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px;
}
.modal {
  background: white; border-radius: 20px; width: 100%; max-width: 960px;
  max-height: 90vh; display: flex; flex-direction: column;
  overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0;
}
.modal-title { display: flex; align-items: center; gap: 10px; }
.modal-title h2 {
  font-size: 20px; font-weight: 700;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #9ca3af; padding: 6px; border-radius: 8px; }
.close-btn:hover { background: #f3f4f6; }

.loader-row { display: flex; align-items: center; gap: 12px; padding: 32px 28px; color: #6b7280; font-size: 14px; }
.loader-spinner { width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top-color: #14b8a6; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.week-nav { display: flex; align-items: center; gap: 16px; padding: 12px 28px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.nav-arrow { background: none; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px; cursor: pointer; display: flex; align-items: center; }
.nav-arrow:hover { background: #f3f4f6; }
.week-label { font-weight: 600; color: #374151; flex: 1; text-align: center; }

.calendar-wrapper { flex: 1; display: flex; overflow: hidden; }
.hours-col { width: 52px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #e5e7eb; }
.hour-header-spacer { height: 48px; flex-shrink: 0; border-bottom: 1px solid #e5e7eb; }
.hours-list { flex: 1; overflow: hidden; }
.hour-label { height: 60px; display: flex; align-items: flex-start; justify-content: center; padding-top: 4px; font-size: 11px; color: #9ca3af; box-sizing: border-box; }

.days-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.days-headers { display: grid; grid-template-columns: repeat(7, 1fr); height: 48px; flex-shrink: 0; border-bottom: 1px solid #e5e7eb; }
.day-header { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border-right: 1px solid #f3f4f6; }
.day-name { font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: 600; }
.day-number { font-size: 15px; font-weight: 700; color: #374151; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.day-number.today { background: linear-gradient(135deg, #14b8a6, #0891b2); color: white; }

.grid-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; }
.grid-body { position: relative; height: calc(60px * 24); }
.hour-lines { position: absolute; inset: 0; pointer-events: none; }
.hour-line { height: 60px; border-bottom: 1px solid #f3f4f6; box-sizing: border-box; }
.day-cols { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(7, 1fr); }
.day-col { position: relative; border-right: 1px solid #f3f4f6; }

.meeting-block {
  position: absolute; left: 2px; right: 2px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 6px; padding: 4px 6px; cursor: pointer;
  display: flex; flex-direction: column; overflow: hidden;
  transition: all 0.2s; z-index: 2; box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(20,184,166,0.3);
}
.meeting-block:hover { opacity: 0.9; transform: scale(1.01); }
.meeting-block.past { background: linear-gradient(135deg, #94a3b8, #64748b); box-shadow: none; }
.meeting-block-title { font-size: 10px; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meeting-block-time { font-size: 9px; color: rgba(255,255,255,0.85); }

/* Détail */
.detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1100; display: flex; align-items: center; justify-content: center; padding: 16px; }
.detail-modal { background: white; border-radius: 20px; width: 100%; max-width: 420px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 24px 60px rgba(0,0,0,0.2); overflow: hidden; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px 16px; border-bottom: 1px solid #e5e7eb; }
.detail-title-row { display: flex; align-items: center; gap: 12px; }
.detail-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #14b8a6, #0891b2); display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
.detail-title { font-size: 18px; font-weight: 700; color: #111827; }
.detail-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #9ca3af; padding: 4px; border-radius: 6px; }
.detail-close:hover { background: #f3f4f6; }
.detail-body { flex: 1; overflow-y: auto; padding: 16px 24px; display: flex; flex-direction: column; gap: 16px; }

.detail-rows { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; align-items: flex-start; gap: 12px; }
.detail-row-icon { font-size: 16px; padding-top: 2px; }
.detail-row-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; margin-bottom: 2px; }
.detail-row-value { font-size: 14px; color: #111827; font-weight: 500; }

.detail-divider { height: 1px; background: #f3f4f6; }
.detail-section {}
.detail-section-title { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
.no-participants { font-size: 13px; color: #9ca3af; }

.participants-list { display: flex; flex-direction: column; gap: 8px; }
.participant-chip { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #f9fafb; border-radius: 10px; }
.participant-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #14b8a6, #0891b2); color: white; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.participant-info { flex: 1; min-width: 0; }
.participant-name { display: block; font-size: 13px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.participant-role { font-size: 11px; color: #9ca3af; }
.participant-role.host { color: #0d9488; font-weight: 600; }
.participant-status { font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 600; white-space: nowrap; }
.participant-status.invited { background: #fef3c7; color: #92400e; }
.participant-status.joined { background: #d1fae5; color: #065f46; }
.participant-status.declined { background: #fee2e2; color: #991b1b; }

.ia-status { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; background: #f9fafb; border-radius: 10px; }
.ia-status.active { background: #f0fdfa; border: 1px solid #99f6e4; }
.ia-status-title { font-size: 14px; font-weight: 600; color: #374151; }
.ia-status-desc { font-size: 12px; color: #6b7280; }
</style>