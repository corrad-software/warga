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
const showBiometricModal = ref(false)
const selectedBiometric = ref<any>(null)
const showDeleteConfirm = ref(false)
const biometricToDelete = ref<any>(null)
const deleting = ref(false)

// Fetch applications
const fetchApplications = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/biometrik', {
      params: { search: search.value }
    })
    if (response.success) {
      applications.value = response.data
      // Auto-select first if none selected
      if (!selectedApplication.value && applications.value.length > 0) {
        selectApplication(applications.value[0])
      }
    }
  } catch (error) {
    console.error('Error fetching applications:', error)
  } finally {
    loading.value = false
  }
}

// Select an application
const selectApplication = (app: any) => {
  selectedApplication.value = app
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

// View biometric details in modal
const viewBiometric = (biometric: any) => {
  selectedBiometric.value = biometric
  showBiometricModal.value = true
}

// Close biometric modal
const closeBiometricModal = () => {
  showBiometricModal.value = false
  selectedBiometric.value = null
}

// Confirm delete biometric
const confirmDeleteBiometric = (biometric: any) => {
  biometricToDelete.value = biometric
  showDeleteConfirm.value = true
}

// Delete biometric
const deleteBiometric = async () => {
  if (!biometricToDelete.value) return
  
  deleting.value = true
  try {
    await $fetch(`/api/biometrik/${biometricToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    // Remove from local state
    if (selectedApplication.value?.biometrics) {
      const index = selectedApplication.value.biometrics.findIndex(
        (b: any) => b.id === biometricToDelete.value.id
      )
      if (index !== -1) {
        selectedApplication.value.biometrics.splice(index, 1)
      }
    }
    
    // Refresh applications list
    await fetchApplications()
    
    showDeleteConfirm.value = false
    biometricToDelete.value = null
  } catch (error) {
    console.error('Error deleting biometric:', error)
    alert('Gagal memadam rekod biometrik')
  } finally {
    deleting.value = false
  }
}

// Cancel delete
const cancelDelete = () => {
  showDeleteConfirm.value = false
  biometricToDelete.value = null
}

// Get status badge class
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SAH':
    case 'LENGKAP':
      return 'bg-green-100 text-green-800'
    case 'SEBAHAGIAN':
      return 'bg-yellow-100 text-yellow-800'
    case 'TIDAK SAH':
    case 'TIDAK_LENGKAP':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get status label
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'SAH':
    case 'LENGKAP':
      return 'SAH'
    case 'SEBAHAGIAN':
      return 'SEBAHAGIAN'
    case 'TIDAK SAH':
    case 'TIDAK_LENGKAP':
      return 'TIDAK SAH'
    default:
      return 'TIDAK SAH'
  }
}

// Get biometric status badge class
const getBiometricStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SAH':
    case 'LENGKAP':
      return 'bg-green-100 text-green-800'
    case 'TIDAK SAH':
    case 'TIDAK_LENGKAP':
    case 'TIDAK_HADIR':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get biometric status label
const getBiometricStatusLabel = (status: string) => {
  switch (status) {
    case 'SAH':
    case 'LENGKAP':
      return 'SAH'
    case 'TIDAK SAH':
    case 'TIDAK_LENGKAP':
    case 'TIDAK_HADIR':
      return 'TIDAK SAH'
    default:
      return 'TIADA STATUS'
  }
}

// Format finger position
const formatFingerPosition = (position: string) => {
  if (!position) return '-'
  return position.replace(/_/g, ' ')
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
    month: '2-digit',
    year: 'numeric'
  })
}

// Format datetime
const formatDateTime = (date: any) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('ms-MY', {
    day: '2-digit',
    month: '2-digit',
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
      <h1 class="text-2xl font-bold text-gray-900">Biometrik</h1>
      <p class="mt-1 text-sm text-gray-500">Semak maklumat biometrik pemohon</p>
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

          <div v-else-if="applications.length === 0" class="p-4 text-center text-gray-500">
            <p class="text-sm">Tiada permohonan dijumpai</p>
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
                    :class="getStatusBadgeClass(app.biometricStatus)"
                  >
                    {{ getStatusLabel(app.biometricStatus) }}
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

      <!-- Right Panel - Biometric Details -->
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

          <!-- Biometric List -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="space-y-4">
              <!-- Section Header -->
              <div class="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 class="text-lg font-semibold text-gray-900">Maklumat Biometrik</h3>
                <span class="text-sm text-gray-500">
                  {{ selectedApplication.biometricStats?.complete || 0 }}/{{ selectedApplication.biometricStats?.total || 0 }} lengkap
                </span>
              </div>

              <div v-if="selectedApplication.biometrics?.length > 0" class="space-y-3">
                <div
                  v-for="biometric in selectedApplication.biometrics"
                  :key="biometric.id"
                  class="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                        <h4 class="text-base font-semibold text-gray-900">
                          {{ formatFingerPosition(biometric.fingerPosition) || 'Cap Jari' }}
                        </h4>
                      </div>
                      <p class="text-xs text-gray-500">ID Biometrik: #{{ biometric.id }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span 
                        class="px-3 py-1 text-xs font-medium rounded-full"
                        :class="getBiometricStatusBadgeClass(biometric.status)"
                      >
                        {{ getBiometricStatusLabel(biometric.status) }}
                      </span>
                      <!-- Action Icons -->
                      <div class="flex items-center gap-1 ml-2">
                        <!-- View Icon -->
                        <button
                          @click="viewBiometric(biometric)"
                          class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <!-- Delete Icon -->
                        <button
                          @click="confirmDeleteBiometric(biometric)"
                          class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Padam"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Tarikh Cap Jari Diambil</p>
                      <p class="font-medium text-gray-900">{{ formatDateTime(biometric.capturedAt) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Jenis Jari</p>
                      <p class="font-medium text-gray-900">{{ formatFingerPosition(biometric.fingerPosition) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Status</p>
                      <p class="font-medium text-gray-900">{{ getBiometricStatusLabel(biometric.status) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-1">Diambil Oleh</p>
                      <p class="font-medium text-gray-900">
                        {{ biometric.capturedBy ? `Pegawai #${biometric.capturedBy}` : '-' }}
                      </p>
                    </div>
                  </div>

                  <div v-if="biometric.biometricType" class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex items-center gap-2">
                      <p class="text-xs text-gray-500">Jenis Biometrik:</p>
                      <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {{ biometric.biometricType }}
                      </span>
                    </div>
                  </div>

                  <div v-if="biometric.biometricHash" class="mt-2">
                    <p class="text-xs text-gray-400 truncate">Hash: {{ biometric.biometricHash }}</p>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-12 text-gray-500">
                <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                <p class="text-sm mt-4">Tiada rekod biometrik</p>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center text-gray-500">
            <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
            <p class="mt-4 text-sm">Pilih pemohon dari senarai untuk melihat biometrik</p>
          </div>
        </div>
      </div>
    </div>

    <!-- View Biometric Modal -->
    <div
      v-if="showBiometricModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeBiometricModal"
    >
      <div
        @click.stop
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900">Maklumat Biometrik</h3>
          <button
            @click="closeBiometricModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div v-if="selectedBiometric" class="px-6 py-6">
          <div class="space-y-6">
            <!-- Biometric ID -->
            <div class="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p class="text-sm text-gray-500">ID Biometrik</p>
                <p class="text-lg font-semibold text-gray-900">#{{ selectedBiometric.id }}</p>
              </div>
              <span 
                class="px-4 py-2 text-sm font-medium rounded-full"
                :class="getBiometricStatusBadgeClass(selectedBiometric.status)"
              >
                {{ getBiometricStatusLabel(selectedBiometric.status) }}
              </span>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-gray-500 mb-2">Jenis Jari</p>
                <p class="text-base font-medium text-gray-900">
                  {{ formatFingerPosition(selectedBiometric.fingerPosition) || '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-2">Jenis Biometrik</p>
                <p class="text-base font-medium text-gray-900">
                  {{ selectedBiometric.biometricType || '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-2">Status</p>
                <p class="text-base font-medium text-gray-900">
                  {{ getBiometricStatusLabel(selectedBiometric.status) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-2">Diambil Oleh</p>
                <p class="text-base font-medium text-gray-900">
                  {{ selectedBiometric.capturedBy ? `Pegawai #${selectedBiometric.capturedBy}` : '-' }}
                </p>
              </div>
              <div class="col-span-2">
                <p class="text-sm text-gray-500 mb-2">Tarikh Cap Jari Diambil</p>
                <p class="text-base font-medium text-gray-900">
                  {{ formatDateTime(selectedBiometric.capturedAt) }}
                </p>
              </div>
            </div>

            <!-- Biometric Hash -->
            <div v-if="selectedBiometric.biometricHash" class="pt-4 border-t border-gray-200">
              <p class="text-sm text-gray-500 mb-2">Biometric Hash</p>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-xs font-mono text-gray-700 break-all">
                  {{ selectedBiometric.biometricHash }}
                </p>
              </div>
            </div>

            <!-- Audit Information -->
            <div class="pt-4 border-t border-gray-200">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Maklumat Audit</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500 mb-1">Dicipta Pada</p>
                  <p class="text-sm text-gray-900">{{ formatDateTime(selectedBiometric.createddate) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 mb-1">Dicipta Oleh</p>
                  <p class="text-sm text-gray-900">{{ selectedBiometric.createdby || '-' }}</p>
                </div>
                <div v-if="selectedBiometric.updateddate">
                  <p class="text-xs text-gray-500 mb-1">Dikemas Kini Pada</p>
                  <p class="text-sm text-gray-900">{{ formatDateTime(selectedBiometric.updateddate) }}</p>
                </div>
                <div v-if="selectedBiometric.updatedby">
                  <p class="text-xs text-gray-500 mb-1">Dikemas Kini Oleh</p>
                  <p class="text-sm text-gray-900">{{ selectedBiometric.updatedby }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            @click="closeBiometricModal"
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="cancelDelete"
    >
      <div
        @click.stop
        class="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Padam Rekod Biometrik</h3>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-6">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p class="text-gray-900 font-medium mb-2">
                Adakah anda pasti untuk memadam rekod biometrik ini?
              </p>
              <p class="text-sm text-gray-600 mb-3">
                Rekod: <span class="font-semibold">{{ formatFingerPosition(biometricToDelete?.fingerPosition) }}</span>
              </p>
              <p class="text-sm text-red-600">
                Tindakan ini tidak boleh dibatalkan.
              </p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            @click="cancelDelete"
            :disabled="deleting"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            Batal
          </button>
          <button
            @click="deleteBiometric"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="deleting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ deleting ? 'Memadam...' : 'Ya, Padam' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
