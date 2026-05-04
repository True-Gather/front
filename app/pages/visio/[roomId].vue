<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const roomId = route.params.roomId as string

const {
  localStream,
  remotePeers,
  localPeerId,
  roomError,
  mode,
  screenOn,
  chatMessages,
  signaling,
  startLocalStream,
  joinRoom,
  leaveRoom,
  toggleAudio,
  toggleVideo,
  toggleScreenShare,
  sendChatMessage,
} = useWebRTC()

// ─── Vidéo locale ────────────────────────────────────────────────────────────

const localVideoEl = ref<HTMLVideoElement | null>(null)

// watchEffect se réexécute dès que localVideoEl OU localStream change,
// ce qui couvre le cas où le stream arrive avant que le <video> soit rendu.
watchEffect(() => {
  const el = localVideoEl.value
  const stream = localStream.value
  if (el && stream) {
    if (el.srcObject !== stream) {
      el.srcObject = stream
      el.play().catch(() => {})
    }
  }
})

// ─── États UI ────────────────────────────────────────────────────────────────

const audioOn = ref(true)
const videoOn = ref(true)
const joining = ref(true)
const setupError = ref<string | null>(null)
const chatOpen = ref(false)
const participantsOpen = ref(false)
const chatInput = ref('')
const chatEndEl = ref<HTMLDivElement | null>(null)

watch(roomError, async (msg) => {
  if (!msg) return
  localStream.value?.getTracks().forEach((t) => t.stop())
  joining.value = false
  setupError.value = msg
  await new Promise((r) => setTimeout(r, 3000))
  router.push('/dashboard')
})

// Auto-scroll chat au dernier message
watch(chatMessages, async () => {
  await nextTick()
  chatEndEl.value?.scrollIntoView({ behavior: 'smooth' })
}, { deep: true })

// ─── Layout de grille adaptatif ──────────────────────────────────────────────

const total = computed(() => remotePeers.value.length + 1)

const layoutClass = computed(() => {
  switch (total.value) {
    case 1: return 'layout-1'
    case 2: return 'layout-2'
    case 3: return 'layout-3'
    case 4: return 'layout-4'
    default: return 'layout-n'
  }
})

// ─── Démarrage ───────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    await startLocalStream(true, true)
  } catch {
    setupError.value = "Accès refusé à la caméra/micro. Autorisez l'accès dans votre navigateur."
    joining.value = false
    return
  }
  try {
    await joinRoom(roomId)
  } catch {
    setupError.value = 'Impossible de rejoindre la room. Êtes-vous bien connecté ?'
  } finally {
    joining.value = false
  }
})

// ─── Contrôles ───────────────────────────────────────────────────────────────

const handleToggleAudio = () => { audioOn.value = toggleAudio() }
const handleToggleVideo = () => { videoOn.value = toggleVideo() }
const handleToggleScreen = async () => { await toggleScreenShare() }
const handleLeave = async () => { leaveRoom(); await router.push('/dashboard') }

const linkCopied = ref(false)
const copyLink = async () => {
  await navigator.clipboard.writeText(window.location.href)
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2000)
}

const handleSendChat = () => {
  const text = chatInput.value.trim()
  if (!text) return
  sendChatMessage(text)
  chatInput.value = ''
}

const handleChatKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendChat()
  }
}
</script>

