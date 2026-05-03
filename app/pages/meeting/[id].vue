<template>
  <div class="lobby-page">

    <!-- Accès refusé -->
    <div v-if="accessDenied" class="centered">
      <div class="error-card">
        <div class="error-icon">!</div>
        <h2>Accès refusé</h2>
        <p>Vous n'êtes pas autorisé à accéder à cette réunion.</p>
        <NuxtLink to="/dashboard" class="btn-primary">Retour au tableau de bord</NuxtLink>
      </div>
    </div>

    <!-- Chargement -->
    <div v-else-if="loading" class="centered">
      <div class="spinner"></div>
      <p class="loading-text">Vérification de l'accès…</p>
    </div>

    <!-- Lobby -->
    <div v-else-if="meeting" class="lobby-layout">

      <!-- Colonne gauche : prévisualisation -->
      <div class="preview-col">
        <div class="video-wrapper">
          <video
            v-if="camOn && videoStream"
            ref="videoEl"
            autoplay
            muted
            playsinline
            class="video-preview"
          ></video>
          <div v-else class="video-placeholder">
            <div class="avatar-circle">{{ initials }}</div>
          </div>

          <!-- Badges état -->
          <div class="media-badges">
            <span class="badge" :class="micOn ? 'badge-on' : 'badge-off'">
              {{ micOn ? 'Micro' : 'Micro coupé' }}
            </span>
            <span class="badge" :class="camOn ? 'badge-on' : 'badge-off'">
              {{ camOn ? 'Caméra' : 'Caméra off' }}
            </span>
          </div>
        </div>

        <!-- Contrôles -->
        <div class="controls-row">
          <button
            class="control-btn"
            :class="micOn ? 'control-on' : 'control-off'"
            @click="toggleMic"
          >
            <span class="control-icon"></span>
            <span>{{ micOn ? 'Micro actif' : 'Micro coupé' }}</span>
          </button>

          <button
            class="control-btn"
            :class="camOn ? 'control-on' : 'control-off'"
            @click="toggleCam"
          >
            <span class="control-icon"></span>
            <span>{{ camOn ? 'Caméra active' : 'Caméra désactivée' }}</span>
          </button>
        </div>

        <p v-if="mediaError" class="media-error">{{ mediaError }}</p>
      </div>

      <!-- Colonne droite : infos + action -->
      <div class="info-col">
        <div class="brand">
          <span class="brand-name">TrueGather</span>
        </div>

        <div class="meeting-card">
          <p class="meeting-label">{{ isHost ? 'Vous organisez' : 'Vous êtes invité à' }}</p>
          <h1 class="meeting-title">{{ meeting.title }}</h1>

          <div class="meeting-meta">
            <span class="meta-badge" :class="meeting.status === 'live' ? 'meta-live' : 'meta-scheduled'">
              {{ meeting.status === 'live' ? 'En direct' : 'Planifiée' }}
            </span>
            <span v-if="meeting.room_code" class="meta-code">
              Code : <strong>{{ meeting.room_code }}</strong>
            </span>
          </div>

          <div v-if="meeting.ai_enabled" class="ai-badge">
            <span>IA activée</span>
            <span class="ai-sub">Transcription et résumé automatique</span>
          </div>

          <div class="participants-preview">
            <p class="participants-label">Participants ({{ meeting.participants.length }})</p>
            <div class="participants-list">
              <div
                v-for="p in meeting.participants.slice(0, 5)"
                :key="p.keycloak_id"
                class="participant-chip"
              >
                {{ p.display_name || p.email }}
              </div>
              <div v-if="meeting.participants.length > 5" class="participant-chip more">
                +{{ meeting.participants.length - 5 }}
              </div>
            </div>
          </div>
        </div>

        <button class="join-btn" @click="joinMeeting" :disabled="joining">
          {{ joining ? 'Connexion…' : (isHost ? 'Démarrer la réunion' : 'Rejoindre') }}
        </button>

        <p class="lobby-hint" v-if="!isHost">
          Vos paramètres micro/caméra seront appliqués à l'entrée.
        </p>

        <NuxtLink to="/dashboard" class="back-link">← Retour au tableau de bord</NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const meetingId = route.params.id as string

interface Participant {
  keycloak_id: string
  email: string
  display_name?: string
  role: string
  status: string
}

interface MeetingDetail {
  meeting_id: string
  title: string
  status: string
  meeting_type: string
  ai_enabled: boolean
  room_code?: string
  meeting_link?: string
  host_keycloak_id: string
  participants: Participant[]
  user_role: string
}

const loading = ref(true)
const accessDenied = ref(false)
const meeting = ref<MeetingDetail | null>(null)
const micOn = ref(true)
const camOn = ref(true)
const joining = ref(false)
const mediaError = ref('')
const videoStream = ref<MediaStream | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)

