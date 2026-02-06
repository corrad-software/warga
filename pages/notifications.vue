<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { token } = useAuth()
const router = useRouter()

const notifications = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const unreadCount = ref(0)

// Fetch notifications
const fetchNotifications = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/notifications', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      notifications.value = response.data.notifications
      unreadCount.value = response.data.unreadCount
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load notifications'
  } finally {
    loading.value = false
  }
}

// Mark as read
const markAsRead = async (id: string) => {
  try {
    await $fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    // Update local state
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.readAt = new Date()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (err: any) {
    console.error('Failed to mark as read:', err)
  }
}

// Format date
const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return d.toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Navigate to application
const viewApplication = (applicationId: string | null) => {
  if (applicationId) {
    router.push(`/applications/${applicationId}`)
  }
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Pemberitahuan</h2>
        <p class="text-gray-600 mt-2">
          Dapatkan maklumat terkini tentang status permohonan dan mesej penting
          <span v-if="unreadCount > 0" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ unreadCount }} belum dibaca
          </span>
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Memuatkan pemberitahuan...</p>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">
          {{ error }}
        </div>
      </div>

      <!-- Notifications List -->
      <div v-else-if="notifications.length > 0" class="space-y-4">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          @click="!notification.readAt && markAsRead(notification.id)"
          class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
          :class="[
            notification.readAt ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
          ]"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <!-- Unread Indicator -->
                  <div
                    v-if="!notification.readAt"
                    class="w-2 h-2 bg-blue-600 rounded-full"
                  ></div>

                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ notification.subject }}
                  </h3>
                </div>

                <p class="text-gray-700 mb-3">
                  {{ notification.message }}
                </p>

                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ formatDate(notification.sentAt || notification.createdAt) }}
                  </span>

                  <span v-if="notification.applicationNumber" class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ notification.applicationNumber }}
                  </span>
                </div>

                <!-- View Application Button -->
                <button
                  v-if="notification.applicationId"
                  @click.stop="viewApplication(notification.applicationId)"
                  class="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Lihat Permohonan
                  <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <!-- Notification Icon -->
              <div class="flex-shrink-0 ml-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Tiada pemberitahuan</h3>
        <p class="mt-1 text-sm text-gray-500">Anda sudah melihat semua!</p>
      </div>
    </main>
  </div>
</template>
