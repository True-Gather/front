<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <!-- Header -->
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
          <h2>Détail du groupe</h2>
        </div>

        <button class="close-btn" type="button" @click="emit('close')">✕</button>
      </div>

      <!-- Body -->
      <div class="body">
        <div v-if="loading" class="state-message">
          Chargement du groupe...
        </div>

        <div v-else-if="error" class="state-message error">
          {{ error }}
        </div>

        <div v-else-if="detail">
          <!-- Bloc principal du groupe -->
          <div class="group-hero">
            <div class="group-avatar">
              <img
                v-if="detail.group.profile_photo_url"
                :src="resolveGroupPhotoUrl(detail.group.profile_photo_url)"
                alt="Photo du groupe"
                class="group-avatar-image"
              />
              <span v-else>{{ groupInitials }}</span>
            </div>

            <div class="group-info">
              <div class="group-title-row">
                <h3>{{ detail.group.name }}</h3>
                <span v-if="detail.my_role === 'owner'" class="owner-badge">
                  Owner
                </span>
                <span v-else-if="detail.my_role === 'admin'" class="admin-badge">
                  Admin
                </span>
              </div>

              <p v-if="detail.group.description" class="group-description">
                {{ detail.group.description }}
              </p>

              <p class="group-members-count">
                {{ detail.group.member_count }} membre(s)
              </p>
            </div>
          </div>

          <!-- Actions owner/admin -->
          <div v-if="canManageMembers" class="actions-row">
            <button class="primary-btn" type="button" @click="toggleAddMemberForm">
              {{ showAddMemberForm ? 'Fermer' : 'Ajouter un membre' }}
            </button>

            <button
              v-if="canDeleteGroup"
              class="danger-outline-btn"
              type="button"
              @click="openDeleteGroupConfirm"
              :disabled="deleteLoading"
            >
              {{ deleteLoading ? 'Suppression...' : 'Supprimer le groupe' }}
            </button>
          </div>

          <!-- Ajout membre avec recherche -->
          <div v-if="showAddMemberForm" class="add-member-box">
            <label class="field-label">Ajouter un membre</label>

            <div class="add-member-row">
              <input
                v-model="memberSearchInput"
                type="text"
                placeholder="Nom ou email d’un membre TrueGather"
                class="text-input"
                @input="handleMemberSearchInput"
                @keyup.enter.prevent="addFirstSuggestion"
              />

              <button
                class="primary-btn"
                type="button"
                @click="addFirstSuggestion"
                :disabled="addLoading"
              >
                {{ addLoading ? 'Envoi...' : 'Inviter' }}
              </button>
            </div>

            <!-- Suggestions -->
            <div v-if="showSuggestions" class="suggestions">
              <button
                v-for="suggestedUser in suggestions"
                :key="suggestedUser.keycloak_id"
                class="suggestion-item"
                type="button"
                @click="selectSuggestedUser(suggestedUser)"
              >
                <div class="suggestion-avatar">
                  {{ userInitials(suggestedUser.display_name) }}
                </div>

                <div class="suggestion-info">
                  <div class="suggestion-name">{{ suggestedUser.display_name }}</div>
                  <div class="suggestion-email">{{ suggestedUser.email }}</div>
                </div>
              </button>

              <div v-if="searchLoading" class="suggestion-empty">
                Recherche...
              </div>

              <div v-else-if="suggestions.length === 0" class="suggestion-empty">
                Aucun utilisateur TrueGather trouvé.
              </div>
            </div>

            <p v-if="actionError" class="action-error">
              {{ actionError }}
            </p>
          </div>

          <!-- Invitations en attente -->
          <div
            v-if="detail.pending_invitations && detail.pending_invitations.length > 0"
            class="members-section"
          >
            <h4>Invitations en attente</h4>

            <div class="members-list">
              <div
                v-for="invitation in detail.pending_invitations"
                :key="invitation.group_invitation_id"
                class="member-item pending"
              >
                <div class="member-main">
                  <div class="member-avatar pending-avatar">
                    {{ userInitials(invitation.invited_user_display_name) }}
                  </div>

                  <div class="member-info">
                    <div class="member-name-row">
                      <span class="member-name">
                        {{ invitation.invited_user_display_name }}
                      </span>
                      <span class="pending-badge">En attente</span>
                    </div>

                    <div class="member-email">
                      {{ invitation.invited_user_email }}
                    </div>
                  </div>
                </div>

                <div v-if="canManageMembers" class="member-actions">
                  <button
                    class="menu-btn"
                    type="button"
                    @click="toggleInvitationMenu(invitation.group_invitation_id)"
                  >
                    ⋯
                  </button>

                  <div
                    v-if="invitationMenuOpenFor === invitation.group_invitation_id"
                    class="member-menu"
                  >
                    <button
                      class="danger-btn"
                      type="button"
                      @click="openCancelInvitationConfirm(invitation.group_invitation_id)"
                    >
                      Annuler l’ajout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Membres acceptés -->
          <div class="members-section">
            <h4>Membres</h4>

            <div v-if="detail.members.length === 0" class="state-message">
              Aucun membre dans ce groupe.
            </div>

            <div v-else class="members-list">
              <div
                v-for="member in detail.members"
                :key="member.user_keycloak_id"
                class="member-item"
              >
                <div class="member-main">
                  <div class="member-avatar">
                    {{ userInitials(member.display_name) }}
                  </div>

                  <div class="member-info">
                    <div class="member-name-row">
                      <span class="member-name">{{ member.display_name }}</span>

                      <span v-if="member.role === 'owner'" class="owner-badge small">
                        Owner
                      </span>

                      <span v-else-if="member.role === 'admin'" class="admin-badge small">
                        Admin
                      </span>

                      <span v-else class="accepted-badge">
                        Membre
                      </span>
                    </div>

                    <div class="member-email">{{ member.email }}</div>
                  </div>
                </div>

                <div
                  v-if="canManageMembers && member.user_keycloak_id !== detail.current_user_keycloak_id"
                  class="member-actions"
                >
                  <button
                    class="menu-btn"
                    type="button"
                    @click="toggleMemberMenu(member.user_keycloak_id)"
                  >
                    ⋯
                  </button>

                  <div
                    v-if="memberMenuOpenFor === member.user_keycloak_id"
                    class="member-menu"
                  >
                    <button
                      class="danger-btn"
                      type="button"
                      @click="openRemoveMemberConfirm(member.user_keycloak_id)"
                    >
                      Retirer du groupe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-if="actionError" class="action-error bottom">
            {{ actionError }}
          </p>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation custom -->
    <div v-if="confirmOpen" class="confirm-overlay" @click.self="closeConfirmModal">
      <div class="confirm-modal">
        <h3 class="confirm-title">
          {{
            confirmMode === 'delete_group'
              ? 'Supprimer ce groupe ?'
              : confirmMode === 'cancel_invitation'
                ? 'Annuler cet ajout ?'
                : 'Retirer ce membre du groupe ?'
          }}
        </h3>

        <p class="confirm-text">
          {{
            confirmMode === 'delete_group'
              ? 'Cette action est définitive.'
              : confirmMode === 'cancel_invitation'
                ? 'L’invitation en attente sera annulée.'
                : 'Le membre sera retiré du groupe.'
          }}
        </p>

        <div class="confirm-actions">
          <button class="confirm-cancel-btn" type="button" @click="closeConfirmModal">
            Annuler
          </button>
          <button class="confirm-danger-btn" type="button" @click="confirmAction">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { $fetch } from 'ofetch'

