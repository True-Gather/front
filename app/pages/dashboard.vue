<template>
  <div class="container">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <svg
          id="toggleIcon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#14b8a6"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline v-if="sidebarCollapsed" points="9 18 15 12 9 6"></polyline>
          <polyline v-else points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <nav>
        <button class="menu-item active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="menu-label">Accueil</span>
        </button>

        <button class="menu-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 8-6 4 6 4V8Z"></path>
            <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
          </svg>
          <span class="menu-label">Meetings</span>
          <span class="badge">{{ totalMeetings }}</span>
        </button>

        <button class="menu-item" @click="showGroupsModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="menu-label">Groupes</span>
          <span class="badge">{{ totalGroups }}</span>
        </button>

        <button class="menu-item" @click="planningViewOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
          <span class="menu-label">Planning</span>
        </button>
      </nav>
    </aside>

    <main class="main">
      <header class="header">
        <div class="logo">
          <img src="/logo.jfif" alt="TrueGather Logo" class="logo-icon-img" />
          <div class="logo-text">TrueGather</div>
        </div>

        <div class="header-actions">
          <button class="icon-btn" @click="showNotifications = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            <span v-if="unreadNotifications > 0" class="notification-dot"></span>
          </button>

          <button class="icon-btn" @click="showSettings = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>

          <UserMenu />
        </div>
      </header>

      <div class="content">
        <div class="content-inner">
          <div class="page-title">
            <h2>Que souhaitez-vous faire ?</h2>
            <p>Bienvenue {{ welcomeName }} sur votre tableau de bord TrueGather</p>
          </div>

          <div class="actions-grid">
            <button class="action-card" @click="meetingOpen = true">
              <div class="action-icon" style="background: linear-gradient(135deg, #14b8a6, #0891b2);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m22 8-6 4 6 4V8Z"></path>
                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
                </svg>
              </div>
              <div class="action-title">
                Créer un meeting
                <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" x2="19" y1="12" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              <div class="action-description">Démarrez une nouvelle visioconférence instantanément</div>
            </button>

            <button class="action-card">
              <div class="action-icon" style="background: linear-gradient(135deg, #06b6d4, #3b82f6);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="action-title">
                Historique des meetings
                <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" x2="19" y1="12" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              <div class="action-description">Consultez vos réunions passées</div>
            </button>

            <button class="action-card" @click="showCreateGroupModal = true">
              <div class="action-icon" style="background: linear-gradient(135deg, #10b981, #14b8a6);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div class="action-title">
                Créer un groupe
                <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" x2="19" y1="12" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              <div class="action-description">Organisez vos contacts en groupes</div>
            </button>

            <button class="action-card" @click="planningOpen = true">
              <div class="action-icon" style="background: linear-gradient(135deg, #3b82f6, #6366f1);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                  <line x1="16" x2="16" y1="2" y2="6"></line>
                  <line x1="8" x2="8" y1="2" y2="6"></line>
                  <line x1="3" x2="21" y1="10" y2="10"></line>
                </svg>
              </div>
              <div class="action-title">
                Planifier
                <svg class="action-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" x2="19" y1="12" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
              <div class="action-description">Gérez vos réunions à venir</div>
            </button>
          </div>

          <div class="meetings-section">
            <div class="meetings-header">
              <h3>Meetings récents</h3>
              <a href="#" class="view-all">Voir tout</a>
            </div>

            <div v-if="dashboardLoading">
              Chargement du dashboard...
            </div>

            <div v-else-if="dashboardError">
              {{ dashboardError }}
            </div>

            <div v-else-if="recentMeetings.length === 0">
              Aucun meeting à afficher pour le moment.
            </div>

            <div v-else>
              <div
                v-for="meeting in recentMeetings"
                :key="meeting.id"
                class="meeting-item"
              >
                <div class="meeting-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m22 8-6 4 6 4V8Z"></path>
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
                  </svg>
                </div>

                <div class="meeting-info">
                  <div class="meeting-title">{{ meeting.title }}</div>

                  <div class="meeting-details">
                    <span class="meeting-detail">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {{ formatMeetingDate(meeting.scheduled_start_at) }}
                    </span>

                    <span class="meeting-detail">
                      Type : {{ meeting.meeting_type }}
                    </span>
                  </div>
                </div>

                <span class="meeting-status" :class="statusClass(meeting.status)">
                  {{ meeting.status }}
                </span>

                <button class="meeting-more">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div class="chatbot-container">
      <div class="chatbot-box" v-if="chatOpen">
        <div class="chatbot-header">
          Assistant
          <span @click="toggleChat" style="cursor:pointer">✖</span>
        </div>

        <div class="chatbot-messages" ref="chatMessages">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="msg.type === 'bot' ? 'bot-message' : 'user-message'"
          >
            {{ msg.text }}
          </div>
        </div>

        <div class="chatbot-input">
          <input
            type="text"
            v-model="userInput"
            @keyup.enter="sendMessage"
            placeholder="Écrire un message..."
          />
          <button @click="sendMessage">➤</button>
        </div>
      </div>

      <div class="chatbot-toggle" @click="toggleChat">💬</div>
    </div>

    <Notifications v-if="showNotifications":notifications="dashboardNotifications" @close="showNotifications = false"/>
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
    <CreateGroupModal v-if="showCreateGroupModal" @close="showCreateGroupModal = false" @created="handleGroupCreated"/>
    <CreateMeetingModal v-if="meetingOpen" @close="meetingOpen = false" />
    <PlanningModal v-if="planningOpen" @close="planningOpen = false" />
    <PlanningViewModal v-if="planningViewOpen":meetings="planningMeetings" @close="planningViewOpen = false"/>
    <GroupsModal v-if="showGroupsModal" @close="showGroupsModal = false"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRuntimeConfig } from '#imports'
