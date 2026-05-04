// composables/useMeetings.ts
// Gestion globale des meetings : fetch, création, suppression
// Partagé entre PlanningModal, PlanningViewModal et dashboard

import { ref } from 'vue'

export interface Participant {
  keycloak_id: string
  email: string
  display_name?: string
  role: string
  status: string
}

export interface Meeting {
  meeting_id: string
  title: string
  description?: string
  host_keycloak_id: string
  scheduled_start_at: string  // ISO string
  scheduled_end_at: string    // ISO string
  ai_enabled: boolean
  status: string
  participants: Participant[]
}

export interface ParticipantConflict {
  email: string
  display_name?: string
  conflicting_meeting_title: string
  conflicting_start: string
  conflicting_end: string
}

export interface ConflictError {
  message: string
  conflicts: ParticipantConflict[]
}

// État partagé (singleton pattern avec Nuxt)
const meetings = ref<Meeting[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useMeetings() {
  // ── Helpers de formatage ────────────────────────────────────────────────────

  /** Convertit un meeting API en format calendrier (date + HH:mm) */
  function toCalendarFormat(m: Meeting) {
    const start = new Date(m.scheduled_start_at)
    const end = new Date(m.scheduled_end_at)
    return {
      ...m,
      date: start.toISOString().split('T')[0],
      start: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
      end: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
    }
  }

  /** Meetings enrichis avec date/start/end pour le calendrier */
  const calendarMeetings = computed(() => meetings.value.map(toCalendarFormat))

  // ── Fetch ───────────────────────────────────────────────────────────────────

  async function fetchMeetings() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<Meeting[]>('/api/v1/meetings', {
        credentials: 'include',
      })
      meetings.value = data
    } catch (e: any) {
      error.value = e?.data?.error || 'Erreur lors du chargement des meetings'
    } finally {
      loading.value = false
    }
  }

  // ── Création ────────────────────────────────────────────────────────────────

  /**
   * Crée un meeting.
   * @returns { success: true, meeting } ou { success: false, conflict: ConflictError } ou { success: false, error: string }
   */
  async function createMeeting(payload: {
    title: string
    description?: string
    date: string        // 'YYYY-MM-DD'
    start: string       // 'HH:mm'
    end: string         // 'HH:mm'
    participant_emails: string[]
    group_ids: string[]
    ai_enabled: boolean
  }) {
    // Convertir date + HH:mm en ISO UTC
    const toISO = (date: string, time: string) => {
      return new Date(`${date}T${time}:00`).toISOString()
    }

    const body = {
      title: payload.title,
      description: payload.description,
      scheduled_start_at: toISO(payload.date, payload.start),
      scheduled_end_at: toISO(payload.date, payload.end),
      ai_enabled: payload.ai_enabled,
      participant_emails: payload.participant_emails,
      group_ids: payload.group_ids,
    }

    try {
      const newMeeting = await $fetch<Meeting>('/api/v1/meetings', {
        method: 'POST',
        body,
        credentials: 'include',
      })
      meetings.value.push(newMeeting)
      return { success: true, meeting: newMeeting }
    }  catch (e: any) {
  const status = e?.statusCode || e?.response?.status
  const data = e?.data || e?.response?._data

  if (status === 409 && data?.conflicts) {
    return { success: false, conflict: data as ConflictError }
  }
  if (status === 409) {
    return { success: false, error: data?.message || data?.error || 'Créneau déjà occupé' }
  }
  return { success: false, error: data?.message || data?.error || 'Erreur lors de la création' }
}
  }

  // ── Suppression ─────────────────────────────────────────────────────────────

  async function deleteMeeting(meetingId: string) {
    try {
      await $fetch(`/api/v1/meetings/${meetingId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      meetings.value = meetings.value.filter(m => m.meeting_id !== meetingId)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e?.data?.error || 'Erreur lors de la suppression' }
    }
  }

  return {
    meetings,
    calendarMeetings,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    deleteMeeting,
    toCalendarFormat,
  }
}