/**
 * Invitation pending renvoyée par le backend.
 */
type GroupInvitationItem = {
  group_invitation_id: string
  group_id: string
  invited_user_keycloak_id: string
  invited_user_display_name: string
  invited_user_email: string
  invited_by_user_keycloak_id: string
  status: string
  created_at: string
  responded_at: string | null
  cancelled_at: string | null
}

/**
 * Réponse backend pour le détail d’un groupe.
 */
type GroupDetailResponse = {
  group: {
    group_id: string
    name: string
    description: string | null
    profile_photo_url: string | null
    member_count: number
  }
  members: Array<{
    user_keycloak_id: string
    display_name: string
    email: string
    role: string
  }>
  pending_invitations: GroupInvitationItem[]
  my_role: string
  current_user_keycloak_id: string
}

/**
 * Utilisateur renvoyé par la recherche backend.
 */
type SearchUserItem = {
  keycloak_id: string
  display_name: string
  first_name?: string | null
  last_name?: string | null
  email: string
}

type SearchUsersResponse = {
  users: SearchUserItem[]
}

type ConfirmMode = 'remove_member' | 'delete_group' | 'cancel_invitation' | null

const props = defineProps<{
  groupId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
  (e: 'deleted'): void
}>()

const runtimeConfig = useRuntimeConfig()

