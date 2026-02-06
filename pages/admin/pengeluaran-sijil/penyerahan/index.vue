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
const submitting = ref(false)

// Handover form
const handoverForm = ref({
  status: '',
  handoverDate: '',
  notes: ''
})

// Fetch applications with certificates
const fetchApplications = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/pengeluaran-sijil/penyerahan', {
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
  // Reset form with existing data if available
  handoverForm.value = {
    status: app.handover?.status || '',
    handoverDate: app.handover?.handoverDate || '',
    notes: app.handover?.notes || ''
  }
}

// Submit handover information
const submitHandover = async () => {
  if (!selectedApplication.value) return
  
  if (!handoverForm.value.status) {
    alert('Sila pilih status penyerahan')
    return
  }
  
  if (!handoverForm.value.handoverDate) {
    alert('Sila pilih tarikh penyerahan')
    return
  }
  
  submitting.value = true
  try {
    const response = await $fetch(`/api/pengeluaran-sijil/penyerahan/${selectedApplication.value.id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        status: handoverForm.value.status,
        handoverDate: handoverForm.value.handoverDate,
        notes: handoverForm.value.notes
      }
    })
    
    if (response.success) {
      alert('Maklumat penyerahan berjaya disimpan')
      await fetchApplications()
    }
  } catch (error: any) {
    console.error('Error submitting handover:', error)
    alert(error.data?.message || 'Gagal menyimpan maklumat penyerahan')
  } finally {
    submitting.value = false
  }
}

// Download certificate (placeholder - implement actual download)
const downloadCertificate = () => {
  if (!selectedApplication.value?.certificate) {
    alert('Tiada sijil untuk dimuat turun')
    return
  }
  
  alert(`Memuat turun sijil: ${selectedApplication.value.certificate.certificateNo}`)
  // TODO: Implement actual certificate download/PDF generation
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
    case 'TELAH_DISERAH':
      return 'bg-green-100 text-green-800'
    case 'TIDAK_LAYAK':
    case 'DITOLAK':
    case 'TIDAK_DISERAH':
      return 'bg-red-100 text-red-800'
    case 'MENUNGGU':
    case 'SELESAI':
    case 'TANGGUH_PENYERAHAN':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Format handover status
const formatHandoverStatus = (status: string) => {
  switch (status) {
    case 'TELAH_DISERAH':
      return 'Telah Diserah'
    case 'TANGGUH_PENYERAHAN':
      return 'Tangguh Penyerahan'
    case 'TIDAK_DISERAH':
      return 'Tidak Diserah'
    default:
      return status || 'Belum Diserah'
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
      <h1 class="text-2xl font-bold text-gray-900">Penyerahan Sijil</h1>
      <p class="mt-1 text-sm text-gray-500">Urus penyerahan sijil kewarganegaraan kepada pemohon</p>
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
            <span class="text-sm font-medium text-gray-700">SIJIL DIJANA</span>
            <span class="text-xs text-gray-500">{{ applications.length }} sijil</span>
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
                    {{ app.certificate?.certificateNo || app.applicationRef }}
                  </p>
                  <p class="text-xs text-gray-600 mt-1">
                    {{ formatApplicationType(app.applicationType) }}
                  </p>
                  <div class="flex items-center gap-2 mt-2">
                    <span 
                      v-if="app.handover?.status"
                      class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                      :class="getStatusBadgeClass(app.handover.status)"
                    >
                      {{ formatHandoverStatus(app.handover.status) }}
                    </span>
                    <span 
                      v-else
                      class="inline-block px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800"
                    >
                      Belum Diserah
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
              <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Penjanaan Sijil
                </h3>
                <div v-if="selectedApplication.certificate" class="space-y-3">
                  <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-purple-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-purple-900">Sijil Telah Dijana</p>
                        <p class="text-xs text-purple-700 mt-1">
                          No. Sijil: <span class="font-semibold">{{ selectedApplication.certificate.certificateNo }}</span>
                        </p>
                        <p class="text-xs text-purple-700 mt-0.5">
                          Tarikh Jana: {{ formatDate(selectedApplication.certificate.issuedAt) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex justify-center">
                    <button
                      @click="downloadCertificate"
                      class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Muat Turun Sijil
                    </button>
                  </div>
                </div>
                <div v-else class="text-center py-4 text-gray-500">
                  <p class="text-sm">Sijil belum dijana</p>
                </div>
              </div>

              <!-- Maklumat Penyerahan -->
              <div class="bg-white rounded-lg p-5 border-2 border-red-200">
                <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Maklumat Penyerahan
                </h3>
                <div class="space-y-4">
                  <!-- Status Dropdown -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Status Penyerahan <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="handoverForm.status"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Status</option>
                      <option value="TELAH_DISERAH">Telah Diserah</option>
                      <option value="TANGGUH_PENYERAHAN">Tangguh Penyerahan</option>
                      <option value="TIDAK_DISERAH">Tidak Diserah</option>
                    </select>
                  </div>

                  <!-- Date Field -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tarikh Penyerahan <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="handoverForm.handoverDate"
                      type="date"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <!-- Catatan TextField -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      v-model="handoverForm.notes"
                      rows="4"
                      placeholder="Masukkan catatan atau ulasan tentang penyerahan sijil..."
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    ></textarea>
                  </div>

                  <!-- Save Button -->
                  <div class="flex justify-end pt-2">
                    <button
                      @click="submitHandover"
                      :disabled="submitting || !handoverForm.status || !handoverForm.handoverDate"
                      class="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg v-if="submitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{{ submitting ? 'Menyimpan...' : 'Simpan' }}</span>
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
