export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, user, fetchUser, token } = useAuth()

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

  // Check if user is admin or officer
  if (user.value?.role !== 'ADMIN' && user.value?.role !== 'OFFICER') {
    return navigateTo('/dashboard')
  }
})
