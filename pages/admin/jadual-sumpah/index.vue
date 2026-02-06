<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const search = ref('')
const selectedApplication = ref<any>(null)
const applications = ref<any[]>([])
const loading = ref(false)
const openMenuId = ref<number | null>(null)
const activeSection = ref('penjadualan') // penjadualan, notis, kehadiran, rekod
const errorMessage = ref('')

// Fetch applications
const fetchApplications = async () => {
  loading.value = true
  errorMessage.value = ''
  console.log('Fetching oath schedule applications...')
  try {
    const response = await $fetch('/api/jadual-sumpah', {
      params: { search: search.value }
    })
    console.log('API Response:', response)
    console.log('Success:', response.success)
    console.log('Data length:', response.data?.length)
    
    if (response.success) {
      applications.value = response.data
      console.log('Applications loaded:', applications.value.length)
      // Auto-select first if none selected
      if (!selectedApplication.value && applications.value.length > 0) {
        selectApplication(applications.value[0])
      }
    } else {
      console.error('API returned success: false')
      errorMessage.value = 'API returned error'
    }
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    console.error('Error message:', error.message)
    console.error('Error data:', error.data)
    errorMessage.value = error.message || error.data?.message || 'Gagal memuatkan data'
  } finally {
    loading.value = false
  }
}

// Select an application
const selectApplication = (app: any) => {
  selectedApplication.value = app
  activeSection.value = 'penjadualan' // Reset to first section
}

// Toggle dropdown menu
const toggleMenu = (appId: number, event: Event) => {
  event.stopPropagation()
  openMenuId.value = openMenuId.value === appId ? null : appId
}

// Close menu when clicking outside
const closeMenu = () => {
  openMenuId.value = null
}

// Navigate to view application
const viewApplication = (appId: number) => {
  navigateTo(`/admin/applications/${appId}`)
}

// Change active section
const changeSection = (section: string) => {
  activeSection.value = section
}

// Get status badge class for oath status
const getOathStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SELESAI':
      return 'bg-green-100 text-green-800'
    case 'DIJADUALKAN':
      return 'bg-blue-100 text-blue-800'
    case 'DITANGGUH':
      return 'bg-yellow-100 text-yellow-800'
    case 'TIDAK_HADIR':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get status label for oath status
const getOathStatusLabel = (status: string) => {
  switch (status) {
    case 'SELESAI':
      return 'SELESAI'
    case 'DIJADUALKAN':
      return 'DIJADUALKAN'
    case 'DITANGGUH':
      return 'DITANGGUH'
    case 'TIDAK_HADIR':
      return 'TIDAK HADIR'
    default:
      return 'BELUM DIJADUAL'
  }
}

// Get notification status badge class
const getNotificationStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'BERJAYA':
      return 'bg-green-100 text-green-800'
    case 'GAGAL':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get notification channel icon
const getNotificationChannelIcon = (channel: string) => {
  switch (channel) {
    case 'EMAIL':
      return '📧'
    case 'SMS':
      return '📱'
    case 'SYSTEM':
      return '💻'
    default:
      return '📬'
  }
}

// Format application type
const formatApplicationType = (type: string) => {
  switch (type) {
    case 'PERKARA_15_2':
      return 'Permohonan Kewarganegaraan Perkara 15(2)'
    case 'KELAHIRAN_LUAR':
      return 'Kelahiran Di Luar Negara'
    default:
      return type || 'Jenis Permohonan'
  }
}

// Format date
const formatDate = (date: any) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// Format time
const formatTime = (time: string) => {
  if (!time) return '-'
  return time
}

// Format datetime
const formatDateTime = (date: any) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('ms-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Debounced search
let searchTimeout: any = null
watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchApplications()
  }, 300)
})

onMounted(() => {
  fetchApplications()
  
  // Close dropdown menu when clicking outside
  document.addEventListener('click', closeMenu)
  
  // Cleanup
  onBeforeUnmount(() => {
    document.removeEventListener('click', closeMenu)
  })
})
</script>

