/**
 * Composable WebSocket de signalisation WebRTC.
 *
 * Gère la connexion au serveur de signalisation /ws/signal et expose
 * les méthodes pour rejoindre une room, envoyer des Offer/Answer/ICE,
 * ainsi que des callbacks réactifs sur les événements entrants.
 */

import { ref, onUnmounted } from '#imports'
import { useRuntimeConfig } from '#app'

// ─── Types des messages ────────────────────────────────────────────────────────

export interface IceServerInfo {
  urls: string[]
  username?: string
  credential?: string
}

// Messages entrants depuis le serveur
export type ServerMessage =
  | { type: 'joined'; room_id: string; user_id: string; peers: string[]; ice_servers: IceServerInfo[]; mode?: 'p2p' | 'sfu' }
  | { type: 'peer_joined'; room_id: string; user_id: string }
  | { type: 'peer_left'; room_id: string; user_id: string }
  | { type: 'mode_switch'; room_id: string; mode: 'p2p' | 'sfu'; peers: string[] }
  | { type: 'offer'; room_id: string; from: string; sdp: string }
  | { type: 'answer'; room_id: string; from: string; sdp: string }
  | { type: 'ice_candidate'; room_id: string; from: string; candidate: string; sdp_mid?: string; sdp_m_line_index?: number }
  | { type: 'sfu_offer'; room_id: string; sdp: string }
  | { type: 'sfu_ice_candidate'; room_id: string; candidate: string; sdp_mid?: string; sdp_m_line_index?: number }
  | { type: 'chat_broadcast'; room_id: string; from: string; text: string }
  | { type: 'error'; message: string }

// Messages sortants vers le serveur
type ClientMessage =
  | { type: 'join'; room_id: string }
  | { type: 'leave'; room_id: string }
  | { type: 'offer'; room_id: string; to: string; sdp: string }
  | { type: 'answer'; room_id: string; to: string; sdp: string }
  | { type: 'ice_candidate'; room_id: string; to: string; candidate: string; sdp_mid?: string; sdp_m_line_index?: number }
  | { type: 'sfu_answer'; room_id: string; sdp: string }
  | { type: 'sfu_ice_candidate'; room_id: string; candidate: string; sdp_mid?: string; sdp_m_line_index?: number }
  | { type: 'chat_message'; room_id: string; text: string }

// ─── Composable ───────────────────────────────────────────────────────────────

