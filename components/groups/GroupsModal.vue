<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="header">
        <div class="header-left">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="header-icon"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h2>Mes groupes</h2>
        </div>

        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="body">
        <div v-if="loading" class="state-message">
          Chargement des groupes...
        </div>

        <div v-else-if="error" class="state-message error">
          {{ error }}
        </div>

        <div v-else-if="groups.length === 0" class="state-message">
          Aucun groupe pour le moment.
        </div>

        <div v-else class="groups-list">
          <button
            v-for="group in groups"
            :key="group.group_id"
            class="group-item"
            @click="selectedGroupId = group.group_id"
          >
            <div class="group-avatar">
              <img
                v-if="group.profile_photo_url"
                :src="resolveGroupPhotoUrl(group.profile_photo_url)"
                alt="Photo du groupe"
                class="group-avatar-image"
              />
              <span v-else>{{ groupInitials(group.name) }}</span>
            </div>

            <div class="group-main">
              <div class="group-name">{{ group.name }}</div>

              <div class="group-meta">
                <span>{{ group.member_count }} membre(s)</span>

                <span v-if="group.my_role === 'owner'" class="owner-badge">
                  Owner
                </span>
              </div>
            </div>

            <div class="group-arrow">›</div>
          </button>
        </div>
      </div>
    </div>

    <GroupDetailsModal
      v-if="selectedGroupId"
      :group-id="selectedGroupId"
      @close="selectedGroupId = null"
      @updated="fetchGroups"
      @deleted="handleGroupDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import GroupDetailsModal from './GroupDetailsModal.vue'

type GroupListItem = {
  group_id: string
  name: string
  profile_photo_url: string | null
  member_count: number
  my_role: string
}

type GroupsListResponse = {
  groups: GroupListItem[]
}

const emit = defineEmits<{
  (e: 'close'): void
}>()

const runtimeConfig = useRuntimeConfig()

const loading = ref(false)
const error = ref('')
const groups = ref<GroupListItem[]>([])
const selectedGroupId = ref<string | null>(null)

function groupInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  const first = parts.at(0) ?? ''
  const second = parts.at(1) ?? ''

  if (!first && !second) return 'GR'
  if (!second) return first.slice(0, 2).toUpperCase()

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
}

function resolveGroupPhotoUrl(url: string) {
  if (!url) return ''

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const backendBaseUrl =
    runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

  if (url.startsWith('/')) {
    return `${backendBaseUrl}${url}`
  }

  return `${backendBaseUrl}/${url}`
}

async function fetchGroups() {
  loading.value = true
  error.value = ''

  try {
    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const response = await $fetch<GroupsListResponse>(
      `${backendBaseUrl}/api/v1/groups`,
      {
        credentials: 'include'
      }
    )

    groups.value = response.groups
  } catch (err) {
    console.error('Erreur lors du chargement des groupes :', err)
    error.value = 'Impossible de charger les groupes.'
    groups.value = []
  } finally {
    loading.value = false
  }
}

async function handleGroupDeleted() {
  selectedGroupId.value = null
  await fetchGroups()
}

onMounted(async () => {
  await fetchGroups()
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2200;
  padding: 16px;
}

.modal {
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  background: white;
  border-radius: 18px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: #14b8a6;
}

.header h2 {
  color: #0f766e;
  font-size: 22px;
  font-weight: 700;
}

.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  color: #9ca3af;
}

.body {
  padding: 20px;
  overflow-y: auto;
}

.state-message {
  text-align: center;
  padding: 40px 0;
  color: #6b7280;
}

.state-message.error {
  color: #b91c1c;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-item {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  background: white;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.group-item:hover {
  border-color: #99f6e4;
  background: #f0fdfa;
}

.group-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
  font-size: 16px;
}

.group-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.group-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.group-name {
  font-weight: 600;
  color: #111827;
  font-size: 16px;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
  font-size: 13px;
  flex-wrap: wrap;
}

.owner-badge {
  background: #ccfbf1;
  color: #0f766e;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
}

.group-arrow {
  font-size: 26px;
  color: #9ca3af;
  flex-shrink: 0;
}
</style>