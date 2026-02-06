<template>
  <div class="min-h-screen bg-background flex flex-col">
    <nav class="border-b bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <img src="/images/jpn_logo.png" alt="JPN Logo" class="h-12 w-auto" />
            <div>
              <h1 class="text-2xl font-bold">SPK</h1>
              <p class="text-xs text-gray-600">Sistem Pengurusan Kewarganegaraan</p>
            </div>
          </div>

          <!-- Right: Menu -->
          <nav class="flex items-center space-x-6">
            <NuxtLink
              to="/dashboard"
              class="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Permohonan
            </NuxtLink>
            <NuxtLink
              to="/payments"
              class="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Pembayaran
            </NuxtLink>

            <!-- Notification Bell -->
            <NuxtLink
              to="/notifications"
              class="relative text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Pemberitahuan"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <!-- Notification Badge -->
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[1rem] h-4 px-1 text-xs font-bold text-white bg-red-500 rounded-full"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </NuxtLink>

            <!-- Profile Icon -->
            <NuxtLink
              to="/profile"
              class="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Profil"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </NuxtLink>

            <button
              @click="handleLogout"
              class="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Log Keluar
            </button>
          </nav>
        </div>
      </div>
    </nav>
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-center text-sm text-gray-600">
          © 2025 Sistem Pengurusan Kewarganegaraan (SPK) - Jabatan Pendaftaran Negara Malaysia
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { logout, token } = useAuth()
const router = useRouter()

const unreadCount = ref(0)

// Fetch unread notification count
const fetchUnreadCount = async () => {
  try {
    const response = await $fetch('/api/notifications', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      unreadCount.value = response.data.unreadCount
    }
  } catch (err) {
    // Silently fail for unread count
    console.error('Failed to fetch unread count:', err)
  }
}

const handleLogout = () => {
  logout()
  router.push('/login')
}

// Fetch unread count on mount and refresh every 30 seconds
onMounted(() => {
  fetchUnreadCount()
  setInterval(fetchUnreadCount, 30000)
})
</script>