import { useAuth } from '~/composables/useAuth'

import Notifications from '../../components/barrehorizontale/Notifications.vue'
import SettingsModal from '../../components/barrehorizontale/SettingsModal.vue'
import CreateGroupModal from '../../components/CreateGroup/CreateGroupModal.vue'
import CreateMeetingModal from '../../components/createmeeting/CreateMeetingModal.vue'
import UserMenu from '../../components/barrehorizontale/UserMenu.vue'
import PlanningModal from '../../components/planning/PlanningModal.vue'
import PlanningViewModal from '../../components/planning/PlanningViewModal.vue'
import GroupsModal from '../../components/groups/GroupsModal.vue'

type DashboardMeeting = {
  id: string
  title: string
  status: string
  meeting_type: string
  scheduled_start_at: string | null
  scheduled_end_at: string | null
}

type DashboardNotification = {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
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
  recent_meetings: DashboardMeeting[]
  notifications: DashboardNotification[]
}

type PlanningMeeting = {
  id: string
  title: string
  date: string
  start: string
  end: string
  participants: string[]
  groupIds: string[]
  iaEnabled: boolean
}

type PlanningResponse = {
  meetings: Array<{
    id: string
    title: string
    date: string
    start: string
    end: string
    participants: string[]
    group_ids: string[]
    ia_enabled: boolean
    status: string
    meeting_type: string
  }>
  tasks: Array<{
    id: string
    title: string
    description?: string | null
    due_at?: string | null
    status: string
  }>
}

const { authUser, fetchMe } = useAuth()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()

const showNotifications = ref(false)
const showSettings = ref(false)
const showCreateGroupModal = ref(false)
const meetingOpen = ref(false)
const showGroupsModal = ref(false)
const planningViewOpen = ref(false)
const planningOpen = ref(false)
const sidebarCollapsed = ref(false)
const chatOpen = ref(false)
const userInput = ref('')

const messages = ref([
  { type: 'bot', text: 'Bonjour 👋 Comment puis-je vous aider ?' }
])

