<template>
  <div class="room-container">
    <!-- Header -->
    <div class="room-header">
      <div class="room-info">
        <img src="/logo.jfif" alt="TrueGather" class="room-logo" />
        <span class="room-title">Room · {{ roomId }}</span>
      </div>
      <div class="room-status" :class="statusClass">{{ statusLabel }}</div>
    </div>

    <!-- Grille vidéo -->
    <div class="video-grid" :class="`peers-${totalVideos}`">
      <!-- Vidéo locale -->
      <div class="video-tile local">
        <video ref="localVideo" autoplay muted playsinline :style="screenSharing ? 'visibility:hidden' : ''"></video>
        <div v-if="screenSharing" class="screen-share-placeholder">🖥️ Partage en cours</div>
        <div class="video-label">Moi</div>
        <div class="video-controls-overlay">
          <button class="ctrl-btn" :class="{ off: !micOn }" @click="toggleMic" title="Micro">
            <svg v-if="micOn" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
          <button class="ctrl-btn" :class="{ off: !camOn }" @click="toggleCam" title="Caméra">
            <svg v-if="camOn" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" x2="22" y1="2" y2="22"/><path d="M16 16H4a2 2 0 0 1-2-2V8"/><path d="M22 8v8"/><path d="m18 9.5 4-2.5v9l-2.35-1.47"/></svg>
          </button>
        </div>
      </div>

      <!-- Vidéos des pairs -->
      <div v-for="(peer, peerId) in remotePeers" :key="peerId" class="video-tile remote">
        <video :ref="el => setRemoteVideo(el, peerId)" autoplay playsinline></video>
        <div class="video-label">{{ peerId.slice(0, 8) }}</div>
      </div>
    </div>

    <!-- Barre d'actions -->
    <div class="room-footer">
      <button class="action-btn" :class="{ off: !micOn }" @click="toggleMic">
        <svg v-if="micOn" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        <span>{{ micOn ? 'Micro' : 'Micro off' }}</span>
      </button>

      <button class="action-btn" :class="{ off: !camOn }" @click="toggleCam">
        <svg v-if="camOn" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" x2="22" y1="2" y2="22"/><path d="M16 16H4a2 2 0 0 1-2-2V8"/><path d="M22 8v8"/><path d="m18 9.5 4-2.5v9l-2.35-1.47"/></svg>
        <span>{{ camOn ? 'Caméra' : 'Caméra off' }}</span>
      </button>

      <button class="action-btn" :class="{ off: screenSharing }" @click="toggleScreenShare">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        <span>{{ screenSharing ? 'Arrêter' : 'Partager' }}</span>
      </button>

      <button class="action-btn" :class="{ off: chatOpen }" @click="chatOpen = !chatOpen">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>Chat <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span></span>
      </button>

      <button class="action-btn hangup" @click="hangup">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.32 9.9"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
        <span>Raccrocher</span>
      </button>
    </div>

    <!-- Mini chat -->
    <div class="chat-panel" :class="{ open: chatOpen }">
      <div class="chat-header">
        <span>Chat</span>
        <button class="chat-close" @click="chatOpen = false">✕</button>
      </div>
      <div class="chat-messages" ref="chatMessagesEl">
        <div v-for="(msg, i) in chatMessages" :key="i" class="chat-msg" :class="msg.mine ? 'mine' : 'theirs'">
          <span class="chat-author">{{ msg.mine ? 'Moi' : msg.from.slice(0, 8) }}</span>
          <span class="chat-bubble">{{ msg.text }}</span>
        </div>
      </div>
      <div class="chat-input-row">
        <input v-model="chatInput" @keyup.enter="sendChat" placeholder="Message…" class="chat-input" />
        <button class="chat-send" @click="sendChat">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const roomId = route.params.id

// ── État ──────────────────────────────────────────────────────────────────────
const localVideo = ref(null)
const micOn = ref(true)
const camOn = ref(true)
const screenSharing = ref(false)
const chatOpen = ref(false)
const chatInput = ref('')
const chatMessages = ref([])
const chatMessagesEl = ref(null)
const unreadCount = ref(0)
const status = ref('connecting') // connecting | joined | error

const statusLabel = computed(() => ({
  connecting: 'Connexion…',
  joined: 'Connecté',
  error: 'Erreur'
}[status.value]))

const statusClass = computed(() => ({
  connecting: 'status-connecting',
  joined: 'status-joined',
  error: 'status-error'
}[status.value]))

// pairs : Map<peerId, { pc: RTCPeerConnection, stream: MediaStream|null }>
const remotePeers = ref({})
const totalVideos = computed(() => 1 + Object.keys(remotePeers.value).length)

// ── Refs vidéo distantes ─────────────────────────────────────────────────────
const remoteVideoEls = {}
function setRemoteVideo(el, peerId) {
  if (el) remoteVideoEls[peerId] = el
}

// ── Media local ───────────────────────────────────────────────────────────────
let localStream = null

