<template>
  <div class="notifications-overlay" @click.self="emit('close')">
    <div class="notifications-panel">
      <div class="notifications-header">
        <h2>Notifications</h2>

        <button class="close-btn" type="button" @click="emit('close')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="notifications-list">
        <div v-if="loading" class="empty-state">
          Chargement des notifications...
        </div>

        <div v-else-if="error" class="empty-state error">
          {{ error }}
        </div>

        <div v-else-if="notifications.length === 0" class="empty-state">
          Aucune notification pour le moment.
        </div>

        <div
          v-else
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.is_read }"
        >
          <div class="notif-icon" :class="iconClass(notification)">
            <component :is="iconComponent(notification)" />
          </div>

          <div class="notif-content">
            <p class="notif-text">
              {{ notification.message }}
            </p>

            <div class="notif-meta-row">
              <span class="notif-time">
                {{ formatRelativeTime(notification.created_at) }}
              </span>

              <span
                v-if="notification.action_status"
                class="notif-status"
                :class="statusClass(notification.action_status)"
              >
                {{ statusLabel(notification.action_status) }}
              </span>
            </div>

            <!-- Actions seulement pour invitation groupe pending -->
            <div
              v-if="canRespondToGroupInvitation(notification)"
              class="notif-actions"
            >
              <button
                class="notif-btn accept"
                type="button"
                :disabled="actionLoadingId === notification.id"
                @click="respondToInvitation(notification, 'accept')"
              >
                {{ actionLoadingId === notification.id ? '...' : 'Accepter' }}
              </button>

              <button
                class="notif-btn decline"
                type="button"
                :disabled="actionLoadingId === notification.id"
                @click="respondToInvitation(notification, 'decline')"
              >
                Refuser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="notifications-footer">
        <button
          class="mark-all-read"
          type="button"
          :disabled="markAllLoading || unreadCount === 0"
          @click="markAllAsRead"
        >
          {{ markAllLoading ? 'Mise à jour...' : 'Tout marquer comme lu' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { $fetch } from 'ofetch'

/**
 * Petit composant SVG inline pour les différents types d’icônes.
 * On garde le style global de ton ancien popup.
 */
const GroupIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  `
}

const MeetingIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <video x="2" y="2" width="20" height="20"></video>
      <path d="M22 8s-4 2-4 6 4 6 4 6"></path>
      <rect x="2" y="6" width="14" height="12" rx="2"></rect>
    </svg>
  `
}

const MessageIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `
}

const ReminderIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  `
}

type DashboardNotification = {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  notification_type: string
  related_group_id: string | null
  related_group_invitation_id: string | null
  action_status: string | null
}

type DashboardResponse = {
  user: {
    id: string
    email: string
    display_name: string
  }
  stats: {
    total_meetings: number
    total_groups: number
    unread_notifications: number
  }
  recent_meetings: Array<unknown>
  notifications: DashboardNotification[]
}

const emit = defineEmits<{
  (e: 'close'): void
}>()

const runtimeConfig = useRuntimeConfig()

const loading = ref<boolean>(false)
const markAllLoading = ref<boolean>(false)
const actionLoadingId = ref<string | null>(null)
const error = ref<string>('')
const notifications = ref<DashboardNotification[]>([])

const unreadCount = computed<number>(() => {
  return notifications.value.filter((notification) => !notification.is_read).length
})

function backendBaseUrl(): string {
  return runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'
}

/**
 * Charge les notifications via le dashboard backend.
 * On réutilise ce que tu as déjà côté backend.
 */
async function fetchNotifications(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch<DashboardResponse>(
      `${backendBaseUrl()}/api/v1/dashboard`,
      {
        credentials: 'include'
      }
    )

    notifications.value = response.notifications
  } catch (err) {
    console.error('Erreur lors du chargement des notifications :', err)
    error.value = 'Impossible de charger les notifications.'
    notifications.value = []
  } finally {
    loading.value = false
  }
}

/**
 * Détermine si une notification est une invitation groupe encore actionnable.
 */
function canRespondToGroupInvitation(notification: DashboardNotification): boolean {
  return (
    notification.notification_type === 'group_invitation' &&
    !!notification.related_group_invitation_id &&
    notification.action_status === 'pending'
  )
}

/**
 * Icône affichée selon le type.
 */
function iconComponent(notification: DashboardNotification) {
  if (
    notification.notification_type === 'group_invitation' ||
    notification.notification_type === 'group_invitation_response'
  ) {
    return GroupIcon
  }

  if (notification.notification_type === 'meeting_invitation') {
    return MeetingIcon
  }

  if (notification.notification_type === 'message') {
    return MessageIcon
  }

  return ReminderIcon
}