<template>
  <div class="visio-page">

    <!-- Chargement -->
    <div v-if="joining" class="overlay-screen">
      <div class="spinner" />
      <p>Connexion à la room <code>{{ roomId }}</code>…</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="setupError" class="overlay-screen error-screen">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
      </svg>
      <p>{{ setupError }}</p>
      <button class="btn-secondary" @click="router.push('/dashboard')">← Tableau de bord</button>
    </div>

    <!-- Interface principale -->
    <template v-else>

      <!-- Header -->
      <header class="visio-header">
        <div class="header-left">
          <div class="room-brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2">
              <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
            </svg>
            <span class="room-name">{{ roomId }}</span>
          </div>
          <span class="mode-badge" :class="mode === 'sfu' ? 'mode-sfu' : 'mode-p2p'">
            {{ mode === 'sfu' ? 'SFU' : 'P2P' }}
          </span>
        </div>

        <div class="header-center">
          <div class="participants-pill">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {{ total }} participant{{ total > 1 ? 's' : '' }}
          </div>
        </div>

        <div class="header-right">
          <button class="icon-btn" :class="{ 'icon-btn-active': participantsOpen }" title="Participants" @click="participantsOpen = !participantsOpen">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </button>
          <button class="icon-btn" :class="{ 'icon-btn-active': chatOpen }" title="Chat" @click="chatOpen = !chatOpen">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span v-if="chatMessages.length > 0 && !chatOpen" class="chat-notif">{{ chatMessages.length }}</span>
          </button>
          <button class="icon-btn" :class="{ copied: linkCopied }" @click="copyLink" title="Copier le lien">
            <svg v-if="!linkCopied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <div class="ws-pill" :class="signaling.connected.value ? 'ws-ok' : 'ws-ko'">
            <span class="ws-dot" />
            {{ signaling.connected.value ? 'En ligne' : 'Hors ligne' }}
          </div>
        </div>
      </header>

      <!-- Contenu principal : vidéo + chat -->
      <div class="visio-body">

        <!-- Grille vidéos -->
        <main class="visio-main" :class="[layoutClass, chatOpen ? 'with-chat' : '']">
          <!-- Flux local -->
          <div class="video-tile local-tile">
            <video ref="localVideoEl" autoplay muted playsinline class="video-el" />
            <div class="tile-overlay">
              <span v-if="!audioOn" class="tile-badge-mute">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="2" x2="22" y1="2" y2="22"/>
                  <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
                  <path d="M5 10v2a7 7 0 0 0 12 5"/>
                  <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
              </span>
              <span v-if="screenOn" class="tile-badge-screen">Écran</span>
            </div>
            <div class="tile-label">Vous</div>
          </div>

          <!-- Flux distants -->
          <RemoteVideoTile
            v-for="peer in remotePeers"
            :key="peer.peerId"
            :stream="peer.stream"
            :label="peer.peerId.slice(0, 8)"
          />

          <!-- Placeholder -->
          <div v-if="remotePeers.length === 0" class="waiting-tile">
            <div class="waiting-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p class="waiting-text">En attente de participants…</p>
            <button class="share-link-btn" @click="copyLink">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              {{ linkCopied ? 'Lien copié !' : 'Copier le lien d\'invitation' }}
            </button>
          </div>
        </main>

        <!-- Panneau Participants -->
        <aside v-if="participantsOpen" class="side-panel">
          <div class="side-header">
            <span>Participants ({{ total }})</span>
            <button class="chat-close" @click="participantsOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="participants-list">
            <!-- Vous-même -->
            <div class="participant-row participant-local">
              <div class="participant-avatar">V</div>
              <div class="participant-info">
                <span class="participant-name">Vous</span>
                <span class="participant-id">{{ localPeerId?.slice(0, 12) ?? '…' }}</span>
              </div>
              <div class="participant-status">
                <span v-if="!audioOn" class="status-icon status-muted" title="Micro coupé">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="2" x2="22" y1="2" y2="22"/>
                    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
                    <path d="M5 10v2a7 7 0 0 0 12 5"/>
                    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </span>
                <span v-if="!videoOn" class="status-icon status-nocam" title="Caméra coupée">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="2" x2="22" y1="2" y2="22"/>
                    <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/>
                    <path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/>
                  </svg>
                </span>
              </div>
            </div>
            <!-- Pairs distants -->
            <div v-for="peer in remotePeers" :key="peer.peerId" class="participant-row">
              <div class="participant-avatar">{{ peer.peerId.slice(0, 1).toUpperCase() }}</div>
              <div class="participant-info">
                <span class="participant-name">Participant</span>
                <span class="participant-id">{{ peer.peerId.slice(0, 12) }}</span>
              </div>
              <div class="participant-status">
                <span class="status-icon status-ok" title="Connecté">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="6"/>
                  </svg>
                </span>
              </div>
            </div>
            <!-- Vide -->
            <div v-if="remotePeers.length === 0" class="participants-empty">
              Aucun autre participant pour l'instant
            </div>
          </div>
        </aside>

        <!-- Panneau Chat -->
        <aside v-if="chatOpen" class="side-panel chat-panel">
          <div class="chat-header">
            <span>Chat</span>
            <button class="chat-close" @click="chatOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="chat-messages">
            <div v-if="chatMessages.length === 0" class="chat-empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>Aucun message pour l'instant</p>
            </div>
            <div
              v-for="(msg, i) in chatMessages"
              :key="i"
              class="chat-msg"
              :class="msg.isLocal ? 'chat-msg-local' : 'chat-msg-remote'"
            >
              <div v-if="!msg.isLocal" class="chat-author">{{ msg.from.slice(0, 8) }}</div>
              <div class="chat-bubble">{{ msg.text }}</div>
              <div class="chat-time">{{ msg.time }}</div>
            </div>
            <div ref="chatEndEl" />
          </div>

          <div class="chat-input-row">
            <textarea
              v-model="chatInput"
              class="chat-input"
              rows="1"
              placeholder="Écrivez un message…"
              maxlength="2000"
              @keydown="handleChatKeydown"
            ></textarea>
            <button class="chat-send" :disabled="!chatInput.trim()" @click="handleSendChat">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </aside>

      </div><!-- /visio-body -->

      <!-- Barre de contrôles -->
      <footer class="visio-controls">
        <div class="ctrl-group">
          <button
            class="ctrl-btn"
            :class="audioOn ? '' : 'ctrl-off'"
            :title="audioOn ? 'Couper le micro' : 'Activer le micro'"
            @click="handleToggleAudio"
          >
            <div class="ctrl-icon">
              <svg v-if="audioOn" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="2" x2="22" y1="2" y2="22"/>
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
                <path d="M5 10v2a7 7 0 0 0 12 5"/>
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
            </div>
            <span>{{ audioOn ? 'Micro' : 'Muet' }}</span>
          </button>

          <button
            class="ctrl-btn"
            :class="videoOn ? '' : 'ctrl-off'"
            :title="videoOn ? 'Couper la caméra' : 'Activer la caméra'"
            @click="handleToggleVideo"
          >
            <div class="ctrl-icon">
              <svg v-if="videoOn" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"/>
                <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/>
                <line x1="2" x2="22" y1="2" y2="22"/>
              </svg>
            </div>
            <span>{{ videoOn ? 'Caméra' : 'Caméra off' }}</span>
          </button>

          <button
            class="ctrl-btn"
            :class="screenOn ? 'ctrl-screen-active' : ''"
            title="Partage d'écran"
            @click="handleToggleScreen"
          >
            <div class="ctrl-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <span>{{ screenOn ? 'Arrêter' : 'Écran' }}</span>
          </button>
        </div>

        <button class="ctrl-btn ctrl-leave" title="Quitter l'appel" @click="handleLeave">
          <div class="ctrl-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 16.29 7.71 14.57 6.32 12.48a19.78 19.78 0 0 1-3.07-8.67A2 2 0 0 1 5.23 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.21 9.89"/>
              <line x1="23" x2="1" y1="1" y2="23"/>
            </svg>
          </div>
          <span>Quitter</span>
        </button>
      </footer>

    </template>
  </div>