const dashboardData = ref<DashboardResponse | null>(null)
const dashboardLoading = ref(false)
const dashboardError = ref('')

const planningData = ref<PlanningResponse | null>(null)
const planningLoading = ref(false)
const planningError = ref('')

const welcomeName = computed(() => {
  return (
    dashboardData.value?.user.display_name ||
    authUser.value?.first_name ||
    authUser.value?.display_name ||
    'utilisateur'
  )
})

const totalMeetings = computed(() => dashboardData.value?.stats.total_meetings ?? 0)
const totalGroups = computed(() => dashboardData.value?.stats.total_groups ?? 0)
const unreadNotifications = computed(() => dashboardData.value?.stats.unread_notifications ?? 0)
const recentMeetings = computed(() => dashboardData.value?.recent_meetings ?? [])
const dashboardNotifications = computed(() => dashboardData.value?.notifications ?? [])

// Mapping pour rester compatible avec PlanningViewModal actuel.
const planningMeetings = computed<PlanningMeeting[]>(() => {
  return (planningData.value?.meetings ?? []).map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    date: meeting.date,
    start: meeting.start,
    end: meeting.end,
    participants: meeting.participants,
    groupIds: meeting.group_ids,
    iaEnabled: meeting.ia_enabled
  }))
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleChat() {
  chatOpen.value = !chatOpen.value
}

function sendMessage() {
  if (!userInput.value.trim()) return

  messages.value.push({ type: 'user', text: userInput.value })
  userInput.value = ''

  setTimeout(() => {
    messages.value.push({
      type: 'bot',
      text: 'Je suis encore en développement 😊'
    })
  }, 500)
}

function statusClass(status: string) {
  if (status === 'scheduled' || status === 'live') {
    return 'status-upcoming'
  }

  if (status === 'completed' || status === 'cancelled') {
    return 'status-completed'
  }

  return 'status-completed'
}

function formatMeetingDate(value: string | null) {
  if (!value) return 'Date non définie'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('fr-FR')
}

async function handleGroupCreated() {
  // Ferme la modale de création.
  showCreateGroupModal.value = false

  // Rafraîchit le dashboard pour mettre à jour le compteur de groupes.
  await fetchDashboard()
}

async function fetchDashboard() {
  dashboardLoading.value = true
  dashboardError.value = ''

  try {
    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const data = await $fetch<DashboardResponse>(
      `${backendBaseUrl}/api/v1/dashboard`,
      {
        credentials: 'include'
      }
    )

    dashboardData.value = data
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard :', error)
    dashboardError.value = 'Impossible de charger le dashboard pour le moment.'
    dashboardData.value = null
  } finally {
    dashboardLoading.value = false
  }
}

// Charge le planning réel.
//
// Sécurité :
// - le cookie HttpOnly est envoyé automatiquement,
// - le backend décide quel utilisateur est connecté,
// - aucune donnée d'identité n'est fournie librement par le frontend.
async function fetchPlanning() {
  planningLoading.value = true
  planningError.value = ''

  try {
    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const data = await $fetch<PlanningResponse>(
      `${backendBaseUrl}/api/v1/planning`,
      {
        credentials: 'include'
      }
    )

    planningData.value = data
  } catch (error) {
    console.error('Erreur lors du chargement du planning :', error)
    planningError.value = 'Impossible de charger le planning pour le moment.'
    planningData.value = null
  } finally {
    planningLoading.value = false
  }
}