const isHost = computed(() => meeting.value?.user_role === 'host')
const initials = computed(() => {
  const p = meeting.value?.participants.find(p => p.role === 'host')
  const name = p?.display_name || p?.email || '?'
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
})

onMounted(async () => {
  await fetchMeeting()
  if (meeting.value) {
    await startMediaPreview()
  }
})

onUnmounted(() => {
  stopMediaPreview()
})

async function fetchMeeting() {
  try {
    const res = await fetch(`/api/v1/meetings/${meetingId}`, {
      credentials: 'include',
    })

    if (res.status === 401) {
      router.push('/')
      return
    }

    if (res.status === 403 || res.status === 404) {
      accessDenied.value = true
      loading.value = false
      return
    }

    if (!res.ok) {
      accessDenied.value = true
      loading.value = false
      return
    }

    meeting.value = await res.json()
  } catch {
    accessDenied.value = true
  } finally {
    loading.value = false
  }
}

async function startMediaPreview() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: camOn.value,
      audio: micOn.value,
    })
    videoStream.value = stream
    applyStreamToVideo()
  } catch (e: any) {
    mediaError.value = 'Impossible d\'accéder à la caméra/micro. Vous pourrez les activer dans la réunion.'
  }
}

function stopMediaPreview() {
  videoStream.value?.getTracks().forEach(t => t.stop())
  videoStream.value = null
}

function applyStreamToVideo() {
  if (videoEl.value && videoStream.value) {
    videoEl.value.srcObject = videoStream.value
  }
}

watch(videoEl, (el) => {
  if (el && videoStream.value) {
    el.srcObject = videoStream.value
  }
})

function toggleMic() {
  micOn.value = !micOn.value
  videoStream.value?.getAudioTracks().forEach(t => {
    t.enabled = micOn.value
  })
}

function toggleCam() {
  camOn.value = !camOn.value
  videoStream.value?.getVideoTracks().forEach(t => {
    t.enabled = camOn.value
  })
}

function joinMeeting() {
  joining.value = true
  // TODO (WebRTC) : connecter au room via WebSocket signaling
  // room_code : meeting.value?.room_code
  // meeting_id : meetingId
  // Les préférences : micOn.value, camOn.value
  // Pour l'instant on reste sur la page (feature WebRTC à implémenter séparément)
  joining.value = false
}
</script>

<style scoped>
.lobby-page {
  min-height: 100vh;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Arial', sans-serif;
}

.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text {
  color: #94a3b8;
  font-size: 15px;
}

.error-card {
  background: #1e293b;
  border-radius: 20px;
  padding: 48px 40px;
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-card h2 {
  color: white;
  font-size: 22px;
  margin: 0 0 12px;
}

.error-card p {
  color: #94a3b8;
  font-size: 15px;
  margin: 0 0 24px;
  line-height: 1.6;
}

.btn-primary {
  display: inline-block;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
}

/* Layout lobby */
.lobby-layout {
  display: flex;
  gap: 48px;
  align-items: center;
  padding: 40px;
  max-width: 1100px;
  width: 100%;
}

/* Prévisualisation */
.preview-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-wrapper {
  position: relative;
  aspect-ratio: 16/9;
  background: #1e293b;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #334155;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  font-weight: 700;
}

.media-badges {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  backdrop-filter: blur(4px);
}

.badge-on { background: rgba(20, 184, 166, 0.3); border: 1px solid #14b8a6; }
.badge-off { background: rgba(239, 68, 68, 0.3); border: 1px solid #ef4444; }

.controls-row {
  display: flex;
  gap: 12px;
}

.control-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.control-on {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid #334155;
}

.control-off {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.control-btn:hover { opacity: 0.85; }
.control-icon { font-size: 18px; }

.media-error {
  color: #fbbf24;
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}

/* Infos */
.info-col {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-name {
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.meeting-card {
  background: #1e293b;
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #334155;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meeting-label {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.meeting-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
  line-height: 1.3;
}

.meeting-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.meta-live {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.meta-scheduled {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.meta-code {
  font-size: 13px;
  color: #64748b;
  font-family: monospace;
}

.ai-badge {
  background: rgba(20, 184, 166, 0.1);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: #5eead4;
}

.ai-sub { font-size: 11px; color: #64748b; }

.participants-label {
  margin: 0 0 8px;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.participant-chip {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  color: #94a3b8;
}

.participant-chip.more {
  color: #64748b;
}

.join-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(20, 184, 166, 0.35);
}

.join-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(20, 184, 166, 0.5);
}

.join-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.lobby-hint {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: #475569;
}

.back-link {
  text-align: center;
  font-size: 14px;
  color: #475569;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover { color: #94a3b8; }

@media (max-width: 768px) {
  .lobby-layout {
    flex-direction: column;
    padding: 20px;
  }
  .info-col {
    width: 100%;
  }
}
</style>