<template>
  <div class="h-full">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tadbir Angkat Sumpah</h1>
      <p class="mt-1 text-sm text-gray-500">Urus jadual upacara angkat sumpah pemohon</p>
    </div>

    <!-- Main Content - Sidebar + Detail Panel -->
    <div class="flex gap-6 h-[calc(100vh-220px)]">
      <!-- Left Sidebar - Applicant List -->
      <div class="w-[400px] flex-shrink-0 bg-white rounded-lg border border-gray-200 flex flex-col">
        <!-- Search Box -->
        <div class="p-4 border-b border-gray-200">
          <div class="relative">
            <input
              v-model="search"
              type="text"
              placeholder="Cari nama atau no. permohonan..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Section Header -->
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">PEMOHON</span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>

        <!-- Applicant List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="p-4 text-center text-gray-500">
            <svg class="animate-spin h-6 w-6 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-sm">Memuatkan...</p>
          </div>

          <div v-else-if="errorMessage" class="p-4 text-center">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <svg class="w-8 h-8 mx-auto text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-800 font-medium mb-2">Ralat</p>
              <p class="text-xs text-red-600">{{ errorMessage }}</p>
              <button
                @click="fetchApplications"
                class="mt-3 px-4 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
              >
                Cuba Semula
              </button>
            </div>
          </div>

          <div v-else-if="applications.length === 0" class="p-4 text-center text-gray-500">
            <p class="text-sm">Tiada jadual sumpah dijumpai</p>
            <button
              @click="fetchApplications"
              class="mt-3 px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            >
              Muat Semula
            </button>
          </div>

          <div v-else>
            <div
              v-for="app in applications"
              :key="app.id"
              @click="selectApplication(app)"
              class="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              :class="{ 'bg-blue-50 border-l-4 border-l-blue-500': selectedApplication?.id === app.id }"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-blue-600 truncate">
                    {{ app.applicant?.fullName || 'Nama Tidak Tersedia' }}
                  </h3>
                  <p class="text-xs text-gray-500 mt-0.5">
                    {{ app.applicant?.idNumber || app.applicationRef }}
                  </p>
                  <span 
                    class="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded"
                    :class="getOathStatusBadgeClass(app.oathStatus)"
                  >
                    {{ getOathStatusLabel(app.oathStatus) }}
                  </span>
                </div>
                <!-- Dropdown Menu -->
                <div class="relative">
                  <button 
                    @click="toggleMenu(app.id, $event)"
                    class="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                  
                  <!-- Dropdown Menu -->
                  <div
                    v-if="openMenuId === app.id"
                    @click.stop
                    class="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <button
                      @click="viewApplication(app.id); closeMenu()"
                      class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Oath Schedule Details -->
      <div class="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
        <template v-if="selectedApplication">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ selectedApplication.applicant?.fullName || 'Nama Tidak Tersedia' }}
              </h2>
              <p class="text-sm text-gray-500 mt-0.5">
                {{ formatApplicationType(selectedApplication.applicationType) }}
              </p>
            </div>
            <NuxtLink
              :to="`/admin/applications/${selectedApplication.id}`"
              class="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </NuxtLink>
          </div>

          <!-- Section Tabs -->
          <div class="px-6 border-b border-gray-200 flex gap-4">
            <button
              @click="changeSection('penjadualan')"
              class="py-3 px-2 border-b-2 text-sm font-medium transition-colors"
              :class="activeSection === 'penjadualan' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              📅 Penjadualan
            </button>
            <button
              @click="changeSection('notis')"
              class="py-3 px-2 border-b-2 text-sm font-medium transition-colors"
              :class="activeSection === 'notis' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              📢 Notis & Peringatan
            </button>
            <button
              @click="changeSection('kehadiran')"
              class="py-3 px-2 border-b-2 text-sm font-medium transition-colors"
              :class="activeSection === 'kehadiran' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              ✅ Pengesahan Kehadiran
            </button>
            <button
              @click="changeSection('rekod')"
              class="py-3 px-2 border-b-2 text-sm font-medium transition-colors"
              :class="activeSection === 'rekod' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              📋 Rekod Sumpah
            </button>
          </div>

          <!-- Content Area -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Penjadualan Section -->
            <div v-if="activeSection === 'penjadualan'" class="space-y-4">
              <div class="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 class="text-lg font-semibold text-gray-900">Maklumat Penjadualan</h3>
                <span class="text-sm text-gray-500">
                  {{ selectedApplication.oathStats?.total || 0 }} jadual
                </span>
              </div>

              <div v-if="selectedApplication.oathSchedules?.length > 0" class="space-y-3">
                <div
                  v-for="schedule in selectedApplication.oathSchedules"
                  :key="schedule.id"
                  class="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h4 class="text-base font-semibold text-gray-900">
                          {{ formatDate(schedule.oathDate) }}
                        </h4>
                      </div>
                      <p class="text-xs text-gray-500">ID Jadual: #{{ schedule.id }}</p>
                    </div>
                    <span 
                      class="px-3 py-1 text-xs font-medium rounded-full"
                      :class="getOathStatusBadgeClass(schedule.status)"
                    >
                      {{ getOathStatusLabel(schedule.status) }}
                    </span>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Tarikh</p>
                      <p class="font-medium text-gray-900">{{ formatDate(schedule.oathDate) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Masa</p>
                      <p class="font-medium text-gray-900">{{ formatTime(schedule.oathTime) }}</p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-xs text-gray-500 mb-1">Lokasi</p>
                      <p class="font-medium text-gray-900">{{ schedule.location || '-' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Status</p>
                      <p class="font-medium text-gray-900">{{ getOathStatusLabel(schedule.status) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Rekod Sumpah</p>
                      <p class="font-medium text-gray-900">{{ schedule.oathRecords?.length || 0 }} rekod</p>
                    </div>
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p class="text-gray-500 mb-1">Dicipta Pada</p>
                        <p class="text-gray-900">{{ formatDateTime(schedule.createdDate) }}</p>
                      </div>
                      <div>
                        <p class="text-gray-500 mb-1">Dicipta Oleh</p>
                        <p class="text-gray-900">{{ schedule.createdBy || '-' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-12 text-gray-500">
                <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-sm mt-4">Tiada jadual sumpah</p>
              </div>
            </div>

            <!-- Notis & Peringatan Section -->
            <div v-else-if="activeSection === 'notis'" class="space-y-4">
              <div class="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 class="text-lg font-semibold text-gray-900">Notis & Peringatan</h3>
                <span class="text-sm text-gray-500">
                  {{ selectedApplication.notificationStats?.successful || 0 }}/{{ selectedApplication.notificationStats?.total || 0 }} berjaya
                </span>
              </div>

              <div v-if="selectedApplication.notifications?.length > 0" class="space-y-3">
                <div
                  v-for="notification in selectedApplication.notifications"
                  :key="notification.id"
                  class="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-2xl">{{ getNotificationChannelIcon(notification.channel) }}</span>
                        <h4 class="text-base font-semibold text-gray-900">
                          {{ notification.channel }}
                        </h4>
                      </div>
                      <p class="text-xs text-gray-500">ID Notifikasi: #{{ notification.id }}</p>
                    </div>
                    <span 
                      class="px-3 py-1 text-xs font-medium rounded-full"
                      :class="getNotificationStatusBadgeClass(notification.status)"
                    >
                      {{ notification.status }}
                    </span>
                  </div>
                  
                  <div class="mb-4">
                    <p class="text-xs text-gray-500 mb-2">Mesej</p>
                    <div class="bg-white rounded-lg p-3 border border-gray-200">
                      <p class="text-sm text-gray-700 whitespace-pre-line">{{ notification.message }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Saluran</p>
                      <p class="font-medium text-gray-900">{{ notification.channel }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Status</p>
                      <p class="font-medium text-gray-900">{{ notification.status }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Jenis Penerima</p>
                      <p class="font-medium text-gray-900">{{ notification.recipientType }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Tarikh Dihantar</p>
                      <p class="font-medium text-gray-900">{{ formatDateTime(notification.sentAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-12 text-gray-500">
                <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p class="text-sm mt-4">Tiada notifikasi</p>
              </div>
            </div>

            <!-- Pengesahan Kehadiran Section -->
            <div v-else-if="activeSection === 'kehadiran'" class="space-y-4">
              <div class="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 class="text-lg font-semibold text-gray-900">Pengesahan Kehadiran</h3>
                <span class="text-sm text-gray-500">
                  {{ selectedApplication.oathStats?.completed || 0 }} hadir
                </span>
              </div>

              <div v-if="selectedApplication.oathSchedules?.length > 0" class="space-y-3">
                <div
                  v-for="schedule in selectedApplication.oathSchedules"
                  :key="schedule.id"
                  class="bg-gray-50 rounded-lg p-5 border border-gray-200"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <h4 class="text-base font-semibold text-gray-900">
                        {{ formatDate(schedule.oathDate) }} - {{ formatTime(schedule.oathTime) }}
                      </h4>
                      <p class="text-xs text-gray-500 mt-1">{{ schedule.location }}</p>
                    </div>
                    <span 
                      class="px-3 py-1 text-xs font-medium rounded-full"
                      :class="getOathStatusBadgeClass(schedule.status)"
                    >
                      {{ getOathStatusLabel(schedule.status) }}
                    </span>
                  </div>

                  <div class="bg-white rounded-lg p-4 border border-gray-200">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Status Kehadiran</p>
                        <p class="text-sm font-medium" :class="schedule.status === 'SELESAI' ? 'text-green-600' : schedule.status === 'TIDAK_HADIR' ? 'text-red-600' : 'text-gray-900'">
                          {{ schedule.status === 'SELESAI' ? 'HADIR' : schedule.status === 'TIDAK_HADIR' ? 'TIDAK HADIR' : 'BELUM DISAHKAN' }}
                        </p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Tarikh Pengesahan</p>
                        <p class="text-sm font-medium text-gray-900">
                          {{ schedule.status === 'SELESAI' ? formatDate(schedule.oathDate) : '-' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-12 text-gray-500">
                <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm mt-4">Tiada rekod kehadiran</p>
              </div>
            </div>

            <!-- Rekod Sumpah Section -->
            <div v-else-if="activeSection === 'rekod'" class="space-y-4">
              <div class="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 class="text-lg font-semibold text-gray-900">Rekod Sumpah</h3>
                <span class="text-sm text-gray-500">
                  {{ selectedApplication.oathSchedules?.reduce((sum: number, s: any) => sum + (s.oathRecords?.length || 0), 0) || 0 }} rekod
                </span>
              </div>

              <div v-if="selectedApplication.oathSchedules?.some((s: any) => s.oathRecords?.length > 0)" class="space-y-3">
                <template v-for="schedule in selectedApplication.oathSchedules" :key="schedule.id">
                  <div
                    v-for="record in schedule.oathRecords"
                    :key="record.id"
                    class="bg-gray-50 rounded-lg p-5 border border-gray-200"
                  >
                    <div class="flex items-start justify-between mb-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h4 class="text-base font-semibold text-gray-900">
                            Rekod Sumpah #{{ record.id }}
                          </h4>
                        </div>
                        <p class="text-xs text-gray-500">Jadual: #{{ schedule.id }}</p>
                      </div>
                      <span class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        SELESAI
                      </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Tarikh Dilaksanakan</p>
                        <p class="font-medium text-gray-900">{{ formatDateTime(record.executedAt) }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 mb-1">Pegawai</p>
                        <p class="font-medium text-gray-900">
                          {{ record.officerId ? `Pegawai #${record.officerId}` : '-' }}
                        </p>
                      </div>
                    </div>

                    <div v-if="record.remarks" class="mb-4">
                      <p class="text-xs text-gray-500 mb-2">Catatan</p>
                      <div class="bg-white rounded-lg p-3 border border-gray-200">
                        <p class="text-sm text-gray-700">{{ record.remarks }}</p>
                      </div>
                    </div>

                    <div class="pt-4 border-t border-gray-200">
                      <div class="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p class="text-gray-500 mb-1">Dicipta Pada</p>
                          <p class="text-gray-900">{{ formatDateTime(record.createdDate) }}</p>
                        </div>
                        <div>
                          <p class="text-gray-500 mb-1">Dicipta Oleh</p>
                          <p class="text-gray-900">{{ record.createdBy || '-' }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <div v-else class="text-center py-12 text-gray-500">
                <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-sm mt-4">Tiada rekod sumpah</p>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center text-gray-500">
            <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="mt-4 text-sm">Pilih pemohon dari senarai untuk melihat jadual sumpah</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