</template>

<style scoped>
/* ── Variables ───────────────────────────────────────────────────────────── */
/* Palette : bleu-ardoise profond, inspirée Google Meet / Teams             */
:root {
  --bg:       #1e2230;   /* fond principal : ardoise marine                 */
  --bg-soft:  #262c3d;   /* header / footer                                 */
  --bg-tile:  #1a1f2e;   /* tuiles vidéo                                    */
  --bg-chat:  #202538;   /* panneau chat                                    */
  --border:   rgba(255,255,255,0.07);
  --text:     #e8eaf0;
  --text-dim: #8b92a8;
  --accent:   #14b8a6;
  --accent2:  #818cf8;   /* indigo doux pour SFU                            */
}

/* ─── Base ───────────────────────────────────────────────────────────────── */
.visio-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.overlay-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  height: 100dvh;
  background: var(--bg);
  color: var(--text-dim);
  font-size: 0.9rem;
}
.overlay-screen code {
  color: var(--accent);
  background: rgba(20,184,166,0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
}
.error-screen { color: #f87171; }

.btn-secondary {
  padding: 0.5rem 1.2rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  color: var(--text-dim);
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-secondary:hover { background: rgba(255,255,255,0.08); }

.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(255,255,255,0.08);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Header ─────────────────────────────────────────────────────────────── */
.visio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.1rem;
  height: 52px;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  gap: 0.75rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.room-brand {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.room-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.mode-badge {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}
.mode-p2p { background: rgba(6,182,212,0.15); color: #22d3ee; }
.mode-sfu { background: rgba(129,140,248,0.15); color: var(--accent2); }

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.participants-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--text-dim);
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-dim);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.icon-btn:hover { background: rgba(255,255,255,0.1); color: var(--text); }
.icon-btn-active { background: rgba(20,184,166,0.15) !important; border-color: rgba(20,184,166,0.4) !important; color: var(--accent) !important; }
.icon-btn.copied { color: var(--accent) !important; border-color: rgba(20,184,166,0.4) !important; }

.chat-notif {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f43f5e;
  color: #fff;
  font-size: 0.58rem;
  font-weight: 700;
  padding: 0 0.3rem;
  border-radius: 999px;
  min-width: 16px;
  text-align: center;
  line-height: 16px;
  height: 16px;
}

.ws-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
}
.ws-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.ws-ok { background: rgba(20,184,166,0.12); color: var(--accent); }
.ws-ko { background: rgba(244,63,94,0.12); color: #f43f5e; }

/* ─── Corps principal ────────────────────────────────────────────────────── */
.visio-body {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

/* ─── Grille vidéos ──────────────────────────────────────────────────────── */
.visio-main {
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: grid;
  gap: 8px;
  padding: 12px;
  overflow: hidden;
  background: var(--bg);
}

.layout-1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
.layout-2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr; }
.layout-3 { grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; }
.layout-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.layout-n { grid-template-columns: repeat(3, 1fr); align-content: start; overflow-y: auto; }

.layout-3 > .video-tile:first-child { grid-row: 1 / span 2; }

/* Tuile vidéo */
.video-tile {
  position: relative;
  background: var(--bg-tile);
  border-radius: 12px;
  overflow: hidden;
  min-height: 0;
  border: 1px solid var(--border);
  box-shadow: 0 2px 12px rgba(0,0,0,0.25);
}

.layout-n .video-tile { aspect-ratio: 16 / 9; }

.local-tile { border-color: rgba(20,184,166,0.35); }

.video-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tile-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.3rem;
  align-items: center;
}

.tile-badge-mute {
  display: flex;
  align-items: center;
  background: rgba(244,63,94,0.88);
  color: #fff;
  border-radius: 6px;
  padding: 0.22rem 0.28rem;
}

.tile-badge-screen {
  font-size: 0.6rem;
  font-weight: 700;
  background: rgba(20,184,166,0.88);
  color: #fff;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tile-label {
  position: absolute;
  bottom: 0.55rem;
  left: 0.65rem;
  font-size: 0.7rem;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  color: rgba(255,255,255,0.85);
}

/* Tuile "en attente" */
.waiting-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border: 1.5px dashed rgba(255,255,255,0.08);
  border-radius: 12px;
  color: var(--text-dim);
  text-align: center;
}

.waiting-icon { opacity: 0.35; }
.waiting-text { font-size: 0.85rem; color: var(--text-dim); }

.share-link-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1.1rem;
  background: rgba(20,184,166,0.1);
  border: 1px solid rgba(20,184,166,0.25);
  border-radius: 8px;
  color: var(--accent);
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.15s;
}
.share-link-btn:hover { background: rgba(20,184,166,0.18); }

