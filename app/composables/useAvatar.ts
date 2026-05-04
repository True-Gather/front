import { useState } from '#imports'

const STORAGE_KEY = 'tg-avatar'

export const useAvatar = () => {
  const avatarDataUrl = useState<string | null>('avatar', () => null)
  const { authUser } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  const backendBaseUrl =
    runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

  const loadAvatar = () => {
    // Priorité : photo de profil renvoyée par le backend via /me.
    if (authUser.value?.profile_photo_url) {
      avatarDataUrl.value = authUser.value.profile_photo_url
      return
    }
    // Repli : cache localStorage pour éviter un flash avant le chargement.
    if (import.meta.client) {
      const saved = localStorage.getItem(STORAGE_KEY)
      avatarDataUrl.value = saved || null
    }
  }

  const saveAvatar = async (dataUrl: string | null) => {
    avatarDataUrl.value = dataUrl

    // Mise à jour locale immédiate.
    if (import.meta.client) {
      if (dataUrl) {
        localStorage.setItem(STORAGE_KEY, dataUrl)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // Persistance en base via le backend.
    try {
      await $fetch(`${backendBaseUrl}/api/v1/auth/avatar`, {
        method: 'PUT',
        credentials: 'include',
        body: { avatar_url: dataUrl },
      })
      // Mise à jour de l'état auth pour cohérence.
      if (authUser.value) {
        authUser.value = { ...authUser.value, profile_photo_url: dataUrl }
      }
    } catch (e) {
      console.warn('[useAvatar] Failed to persist avatar to backend:', e)
    }
  }

  return { avatarDataUrl, loadAvatar, saveAvatar }
}
