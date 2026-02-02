<script setup lang="ts">
const props = defineProps<{
  currentStatus: string
  history?: any[]
}>()

const workflowStages = [
  { key: 'DRAFT', label: 'Draft', order: 1 },
  { key: 'SUBMITTED', label: 'Submitted', order: 2 },
  { key: 'PENDING_REVIEW', label: 'Pending Review', order: 3 },
  { key: 'DOCUMENTS_VERIFIED', label: 'Documents Verified', order: 4 },
  { key: 'PENDING_BIOMETRIC', label: 'Pending Biometric', order: 5 },
  { key: 'BIOMETRIC_CAPTURED', label: 'Biometric Captured', order: 6 },
  { key: 'PENDING_PAYMENT', label: 'Pending Payment', order: 7 },
  { key: 'PAYMENT_COMPLETED', label: 'Payment Completed', order: 8 },
  { key: 'UNDER_REVIEW', label: 'Under Review', order: 9 },
  { key: 'APPROVED', label: 'Approved', order: 10 },
  { key: 'PENDING_OATH', label: 'Pending Oath', order: 11 },
  { key: 'OATH_COMPLETED', label: 'Oath Completed', order: 12 },
  { key: 'CERTIFICATE_ISSUED', label: 'Certificate Issued', order: 13 },
  { key: 'COMPLETED', label: 'Completed', order: 14 }
]

// Simplified workflow for display (main milestones)
const mainStages = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'DOCUMENTS_VERIFIED', label: 'Documents' },
  { key: 'BIOMETRIC_CAPTURED', label: 'Biometric' },
  { key: 'PAYMENT_COMPLETED', label: 'Payment' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'CERTIFICATE_ISSUED', label: 'Certificate' },
  { key: 'COMPLETED', label: 'Completed' }
]

const getCurrentStageIndex = () => {
  const currentStageOrder = workflowStages.find(s => s.key === props.currentStatus)?.order || 0
  return mainStages.findIndex(s => {
    const stageOrder = workflowStages.find(ws => ws.key === s.key)?.order || 0
    return stageOrder >= currentStageOrder
  })
}

const isCompleted = (stageKey: string) => {
  const currentOrder = workflowStages.find(s => s.key === props.currentStatus)?.order || 0
  const stageOrder = workflowStages.find(s => s.key === stageKey)?.order || 0
  return currentOrder > stageOrder
}

const isCurrent = (stageKey: string) => {
  const currentOrder = workflowStages.find(s => s.key === props.currentStatus)?.order || 0
  const stageOrder = workflowStages.find(s => s.key === stageKey)?.order || 0

  // Find next main stage that hasn't been completed
  return stageOrder >= currentOrder && !isCompleted(stageKey)
}

const isRejected = computed(() => props.currentStatus === 'REJECTED')
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-medium text-gray-900 mb-6">Application Progress</h3>

    <!-- Rejected Status -->
    <div v-if="isRejected" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Application Rejected</h3>
          <p class="mt-2 text-sm text-red-700">
            Your application has been rejected. Please contact support for more information.
          </p>
        </div>
      </div>
    </div>

    <!-- Progress Tracker -->
    <nav v-else aria-label="Progress">
      <ol class="overflow-hidden">
        <li
          v-for="(stage, index) in mainStages"
          :key="stage.key"
          :class="[
            index !== mainStages.length - 1 ? 'pb-10' : '',
            'relative'
          ]"
        >
          <!-- Line connector -->
          <div
            v-if="index !== mainStages.length - 1"
            :class="[
              isCompleted(stage.key) ? 'bg-blue-600' : 'bg-gray-200',
              'absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5'
            ]"
            aria-hidden="true"
          />

          <div class="group relative flex items-start">
            <span class="flex h-9 items-center">
              <!-- Completed -->
              <span
                v-if="isCompleted(stage.key)"
                class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600"
              >
                <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>

              <!-- Current -->
              <span
                v-else-if="isCurrent(stage.key)"
                class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white"
              >
                <span class="h-2.5 w-2.5 rounded-full bg-blue-600" />
              </span>

              <!-- Upcoming -->
              <span
                v-else
                class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"
              >
                <span class="h-2.5 w-2.5 rounded-full bg-transparent" />
              </span>
            </span>

            <span class="ml-4 flex min-w-0 flex-col">
              <span
                :class="[
                  isCompleted(stage.key) ? 'text-blue-600 font-semibold' :
                  isCurrent(stage.key) ? 'text-gray-900 font-semibold' :
                  'text-gray-500',
                  'text-sm'
                ]"
              >
                {{ stage.label }}
              </span>
              <span
                v-if="isCurrent(stage.key)"
                class="text-xs text-gray-500 mt-1"
              >
                Current Status: {{ currentStatus.replace(/_/g, ' ') }}
              </span>
            </span>
          </div>
        </li>
      </ol>
    </nav>

    <!-- Current Status Detail -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-900">Current Status</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ currentStatus.replace(/_/g, ' ') }}
          </p>
        </div>
        <div>
          <span
            :class="[
              currentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              currentStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
              currentStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800',
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium'
            ]"
          >
            {{ currentStatus === 'COMPLETED' ? 'Complete' :
               currentStatus === 'REJECTED' ? 'Rejected' :
               currentStatus === 'APPROVED' ? 'Approved' :
               'In Progress' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