export const useSignaling = () => {
  const config = useRuntimeConfig()
  const baseUrl = (config.public.backendBaseUrl as string) || 'http://localhost:8082'

  // Transforme http(s):// → ws(s)://
  const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/signal'

  let ws: WebSocket | null = null

  // État réactif
  const connected = ref(false)
  const error = ref<string | null>(null)

  // Callbacks utilisateur (définis depuis useWebRTC ou la page)
  const handlers: Partial<{
    onJoined: (msg: Extract<ServerMessage, { type: 'joined' }>) => void
    onPeerJoined: (msg: Extract<ServerMessage, { type: 'peer_joined' }>) => void
    onPeerLeft: (msg: Extract<ServerMessage, { type: 'peer_left' }>) => void
    onModeSwitch: (msg: Extract<ServerMessage, { type: 'mode_switch' }>) => void
    onOffer: (msg: Extract<ServerMessage, { type: 'offer' }>) => void
    onAnswer: (msg: Extract<ServerMessage, { type: 'answer' }>) => void
    onIceCandidate: (msg: Extract<ServerMessage, { type: 'ice_candidate' }>) => void
    onSfuOffer: (msg: Extract<ServerMessage, { type: 'sfu_offer' }>) => void
    onSfuIceCandidate: (msg: Extract<ServerMessage, { type: 'sfu_ice_candidate' }>) => void
    onChatBroadcast: (msg: Extract<ServerMessage, { type: 'chat_broadcast' }>) => void
    onError: (msg: Extract<ServerMessage, { type: 'error' }>) => void
  }> = {}

  // ─── Connexion ──────────────────────────────────────────────────────────────

  const connect = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        connected.value = true
        error.value = null
        resolve()
      }

      ws.onclose = () => {
        connected.value = false
      }

      ws.onerror = () => {
        const msg = 'Connexion WebSocket échouée'
        error.value = msg
        connected.value = false
        reject(new Error(msg))
      }

      ws.onmessage = (event: MessageEvent) => {
        let msg: ServerMessage
        try {
          msg = JSON.parse(event.data as string) as ServerMessage
        } catch {
          console.warn('[signaling] message JSON invalide:', event.data)
          return
        }

        switch (msg.type) {
          case 'joined':
            handlers.onJoined?.(msg)
            break
          case 'peer_joined':
            handlers.onPeerJoined?.(msg)
            break
          case 'peer_left':
            handlers.onPeerLeft?.(msg)
            break
          case 'mode_switch':
            handlers.onModeSwitch?.(msg)
            break
          case 'offer':
            handlers.onOffer?.(msg)
            break
          case 'answer':
            handlers.onAnswer?.(msg)
            break
          case 'ice_candidate':
            handlers.onIceCandidate?.(msg)
            break
          case 'sfu_offer':
            handlers.onSfuOffer?.(msg)
            break
          case 'sfu_ice_candidate':
            handlers.onSfuIceCandidate?.(msg)
            break
          case 'chat_broadcast':
            handlers.onChatBroadcast?.(msg)
            break
          case 'error':
            console.error('[signaling] erreur serveur:', msg.message)
            handlers.onError?.(msg)
            break
        }
      }
    })
  }

  // ─── Déconnexion ────────────────────────────────────────────────────────────

  const disconnect = () => {
    ws?.close()
    ws = null
    connected.value = false
  }

  // ─── Envoi de messages ──────────────────────────────────────────────────────

  const send = (msg: ClientMessage) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[signaling] WebSocket non connecté, message ignoré')
      return
    }
    ws.send(JSON.stringify(msg))
  }

  const joinRoom = (roomId: string) => send({ type: 'join', room_id: roomId })
  const leaveRoom = (roomId: string) => send({ type: 'leave', room_id: roomId })

  const sendOffer = (roomId: string, to: string, sdp: string) =>
    send({ type: 'offer', room_id: roomId, to, sdp })

  const sendAnswer = (roomId: string, to: string, sdp: string) =>
    send({ type: 'answer', room_id: roomId, to, sdp })

  const sendIceCandidate = (
    roomId: string,
    to: string,
    candidate: string,
    sdpMid?: string,
    sdpMLineIndex?: number
  ) =>
    send({
      type: 'ice_candidate',
      room_id: roomId,
      to,
      candidate,
      sdp_mid: sdpMid,
      sdp_m_line_index: sdpMLineIndex,
    })

  // ── Signalisation SFU (client → serveur) ─────────────────────────────────

  const sendSfuAnswer = (roomId: string, sdp: string) =>
    send({ type: 'sfu_answer', room_id: roomId, sdp })

  const sendSfuIceCandidate = (
    roomId: string,
    candidate: string,
    sdpMid?: string,
    sdpMLineIndex?: number
  ) =>
    send({
      type: 'sfu_ice_candidate',
      room_id: roomId,
      candidate,
      sdp_mid: sdpMid,
      sdp_m_line_index: sdpMLineIndex,
    })

  const sendChatMessage = (roomId: string, text: string) =>
    send({ type: 'chat_message', room_id: roomId, text })

  // ─── Enregistrement des handlers ────────────────────────────────────────────

  const on = <K extends keyof typeof handlers>(
    event: K,
    handler: NonNullable<(typeof handlers)[K]>
  ) => {
    handlers[event] = handler as typeof handlers[K]
  }

  // Nettoyage automatique si le composant est démonté
  onUnmounted(() => disconnect())

  return {
    connected,
    error,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendSfuAnswer,
    sendSfuIceCandidate,
    sendChatMessage,
    on,
  }
}
