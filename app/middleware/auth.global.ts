export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/', '/auth/forgot-password', '/auth/reset-password']
  const isPublicRoute = publicRoutes.includes(to.path)

  const { authUser, authChecked, fetchMe } = useAuth()

  if (!authChecked.value) {
    await fetchMe()
  }

  const isAuthenticated = Boolean(authUser.value)

  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo('/')
  }

  if (isAuthenticated && to.path === '/') {
    return navigateTo('/dashboard')
  }
})