onMounted(async () => {
  try {
    if (!authUser.value) {
      await fetchMe()
    }

    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const response = await $fetch<{ authenticated?: boolean }>(
      `${backendBaseUrl}/api/v1/auth/me`,
      {
        credentials: 'include'
      }
    )

    if (!response?.authenticated) {
      await router.replace('/')
      return
    }

    await Promise.all([
      fetchDashboard(),
      fetchPlanning()
    ])
  } catch {
    await router.replace('/')
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #f0fdfa 0%, #cffafe 50%, #d1fae5 100%);
  min-height: 100vh;
}

.container {
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #f0fdfa 0%, #cffafe 50%, #d1fae5 100%);
}

.sidebar {
  background: white;
  border-right: 1px solid #99f6e4;
  width: 256px;
  transition: width 0.3s;
  position: relative;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-toggle {
  position: absolute;
  right: -12px;
  top: 24px;
  background: white;
  border: 1px solid #99f6e4;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.sidebar-toggle:hover {
  background: #f0fdfa;
}

.sidebar nav {
  padding: 16px;
  margin-top: 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: none;
  width: 100%;
  color: #4b5563;
  font-size: 14px;
}

.logo-icon-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  display: block;
  margin-top: 8px;
  margin-left: -8px;
}

.menu-item.active {
  background: linear-gradient(to right, #14b8a6, #0891b2);
  color: white;
  box-shadow: 0 4px 6px rgba(20, 184, 166, 0.3);
}

.menu-item:not(.active):hover {
  background: #f0fdfa;
}

.menu-item svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  text-align: left;
}

.sidebar.collapsed .menu-label,
.sidebar.collapsed .badge {
  display: none;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.menu-item:not(.active) .badge {
  background: #ccfbf1;
  color: #0f766e;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #99f6e4;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(to right, #0d9488, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icon-btn {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  position: relative;
}

.icon-btn:hover {
  background: #f0fdfa;
}

.icon-btn svg {
  width: 20px;
  height: 20px;
  color: #4b5563;
}

.notification-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.content-inner {
  max-width: 1280px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 32px;
}

.page-title h2 {
  font-size: 30px;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-title p {
  color: #6b7280;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: transform 0.3s;
}

.action-card:hover .action-icon {
  transform: scale(1.1);
}

.action-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-arrow {
  width: 20px;
  height: 20px;
  color: #9ca3af;
  transition: all 0.3s;
}

.action-card:hover .action-arrow {
  color: #14b8a6;
  transform: translateX(4px);
}

.action-description {
  font-size: 14px;
  color: #6b7280;
}

.meetings-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.meetings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.meetings-header h3 {
  font-size: 20px;
  color: #1f2937;
}

.view-all {
  color: #14b8a6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.view-all:hover {
  color: #0d9488;
}

.meeting-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: background 0.2s;
}

.meeting-item:hover {
  background: #f9fafb;
}

.meeting-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.meeting-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.meeting-info {
  flex: 1;
  min-width: 0;
}

.meeting-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.meeting-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
  flex-wrap: wrap;
}

.meeting-detail {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meeting-detail svg {
  width: 16px;
  height: 16px;
}

.meeting-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  text-transform: capitalize;
}

.status-upcoming {
  background: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background: #f3f4f6;
  color: #4b5563;
}

.meeting-more {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  opacity: 0;
  transition: all 0.2s;
}

.meeting-item:hover .meeting-more {
  opacity: 1;
}

.meeting-more:hover {
  background: #f3f4f6;
}

.meeting-more svg {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.chatbot-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chatbot-toggle {
  width: 55px;
  height: 55px;
  background: #4f46e5;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.chatbot-box {
  width: 280px;
  height: 360px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 10px;
}

.chatbot-header {
  background: #4f46e5;
  color: white;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.chatbot-messages {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  font-size: 14px;
}

.bot-message {
  background: #f3f4f6;
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 8px;
  width: fit-content;
}

.user-message {
  background: #4f46e5;
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 8px;
  width: fit-content;
  margin-left: auto;
}

.chatbot-input {
  display: flex;
  border-top: 1px solid #eee;
}

.chatbot-input input {
  flex: 1;
  border: none;
  padding: 10px;
  outline: none;
}

.chatbot-input button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0 15px;
  cursor: pointer;
}
</style>