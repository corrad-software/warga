<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

// Document categories based on PERMOHONAN KEWARGANEGARAAN PERKARA 15(2)
const documentCategories = [
  {
    id: 'subjek',
    title: 'Dokumen Orang Yang Hendak Didaftarkan',
    subtitle: '(Asal & Fotostat Satu Salinan)',
    documents: [
      { type: 'KAD_PENGENALAN_SUBJEK', name: 'Kad Pengenalan (IC)', optional: true },
      { type: 'SIJIL_KELAHIRAN', name: 'Sijil Kelahiran / Sijil Anak Angkat', optional: false },
      { type: 'PERMIT_MASUK', name: 'Permit Masuk', optional: true },
      { type: 'PASSPORT_PERJALANAN_SUBJEK', name: 'Passport Perjalanan', optional: true },
      { type: 'DOKUMEN_PERSEKOLAHAN', name: 'Dokumen Bukti Persekolahan Subjek', optional: true },
    ]
  },
  {
    id: 'ibu_bapa',
    title: 'Dokumen Pemohon Ibu / Bapa',
    subtitle: '(Asal & Fotostat Satu Salinan)',
    documents: [
      { type: 'IC_BAPA', name: 'Kad Pengenalan Bapa', optional: false },
      { type: 'IC_IBU', name: 'Kad Pengenalan Ibu', optional: false },
      { type: 'SIJIL_KELAHIRAN_IBU_BAPA', name: 'Sijil Kelahiran Ibu/Bapa', optional: true },
      { type: 'SIJIL_WARGANEGARA', name: 'Sijil Warganegara', optional: true },
      { type: 'SIJIL_NIKAH', name: 'Sijil Nikah / Sijil Perkahwinan', optional: false },
      { type: 'PASSPORT_PERJALANAN_IBU_BAPA', name: 'Passport Perjalanan', optional: true },
    ]
  },
  {
    id: 'penjaga',
    title: 'Dokumen Penjaga',
    subtitle: '(Asal & Fotostat Satu Salinan)',
    documents: [
      { type: 'KAD_PENGENALAN_PENJAGA', name: 'Kad Pengenalan Penjaga', optional: true },
    ]
  }
]

const search = ref('')
const selectedApplication = ref<any>(null)
const applications = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const openMenuId = ref<number | null>(null)
const openDocumentMenuType = ref<string | null>(null)

// Fetch applications
const fetchApplications = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/pengesahan-dokumen', {
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

// Toggle document menu
const toggleDocumentMenu = (docType: string, event: Event) => {
  event.stopPropagation()
  openDocumentMenuType.value = openDocumentMenuType.value === docType ? null : docType
}

// Close document menu
const closeDocumentMenu = () => {
  openDocumentMenuType.value = null
}

// View document
const viewDocument = (docType: string) => {
  const doc = getDocumentByType(docType)
  if (doc && doc.filePath) {
    // Open document in new tab/window
    window.open(doc.filePath, '_blank')
  }
  closeDocumentMenu()
}

// Add comment to document
const addComment = (docType: string) => {
  const doc = getDocumentByType(docType)
  if (doc) {
    // TODO: Implement comment modal/functionality
    alert(`Tambah komen untuk: ${docType}`)
  }
  closeDocumentMenu()
}

// Get document by type from selected application
const getDocumentByType = (type: string) => {
  if (!selectedApplication.value) return null
  return selectedApplication.value.documents.find((d: any) => d.documentType === type)
}

// Get verification status for a document
const isDocumentVerified = (type: string) => {
  const doc = getDocumentByType(type)
  return doc?.status === 'DISAHKAN'
}

// Toggle document verification
const toggleVerification = async (type: string) => {
  const doc = getDocumentByType(type)
  if (!doc) return

  saving.value = true
  try {
    const newStatus = doc.status === 'DISAHKAN' ? 'DIMUATNAIK' : 'DISAHKAN'
    const response = await $fetch(`/api/pengesahan-dokumen/${doc.id}`, {
      method: 'PATCH',
      body: {
        status: newStatus,
        verifiedBy: 1 // TODO: Get from auth
      }
    })
    
    if (response.success) {
      // Update local state
      doc.status = newStatus
      doc.verifiedAt = newStatus === 'DISAHKAN' ? new Date().toISOString() : null
      
      // Recalculate verification status
      const totalDocs = selectedApplication.value.documents.length
      const verifiedDocs = selectedApplication.value.documents.filter((d: any) => d.status === 'DISAHKAN').length
      
      if (verifiedDocs === totalDocs && totalDocs > 0) {
        selectedApplication.value.verificationStatus = 'LENGKAP'
      } else if (verifiedDocs > 0) {
        selectedApplication.value.verificationStatus = 'DALAM_SEMAKAN'
      } else {
        selectedApplication.value.verificationStatus = 'BELUM_DISEMAK'
      }
    }
  } catch (error) {
    console.error('Error updating verification:', error)
  } finally {
    saving.value = false
  }
}

