<script setup lang="ts">
definePageMeta({
  layout: false
})

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
    error.value = 'Sila isi semua medan'
    return
  }

  loading.value = true
  error.value = ''

  const result = await login(form.value.email, form.value.password)

  loading.value = false

  if (result.success) {
    // Redirect based on role
    if (result.user.role === 'ADMIN') {
      router.push('/admin')
    } else if (result.user.role === 'PEMOHON') {
      router.push('/dashboard')
    } else if (['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(result.user.role)) {
      router.push('/officer/dashboard')
    } else {
      router.push('/')
    }
  } else {
    error.value = result.error || 'Log masuk gagal'
  }
}

// Redirect if already logged in
onMounted(async () => {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated.value && user.value) {
    if (user.value.role === 'ADMIN') {
      router.push('/admin')
    } else if (user.value.role === 'PEMOHON') {
      router.push('/dashboard')
    } else {
      router.push('/officer/dashboard')
    }
  }
})
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Left Side - Brand Section -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center" style="background-image: url('/images/jpn_login.jpg');">
      <!-- Dark blue gradient overlay for text readability -->
      <div class="absolute inset-0 opacity-95" style="background: linear-gradient(to bottom right, #0a1929, #1e3a5f, #1e40af);"></div>

      <div class="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
        <!-- Logo/Brand -->
        <div class="mb-12">
          <div class="flex items-center space-x-3 mb-4">
            <img src="/images/jpn_logo.png" alt="JPN Logo" class="h-16 w-auto" />
            <div>
              <h1 class="text-3xl font-bold">SPK</h1>
              <p class="text-blue-100 text-sm">Jabatan Pendaftaran Negara</p>
            </div>
          </div>
          <p class="text-blue-100 text-lg">Sistem Pengurusan Kewarganegaraan</p>
        </div>

        <!-- Features -->
        <div class="space-y-6">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-500 bg-opacity-30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-1">Pemprosesan Pantas</h3>
              <p class="text-blue-100 text-sm">Hantar dan pantau permohonan kewarganegaraan anda dengan cekap</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-500 bg-opacity-30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-1">Selamat & Dipercayai</h3>
              <p class="text-blue-100 text-sm">Data anda dilindungi dengan keselamatan bertaraf korporat</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-500 bg-opacity-30 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-1">Kemas Kini Masa Nyata</h3>
              <p class="text-blue-100 text-sm">Terima pemberitahuan tentang status permohonan anda serta-merta</p>
            </div>
          </div>
        </div>

        <!-- Footer text -->
        <div class="mt-auto pt-12">
          <p class="text-blue-200 text-sm">
            Dipercayai oleh ribuan pemohon di seluruh negara
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <!-- Mobile Logo -->
        <div class="lg:hidden text-center mb-8">
          <div class="inline-flex flex-col items-center mb-4">
            <img src="/images/jpn_logo.png" alt="JPN Logo" class="h-16 w-auto mb-2" />
            <h1 class="text-2xl font-bold text-gray-900">SPK</h1>
            <p class="text-sm text-gray-600">Jabatan Pendaftaran Negara</p>
          </div>
        </div>

        <div>
          <h2 class="text-3xl font-bold text-gray-900">
            Selamat Kembali
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Sila log masuk ke akaun anda untuk meneruskan
          </p>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <!-- Error Message -->
          <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-5">
            <!-- Email Input -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Alamat E-mel
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="form.email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="Masukkan e-mel anda"
                >
              </div>
            </div>

            <!-- Password Input -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Kata Laluan
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="Masukkan kata laluan anda"
                >
              </div>
            </div>
          </div>

          <!-- Sign In Button -->
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Sedang log masuk...' : 'Log Masuk' }}
            </button>
          </div>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-50 text-gray-500">Baharu ke SPK?</span>
            </div>
          </div>

          <!-- Register Link -->
          <div class="text-center">
            <NuxtLink
              to="/register"
              class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Cipta akaun
              <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
