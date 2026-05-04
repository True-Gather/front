/**
 * Composable WebRTC P2P — mesh topology pour N clients.
 *
 * Règle de négociation (évite les Offer collisions) :
 *   - Les pairs EXISTANTS (qui reçoivent "peer_joined") créent l'Offer.
 *   - Le nouveau pair (qui reçoit "joined") crée seulement la RTCPeerConnection
 *     et attend les Offers des pairs déjà présents.
 *
 * Topologie pour 3 clients A→B→C :
 *   1. A rejoint (seul)
 *   2. B rejoint → A reçoit peer_joined(B) → A offre B
 *   3. C rejoint → A reçoit peer_joined(C) → A offre C
 *                  B reçoit peer_joined(C) → B offre C
 *
 * Ce composable gère aussi la mise en tampon des ICE candidates qui
 * arrivent avant que setRemoteDescription soit appelé.
 */

import { ref, shallowRef, onUnmounted } from '#imports'
import { useSignaling, type IceServerInfo } from './useSignaling'

// ─── Composable ───────────────────────────────────────────────────────────────

export const useWebRTC = () => {
  const signaling = useSignaling()

  const roomId = ref<string | null>(null)
  const localPeerId = ref<string | null>(null)

  // Erreur de room (ex : room pleine)
  const roomError = ref<string | null>(null)

  // Mode actuel de la room : 'p2p' (mesh) ou 'sfu' (relais serveur)
  const mode = ref<'p2p' | 'sfu'>('p2p')

  // Flux local (caméra + micro)
  const localStream = shallowRef<MediaStream | null>(null)

  // Partage d'écran
  const screenOn = ref(false)
  let screenStream: MediaStream | null = null

  // Chat
  const chatMessages = ref<ChatMessage[]>([])

  // Liste réactive des pairs distants (tableau pour Vue 3)
  const remotePeers = ref<RemotePeer[]>([])

  // Map interne des RTCPeerConnections P2P (mode mesh)
  const peerConnections = new Map<string, RTCPeerConnection>()

  // Tampon des ICE candidates P2P en attente de setRemoteDescription
  const iceCandidateBuffer = new Map<string, RTCIceCandidateInit[]>()

  // RTCPeerConnection unique vers le SFU (mode SFU)
  let sfuConnection: RTCPeerConnection | null = null
  // Tampon ICE du SFU (candidates arrivées avant setRemoteDescription)
  const sfuIceCandidateBuffer: RTCIceCandidateInit[] = []

  // Serveurs ICE reçus du backend
  let iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]

  // ─── Helpers réactifs ─────────────────────────────────────────────────────

  const addRemotePeer = (peerId: string) => {
    if (!remotePeers.value.find((p) => p.peerId === peerId)) {
      remotePeers.value = [...remotePeers.value, { peerId, stream: null, audioMuted: false, videoMuted: false }]
    }
  }

  const setRemoteStream = (peerId: string, stream: MediaStream) => {
    remotePeers.value = remotePeers.value.map((p) =>
      p.peerId === peerId ? { ...p, stream } : p
    )
  }

  const removeRemotePeer = (peerId: string) => {
    remotePeers.value = remotePeers.value.filter((p) => p.peerId !== peerId)
  }

  // ─── Créer une RTCPeerConnection ──────────────────────────────────────────

  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers })

    // Ajouter les tracks locaux
    localStream.value?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.value!)
    })

    // Envoyer les ICE candidates au pair via signalisation
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && roomId.value) {
        signaling.sendIceCandidate(
          roomId.value,
          peerId,
          candidate.candidate,
          candidate.sdpMid ?? undefined,
          candidate.sdpMLineIndex ?? undefined
        )
      }
    }

    // Réception du flux distant → mettre à jour la liste réactive
    pc.ontrack = ({ streams }) => {
      const stream = streams[0]
      if (stream) setRemoteStream(peerId, stream)
    }

    // Nettoyage automatique si la connexion tombe
    pc.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        console.warn(`[webrtc] connexion vers ${peerId.slice(0, 8)} : ${pc.connectionState}`)
        cleanupPeer(peerId)
      }
    }

    peerConnections.set(peerId, pc)
    addRemotePeer(peerId)

    return pc
  }

  // Vide le tampon ICE pour un pair après setRemoteDescription
  const flushIceCandidates = async (peerId: string, pc: RTCPeerConnection) => {
    const buffered = iceCandidateBuffer.get(peerId)
    if (!buffered) return
    iceCandidateBuffer.delete(peerId)
    for (const c of buffered) {
      try {
        await pc.addIceCandidate(c)
      } catch (e) {
        console.warn('[webrtc] addIceCandidate (buffered):', e)
      }
    }
  }

  // ─── Négociation : créer et envoyer une Offer (pair EXISTANT → nouveau) ───

  const negotiateWithPeer = async (peerId: string) => {
    if (!roomId.value) return

    // On est un pair existant : créer la connexion ET l'Offer
    let pc = peerConnections.get(peerId)
    if (!pc) pc = createPeerConnection(peerId)

    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      signaling.sendOffer(roomId.value, peerId, offer.sdp!)
    } catch (e) {
      console.error('[webrtc] createOffer:', e)
    }
  }

  // ─── Connexion SFU (mode SFU : 1 connexion client → serveur) ─────────────

  /**
   * Crée la RTCPeerConnection vers le SFU.
   *
   * - Ajoute les tracks locaux (pour les publier au SFU).
   * - Configure ontrack pour recevoir les flux des autres participants.
   * - Configure onicecandidate pour relayer les candidates ICE au serveur.
   *
   * Le stream_id de chaque track relay côté serveur est le user_id du publisher.
   * On utilise stream.id pour identifier de quel pair vient chaque flux.
   */
  const createSfuConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers })

    // Publier nos tracks locaux au SFU.
    localStream.value?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.value!)
    })

    // Recevoir les tracks des autres participants relayées par le SFU.
    // Le serveur met le user_id du publisher comme stream_id.
    const knownStreams = new Map<string, MediaStream>()
    pc.ontrack = ({ streams }) => {
      const stream = streams[0]
      if (!stream) return
      const peerId = stream.id // = user_id du publisher côté serveur
      if (!knownStreams.has(peerId)) {
        knownStreams.set(peerId, stream)
        addRemotePeer(peerId)
      }
      setRemoteStream(peerId, stream)
    }

    // Relayer les ICE candidates SFU vers le serveur.
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && roomId.value) {
        signaling.sendSfuIceCandidate(
          roomId.value,
          candidate.candidate,
          candidate.sdpMid ?? undefined,
          candidate.sdpMLineIndex ?? undefined
        )
      }
    }

    pc.onconnectionstatechange = () => {
      console.info('[sfu] état connexion:', pc.connectionState)
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        console.warn('[sfu] connexion SFU perdue:', pc.connectionState)
      }
    }

    sfuConnection = pc
    return pc
  }

  const cleanupSfuConnection = () => {
    sfuConnection?.close()
    sfuConnection = null
    sfuIceCandidateBuffer.length = 0
  }

  // ─── Handlers signalisation ────────────────────────────────────────────────

  // "joined" : on arrive dans une room.
  // - mode "p2p" : créer les RTCPeerConnections avec les pairs existants (pas d'Offer : ils nous offrent).
  // - mode "sfu" : attendre sfu_offer du serveur.
  signaling.on('onJoined', ({ user_id, peers, ice_servers, mode: roomMode }) => {
    localPeerId.value = user_id

    iceServers = (ice_servers as IceServerInfo[]).map((s) => ({
      urls: s.urls,
      ...(s.username ? { username: s.username } : {}),
      ...(s.credential ? { credential: s.credential } : {}),
    }))

    if (roomMode === 'sfu') {
      mode.value = 'sfu'
      // En mode SFU, ne pas créer de connexions P2P mesh.
      // Le serveur va envoyer un sfu_offer séparément.
      return
    }

    mode.value = 'p2p'
    // Préparer les connexions P2P (mais pas d'Offer : les existants nous offrent)
    for (const peerId of peers) {
      if (!peerConnections.has(peerId)) {
        createPeerConnection(peerId)
      }
    }
  })

  // "peer_joined" : un nouveau pair vient d'arriver.
  // On est un pair existant → on lui envoie une Offer.
  signaling.on('onPeerJoined', async ({ user_id: peerId }) => {
    await negotiateWithPeer(peerId)
  })

  // Offer reçue → répondre par un Answer
  signaling.on('onOffer', async ({ from: peerId, sdp }) => {
    if (!roomId.value) return

    let pc = peerConnections.get(peerId)
    if (!pc) pc = createPeerConnection(peerId)

    try {
      await pc.setRemoteDescription({ type: 'offer', sdp })
      await flushIceCandidates(peerId, pc)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      signaling.sendAnswer(roomId.value, peerId, answer.sdp!)
    } catch (e) {
      console.error('[webrtc] setRemoteDescription/createAnswer:', e)
    }
  })

  // Answer reçue → finaliser la connexion
  signaling.on('onAnswer', async ({ from: peerId, sdp }) => {
    const pc = peerConnections.get(peerId)
    if (!pc) return
    try {
      await pc.setRemoteDescription({ type: 'answer', sdp })
      await flushIceCandidates(peerId, pc)
    } catch (e) {
      console.error('[webrtc] setRemoteDescription (answer):', e)
    }
  })

  // ICE candidate reçu → ajouter ou mettre en tampon
  signaling.on('onIceCandidate', async ({ from: peerId, candidate, sdp_mid, sdp_m_line_index }) => {
    const pc = peerConnections.get(peerId)
    const init: RTCIceCandidateInit = {
      candidate,
      sdpMid: sdp_mid ?? null,
      sdpMLineIndex: sdp_m_line_index ?? null,
    }

    // Si pas encore de description distante, mettre en tampon
    if (!pc || !pc.remoteDescription) {
      const buf = iceCandidateBuffer.get(peerId) ?? []
      buf.push(init)
      iceCandidateBuffer.set(peerId, buf)
      return
    }

    try {
      await pc.addIceCandidate(init)
    } catch (e) {
      console.warn('[webrtc] addIceCandidate:', e)
    }
  })

  // Pair déconnecté
  signaling.on('onPeerLeft', ({ user_id: peerId }) => {
    cleanupPeer(peerId)
  })

  // Erreur serveur (ex : room pleine)
  signaling.on('onError', ({ message }) => {
    roomError.value = message
    console.warn('[webrtc] erreur serveur:', message)
  })

  // ─── Handlers SFU ─────────────────────────────────────────────────────────

  // "mode_switch" : la room bascule de P2P vers SFU (3ème participant arrive).
  // Fermer toutes les connexions P2P existantes et passer en mode SFU.
  // Le serveur enverra ensuite un sfu_offer.
  signaling.on('onModeSwitch', ({ mode: newMode }) => {
    console.info('[webrtc] mode_switch →', newMode)
    mode.value = newMode

    if (newMode === 'sfu') {
      // Fermer toutes les peer connections P2P.
      peerConnections.forEach((pc, peerId) => {
        pc.close()
        peerConnections.delete(peerId)
      })
      iceCandidateBuffer.clear()
      // Vider les pairs distants : ils réapparaîtront via ontrack SFU.
      remotePeers.value = []
    }
  })

  // "sfu_offer" : le serveur SFU nous envoie une Offer pour établir la connexion.
  // On crée (ou réutilise) la SFU connection, on répond par un Answer,
  // et on ajoute nos tracks locaux pour qu'elles soient publiées au SFU.
  signaling.on('onSfuOffer', async ({ room_id: sfuRoomId, sdp }) => {
    if (!roomId.value) return

    // Créer la connexion SFU si elle n'existe pas encore.
    if (!sfuConnection) {
      sfuConnection = createSfuConnection()
    }

    try {
      await sfuConnection.setRemoteDescription({ type: 'offer', sdp })

      // Vider le tampon ICE SFU maintenant que la description distante est connue.
      for (const c of sfuIceCandidateBuffer.splice(0)) {
        await sfuConnection.addIceCandidate(c).catch(() => {})
      }

      const answer = await sfuConnection.createAnswer()
      await sfuConnection.setLocalDescription(answer)
      signaling.sendSfuAnswer(roomId.value, answer.sdp!)
    } catch (e) {
      console.error('[sfu] handleSfuOffer:', e)
    }
  })

  // ICE candidate SFU (serveur → client)
  signaling.on('onSfuIceCandidate', async ({ candidate, sdp_mid, sdp_m_line_index }) => {
    const init: RTCIceCandidateInit = {
      candidate,
      sdpMid: sdp_mid ?? null,
      sdpMLineIndex: sdp_m_line_index ?? null,
    }

    if (!sfuConnection || !sfuConnection.remoteDescription) {
      sfuIceCandidateBuffer.push(init)
      return
    }

    await sfuConnection.addIceCandidate(init).catch((e) =>
      console.warn('[sfu] addIceCandidate:', e)
    )
  })

  // ─── Actions publiques ────────────────────────────────────────────────────

  const startLocalStream = async (video = true, audio = true): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio })
    localStream.value = stream
    return stream
  }

  const joinRoom = async (rid: string) => {
    roomId.value = rid
    await signaling.connect()
    signaling.joinRoom(rid)
  }

  const leaveRoom = () => {
    if (roomId.value) signaling.leaveRoom(roomId.value)
    peerConnections.forEach((_, peerId) => cleanupPeer(peerId))
    cleanupSfuConnection()
    localStream.value?.getTracks().forEach((t) => t.stop())
    localStream.value = null
    screenStream?.getTracks().forEach((t) => t.stop())
    screenStream = null
    screenOn.value = false
    iceCandidateBuffer.clear()
    signaling.disconnect()
    roomId.value = null
    localPeerId.value = null
    remotePeers.value = []
    chatMessages.value = []
    mode.value = 'p2p'
  }

  const toggleAudio = (): boolean => {
    const track = localStream.value?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      return track.enabled
    }
    return false
  }

  const toggleVideo = (): boolean => {
    const track = localStream.value?.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      return track.enabled
    }
    return false
  }

  // ─── Partage d'écran ──────────────────────────────────────────────────────

  const toggleScreenShare = async (): Promise<boolean> => {
    if (screenOn.value) {
      // Arrêter le partage d'écran : revenir à la caméra
      screenStream?.getTracks().forEach((t) => t.stop())
      screenStream = null
      screenOn.value = false

      const cameraTrack = localStream.value?.getVideoTracks()[0]
      if (cameraTrack) {
        replaceVideoTrackInAllConnections(cameraTrack)
      }
      return false
    }

    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      screenStream = display
      screenOn.value = true

      const screenTrack = display.getVideoTracks()[0]
      if (!screenTrack) return false

      // Quand l'utilisateur arrête le partage via le bouton natif du navigateur
      screenTrack.onended = () => {
        screenStream = null
        screenOn.value = false
        const cameraTrack = localStream.value?.getVideoTracks()[0]
        if (cameraTrack) replaceVideoTrackInAllConnections(cameraTrack)
      }

      replaceVideoTrackInAllConnections(screenTrack)
      return true
    } catch (e) {
      console.warn('[webrtc] getDisplayMedia annulé ou refusé:', e)
      return false
    }
  }

  // Remplace la piste vidéo dans toutes les connexions actives (P2P + SFU).
  const replaceVideoTrackInAllConnections = (newTrack: MediaStreamTrack) => {
    const replaceInPc = (pc: RTCPeerConnection) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
      if (sender) sender.replaceTrack(newTrack).catch((e) => console.warn('[webrtc] replaceTrack:', e))
    }
    peerConnections.forEach(replaceInPc)
    if (sfuConnection) replaceInPc(sfuConnection)
  }

  // ─── Chat ─────────────────────────────────────────────────────────────────

  // Réception d'un message de chat diffusé par le serveur
  signaling.on('onChatBroadcast', ({ from, text }) => {
    chatMessages.value = [
      ...chatMessages.value,
      {
        from,
        text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isLocal: from === localPeerId.value,
      },
    ]
  })

  const sendChatMessage = (text: string) => {
    if (!roomId.value || !text.trim()) return
    signaling.sendChatMessage(roomId.value, text.trim())
  }

  // ─── Nettoyage d'un pair ──────────────────────────────────────────────────

  const cleanupPeer = (peerId: string) => {
    peerConnections.get(peerId)?.close()
    peerConnections.delete(peerId)
    iceCandidateBuffer.delete(peerId)
    removeRemotePeer(peerId)
  }

  onUnmounted(() => leaveRoom())

  return {
    localStream,
    remotePeers,
    localPeerId,
    roomId,
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
  }
}


// ─── Types ────────────────────────────────────────────────────────────────────

export interface RemotePeer {
  peerId: string
  stream: MediaStream | null
  audioMuted: boolean
  videoMuted: boolean
}

export interface ChatMessage {
  from: string
  text: string
  time: string
  isLocal: boolean
}
