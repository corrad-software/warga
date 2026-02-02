<script setup lang="ts">
const { login } = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  const result = await login(form.value.email, form.value.password)

  loading.value = false

  if (result.success) {
    // Redirect based on role
    if (result.user.role === 'PEMOHON') {
      router.push('/dashboard')
    } else if (['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN'].includes(result.user.role)) {
      router.push('/officer/dashboard')
    } else {
      router.push('/')
    }
  } else {
    error.value = result.error || 'Login failed'
  }
}

// Redirect if already logged in
onMounted(async () => {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated.value && user.value) {
    if (user.value.role === 'PEMOHON') {
      router.push('/dashboard')
    } else {
      router.push('/officer/dashboard')
    }
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Warga
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Citizenship Application Management System
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">
            {{ error }}
          </div>
        </div>

        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            >
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <div class="text-center">
          <NuxtLink to="/register" class="text-sm text-blue-600 hover:text-blue-500">
            Don't have an account? Register here
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
