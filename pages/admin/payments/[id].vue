<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Payment Details</h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
            View and manage payment information
          </p>
        </div>
        <NuxtLink
          to="/admin/payments/transactions"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Transactions
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Main Content -->
    <div v-else-if="payment" class="space-y-6">
      <!-- Payment Status Card -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Payment Information</h2>
          <span :class="getStatusBadgeClass(payment.status)" class="px-3 py-1 inline-flex text-sm font-semibold rounded-full">
            {{ payment.status }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Number</h3>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ payment.paymentNumber }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Amount</h3>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ payment.currency }} {{ formatCurrency(payment.amount) }}
            </p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment Method</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ formatPaymentMethod(payment.method) }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Transaction ID</h3>
            <p class="text-base text-gray-900 dark:text-white font-mono">{{ payment.transactionId || 'N/A' }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created At</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ formatDate(payment.createdAt) }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Updated At</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ formatDate(payment.updatedAt) }}</p>
          </div>

          <div v-if="payment.paidAt">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Paid At</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ formatDate(payment.paidAt) }}</p>
          </div>
        </div>
      </div>

      <!-- User Information -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ payment.user?.fullName || 'N/A' }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ payment.user?.email || 'N/A' }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">IC Number</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ payment.user?.icNumber || 'N/A' }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ payment.user?.phoneNumber || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- Application Information -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Application Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Application Number</h3>
            <NuxtLink
              :to="`/admin/applications/${payment.application?.id}`"
              class="text-base text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {{ payment.application?.applicationNumber || 'N/A' }}
            </NuxtLink>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Application Type</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ payment.application?.applicationType || 'N/A' }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Application Status</h3>
            <span v-if="payment.application" :class="getApplicationStatusClass(payment.application.status)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
              {{ payment.application.status }}
            </span>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Application Date</h3>
            <p class="text-base text-gray-900 dark:text-white">{{ payment.application ? formatDate(payment.application.createdAt) : 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- Gateway Response -->
      <div v-if="payment.gatewayResponse" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Gateway Response</h2>
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre class="text-xs text-gray-800 dark:text-gray-200">{{ JSON.stringify(payment.gatewayResponse, null, 2) }}</pre>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
        <div class="flex flex-wrap gap-3">
          <!-- Verify as Completed -->
          <button
            v-if="payment.status === 'PENDING' || payment.status === 'PROCESSING'"
            @click="openVerifyModal('COMPLETED')"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Verify as Completed
          </button>

          <!-- Verify as Failed -->
          <button
            v-if="payment.status === 'PENDING' || payment.status === 'PROCESSING'"
            @click="openVerifyModal('FAILED')"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Mark as Failed
          </button>

          <!-- Process Refund -->
          <button
            v-if="payment.status === 'COMPLETED'"
            @click="openRefundModal"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Process Refund
          </button>

          <!-- View Application -->
          <NuxtLink
            v-if="payment.application"
            :to="`/admin/applications/${payment.application.id}`"
            class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Application
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
      <p class="text-red-800 dark:text-red-200">Payment not found</p>
    </div>

    <!-- Verify Modal -->
    <div v-if="showVerifyModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeVerifyModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div :class="verifyStatus === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'" class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <svg v-if="verifyStatus === 'COMPLETED'" class="h-6 w-6 text-green-600 dark:text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="h-6 w-6 text-red-600 dark:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  Verify Payment as {{ verifyStatus }}
                </h3>
                <div class="mt-4 space-y-4">
                  <div>
                    <label for="transactionId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Transaction ID (Optional)
                    </label>
                    <input
                      id="transactionId"
                      v-model="verifyForm.transactionId"
                      type="text"
                      placeholder="Enter transaction ID from payment gateway"
                      class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label for="notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      v-model="verifyForm.notes"
                      rows="3"
                      placeholder="Add any additional notes..."
                      class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="verifyPayment"
              :disabled="verifying"
              type="button"
              :class="verifyStatus === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ verifying ? 'Processing...' : 'Confirm' }}
            </button>
            <button
              @click="closeVerifyModal"
              :disabled="verifying"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Refund Modal -->
    <div v-if="showRefundModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeRefundModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-purple-600 dark:text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  Process Refund
                </h3>
                <div class="mt-4">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Refund amount: <span class="font-semibold">{{ payment.currency }} {{ formatCurrency(payment.amount) }}</span>
                  </p>
                  <div>
                    <label for="refundReason" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Refund Reason <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      id="refundReason"
                      v-model="refundForm.reason"
                      rows="3"
                      required
                      placeholder="Please provide a reason for the refund..."
                      class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="processRefund"
              :disabled="refunding || !refundForm.reason"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ refunding ? 'Processing...' : 'Process Refund' }}
            </button>
            <button
              @click="closeRefundModal"
              :disabled="refunding"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
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

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const payment = ref(null)

