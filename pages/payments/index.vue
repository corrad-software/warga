<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">My Payments</h1>
            <p class="text-sm text-gray-600">View your payment history and transaction details</p>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/dashboard"
              class="text-sm font-medium text-gray-700 hover:text-blue-600 hidden sm:block"
            >
              My Applications
            </NuxtLink>
            <NuxtLink
              to="/payments"
              class="text-sm font-medium text-blue-600 hidden sm:block"
            >
              My Payments
            </NuxtLink>
            <button
              @click="logout"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Summary Cards - 4 Columns -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Total Spent -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-blue-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Spent
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                      RM {{ formatCurrency(totalSpent) }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Payments -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-green-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Payments
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                      {{ payments.length }}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-emerald-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Completed
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                      {{ completedCount }}
                    </div>
                  </dd>
                  <dd class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    RM {{ formatCurrency(completedAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-yellow-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Pending
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                      {{ pendingCount }}
                    </div>
                  </dd>
                  <dd class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    RM {{ formatCurrency(pendingAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments List -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Payment History</h3>
        </div>

        <!-- Filter -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <label for="statusFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                v-model="statusFilter"
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
          </div>
        </div>

        <!-- Table for Desktop -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment #
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Application
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="payment in filteredPayments" :key="payment.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                  {{ payment.paymentNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  <NuxtLink :to="`/applications/${payment.application?.id}`" class="hover:text-blue-600 dark:hover:text-blue-400">
                    {{ payment.application?.applicationNumber || 'N/A' }}
                  </NuxtLink>
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(payment.createdAt) }}
                </td>
              </tr>
              <tr v-if="filteredPayments.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex flex-col items-center">
                    <svg class="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="font-medium">No payments found</p>
                    <p class="text-xs mt-1">{{ statusFilter ? 'Try adjusting your filter' : 'You have not made any payments yet' }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards for Mobile -->
        <div class="md:hidden">
          <div v-if="filteredPayments.length === 0" class="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <div class="flex flex-col items-center">
              <svg class="h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="font-medium">No payments found</p>
              <p class="text-xs mt-1">{{ statusFilter ? 'Try adjusting your filter' : 'You have not made any payments yet' }}</p>
            </div>
          </div>
          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div v-for="payment in filteredPayments" :key="payment.id" class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div class="flex items-center justify-between mb-3">
                <div class="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {{ payment.paymentNumber }}
                </div>
                <span :class="getStatusBadgeClass(payment.status)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ payment.status }}
                </span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Application:</span>
                  <NuxtLink :to="`/applications/${payment.application?.id}`" class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                    {{ payment.application?.applicationNumber || 'N/A' }}
                  </NuxtLink>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Amount:</span>
                  <span class="font-semibold text-gray-900 dark:text-white">RM {{ formatCurrency(payment.amount) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Method:</span>
                  <span class="text-gray-900 dark:text-white">{{ formatPaymentMethod(payment.method) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Date:</span>
                  <span class="text-gray-900 dark:text-white">{{ formatDate(payment.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { logout, user } = useAuth()
const loading = ref(true)
const payments = ref<any[]>([])
const statusFilter = ref('')

// Fetch user payments
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
        payments.value = data.value
      } else if (typeof data.value === 'object' && 'data' in data.value && data.value.data) {
        payments.value = (data.value.data as any).payments || []
      } else {
        payments.value = []
      }
    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Computed properties
const filteredPayments = computed(() => {
  if (!statusFilter.value) {
    return payments.value
  }
  return payments.value.filter(p => p.status === statusFilter.value)
})

const totalSpent = computed(() => {
  return payments.value
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0)
})

const completedCount = computed(() => {
  return payments.value.filter(p => p.status === 'COMPLETED').length
})

const completedAmount = computed(() => {
  return payments.value
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0)
})

const pendingCount = computed(() => {
  return payments.value.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length
})

const pendingAmount = computed(() => {
  return payments.value
    .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + Number(p.amount), 0)
})

// Utility functions
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
</script>