/**
 * Couleur d’icône selon le type.
 */
function iconClass(notification: DashboardNotification): string {
  if (
    notification.notification_type === 'group_invitation' ||
    notification.notification_type === 'group_invitation_response'
  ) {
    return 'group'
  }

  if (notification.notification_type === 'meeting_invitation') {
    return 'meeting'
  }

  if (notification.notification_type === 'message') {
    return 'message'
  }

  return 'reminder'
}

/**
 * Badge d’état d’action.
 */
function statusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'En attente'
    case 'accepted':
      return 'Acceptée'
    case 'declined':
      return 'Refusée'
    case 'cancelled':
      return 'Annulée'
    default:
      return status
  }
}

function statusClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'pending'
    case 'accepted':
      return 'accepted'
    case 'declined':
      return 'declined'
    case 'cancelled':
      return 'cancelled'
    default:
      return ''
  }
}

/**
 * Petit format relatif simple.
 */
function formatRelativeTime(rawDate: string): string {
  const date = new Date(rawDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (minutes < 1) return 'À l’instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`

  return date.toLocaleDateString('fr-FR')
}

/**
 * Accepte ou refuse une invitation groupe.
 */
async function respondToInvitation(
  notification: DashboardNotification,
  action: 'accept' | 'decline'
): Promise<void> {
  if (!notification.related_group_invitation_id) {
    return
  }

  actionLoadingId.value = notification.id
  error.value = ''

  try {
    await $fetch<{ message: string }>(
      `${backendBaseUrl()}/api/v1/group-invitations/${notification.related_group_invitation_id}/respond`,
      {
        method: 'POST',
        credentials: 'include',
        body: {
          action
        }
      }
    )

    // Rechargement complet pour récupérer le nouvel état exact du backend.
    await fetchNotifications()
  } catch (err: any) {
    console.error('Erreur lors de la réponse à l’invitation :', err)
    error.value =
      err?.data?.message ||
      'Impossible de traiter cette invitation.'
  } finally {
    actionLoadingId.value = null
  }
}

/**
 * Marque toutes les notifications comme lues.
 */
async function markAllAsRead(): Promise<void> {
  if (unreadCount.value === 0) {
    return
  }

  markAllLoading.value = true
  error.value = ''

  try {
    await $fetch<{ message: string }>(
      `${backendBaseUrl()}/api/v1/notifications/mark-all-read`,
      {
        method: 'POST',
        credentials: 'include'
      }
    )

    notifications.value = notifications.value.map((notification) => ({
      ...notification,
      is_read: true
    }))
  } catch (err: any) {
    console.error('Erreur lors du marquage des notifications :', err)
    error.value =
      err?.data?.message ||
      'Impossible de marquer les notifications comme lues.'
  } finally {
    markAllLoading.value = false
  }
}

onMounted(async () => {
  await fetchNotifications()
})
</script>

<style scoped>
.notifications-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 1000;
  padding: 70px 20px 0 0;
}

.notifications-panel {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  width: 380px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 1;
}

.notifications-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.4);
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #111827;
  background: rgba(0, 0, 0, 0.06);
}

.notifications-list {
  padding: 8px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s;
  position: relative;
}

.notification-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.notification-item.unread {
  background: rgba(99, 102, 241, 0.05);
}

.notification-item.unread::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
}

.notif-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon.meeting {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}

.notif-icon.message {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.notif-icon.group {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.notif-icon.reminder {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  margin: 0 0 6px 0;
  line-height: 1.45;
}

.notif-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.notif-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.35);
}

.notif-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
}

.notif-status.pending {
  background: #fef3c7;
  color: #b45309;
}

.notif-status.accepted {
  background: #dcfce7;
  color: #15803d;
}

.notif-status.declined {
  background: #fee2e2;
  color: #b91c1c;
}

.notif-status.cancelled {
  background: #e5e7eb;
  color: #4b5563;
}

.notif-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.notif-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.notif-btn.accept {
  background: #6366f1;
  color: #fff;
}

.notif-btn.accept:hover {
  background: #5254cc;
}

.notif-btn.accept:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.notif-btn.decline {
  background: rgba(0, 0, 0, 0.07);
  color: rgba(0, 0, 0, 0.6);
}

.notif-btn.decline:hover {
  background: rgba(0, 0, 0, 0.12);
}

.notif-btn.decline:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.notifications-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  text-align: center;
}

.mark-all-read {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.mark-all-read:hover {
  opacity: 0.7;
}

.mark-all-read:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  padding: 26px 24px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.empty-state.error {
  color: #b91c1c;
}
</style>