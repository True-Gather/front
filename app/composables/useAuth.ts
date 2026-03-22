import { computed, ref } from 'vue'

type AuthUser = {
  id: string
  email: string
  display_name: string
  first_name?: string | null
  last_name?: string | null
}

type AuthResponse = {
  authenticated: boolean
  user: AuthUser | null
}

const authUser = ref<AuthUser | null>(null)
const authChecked = ref(false)

export const useAuth = () => {
  const fetchMe = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/me', {
        credentials: 'include'
      })

      const data: AuthResponse = await response.json()

      authUser.value = data.authenticated ? data.user : null
    } catch (_error) {
      authUser.value = null
    } finally {
      authChecked.value = true
    }
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (_error) {
      // no-op
    } finally {
      authUser.value = null
      window.location.href = '/auth/login'
    }
  }

  const initials = computed(() => {
    if (!authUser.value) return 'TG'

    const first = authUser.value.first_name?.trim()?.[0] ?? ''
    const last = authUser.value.last_name?.trim()?.[0] ?? ''
    const value = `${first}${last}`.toUpperCase()

    if (value) return value

    return authUser.value.display_name
      .split(' ')
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'TG'
  })

  return {
    authUser,
    authChecked,
    initials,
    fetchMe,
    logout
  }
}