/* ─── Liste des participants ─────────────────────────────────────────────── */
.participants-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.participants-list::-webkit-scrollbar { width: 4px; }
.participants-list::-webkit-scrollbar-track { background: transparent; }
.participants-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.participant-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.6rem;
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  transition: background 0.12s;
}
.participant-row:hover { background: rgba(255,255,255,0.06); }
.participant-local { border-color: rgba(20,184,166,0.2); background: rgba(20,184,166,0.05); }

.participant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(129,140,248,0.25);
  color: var(--accent2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.participant-local .participant-avatar {
  background: rgba(20,184,166,0.2);
  color: var(--accent);
}

.participant-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.participant-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}
.participant-id {
  font-size: 0.62rem;
  color: var(--text-dim);
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.participant-status {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  flex-shrink: 0;
}
.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
}
.status-muted  { color: #fb7185; background: rgba(244,63,94,0.12); }
.status-nocam  { color: #fb7185; background: rgba(244,63,94,0.12); }
.status-ok     { color: var(--accent); }

.participants-empty {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.15);
}

/* ─── Panneaux latéraux (participants + chat) ────────────────────────────── */
.side-panel {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-chat);
  border-left: 1px solid var(--border);
  overflow: hidden;
  animation: slideIn 0.2s ease;
}

