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

// Fetch applications
const fetchApplications = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/pengesahan-bayaran', {
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

// Get status badge class
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'LENGKAP':
      return 'bg-green-100 text-green-800'
    case 'SEBAHAGIAN':
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
    case 'SEBAHAGIAN':
      return 'SEBAHAGIAN'
    default:
      return 'BELUM BAYAR'
  }
}

// Get payment status badge class
const getPaymentStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'BERJAYA':
      return 'bg-green-100 text-green-800'
    case 'MENUNGGU':
      return 'bg-yellow-100 text-yellow-800'
    case 'GAGAL':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get payment status label
const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'BERJAYA':
      return 'BERJAYA'
    case 'MENUNGGU':
      return 'MENUNGGU'
    case 'GAGAL':
      return 'GAGAL'
    default:
      return 'BELUM BAYAR'
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

// Format currency
const formatCurrency = (amount: any) => {
  if (!amount) return 'RM 0.00'
  return `RM ${parseFloat(amount).toFixed(2)}`
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
      <h1 class="text-2xl font-bold text-gray-900">Transaksi Bayaran</h1>
      <p class="mt-1 text-sm text-gray-500">Semak transaksi bayaran permohonan kewarganegaraan</p>
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
                    :class="getStatusBadgeClass(app.paymentVerificationStatus)"
                  >
                    {{ getStatusLabel(app.paymentVerificationStatus) }}
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

      <!-- Right Panel - Payment Details -->
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

          <!-- Payment Lists -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="space-y-6">
              <!-- Bayaran Permohonan Section -->
              <div>
                <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Bayaran Permohonan</h3>
                  <span class="text-sm text-gray-500">
                    {{ selectedApplication.payments?.application?.length || 0 }} transaksi
                  </span>
                </div>

                <div v-if="selectedApplication.payments?.application?.length > 0" class="space-y-3">
                  <div
                    v-for="payment in selectedApplication.payments.application"
                    :key="payment.id"
                    class="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <p class="text-sm font-semibold text-gray-900">{{ payment.billNo || 'Tiada No. Bil' }}</p>
                        <p class="text-xs text-gray-500 mt-0.5">Tarikh: {{ formatDate(payment.paidAt || payment.createdDate) }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded"
                        :class="getPaymentStatusBadgeClass(payment.paymentStatus)"
                      >
                        {{ getPaymentStatusLabel(payment.paymentStatus) }}
                      </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p class="text-xs text-gray-500">No. Rujukan</p>
                        <p class="font-medium text-gray-900">{{ payment.gatewayRef || '-' }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">Jumlah</p>
                        <p class="font-semibold text-green-600">{{ formatCurrency(payment.amount) }}</p>
                      </div>
                    </div>

                    <div v-if="payment.receipts && payment.receipts.length > 0" class="mt-3 pt-3 border-t border-gray-200">
                      <p class="text-xs text-gray-500 mb-1">Resit:</p>
                      <div v-for="receipt in payment.receipts" :key="receipt.id" class="text-xs text-blue-600">
                        {{ receipt.receiptNo }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-gray-500">
                  <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm mt-2">Tiada bayaran permohonan</p>
                </div>
              </div>

              <!-- Bayaran Pengeluaran Sijil Section -->
              <div>
                <div class="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Bayaran Pengeluaran Sijil</h3>
                  <span class="text-sm text-gray-500">
                    {{ selectedApplication.payments?.certificate?.length || 0 }} transaksi
                  </span>
                </div>

                <div v-if="selectedApplication.payments?.certificate?.length > 0" class="space-y-3">
                  <div
                    v-for="payment in selectedApplication.payments.certificate"
                    :key="payment.id"
                    class="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1">
                        <p class="text-sm font-semibold text-gray-900">{{ payment.billNo || 'Tiada No. Bil' }}</p>
                        <p class="text-xs text-gray-500 mt-0.5">Tarikh: {{ formatDate(payment.paidAt || payment.createdDate) }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded"
                        :class="getPaymentStatusBadgeClass(payment.paymentStatus)"
                      >
                        {{ getPaymentStatusLabel(payment.paymentStatus) }}
                      </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p class="text-xs text-gray-500">No. Rujukan</p>
                        <p class="font-medium text-gray-900">{{ payment.gatewayRef || '-' }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500">Jumlah</p>
                        <p class="font-semibold text-green-600">{{ formatCurrency(payment.amount) }}</p>
                      </div>
                    </div>

                    <div v-if="payment.receipts && payment.receipts.length > 0" class="mt-3 pt-3 border-t border-gray-200">
                      <p class="text-xs text-gray-500 mb-1">Resit:</p>
                      <div v-for="receipt in payment.receipts" :key="receipt.id" class="text-xs text-blue-600">
                        {{ receipt.receiptNo }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-gray-500">
                  <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm mt-2">Tiada bayaran pengeluaran sijil</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center text-gray-500">
            <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="mt-4 text-sm">Pilih pemohon dari senarai untuk melihat bayaran</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
