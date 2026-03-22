export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/', '/auth/login', '/auth/register']

  const isPublicRoute = publicRoutes.includes(to.path)

  try {
    const response = await fetch('http://localhost:8080/api/v1/auth/me', {
      credentials: 'include'
    })

    const data = await response.json()

    const isAuthenticated = Boolean(data?.authenticated)

    // Non connecté + route privée => login
    if (!isAuthenticated && !isPublicRoute) {
      return navigateTo('/auth/login')
    }

    // Connecté + page auth => app
    if (isAuthenticated && (to.path === '/auth/login' || to.path === '/auth/register')) {
      return navigateTo('/meetings/create')
    }
  } catch (_error) {
    if (!isPublicRoute) {
      return navigateTo('/auth/login')
    }
  }
})