async function startLocalMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    if (localVideo.value) localVideo.value.srcObject = localStream
  } catch {
    localStream = new MediaStream()
  }
}

function toggleMic() {
  micOn.value = !micOn.value
  localStream?.getAudioTracks().forEach(t => (t.enabled = micOn.value))
}

function toggleCam() {
  camOn.value = !camOn.value
  localStream?.getVideoTracks().forEach(t => (t.enabled = camOn.value))
}

// ── WebSocket + WebRTC ────────────────────────────────────────────────────────
let ws = null
let iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]

function connectWS() {
  const wsUrl = `ws://localhost:8082/ws/signal`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', room_id: roomId }))
  }

  ws.onmessage = async ({ data }) => {
    const msg = JSON.parse(data)
    await handleServerMessage(msg)
  }

  ws.onclose = () => {
    if (status.value !== 'error') status.value = 'connecting'
  }

  ws.onerror = () => {
    status.value = 'error'
  }
}

async function handleServerMessage(msg) {
  switch (msg.type) {
    case 'joined': {
      status.value = 'joined'
      if (msg.ice_servers?.length) iceServers = msg.ice_servers
      // Créer une connexion pour chaque pair déjà présent et envoyer une Offer
      for (const peerId of msg.peers) {
        await createPeerConnection(peerId, true)
      }
      break
    }
    case 'peer_joined': {
      // Le nouveau pair attend notre Offer
      await createPeerConnection(msg.user_id, true)
      break
    }
    case 'peer_left': {
      closePeer(msg.user_id)
      break
    }
    case 'offer': {
      await handleOffer(msg.from, msg.sdp)
      break
    }
    case 'answer': {
      const entry = remotePeers.value[msg.from]
      if (entry?.pc) await entry.pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp })
      break
    }
    case 'ice_candidate': {
      const entry = remotePeers.value[msg.from]
      if (entry?.pc) {
        await entry.pc.addIceCandidate({
          candidate: msg.candidate,
          sdpMid: msg.sdp_mid,
          sdpMLineIndex: msg.sdp_m_line_index
        }).catch(() => {})
      }
      break
    }
  }
}

async function createPeerConnection(peerId, isInitiator) {
  const pc = new RTCPeerConnection({ iceServers })

  remotePeers.value = { ...remotePeers.value, [peerId]: { pc, stream: null } }

  // Ajouter les tracks locaux
  localStream?.getTracks().forEach(track => pc.addTrack(track, localStream))

  // Recevoir les tracks distants
  pc.ontrack = ({ streams }) => {
    const stream = streams[0]
    remotePeers.value[peerId] = { ...remotePeers.value[peerId], stream }
    // Attacher le stream à l'élément vidéo
    setTimeout(() => {
      if (remoteVideoEls[peerId]) remoteVideoEls[peerId].srcObject = stream
    }, 100)
  }

  // Envoyer les candidats ICE
  pc.onicecandidate = ({ candidate }) => {
    if (candidate && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ice_candidate',
        room_id: roomId,
        to: peerId,
        candidate: candidate.candidate,
        sdp_mid: candidate.sdpMid,
        sdp_m_line_index: candidate.sdpMLineIndex
      }))
    }
  }

  if (isInitiator) {
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    ws.send(JSON.stringify({ type: 'offer', room_id: roomId, to: peerId, sdp: offer.sdp }))
  }

  return pc
}

async function handleOffer(fromId, sdp) {
  let entry = remotePeers.value[fromId]
  let pc

  if (entry?.pc) {
    pc = entry.pc
  } else {
    pc = await createPeerConnection(fromId, false)
  }

  await pc.setRemoteDescription({ type: 'offer', sdp })
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  ws.send(JSON.stringify({ type: 'answer', room_id: roomId, to: fromId, sdp: answer.sdp }))
}

function closePeer(peerId) {
  remotePeers.value[peerId]?.pc?.close()
  const peers = { ...remotePeers.value }
  delete peers[peerId]
  remotePeers.value = peers
  delete remoteVideoEls[peerId]
}

// ── Partage d'écran ──────────────────────────────────────────────────────────
let screenStream = null

async function toggleScreenShare() {
  if (screenSharing.value) {
    screenStream?.getTracks().forEach(t => t.stop())
    screenStream = null
    screenSharing.value = false
    // Remplacer la track vidéo par celle de la caméra dans toutes les PCs
    const camTrack = localStream?.getVideoTracks()[0]
    if (camTrack) {
      Object.values(remotePeers.value).forEach(({ pc }) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        sender?.replaceTrack(camTrack)
      })
    }
    if (localVideo.value) localVideo.value.srcObject = localStream
    return
  }
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'window' },
      selfBrowserSurface: 'exclude',
      surfaceSwitching: 'exclude'
    })
    screenSharing.value = true
    const screenTrack = screenStream.getVideoTracks()[0]
    // Afficher localement
    if (localVideo.value) {
      const mixed = new MediaStream([screenTrack, ...( localStream?.getAudioTracks() || [])])
      localVideo.value.srcObject = mixed
    }
    // Remplacer dans toutes les PCs
    Object.values(remotePeers.value).forEach(({ pc }) => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video')
      sender?.replaceTrack(screenTrack)
    })
    // Arrêt automatique si l'utilisateur arrête via le navigateur
    screenTrack.onended = () => toggleScreenShare()
  } catch {
    screenSharing.value = false
  }
}