// Verify modal
const showVerifyModal = ref(false)
const verifyStatus = ref('')
const verifying = ref(false)
const verifyForm = ref({
  transactionId: '',
  notes: ''
})

// Refund modal
const showRefundModal = ref(false)
const refunding = ref(false)
const refundForm = ref({
  reason: ''
})

// Fetch payment details
const fetchPayment = async () => {
  try {
    loading.value = true
    const { data, error } = await useFetch(`/api/payments/${route.params.id}`, {
      headers: useRequestHeaders(['cookie'])
    })

    if (error.value) {
      console.error('Error fetching payment:', error.value)
      payment.value = null
      return
    }

    payment.value = data.value
  } catch (err) {
    console.error('Error:', err)
    payment.value = null
  } finally {
    loading.value = false
  }
}

// Modal functions
const openVerifyModal = (status) => {
  verifyStatus.value = status
  verifyForm.value = {
    transactionId: payment.value.transactionId || '',
    notes: ''
  }
  showVerifyModal.value = true
}

const closeVerifyModal = () => {
  showVerifyModal.value = false
  verifyForm.value = { transactionId: '', notes: '' }
}

const openRefundModal = () => {
  refundForm.value.reason = ''
  showRefundModal.value = true
}

const closeRefundModal = () => {
  showRefundModal.value = false
  refundForm.value.reason = ''
}

// Verify payment
const verifyPayment = async () => {
  try {
    verifying.value = true
    const { data, error } = await useFetch(`/api/payments/${route.params.id}/verify`, {
      method: 'POST',
      headers: useRequestHeaders(['cookie']),
      body: {
        status: verifyStatus.value,
        transactionId: verifyForm.value.transactionId || undefined,
        notes: verifyForm.value.notes || undefined
      }
    })

    if (error.value) {
      alert('Error verifying payment: ' + (error.value.data?.message || 'Unknown error'))
      return
    }

    alert('Payment verified successfully')
    closeVerifyModal()
    await fetchPayment()
  } catch (err) {
    console.error('Error:', err)
    alert('Error verifying payment')
  } finally {
    verifying.value = false
  }
}

// Process refund
const processRefund = async () => {
  try {
    refunding.value = true
    const { data, error } = await useFetch(`/api/payments/${route.params.id}/refund`, {
      method: 'POST',
      headers: useRequestHeaders(['cookie']),
      body: {
        reason: refundForm.value.reason
      }
    })

    if (error.value) {
      alert('Error processing refund: ' + (error.value.data?.message || 'Unknown error'))
      return
    }

    alert('Refund processed successfully')
    closeRefundModal()
    await fetchPayment()
  } catch (err) {
    console.error('Error:', err)
    alert('Error processing refund')
  } finally {
    refunding.value = false
  }
}

// Utility functions
const formatCurrency = (amount) => {
  return Number(amount).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatPaymentMethod = (method) => {
  return method?.replace(/_/g, ' ') || 'N/A'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const getApplicationStatusClass = (status) => {
  const classes = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PENDING_PAYMENT: 'bg-orange-100 text-orange-800',
    PAYMENT_COMPLETED: 'bg-emerald-100 text-emerald-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Load data on mount
onMounted(() => {
  fetchPayment()
})
</script>