const loading = ref<boolean>(false)
const error = ref<string>('')
const detail = ref<GroupDetailResponse | null>(null)

const showAddMemberForm = ref<boolean>(false)
const addLoading = ref<boolean>(false)
const deleteLoading = ref<boolean>(false)
const cancelInvitationLoading = ref<boolean>(false)
const actionError = ref<string>('')
const successMessage = ref<string>('')

const memberMenuOpenFor = ref<string | null>(null)
const invitationMenuOpenFor = ref<string | null>(null)

/**
 * Recherche utilisateur pour ajout membre.
 */
const memberSearchInput = ref<string>('')
const suggestions = ref<SearchUserItem[]>([])
const searchLoading = ref<boolean>(false)
const showSuggestions = ref<boolean>(false)
const searchTimeout = ref<number | null>(null)

/**
 * Etat modale custom de confirmation.
 */
const confirmOpen = ref<boolean>(false)
const confirmMode = ref<ConfirmMode>(null)
const pendingMemberId = ref<string | null>(null)
const pendingInvitationId = ref<string | null>(null)

/**
 * Owner et admin peuvent gérer les membres.
 */
const canManageMembers = computed<boolean>(() => {
  return detail.value?.my_role === 'owner' || detail.value?.my_role === 'admin'
})

/**
 * Seul owner peut supprimer le groupe.
 */
const canDeleteGroup = computed<boolean>(() => {
  return detail.value?.my_role === 'owner'
})

/**
 * Initiales du groupe si aucune photo n’existe.
 */
const groupInitials = computed<string>(() => {
  const name = detail.value?.group.name?.trim() || 'Groupe'
  const parts = name.split(/\s+/).filter(Boolean)

  const first = parts.at(0) ?? ''
  const second = parts.at(1) ?? ''

  if (!first && !second) return 'GR'
  if (!second) return first.slice(0, 2).toUpperCase()

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
})

/**
 * Construit une URL photo valide.
 */
function resolveGroupPhotoUrl(url: string): string {
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

/**
 * Calcule les initiales d’un nom affiché.
 */
function userInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)

  const first = parts.at(0) ?? ''
  const second = parts.at(1) ?? ''

  if (!first && !second) return 'U'
  if (!second) return first.slice(0, 2).toUpperCase()

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
}

function toggleMemberMenu(userKeycloakId: string): void {
  invitationMenuOpenFor.value = null
  memberMenuOpenFor.value =
    memberMenuOpenFor.value === userKeycloakId ? null : userKeycloakId
}

function toggleInvitationMenu(groupInvitationId: string): void {
  memberMenuOpenFor.value = null
  invitationMenuOpenFor.value =
    invitationMenuOpenFor.value === groupInvitationId ? null : groupInvitationId
}

function toggleAddMemberForm(): void {
  showAddMemberForm.value = !showAddMemberForm.value
  actionError.value = ''
  successMessage.value = ''

  if (!showAddMemberForm.value) {
    memberSearchInput.value = ''
    suggestions.value = []
    showSuggestions.value = false
  }
}

function openRemoveMemberConfirm(userKeycloakId: string): void {
  memberMenuOpenFor.value = null
  pendingMemberId.value = userKeycloakId
  confirmMode.value = 'remove_member'
  confirmOpen.value = true
}

function openDeleteGroupConfirm(): void {
  confirmMode.value = 'delete_group'
  confirmOpen.value = true
}

function openCancelInvitationConfirm(groupInvitationId: string): void {
  invitationMenuOpenFor.value = null
  pendingInvitationId.value = groupInvitationId
  confirmMode.value = 'cancel_invitation'
  confirmOpen.value = true
}

function closeConfirmModal(): void {
  confirmOpen.value = false
  confirmMode.value = null
  pendingMemberId.value = null
  pendingInvitationId.value = null
}

async function confirmAction(): Promise<void> {
  if (confirmMode.value === 'remove_member' && pendingMemberId.value) {
    await reallyRemoveMember(pendingMemberId.value)
  } else if (confirmMode.value === 'delete_group') {
    await reallyDeleteGroup()
  } else if (confirmMode.value === 'cancel_invitation' && pendingInvitationId.value) {
    await reallyCancelInvitation(pendingInvitationId.value)
  }

  closeConfirmModal()
}

/**
 * Charge le détail du groupe.
 */
