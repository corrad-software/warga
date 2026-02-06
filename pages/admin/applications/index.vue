<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { token } = useAuth()
const applications = ref<any[]>([])
const loading = ref(true)
const error = ref('')

// Filters
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')

const applicationTypes = [
  { value: 'BORANG_H', label: 'Kelahiran Luar Negara (Borang H)' },
  { value: 'BORANG_G', label: 'Perkara 15(2) Laluan Pantas (Borang G)' },
  { value: 'TADBIR_SUMPAH', label: 'Pentadbiran Sumpah' }
]

const applicationStatuses = [
  { value: 'DRAFT', label: 'Draf' },
  { value: 'SUBMITTED', label: 'Dihantar' },
  { value: 'PENDING_REVIEW', label: 'Menunggu Semakan' },
  { value: 'DOCUMENTS_VERIFIED', label: 'Dokumen Disahkan' },
  { value: 'PENDING_BIOMETRIC', label: 'Menunggu Biometrik' },
  { value: 'BIOMETRIC_CAPTURED', label: 'Biometrik Diambil' },
  { value: 'PENDING_PAYMENT', label: 'Menunggu Pembayaran' },
  { value: 'PAYMENT_COMPLETED', label: 'Pembayaran Selesai' },
  { value: 'UNDER_REVIEW', label: 'Dalam Semakan' },
  { value: 'APPROVED', label: 'Diluluskan' },
  { value: 'REJECTED', label: 'Ditolak' },
  { value: 'PENDING_OATH', label: 'Menunggu Sumpah' },
  { value: 'OATH_COMPLETED', label: 'Sumpah Selesai' },
  { value: 'CERTIFICATE_ISSUED', label: 'Sijil Dikeluarkan' },
  { value: 'COMPLETED', label: 'Selesai' }
]

const fetchApplications = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/applications', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      applications.value = response.data.applications
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal memuatkan permohonan'
  } finally {
    loading.value = false
  }
}

const filteredApplications = computed(() => {
  let filtered = applications.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(app =>
      app.applicationNumber?.toLowerCase().includes(query) ||
      app.user?.name?.toLowerCase().includes(query) ||
      app.user?.email?.toLowerCase().includes(query)
    )
  }

  // Type filter
  if (typeFilter.value) {
    filtered = filtered.filter(app => app.type === typeFilter.value)
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(app => app.status === statusFilter.value)
  }

  return filtered
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
    DRAFT: 'Draf',
    SUBMITTED: 'Dihantar',
    PENDING_REVIEW: 'Menunggu Semakan',
    DOCUMENTS_VERIFIED: 'Dokumen Disahkan',
    PENDING_BIOMETRIC: 'Menunggu Biometrik',
    BIOMETRIC_CAPTURED: 'Biometrik Diambil',
    PENDING_PAYMENT: 'Menunggu Pembayaran',
    PAYMENT_COMPLETED: 'Pembayaran Selesai',
    UNDER_REVIEW: 'Dalam Semakan',
    APPROVED: 'Diluluskan',
    REJECTED: 'Ditolak',
    PENDING_OATH: 'Menunggu Sumpah',
    OATH_COMPLETED: 'Sumpah Selesai',
    CERTIFICATE_ISSUED: 'Sijil Dikeluarkan',
    COMPLETED: 'Selesai'
  }
  return statusMap[status] || status.replace(/_/g, ' ')
}

const formatType = (type: string) => {
  const typeMap: Record<string, string> = {
    BORANG_H: 'Kelahiran Luar Negara',
    BORANG_G: 'Perkara 15(2)',
    TADBIR_SUMPAH: 'Pentadbiran Sumpah'
  }
  return typeMap[type] || type
}

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    DOCUMENTS_VERIFIED: 'bg-cyan-100 text-cyan-800',
    PENDING_BIOMETRIC: 'bg-orange-100 text-orange-800',
    BIOMETRIC_CAPTURED: 'bg-teal-100 text-teal-800',
    PENDING_PAYMENT: 'bg-purple-100 text-purple-800',
    PAYMENT_COMPLETED: 'bg-indigo-100 text-indigo-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PENDING_OATH: 'bg-pink-100 text-pink-800',
    OATH_COMPLETED: 'bg-emerald-100 text-emerald-800',
    CERTIFICATE_ISSUED: 'bg-lime-100 text-lime-800',
    COMPLETED: 'bg-green-100 text-green-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getTypeBadgeColor = (type: string) => {
  const colors: Record<string, string> = {
    BORANG_H: 'bg-blue-100 text-blue-800',
    BORANG_G: 'bg-purple-100 text-purple-800',
    TADBIR_SUMPAH: 'bg-orange-100 text-orange-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const clearFilters = () => {
  searchQuery.value = ''
  typeFilter.value = ''
  statusFilter.value = ''
}

onMounted(() => {
  fetchApplications()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h3 class="text-2xl font-bold text-gray-900">Pengurusan Permohonan</h3>
      <p class="mt-1 text-sm text-gray-600">Urus dan semak permohonan kewarganegaraan</p>
    </div>

    <!-- Penapis -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <!-- Carian -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Carian</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari mengikut nombor permohonan, nama, atau e-mel..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Penapis Jenis -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
          <select
            v-model="typeFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Jenis</option>
            <option v-for="type in applicationTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <!-- Penapis Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            <option v-for="status in applicationStatuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Tindakan Penapis -->
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Menunjukkan {{ filteredApplications.length }} daripada {{ applications.length }} permohonan
        </div>
        <button
          v-if="searchQuery || typeFilter || statusFilter"
          @click="clearFilters"
          class="text-sm text-blue-600 hover:text-blue-500"
        >
          Padam penapis
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
      <div class="text-sm text-red-700">{{ error }}</div>
    </div>

    <!-- Keadaan Memuatkan -->
    <div v-if="loading" class="text-center py-12 bg-white rounded-lg shadow">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Memuatkan permohonan...</p>
    </div>

    <!-- Applications Table -->
    <div v-else-if="filteredApplications.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Permohonan</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemohon</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarikh Hantar</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="app in filteredApplications"
            :key="app.id"
            @click="$router.push(`/admin/applications/${app.id}`)"
            class="hover:bg-gray-50 cursor-pointer"
          >
            <!-- Application Number -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-blue-600">
                {{ app.applicationNumber }}
              </div>
            </td>

            <!-- Applicant Info -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-blue-600 font-medium text-sm">{{ app.user?.name?.charAt(0) || 'U' }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ app.user?.name || 'N/A' }}</div>
                  <div class="text-sm text-gray-500">{{ app.user?.email || 'N/A' }}</div>
                </div>
              </div>
            </td>

            <!-- Type -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getTypeBadgeColor(app.type)
                ]"
              >
                {{ formatType(app.type) }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStatusBadgeColor(app.status)
                ]"
              >
                {{ formatStatus(app.status) }}
              </span>
            </td>

            <!-- Submission Date -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(app.submissionDate || app.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Keadaan Kosong -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Tiada permohonan dijumpai</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery || typeFilter || statusFilter ? 'Cuba laraskan penapis anda' : 'Tiada permohonan dalam sistem lagi' }}
      </p>
    </div>
  </div>
</template>
