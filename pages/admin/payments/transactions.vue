<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">All Transactions</h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
            View and manage all payment transactions
          </p>
        </div>
        <NuxtLink
          to="/admin/payments"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Search -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <input
            id="search"
            v-model="filters.search"
            type="text"
            placeholder="Payment #, User, Transaction ID..."
            class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            id="status"
            v-model="filters.status"
            class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <!-- Payment Method Filter -->
        <div>
          <label for="method" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Method
          </label>
          <select
            id="method"
            v-model="filters.method"
            class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Methods</option>
            <option value="ONLINE_BANKING">Online Banking</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="CASH">Cash</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <!-- Date Range -->
        <div>
          <label for="dateRange" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <select
            id="dateRange"
            v-model="filters.dateRange"
            class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <!-- Clear Filters -->
      <div class="mt-4 flex justify-end">
        <button
          @click="clearFilters"
          class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Transactions Table -->
    <div v-else class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <!-- Summary Bar -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Showing <span class="font-medium">{{ filteredPayments.length }}</span> of
            <span class="font-medium">{{ allPayments.length }}</span> transactions
          </p>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Total: <span class="font-semibold text-gray-900 dark:text-white">RM {{ formatCurrency(totalFilteredAmount) }}</span>
            </span>
            <button
              @click="exportToCSV"
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" @click="sortBy('paymentNumber')">
                <div class="flex items-center">
                  Payment #
                  <svg v-if="sortField === 'paymentNumber'" class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path :d="sortDirection === 'asc' ? 'M5 10l5-5 5 5H5z' : 'M5 10l5 5 5-5H5z'" />
                  </svg>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Application
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" @click="sortBy('amount')">
                <div class="flex items-center">
                  Amount
                  <svg v-if="sortField === 'amount'" class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path :d="sortDirection === 'asc' ? 'M5 10l5-5 5 5H5z' : 'M5 10l5 5 5-5H5z'" />
                  </svg>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Method
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transaction ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer" @click="sortBy('createdAt')">
                <div class="flex items-center">
                  Date
                  <svg v-if="sortField === 'createdAt'" class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path :d="sortDirection === 'asc' ? 'M5 10l5-5 5 5H5z' : 'M5 10l5 5 5-5H5z'" />
                  </svg>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="payment in paginatedPayments" :key="payment.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                {{ payment.paymentNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                <NuxtLink :to="`/admin/applications/${payment.application?.id}`" class="hover:text-blue-600 dark:hover:text-blue-400">
                  {{ payment.application?.applicationNumber || 'N/A' }}
                </NuxtLink>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {{ payment.user?.fullName || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                RM {{ formatCurrency(payment.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {{ formatPaymentMethod(payment.method) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(payment.status)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ payment.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                {{ payment.transactionId || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(payment.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <NuxtLink
                  :to="`/admin/payments/${payment.id}`"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="filteredPayments.length === 0">
              <td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <div class="flex flex-col items-center">
                  <svg class="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="font-medium">No transactions found</p>
                  <p class="text-xs mt-1">Try adjusting your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredPayments.length > 0" class="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <label for="perPage" class="text-sm text-gray-700 dark:text-gray-300 mr-2">
              Per page:
            </label>
            <select
              id="perPage"
              v-model="pagination.perPage"
              @change="pagination.currentPage = 1"
              class="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="pagination.currentPage--"
              :disabled="pagination.currentPage === 1"
              class="px-3 py-1 rounded-md text-sm border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Page {{ pagination.currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="pagination.currentPage++"
              :disabled="pagination.currentPage === totalPages"
              class="px-3 py-1 rounded-md text-sm border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const loading = ref(true)
const allPayments = ref<any[]>([])

const filters = ref({
  search: '',
  status: '',
  method: '',
  dateRange: ''
})

const sortField = ref('createdAt')
const sortDirection = ref('desc')

const pagination = ref({
  currentPage: 1,
  perPage: 25
})

// Fetch all payments
const fetchPayments = async () => {
  try {
    loading.value = true
    const { data, error } = await useFetch('/api/payments', {
      headers: useRequestHeaders(['cookie'])
    })

    if (error.value) {
      console.error('Error fetching payments:', error.value)
      return
    }

    // Handle both response formats
    if (data.value) {
      if (Array.isArray(data.value)) {
        allPayments.value = data.value
      } else if (typeof data.value === 'object' && 'data' in data.value && data.value.data) {
        allPayments.value = (data.value.data as any).payments || []
      } else {
        allPayments.value = []
      }
    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Filtered payments
const filteredPayments = computed(() => {
  let result = [...allPayments.value]

  // Search filter
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    result = result.filter(p =>
      p.paymentNumber?.toLowerCase().includes(searchLower) ||
      p.transactionId?.toLowerCase().includes(searchLower) ||
      p.user?.fullName?.toLowerCase().includes(searchLower) ||
      p.user?.email?.toLowerCase().includes(searchLower) ||
      p.application?.applicationNumber?.toLowerCase().includes(searchLower)
    )
  }

  // Status filter
  if (filters.value.status) {
    result = result.filter(p => p.status === filters.value.status)
  }

  // Method filter
  if (filters.value.method) {
    result = result.filter(p => p.method === filters.value.method)
  }

  // Date range filter
  if (filters.value.dateRange) {
    const now = new Date()
    let startDate: Date | undefined

    switch (filters.value.dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    if (startDate) {
      result = result.filter(p => new Date(p.createdAt) >= startDate)
    }
  }

  // Sorting
  result.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]

    if (sortField.value === 'amount') {
      aVal = Number(aVal)
      bVal = Number(bVal)
    } else if (sortField.value === 'createdAt') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }

    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return result
})

// Paginated payments
const paginatedPayments = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return filteredPayments.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / pagination.value.perPage)
})

const totalFilteredAmount = computed(() => {
  return filteredPayments.value.reduce((sum, p) => sum + Number(p.amount), 0)
})

// Functions
const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    method: '',
    dateRange: ''
  }
  pagination.value.currentPage = 1
}

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'desc'
  }
}

const exportToCSV = () => {
  const headers = ['Payment Number', 'Application', 'User', 'Amount', 'Method', 'Status', 'Transaction ID', 'Date']
  const rows = filteredPayments.value.map(p => [
    p.paymentNumber,
    p.application?.applicationNumber || '',
    p.user?.fullName || '',
    p.amount,
    p.method,
    p.status,
    p.transactionId || '',
    new Date(p.createdAt).toISOString()
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

const formatCurrency = (amount: number | string) => {
  return Number(amount).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPaymentMethod = (method: string) => {
  return method?.replace(/_/g, ' ') || 'N/A'
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

// Load data on mount
onMounted(() => {
  fetchPayments()
})

// Watch perPage and reset to page 1 when it changes
watch(() => pagination.value.perPage, () => {
  pagination.value.currentPage = 1
})
</script>