async function fetchGroupDetail(): Promise<void> {
  loading.value = true
  error.value = ''
  successMessage.value = ''
  actionError.value = ''
  memberMenuOpenFor.value = null
  invitationMenuOpenFor.value = null

  try {
    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const response = await $fetch<GroupDetailResponse>(
      `${backendBaseUrl}/api/v1/groups/${props.groupId}`,
      {
        credentials: 'include'
      }
    )

    detail.value = response
  } catch (err) {
    console.error('Erreur lors du chargement du détail du groupe :', err)
    error.value = 'Impossible de charger ce groupe.'
    detail.value = null
  } finally {
    loading.value = false
  }
}

/**
 * Recherche des utilisateurs existants,
 * en excluant membres déjà présents + invitations déjà pending.
 */
async function searchUsers(query: string): Promise<void> {
  const trimmedQuery = query.trim()

  if (trimmedQuery.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  searchLoading.value = true
  showSuggestions.value = true

  try {
    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const response = await $fetch<SearchUsersResponse>(
      `${backendBaseUrl}/api/v1/users/search`,
      {
        credentials: 'include',
        query: {
          q: trimmedQuery
        }
      }
    )

    const existingMemberIds = new Set(
      detail.value?.members.map((member) => member.user_keycloak_id) ?? []
    )

    const existingPendingInvitationIds = new Set(
      detail.value?.pending_invitations.map((invitation) => invitation.invited_user_keycloak_id) ?? []
    )

    suggestions.value = response.users.filter((suggestedUser: SearchUserItem) => {
      return (
        !existingMemberIds.has(suggestedUser.keycloak_id) &&
        !existingPendingInvitationIds.has(suggestedUser.keycloak_id)
      )
    })
  } catch (err) {
    console.error('Erreur lors de la recherche des utilisateurs :', err)
    suggestions.value = []
    showSuggestions.value = false
  } finally {
    searchLoading.value = false
  }
}

function handleMemberSearchInput(): void {
  if (searchTimeout.value) {
    window.clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    void searchUsers(memberSearchInput.value)
  }, 250)
}

/**
 * Envoie une invitation au groupe.
 */
async function inviteMemberByEmail(email: string): Promise<void> {
  addLoading.value = true
  actionError.value = ''
  successMessage.value = ''

  try {
    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const response = await $fetch<{ message: string }>(
      `${backendBaseUrl}/api/v1/groups/${props.groupId}/members`,
      {
        method: 'POST',
        credentials: 'include',
        body: {
          email
        }
      }
    )

    successMessage.value = response.message
    memberSearchInput.value = ''
    suggestions.value = []
    showSuggestions.value = false
    showAddMemberForm.value = false

    await fetchGroupDetail()
    emit('updated')
  } catch (err: any) {
    console.error('Erreur lors de l’invitation du membre :', err)
    actionError.value =
      err?.data?.message ||
      'Impossible d’envoyer cette invitation.'
  } finally {
    addLoading.value = false
  }
}

function addFirstSuggestion(): void {
  const firstSuggestion = suggestions.value.at(0)

  if (!firstSuggestion) {
    return
  }

  void selectSuggestedUser(firstSuggestion)
}

async function selectSuggestedUser(user: SearchUserItem): Promise<void> {
  await inviteMemberByEmail(user.email)
}

/**
 * Retire un membre déjà accepté.
 */
async function reallyRemoveMember(userKeycloakId: string): Promise<void> {
  actionError.value = ''
  successMessage.value = ''

  try {
    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const response = await $fetch<{ message: string }>(
      `${backendBaseUrl}/api/v1/groups/${props.groupId}/members/${userKeycloakId}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    )

    successMessage.value = response.message

    await fetchGroupDetail()
    emit('updated')
  } catch (err: any) {
    console.error('Erreur lors de la suppression du membre :', err)
    actionError.value =
      err?.data?.message ||
      'Impossible de retirer ce membre.'
  }
}

/**
 * Annule une invitation pending.
 */
async function reallyCancelInvitation(groupInvitationId: string): Promise<void> {
  cancelInvitationLoading.value = true
  actionError.value = ''
  successMessage.value = ''

  try {
    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const response = await $fetch<{ message: string }>(
      `${backendBaseUrl}/api/v1/groups/${props.groupId}/invitations/${groupInvitationId}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    )

    successMessage.value = response.message

    await fetchGroupDetail()
    emit('updated')
  } catch (err: any) {
    console.error('Erreur lors de l’annulation de l’invitation :', err)
    actionError.value =
      err?.data?.message ||
      'Impossible d’annuler cet ajout.'
  } finally {
    cancelInvitationLoading.value = false
  }
}

