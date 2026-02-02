export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, fetchUser, token } = useAuth()

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    // Try to fetch user if token exists
    if (token.value) {
      await fetchUser()
    }

    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
  }
})
