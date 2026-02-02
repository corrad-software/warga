<script setup lang="ts">
const props = defineProps<{
  applicationId: string
  canVerify?: boolean
}>()

const { token } = useAuth()

const payments = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const verifying = ref<string | null>(null)

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800'
}

const methodLabels: Record<string, string> = {
  ONLINE_BANKING: 'Online Banking',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  CASH: 'Cash',
  OTHER: 'Other'
}

const fetchPayments = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/payments?applicationId=${props.applicationId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      payments.value = response.data.payments
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load payments'
  } finally {
    loading.value = false
  }
}

const verifyPayment = async (paymentId: string, status: 'COMPLETED' | 'FAILED') => {
  const transactionId = prompt(`Enter transaction ID for this payment (optional):`)

  if (status === 'FAILED') {
    const confirmFail = confirm('Are you sure you want to mark this payment as FAILED?')
    if (!confirmFail) return
  }

  verifying.value = paymentId

  try {
    await $fetch(`/api/payments/${paymentId}/verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        status,
        transactionId: transactionId || undefined,
        notes: status === 'FAILED' ? 'Payment verification failed' : 'Payment verified by officer'
      }
    })

    // Refresh payments list
    await fetchPayments()
  } catch (err: any) {
    alert(err.data?.message || 'Failed to verify payment')
  } finally {
    verifying.value = null
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchPayments()
})
</script>

<template>
  <div class="payment-verification">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading payments...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-md bg-red-50 p-4">
      <div class="text-sm text-red-700">{{ error }}</div>
    </div>

    <!-- Payment Records -->
    <div v-else-if="payments.length > 0" class="space-y-4">
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="bg-white rounded-lg shadow p-4"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <!-- Payment Header -->
            <div class="flex items-center gap-2 mb-3">
              <h4 class="text-base font-medium text-gray-900">
                {{ payment.paymentNumber }}
              </h4>
              <span :class="['px-2 py-1 text-xs font-semibold rounded-full', statusColors[payment.status]]">
                {{ payment.status }}
              </span>
            </div>

            <!-- Payment Details Grid -->
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-gray-500">Amount:</span>
                <span class="ml-2 font-medium text-gray-900">
                  RM {{ parseFloat(payment.amount).toFixed(2) }}
                </span>
              </div>

              <div>
                <span class="text-gray-500">Method:</span>
                <span class="ml-2 text-gray-900">
                  {{ payment.method ? methodLabels[payment.method] : 'Not specified' }}
                </span>
              </div>

              <div>
                <span class="text-gray-500">Created:</span>
                <span class="ml-2 text-gray-900">
                  {{ formatDate(payment.createdAt) }}
                </span>
              </div>

              <div v-if="payment.paidAt">
                <span class="text-gray-500">Paid At:</span>
                <span class="ml-2 text-gray-900">
                  {{ formatDate(payment.paidAt) }}
                </span>
              </div>

              <div v-if="payment.transactionId" class="col-span-2">
                <span class="text-gray-500">Transaction ID:</span>
                <code class="ml-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-900">
                  {{ payment.transactionId }}
                </code>
              </div>

              <div class="col-span-2">
                <span class="text-gray-500">Paid By:</span>
                <span class="ml-2 text-gray-900">
                  {{ payment.user.name }} ({{ payment.user.email }})
                </span>
              </div>
            </div>

            <!-- Gateway Response (if exists) -->
            <div v-if="payment.gatewayResponse" class="mt-3 bg-gray-50 rounded p-3">
              <p class="text-xs font-medium text-gray-700 mb-1">Gateway Response:</p>
              <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ JSON.stringify(payment.gatewayResponse, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- Verification Actions -->
        <div v-if="canVerify && payment.status === 'PENDING'" class="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          <button
            @click="verifyPayment(payment.id, 'COMPLETED')"
            :disabled="verifying === payment.id"
            class="px-3 py-1.5 text-sm border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {{ verifying === payment.id ? 'Verifying...' : 'Verify as Paid' }}
          </button>
          <button
            @click="verifyPayment(payment.id, 'FAILED')"
            :disabled="verifying === payment.id"
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Mark as Failed
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No payments</h3>
      <p class="mt-1 text-sm text-gray-500">No payments have been created for this application.</p>
    </div>
  </div>
</template>
