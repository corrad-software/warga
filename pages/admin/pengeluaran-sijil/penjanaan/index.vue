<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const { token } = useAuth()

const search = ref('')
const selectedApplication = ref<any>(null)
const applications = ref<any[]>([])
const loading = ref(false)
const generating = ref(false)

// Fetch verified applications
const fetchApplications = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/pengeluaran-sijil/penjanaan', {
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      params: { search: search.value }
    })
    if (response.success) {
      applications.value = response.data
      // Auto-select first if none selected
      if (!selectedApplication.value && applications.value.length > 0) {
        selectApplication(applications.value[0])
      }
    }
  } catch (error: any) {
    console.error('Error fetching applications:', error)
  } finally {
    loading.value = false
  }
}

// Select an application
const selectApplication = (app: any) => {
  selectedApplication.value = app
}

// Generate certificate
const generateCertificate = async () => {
  if (!selectedApplication.value) return
  
  if (!confirm('Adakah anda pasti untuk menjana sijil bagi pemohon ini?')) {
    return
  }
  
  generating.value = true
  try {
    const response = await $fetch(`/api/pengeluaran-sijil/penjanaan/${selectedApplication.value.id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
    
    if (response.success) {
      alert('Sijil berjaya dijana!')
      await fetchApplications()
    }
  } catch (error: any) {
    console.error('Error generating certificate:', error)
    alert(error.data?.message || 'Gagal menjana sijil')
  } finally {
    generating.value = false
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

// Get status badge class
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'DILULUSKAN':
    case 'LULUS':
    case 'LAYAK':
      return 'bg-green-100 text-green-800'
    case 'TIDAK_LAYAK':
    case 'DITOLAK':
      return 'bg-red-100 text-red-800'
    case 'MENUNGGU':
    case 'SELESAI':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
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
})
</script>

<template>
  <div class="h-full">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Penjanaan Sijil</h1>
      <p class="mt-1 text-sm text-gray-500">Jana sijil kewarganegaraan untuk pemohon yang layak</p>
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
            <span class="text-sm font-medium text-gray-700">PEMOHON LAYAK</span>
            <span class="text-xs text-gray-500">{{ applications.length }} pemohon</span>
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
                    {{ app.applicationRef || app.applicant?.idNumber }}
                  </p>
                  <p class="text-xs text-gray-600 mt-1">
                    {{ formatApplicationType(app.applicationType) }}
                  </p>
                  <div class="flex items-center gap-2 mt-2">
                    <span 
                      v-if="app.certificate"
                      class="inline-block px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800"
                    >
                      Sijil Dijana
                    </span>
                    <span 
                      v-else
                      class="inline-block px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800"
                    >
                      Belum Dijana
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Application Details -->
      <div class="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
        <template v-if="selectedApplication">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ selectedApplication.applicant?.fullName || 'Nama Tidak Tersedia' }}
              </h2>
              <p class="text-sm text-gray-500 mt-0.5">
                {{ selectedApplication.applicationRef }} • {{ formatApplicationType(selectedApplication.applicationType) }}
              </p>
            </div>
          </div>

          <!-- Details Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="space-y-6">
              <!-- Maklumat Pemohon -->
              <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Maklumat Pemohon
                </h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Nama Penuh</p>
                    <p class="font-medium text-gray-900">{{ selectedApplication.applicant?.fullName || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">No. Kad Pengenalan</p>
                    <p class="font-medium text-gray-900">{{ selectedApplication.applicant?.idNumber || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Tarikh Lahir</p>
                    <p class="font-medium text-gray-900">{{ formatDate(selectedApplication.applicant?.dateOfBirth) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Tempat Lahir</p>
                    <p class="font-medium text-gray-900">{{ selectedApplication.applicant?.placeOfBirth || '-' }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-xs text-gray-500 mb-1">Jenis Permohonan</p>
                    <p class="font-medium text-gray-900">{{ formatApplicationType(selectedApplication.applicationType) }}</p>
                  </div>
                </div>
              </div>

              <!-- Rekod Kelulusan -->
              <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Rekod Kelulusan
                </h3>
                <div v-if="selectedApplication.approval" class="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Status</p>
                    <span 
                      class="inline-block px-2 py-1 text-xs font-medium rounded"
                      :class="getStatusBadgeClass(selectedApplication.approval.status)"
                    >
                      {{ selectedApplication.approval.status }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Tarikh Kelulusan</p>
                    <p class="font-medium text-gray-900">{{ formatDate(selectedApplication.approval.approvedAt) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Pelulus</p>
                    <p class="font-medium text-gray-900">{{ selectedApplication.approval.approverName || '-' }}</p>
                  </div>
                  <div v-if="selectedApplication.approval.decisionNotes" class="col-span-3">
                    <p class="text-xs text-gray-500 mb-1">Catatan</p>
                    <p class="text-sm text-gray-900">{{ selectedApplication.approval.decisionNotes }}</p>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500">
                  <p class="text-sm">Tiada rekod kelulusan</p>
                </div>
              </div>

              <!-- Rekod Pelaksanaan Angkat Sumpah -->
              <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  Rekod Pelaksanaan Angkat Sumpah
                </h3>
                <div v-if="selectedApplication.oathRecord" class="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Tarikh</p>
                    <p class="font-medium text-gray-900">{{ formatDate(selectedApplication.oathRecord.oathDate) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Tempat</p>
                    <p class="font-medium text-gray-900">{{ selectedApplication.oathRecord.oathLocation || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Status</p>
                    <span 
                      class="inline-block px-2 py-1 text-xs font-medium rounded"
                      :class="getStatusBadgeClass(selectedApplication.oathRecord.status)"
                    >
                      {{ selectedApplication.oathRecord.status }}
                    </span>
                  </div>
                  <div v-if="selectedApplication.oathRecord.remarks" class="col-span-3">
                    <p class="text-xs text-gray-500 mb-1">Catatan</p>
                    <p class="text-sm text-gray-900">{{ selectedApplication.oathRecord.remarks }}</p>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500">
                  <p class="text-sm">Tiada rekod pelaksanaan angkat sumpah</p>
                </div>
              </div>

              <!-- Pengesahan Kelayakan Pengeluaran Sijil -->
              <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Pengesahan Kelayakan Pengeluaran Sijil
                </h3>
                <div v-if="selectedApplication.certificateEligibility" class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-xs text-gray-500 mb-1">Status</p>
                    <span 
                      class="inline-block px-2 py-1 text-xs font-medium rounded"
                      :class="getStatusBadgeClass(selectedApplication.certificateEligibility.status)"
                    >
                      {{ selectedApplication.certificateEligibility.status }}
                    </span>
                  </div>
                  <div v-if="selectedApplication.certificateEligibility.notes" class="col-span-2">
                    <p class="text-xs text-gray-500 mb-1">Catatan</p>
                    <p class="text-sm text-gray-900">{{ selectedApplication.certificateEligibility.notes }}</p>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500">
                  <p class="text-sm">Belum disahkan</p>
                </div>
              </div>

              <!-- Penjanaan Sijil -->
              <div class="bg-white rounded-lg p-5 border-2 border-green-200">
                <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Penjanaan Sijil
                </h3>
                
                <!-- If certificate already generated -->
                <div v-if="selectedApplication.certificate" class="space-y-4">
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-green-900">Sijil Telah Dijana</p>
                        <p class="text-xs text-green-700 mt-1">
                          No. Sijil: <span class="font-semibold">{{ selectedApplication.certificate.certificateNo }}</span>
                        </p>
                        <p class="text-xs text-green-700 mt-0.5">
                          Tarikh Jana: {{ formatDate(selectedApplication.certificate.issuedAt) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex justify-center">
                    <button
                      class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-lg cursor-not-allowed"
                      disabled
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Sijil Telah Dijana
                    </button>
                  </div>
                </div>
                
                <!-- If certificate not yet generated -->
                <div v-else class="space-y-4">
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-yellow-900">Sijil Belum Dijana</p>
                        <p class="text-xs text-yellow-700 mt-1">
                          Klik butang di bawah untuk menjana sijil kewarganegaraan
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex justify-center">
                    <button
                      @click="generateCertificate"
                      :disabled="generating"
                      class="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
                    >
                      <svg v-if="generating" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <span>{{ generating ? 'Menjana Sijil...' : 'Jana Sijil' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center text-gray-500">
            <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p class="mt-4 text-sm">Pilih pemohon dari senarai untuk melihat butiran</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
