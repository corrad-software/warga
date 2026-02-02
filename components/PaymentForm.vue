<script setup lang="ts">
const props = defineProps<{
  applicationId: string
  applicationType: string
}>()

const emit = defineEmits<{
  paid: [payment: any]
  close: []
}>()

const { token } = useAuth()

const creating = ref(false)
const error = ref('')
const payment = ref<any>(null)

// Payment method selection
const selectedMethod = ref<string>('ONLINE_BANKING')
const methods = [
  { value: 'ONLINE_BANKING', label: 'Online Banking (FPX)' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' }
]

// Fee amounts based on application type
const feeAmounts: Record<string, number> = {
  BORANG_H: 300.00,
  BORANG_G: 500.00,
  TADBIR_SUMPAH: 100.00
}

const paymentAmount = computed(() => {
  return feeAmounts[props.applicationType] || 0
})

const createPayment = async () => {
  creating.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        applicationId: props.applicationId,
        method: selectedMethod.value
      }
    })

    if (response.success) {
      payment.value = response.data.payment

      // In production, redirect to payment gateway
      // For now, show success message
      setTimeout(() => {
        emit('paid', payment.value)
      }, 1500)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to create payment'
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="payment-form bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>

    <!-- Payment Created Success -->
    <div v-if="payment" class="rounded-md bg-green-50 p-4 mb-4">
      <div class="flex">
        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Payment Created</h3>
          <div class="mt-2 text-sm text-green-700">
            <p>Payment Number: <span class="font-semibold">{{ payment.paymentNumber }}</span></p>
            <p class="mt-1">Amount: RM {{ payment.amount.toFixed(2) }}</p>
            <p class="mt-2 text-xs">
              In production, you would be redirected to the payment gateway to complete the payment.
              For now, an officer will manually verify your payment.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="rounded-md bg-red-50 p-4 mb-4">
      <div class="text-sm text-red-700">{{ error }}</div>
    </div>

    <!-- Payment Form -->
    <div v-if="!payment" class="space-y-4">
      <!-- Application Type & Amount -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500">Application Type</p>
            <p class="text-base font-medium text-gray-900">
              {{ applicationType.replace(/_/g, ' ') }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Amount</p>
            <p class="text-2xl font-bold text-blue-600">
              RM {{ paymentAmount.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Payment Method Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <div class="space-y-2">
          <div
            v-for="method in methods"
            :key="method.value"
            class="flex items-center"
          >
            <input
              :id="method.value"
              v-model="selectedMethod"
              :value="method.value"
              type="radio"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              :for="method.value"
              class="ml-3 block text-sm font-medium text-gray-700"
            >
              {{ method.label }}
            </label>
          </div>
        </div>
      </div>

      <!-- Payment Notice -->
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              <strong>Note:</strong> Payment gateway integration is currently in development.
              After creating the payment, an officer will manually verify your payment using
              alternative methods (bank transfer, cash, etc.).
            </p>
          </div>
        </div>
      </div>

      <!-- Fee Breakdown -->
      <div class="border-t border-gray-200 pt-4">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Fee Breakdown</h4>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Application Processing Fee</span>
            <span class="text-gray-900">RM {{ paymentAmount.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm pt-2 border-t border-gray-200">
            <span class="font-medium text-gray-900">Total</span>
            <span class="font-bold text-gray-900">RM {{ paymentAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex justify-end gap-3">
      <button
        v-if="!payment"
        @click="emit('close')"
        :disabled="creating"
        class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        v-if="!payment"
        @click="createPayment"
        :disabled="creating"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {{ creating ? 'Creating Payment...' : 'Proceed to Payment' }}
      </button>
      <button
        v-else
        @click="emit('close')"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
      >
        Done
      </button>
    </div>
  </div>
</template>
