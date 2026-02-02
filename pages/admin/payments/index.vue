<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h3 class="text-2xl font-bold text-gray-900">Payment Management</h3>
      <p class="mt-1 text-sm text-gray-600">
        Manage and monitor all payment transactions
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Statistics Grid - 4 Columns -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Total Revenue -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-blue-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Revenue
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                      RM {{ formatCurrency(stats.totalRevenue) }}
                    </div>
                  </dd>
                  <dd class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ stats.totalPayments }} payments
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Payments -->
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
                    Pending Payments
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                      {{ stats.pendingPayments }}
                    </div>
                  </dd>
                  <dd class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    RM {{ formatCurrency(stats.pendingAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed Payments -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-green-500 p-3">
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
                      {{ stats.completedPayments }}
                    </div>
                  </dd>
                  <dd class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    RM {{ formatCurrency(stats.completedAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Failed/Refunded -->
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-red-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Failed/Refunded
                  </dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                      {{ stats.failedPayments + stats.refundedPayments }}
                    </div>
                  </dd>
                  <dd class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ stats.failedPayments }} failed, {{ stats.refundedPayments }} refunded
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods & Recent Transactions -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
        <!-- Payment Methods Breakdown -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Methods</h3>
          <div class="space-y-4">
            <div v-for="method in paymentMethodStats" :key="method.name" class="flex items-center justify-between">
              <div class="flex items-center flex-1">
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ method.name }}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ method.count }} payments</span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      :class="method.color"
                      class="h-2 rounded-full transition-all duration-300"
                      :style="{ width: method.percentage + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="ml-4 text-sm font-semibold text-gray-900 dark:text-white">
                RM {{ formatCurrency(method.amount) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Status Breakdown -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <span class="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                <span class="text-sm text-gray-700 dark:text-gray-300">Completed</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stats.completedPayments }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ getPercentage(stats.completedPayments) }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <span class="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                <span class="text-sm text-gray-700 dark:text-gray-300">Pending</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stats.pendingPayments }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ getPercentage(stats.pendingPayments) }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <span class="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                <span class="text-sm text-gray-700 dark:text-gray-300">Processing</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stats.processingPayments }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ getPercentage(stats.processingPayments) }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <span class="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                <span class="text-sm text-gray-700 dark:text-gray-300">Failed</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stats.failedPayments }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ getPercentage(stats.failedPayments) }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between py-2">
              <div class="flex items-center">
                <span class="h-3 w-3 rounded-full bg-purple-500 mr-2"></span>
                <span class="text-sm text-gray-700 dark:text-gray-300">Refunded</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ stats.refundedPayments }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ getPercentage(stats.refundedPayments) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions Table -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Recent Transactions</h3>
          <NuxtLink
            to="/admin/payments/transactions"
            class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View All
          </NuxtLink>
        </div>
        <div class="overflow-x-auto">
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
                  User
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
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="payment in recentPayments" :key="payment.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
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
              <tr v-if="recentPayments.length === 0">
                <td colspan="8" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No payments found
                </td>
              </tr>
            </tbody>
          </table>
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
const stats = ref({
  totalPayments: 0,
  totalRevenue: 0,
  pendingPayments: 0,
  pendingAmount: 0,
  processingPayments: 0,
  processingAmount: 0,
  completedPayments: 0,
  completedAmount: 0,
  failedPayments: 0,
  failedAmount: 0,
  refundedPayments: 0,
  refundedAmount: 0
})

const recentPayments = ref<any[]>([])
const allPayments = ref<any[]>([])

// Fetch all payments data
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

    // Calculate statistics
    const payments = allPayments.value
    stats.value.totalPayments = payments.length
    stats.value.totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    stats.value.pendingPayments = payments.filter(p => p.status === 'PENDING').length
    stats.value.pendingAmount = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0)

    stats.value.processingPayments = payments.filter(p => p.status === 'PROCESSING').length
    stats.value.processingAmount = payments.filter(p => p.status === 'PROCESSING').reduce((sum, p) => sum + Number(p.amount), 0)

    stats.value.completedPayments = payments.filter(p => p.status === 'COMPLETED').length
    stats.value.completedAmount = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + Number(p.amount), 0)

    stats.value.failedPayments = payments.filter(p => p.status === 'FAILED').length
    stats.value.failedAmount = payments.filter(p => p.status === 'FAILED').reduce((sum, p) => sum + Number(p.amount), 0)

    stats.value.refundedPayments = payments.filter(p => p.status === 'REFUNDED').length
    stats.value.refundedAmount = payments.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + Number(p.amount), 0)

    // Get recent 10 payments sorted by date
    recentPayments.value = [...payments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

// Payment method statistics
const paymentMethodStats = computed(() => {
  const methods = {
    ONLINE_BANKING: { name: 'Online Banking', count: 0, amount: 0, color: 'bg-blue-500' },
    CREDIT_CARD: { name: 'Credit Card', count: 0, amount: 0, color: 'bg-purple-500' },
    DEBIT_CARD: { name: 'Debit Card', count: 0, amount: 0, color: 'bg-green-500' },
    CASH: { name: 'Cash', count: 0, amount: 0, color: 'bg-yellow-500' },
    OTHER: { name: 'Other', count: 0, amount: 0, color: 'bg-gray-500' }
  }

  allPayments.value.forEach(payment => {
    if (payment.status === 'COMPLETED' && methods[payment.method]) {
      methods[payment.method].count++
      methods[payment.method].amount += Number(payment.amount)
    }
  })

  const total = Object.values(methods).reduce((sum, m) => sum + m.count, 0)

  return Object.values(methods)
    .map(method => ({
      ...method,
      percentage: total > 0 ? Math.round((method.count / total) * 100) : 0
    }))
    .filter(m => m.count > 0)
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

const getPercentage = (count: number) => {
  if (stats.value.totalPayments === 0) return 0
  return Math.round((count / stats.value.totalPayments) * 100)
}

// Load data on mount
onMounted(() => {
  fetchPayments()
})
</script>
