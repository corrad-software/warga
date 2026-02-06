<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const { token } = useAuth()
const preApplications = ref<any[]>([])
const loading = ref(true)
const error = ref('')

// Filters
const searchQuery = ref('')
const statusFilter = ref('')

// Pagination
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const itemsPerPage = 10

const preAppStatuses = [
  { value: 'PRA_DAFTAR', label: 'Pra-Daftar' },
  { value: 'PRA_LENGKAP', label: 'Pra-Lengkap' },
  { value: 'TIDAK_LENGKAP', label: 'Tidak Lengkap' }
]

const applicationTypes = [
  { value: 'PERKARA_15_2', label: 'Perkara 15(2)' },
  { value: 'KELAHIRAN_LUAR', label: 'Kelahiran Luar Negara' },
  { value: 'TADBIR_SUMPAH', label: 'Pentadbiran Sumpah' }
]

const fetchPreApplications = async () => {
  loading.value = true
  error.value = ''

  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: itemsPerPage.toString()
    })

    if (statusFilter.value) {
      params.append('status', statusFilter.value)
    }

    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }

    const response = await $fetch(`/api/pendaftaran?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      preApplications.value = response.data.preApplications
      totalPages.value = response.data.pagination.totalPages
      totalItems.value = response.data.pagination.total
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal memuatkan senarai permohonan'
  } finally {
    loading.value = false
  }
}

// Computed for display
const filteredPreApplications = computed(() => {
  return preApplications.value
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    PRA_DAFTAR: 'Pra-Daftar',
    PRA_LENGKAP: 'Pra-Lengkap',
    TIDAK_LENGKAP: 'Tidak Lengkap',
    BARU: 'Baru',
    DALAM_SEMAKAN: 'Dalam Semakan',
    MENUNGGU_DOKUMEN: 'Menunggu Dokumen',
    DILULUSKAN: 'Diluluskan',
    DITOLAK: 'Ditolak',
    SELESAI: 'Selesai'
  }
  return statusMap[status] || status?.replace(/_/g, ' ') || '-'
}

const formatType = (type: string) => {
  const typeMap: Record<string, string> = {
    PERKARA_15_2: 'Perkara 15(2)',
    KELAHIRAN_LUAR: 'Kelahiran Luar Negara',
    TADBIR_SUMPAH: 'Pentadbiran Sumpah'
  }
  return typeMap[type] || type || '-'
}

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    PRA_DAFTAR: 'bg-gray-100 text-gray-800',
    PRA_LENGKAP: 'bg-green-100 text-green-800',
    TIDAK_LENGKAP: 'bg-red-100 text-red-800',
    BARU: 'bg-blue-100 text-blue-800',
    DALAM_SEMAKAN: 'bg-yellow-100 text-yellow-800',
    MENUNGGU_DOKUMEN: 'bg-orange-100 text-orange-800',
    DILULUSKAN: 'bg-green-100 text-green-800',
    DITOLAK: 'bg-red-100 text-red-800',
    SELESAI: 'bg-emerald-100 text-emerald-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getTypeBadgeColor = (type: string) => {
  const colors: Record<string, string> = {
    PERKARA_15_2: 'bg-purple-100 text-purple-800',
    KELAHIRAN_LUAR: 'bg-blue-100 text-blue-800',
    TADBIR_SUMPAH: 'bg-orange-100 text-orange-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  fetchPreApplications()
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchPreApplications()
}

const getApplicationRef = (preApp: any) => {
  if (preApp.applications && preApp.applications.length > 0) {
    return preApp.applications[0].applicationRef
  }
  return `PRA-${String(preApp.id).padStart(5, '0')}`
}

const getApplicationStatus = (preApp: any) => {
  if (preApp.applications && preApp.applications.length > 0) {
    return preApp.applications[0].status
  }
  return preApp.status
}

const getApplicationType = (preApp: any) => {
  if (preApp.applications && preApp.applications.length > 0) {
    return preApp.applications[0].applicationType
  }
  return preApp.applicant?.applicationType
}

// Navigate to application detail
const navigateToDetail = (preApp: any) => {
  if (preApp.applications && preApp.applications.length > 0) {
    // Has linked application - go to application view
    navigateTo(`/admin/pendaftaran/${preApp.applications[0].id}`)
  } else {
    // Only pre-application - go to pra-permohonan view
    navigateTo(`/admin/pra-permohonan/${preApp.id}`)
  }
}

// Watch for filter changes
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  fetchPreApplications()
}, { debounce: 300 })

onMounted(() => {
  fetchPreApplications()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h3 class="text-2xl font-bold text-gray-900">Pendaftaran Permohonan</h3>
      <p class="mt-1 text-sm text-gray-600">Semak dan urus senarai pendaftaran permohonan kewarganegaraan</p>
    </div>

    <!-- Filters Card -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <!-- Search -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Carian</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari mengikut nombor permohonan atau nama..."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="">Semua Status</option>
            <option v-for="status in preAppStatuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>

        <!-- Action Button -->
        <div class="flex items-end">
          <button
            @click="fetchPreApplications"
            class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Muat Semula
          </button>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Menunjukkan {{ filteredPreApplications.length }} daripada {{ totalItems }} permohonan
        </div>
        <button
          v-if="searchQuery || statusFilter"
          @click="clearFilters"
          class="text-sm text-blue-600 hover:text-blue-500"
        >
          Padam penapis
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 bg-white rounded-lg shadow">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Memuatkan senarai permohonan...</p>
    </div>

    <!-- Data Table -->
    <div v-else-if="filteredPreApplications.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Permohonan</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemohon</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarikh</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="preApp in filteredPreApplications"
            :key="preApp.id"
            @click="navigateToDetail(preApp)"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <!-- Application Number -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-blue-600 hover:text-blue-800">
                {{ getApplicationRef(preApp) }}
              </div>
            </td>

            <!-- Applicant Info -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-blue-600 font-medium text-sm">
                      {{ preApp.applicant?.fullName?.charAt(0) || 'P' }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ preApp.applicant?.fullName || 'N/A' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ preApp.applicant?.idNumber || '-' }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Type -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getTypeBadgeColor(getApplicationType(preApp))
                ]"
              >
                {{ formatType(getApplicationType(preApp)) }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStatusBadgeColor(getApplicationStatus(preApp))
                ]"
              >
                {{ formatStatus(getApplicationStatus(preApp)) }}
              </span>
            </td>

            <!-- Date -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(preApp.submittedAt || preApp.createdDate) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Halaman <span class="font-medium">{{ currentPage }}</span> daripada <span class="font-medium">{{ totalPages }}</span>
          </div>
          <nav class="flex items-center space-x-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700',
                'px-3 py-1 border border-gray-300 rounded-md text-sm'
              ]"
            >
              Sebelum
            </button>
            
            <template v-for="page in totalPages" :key="page">
              <button
                v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
                @click="goToPage(page)"
                :class="[
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-gray-300',
                  'px-3 py-1 border rounded-md text-sm'
                ]"
              >
                {{ page }}
              </button>
              <span
                v-else-if="page === currentPage - 2 || page === currentPage + 2"
                class="px-2 text-gray-500"
              >
                ...
              </span>
            </template>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700',
                'px-3 py-1 border border-gray-300 rounded-md text-sm'
              ]"
            >
              Seterusnya
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Tiada permohonan dijumpai</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery || statusFilter ? 'Cuba laraskan penapis anda' : 'Tiada permohonan dalam sistem lagi' }}
      </p>
    </div>
  </div>
</template>
