export const useAuth = () => {
  const token = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  })

  const user = useState('user', () => null as any)

  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })

      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        return { success: true, user: response.data.user }
      }

      return { success: false, error: 'Login failed' }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Login failed'
      }
    }
  }

  const register = async (userData: {
    email: string
    password: string
    name: string
    phoneNumber?: string
    dateOfBirth?: string
    placeOfBirth?: string
  }) => {
    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData
      })

      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        return { success: true, user: response.data.user }
      }

      return { success: false, error: 'Registration failed' }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Registration failed'
      }
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      await navigateTo('/login')
    }
  }

  const fetchUser = async () => {
    if (!token.value) {
      user.value = null
      return null
    }

    try {
      const response = await $fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.success && response.data) {
        user.value = response.data.user
        return response.data.user
      }

      return null
    } catch (error) {
      token.value = null
      user.value = null
      return null
    }
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const hasRole = (roles: string | string[]) => {
    if (!user.value) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.value.role)
  }

  return {
    token,
    user,
    login,
    register,
    logout,
    fetchUser,
    isAuthenticated,
    hasRole
  }
}
