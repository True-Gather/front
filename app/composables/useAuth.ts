import { computed, useState } from '#imports'

type AuthUser = {
  id: string
  email: string
  display_name: string
  first_name?: string | null
  last_name?: string | null
  profile_photo_url?: string | null
}

type AuthResponse = {
  authenticated: boolean
  user: AuthUser | null
}

export const useAuth = () => {
  const runtimeConfig = useRuntimeConfig()
  const backendBaseUrl =
    runtimeConfig.public.backendBaseUrl || 'http://localhost:8080'

  const authUser = useState<AuthUser | null>('auth-user', () => null)
  const authChecked = useState<boolean>('auth-checked', () => false)

  const fetchMe = async () => {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      const data = await $fetch<AuthResponse>(`${backendBaseUrl}/api/v1/auth/me`, {
        credentials: 'include',
        headers
      })

      authUser.value = data?.authenticated ? data.user : null
    } catch {
      authUser.value = null
    } finally {
      authChecked.value = true
    }
  }

  const logout = () => {
    authUser.value = null
    authChecked.value = false
    window.location.href = `${backendBaseUrl}/api/v1/auth/logout`
  }

  const initials = computed(() => {
    if (!authUser.value) return 'TG'

    const first = authUser.value.first_name?.trim()?.[0] ?? ''
    const last = authUser.value.last_name?.trim()?.[0] ?? ''
    const value = `${first}${last}`.toUpperCase()

    if (value) return value

    return (
      authUser.value.display_name
        ?.split(' ')
        .map((part) => part[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'TG'
    )
  })

  return {
    authUser,
    authChecked,
    initials,
    fetchMe,
    logout
  }
}