// Get status badge class
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'LENGKAP':
      return 'bg-green-100 text-green-800'
    case 'DALAM_SEMAKAN':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get status label
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'LENGKAP':
      return 'LENGKAP'
    case 'DALAM_SEMAKAN':
      return 'DALAM SEMAKAN'
    default:
      return 'BELUM DISEMAK'
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
  
  // Close dropdown menus when clicking outside
  const handleClickOutside = () => {
    closeMenu()
    closeDocumentMenu()
  }
  document.addEventListener('click', handleClickOutside)
  
  // Cleanup
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<template>
  <div class="h-full">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Pengesahan Dokumen</h1>
      <p class="mt-1 text-sm text-gray-500">Sahkan dokumen permohonan kewarganegaraan</p>
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
                    {{ app.applicant?.idNumber || app.applicationRef }};{{ formatApplicationType(app.applicationType).split(' ').slice(0, 2).join(' ') }}
                  </p>
                  <span 
                    class="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded"
                    :class="getStatusBadgeClass(app.verificationStatus)"
                  >
                    {{ getStatusLabel(app.verificationStatus) }}
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

      <!-- Right Panel - Document Verification -->
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

          <!-- Document List -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="space-y-6">
              <!-- Section Title -->
              <div class="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 class="text-lg font-semibold text-gray-900">Dokumen</h3>
                <span class="text-sm text-gray-500">
                  {{ selectedApplication.documentStats?.verified || 0 }}/{{ selectedApplication.documentStats?.total || 0 }} disahkan
                </span>
              </div>

              <!-- Document Categories -->
              <div v-for="category in documentCategories" :key="category.id" class="space-y-3">
                <!-- Category Header -->
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-gray-900">{{ category.title }}</h4>
                    <p class="text-xs text-gray-500">{{ category.subtitle }}</p>
                  </div>
                </div>

                <!-- Documents in Category -->
                <div class="ml-8 space-y-2">
                  <div
                    v-for="docType in category.documents"
                    :key="docType.type"
                    class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div class="flex-1 relative">
                      <p class="text-sm text-gray-700">{{ docType.name }}</p>
                      <template v-if="getDocumentByType(docType.type)">
                        <div class="relative inline-block">
                          <button
                            @click="toggleDocumentMenu(docType.type, $event)"
                            class="text-xs text-blue-600 hover:text-blue-800 mt-0.5 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            {{ getDocumentByType(docType.type)?.filePath?.split('/').pop() || 'Dokumen dimuat naik' }}
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          <!-- Document Dropdown Menu -->
                          <div
                            v-if="openDocumentMenuType === docType.type"
                            @click.stop
                            class="absolute left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                          >
                            <button
                              @click="viewDocument(docType.type)"
                              class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Lihat
                            </button>
                            <button
                              @click="addComment(docType.type)"
                              class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              Komen
                            </button>
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <p class="text-xs text-gray-400 mt-0.5 italic">
                          {{ docType.optional ? 'Tidak dimuat naik (Pilihan)' : 'Belum dimuat naik' }}
                        </p>
                      </template>
                    </div>
                    
                    <!-- Verification Column -->
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-gray-500 w-20 text-right">Pengesahan</span>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          :checked="isDocumentVerified(docType.type)"
                          :disabled="!getDocumentByType(docType.type) || saving"
                          @change="toggleVerification(docType.type)"
                          class="sr-only peer"
                        />
                        <div 
                          class="w-5 h-5 border-2 rounded peer-focus:ring-2 peer-focus:ring-blue-300 transition-all"
                          :class="[
                            getDocumentByType(docType.type) 
                              ? (isDocumentVerified(docType.type) ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white hover:border-gray-400')
                              : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                          ]"
                        >
                          <svg 
                            v-if="isDocumentVerified(docType.type)" 
                            class="w-full h-full text-white p-0.5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </label>
                    </div>
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="mt-4 text-sm">Pilih pemohon dari senarai untuk melihat dokumen</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