// ── Chat local ────────────────────────────────────────────────────────────────
function sendChat() {
  const text = chatInput.value.trim()
  if (!text) return
  chatMessages.value.push({ mine: true, from: 'me', text })
  chatInput.value = ''
  scrollChat()
  // TODO: brancher sur le DataChannel WebRTC pour envoyer aux pairs
}

function scrollChat() {
  setTimeout(() => {
    if (chatMessagesEl.value) chatMessagesEl.value.scrollTop = chatMessagesEl.value.scrollHeight
  }, 50)
}

function hangup() {
  ws?.send(JSON.stringify({ type: 'leave', room_id: roomId }))
  ws?.close()
  localStream?.getTracks().forEach(t => t.stop())
  screenStream?.getTracks().forEach(t => t.stop())
  Object.keys(remotePeers.value).forEach(closePeer)
  router.push('/')
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await startLocalMedia()
  connectWS()
})

onUnmounted(() => {
  ws?.close()
  localStream?.getTracks().forEach(t => t.stop())
})
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.room-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #cffafe 50%, #d1fae5 100%);
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Header */
.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #99f6e4;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.room-info { display: flex; align-items: center; gap: 12px; }
.room-logo { width: 36px; height: 36px; object-fit: contain; }
.room-title { font-size: 16px; font-weight: 700; background: linear-gradient(to right, #0d9488, #0891b2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.room-status { padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.status-connecting { background: #fef3c7; color: #d97706; border: 1px solid #fcd34d; }
.status-joined     { background: #d1fae5; color: #059669; border: 1px solid #6ee7b7; }
.status-error      { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }

/* Grille vidéo */
.video-grid {
  flex: 1;
  display: grid;
  gap: 12px;
  padding: 20px;
  overflow: hidden;
}
.video-grid.peers-1 { grid-template-columns: 1fr; }
.video-grid.peers-2 { grid-template-columns: 1fr 1fr; }
.video-grid.peers-3 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.video-grid.peers-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }

.video-tile {
  position: relative;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #99f6e4;
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.1);
}
.video-tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.video-tile.local video {
  transform: scaleX(-1);
}
.screen-share-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  background: #0f172a;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
}
.video-label {
  position: absolute;
  bottom: 10px;
  left: 12px;
  background: rgba(255,255,255,0.85);
  color: #0f172a;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  border: 1px solid #e2e8f0;
}
.video-controls-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
}
.ctrl-btn {
  background: rgba(255,255,255,0.85);
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  cursor: pointer;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: background 0.2s;
}
.ctrl-btn:hover { background: #f0fdfa; }
.ctrl-btn.off { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

/* Footer */
.room-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #99f6e4;
  box-shadow: 0 -1px 4px rgba(0,0,0,0.04);
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 28px;
  border: 2px solid #99f6e4;
  border-radius: 14px;
  background: white;
  color: #0f172a;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}
.action-btn:hover { background: #f0fdfa; border-color: #14b8a6; }
.action-btn.off { background: #eff6ff; border-color: #93c5fd; color: #1d4ed8; }
.action-btn.off:hover { background: #dbeafe; }
.action-btn.hangup { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
.action-btn.hangup:hover { background: #fecaca; }

.badge {
  display: inline-block;
  background: #0891b2;
  color: white;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 11px;
  margin-left: 4px;
}

/* Chat panel */
.chat-panel {
  position: fixed;
  right: -360px;
  top: 0;
  bottom: 0;
  width: 320px;
  background: white;
  border-left: 1px solid #99f6e4;
  box-shadow: -4px 0 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
  z-index: 100;
}
.chat-panel.open { right: 0; }

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}
.chat-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 16px;
}
.chat-close:hover { color: #0f172a; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.chat-msg {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 85%;
}
.chat-msg.mine { align-self: flex-end; align-items: flex-end; }
.chat-msg.theirs { align-self: flex-start; align-items: flex-start; }

.chat-author {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}
.chat-bubble {
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
}
.mine .chat-bubble {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  color: white;
  border-radius: 12px 12px 2px 12px;
}
.theirs .chat-bubble {
  background: #f1f5f9;
  color: #0f172a;
  border-radius: 12px 12px 12px 2px;
}

.chat-input-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
}
.chat-input {
  flex: 1;
  border: 1.5px solid #99f6e4;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus { border-color: #14b8a6; }
.chat-send {
  background: linear-gradient(135deg, #14b8a6, #0891b2);
  border: none;
  border-radius: 10px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: opacity 0.2s;
}
.chat-send:hover { opacity: 0.85; }
</style>