/* Le panneau chat a une largeur légèrement plus grande */
.chat-panel { width: 300px; }

@keyframes slideIn {
  from { transform: translateX(16px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

.chat-header, .side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
  flex-shrink: 0;
}

.chat-close {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
}
.chat-close:hover { color: var(--text); background: rgba(255,255,255,0.06); }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  scroll-behavior: smooth;
}
.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  flex: 1;
  color: rgba(255,255,255,0.15);
  font-size: 0.78rem;
  text-align: center;
  padding: 2rem 1rem;
}

.chat-msg {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}
.chat-msg-local  { align-self: flex-end;  align-items: flex-end; }
.chat-msg-remote { align-self: flex-start; align-items: flex-start; }

.chat-author {
  font-size: 0.65rem;
  color: var(--text-dim);
  margin-bottom: 0.18rem;
  font-family: monospace;
}

.chat-bubble {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 0.5rem 0.8rem;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--text);
  word-break: break-word;
  white-space: pre-wrap;
}
.chat-msg-local .chat-bubble {
  background: rgba(20,184,166,0.14);
  border-color: rgba(20,184,166,0.3);
  color: #a7f3d0;
}

.chat-time {
  font-size: 0.6rem;
  color: rgba(255,255,255,0.2);
  margin-top: 0.18rem;
}

.chat-input-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.82rem;
  padding: 0.55rem 0.75rem;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.4;
  max-height: 100px;
  overflow-y: auto;
}
.chat-input::placeholder { color: rgba(255,255,255,0.2); }
.chat-input:focus { border-color: rgba(20,184,166,0.4); }

.chat-send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--accent);
  border: none;
  border-radius: 8px;
  color: #0f1628;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.chat-send:hover { background: #0d9488; }
.chat-send:disabled { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.2); cursor: not-allowed; }

/* ─── Barre de contrôles ─────────────────────────────────────────────────── */
.visio-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.25rem;
  background: var(--bg-soft);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.ctrl-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ctrl-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.22rem;
  padding: 0.5rem 0.9rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-dim);
  font-size: 0.67rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  min-width: 56px;
}
.ctrl-btn:hover { background: rgba(255,255,255,0.09); color: var(--text); }

.ctrl-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctrl-off {
  background: rgba(244,63,94,0.12) !important;
  border-color: rgba(244,63,94,0.25) !important;
  color: #fb7185 !important;
}
.ctrl-off:hover { background: rgba(244,63,94,0.2) !important; }

.ctrl-screen-active {
  background: rgba(20,184,166,0.12) !important;
  border-color: rgba(20,184,166,0.3) !important;
  color: var(--accent) !important;
}

.ctrl-leave {
  background: rgba(244,63,94,0.14);
  border-color: rgba(244,63,94,0.2);
  color: #fda4af;
  min-width: 70px;
}
.ctrl-leave:hover { background: rgba(244,63,94,0.22); }
</style>