/**
 * Supprime le groupe.
 */
async function reallyDeleteGroup(): Promise<void> {
  deleteLoading.value = true
  actionError.value = ''
  successMessage.value = ''

  try {
    const backendBaseUrl =
      runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

    const response = await $fetch<{ message: string }>(
      `${backendBaseUrl}/api/v1/groups/${props.groupId}`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    )

    successMessage.value = response.message
    emit('deleted')
    emit('updated')
    emit('close')
  } catch (err: any) {
    console.error('Erreur lors de la suppression du groupe :', err)
    actionError.value =
      err?.data?.message ||
      'Impossible de supprimer le groupe.'
  } finally {
    deleteLoading.value = false
  }
}

onMounted(async () => {
  await fetchGroupDetail()
})

onBeforeUnmount(() => {
  if (searchTimeout.value) {
    window.clearTimeout(searchTimeout.value)
  }
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
  z-index: 2300;
  padding: 16px;
}

.modal {
  width: 100%;
  max-width: 760px;
  max-height: 88vh;
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
  padding: 32px 0;
  color: #6b7280;
}

.state-message.error {
  color: #b91c1c;
}

.group-hero {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 22px;
}

.group-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  overflow: hidden;
  flex-shrink: 0;
}

.group-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.group-title-row h3 {
  font-size: 24px;
  color: #111827;
}

.group-description {
  color: #4b5563;
}

.group-members-count {
  color: #6b7280;
  font-size: 14px;
}

.owner-badge {
  background: #ccfbf1;
  color: #0f766e;
  padding: 5px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 12px;
}

.owner-badge.small {
  font-size: 11px;
  padding: 3px 8px;
}

.admin-badge {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 5px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 12px;
}

.admin-badge.small {
  font-size: 11px;
  padding: 3px 8px;
}

.pending-badge {
  background: #fef3c7;
  color: #b45309;
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 11px;
}

.accepted-badge {
  background: #ecfdf5;
  color: #047857;
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 11px;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.add-member-box {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 22px;
  background: #f9fafb;
  position: relative;
}

.field-label {
  display: block;
  margin-bottom: 10px;
  color: #374151;
  font-weight: 600;
}

.add-member-row {
  display: flex;
  gap: 10px;
}

.text-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
}

.text-input:focus {
  border-color: #14b8a6;
}

.primary-btn {
  border: none;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.danger-outline-btn {
  border: 1px solid #ef4444;
  background: white;
  color: #b91c1c;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.danger-outline-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.members-section h4 {
  font-size: 18px;
  color: #111827;
  margin-bottom: 14px;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
}

.member-item.pending {
  background: #fffdfa;
  border-color: #fde68a;
}

.member-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.member-avatar,
.suggestion-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1e40af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.pending-avatar {
  background: #fef3c7;
  color: #b45309;
}

.member-info {
  min-width: 0;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.member-name {
  font-weight: 600;
  color: #111827;
}

.member-email {
  color: #6b7280;
  font-size: 14px;
  word-break: break-word;
}

.member-actions {
  position: relative;
}

.menu-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 24px;
  color: #6b7280;
  line-height: 1;
}

.member-menu {
  position: absolute;
  right: 0;
  top: 28px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  z-index: 5;
}

.danger-btn {
  border: none;
  background: #fef2f2;
  color: #b91c1c;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}

.action-error {
  margin-top: 10px;
  color: #b91c1c;
  font-size: 14px;
}

.action-error.bottom {
  margin-top: 16px;
}

.success-message {
  margin-top: 16px;
  color: #0f766e;
  font-weight: 600;
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2600;
}

.confirm-modal {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.18);
}

.confirm-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}

.confirm-text {
  color: #4b5563;
  margin-bottom: 18px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-cancel-btn {
  background: none;
  border: 1px solid #d1d5db;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  color: #374151;
  font-weight: 600;
}

.confirm-danger-btn {
  border: none;
  background: #dc2626;
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.suggestions {
  margin-top: 10px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: white;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.suggestion-item {
  width: 100%;
  border: none;
  background: white;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
}

.suggestion-item:hover {
  background: #f0fdfa;
}

.suggestion-info {
  min-width: 0;
}

.suggestion-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.suggestion-email {
  font-size: 13px;
  color: #6b7280;
  word-break: break-word;
}

.suggestion-empty {
  padding: 12px;
  font-size: 13px;
  color: #6b7280;
}
</style>