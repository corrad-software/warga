<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const { user, token } = useAuth()

const applicationId = route.params.id as string

const application = ref<any>(null)
const documents = ref<any[]>([])
const workflowHistory = ref<any[]>([])
const validTransitions = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const activeTab = ref('details')
const showPaymentForm = ref(false)

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
  DOCUMENTS_VERIFIED: 'bg-green-100 text-green-800',
  PENDING_BIOMETRIC: 'bg-purple-100 text-purple-800',
  BIOMETRIC_CAPTURED: 'bg-indigo-100 text-indigo-800',
  PENDING_PAYMENT: 'bg-orange-100 text-orange-800',
  PAYMENT_COMPLETED: 'bg-teal-100 text-teal-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PENDING_OATH: 'bg-purple-100 text-purple-800',
  OATH_COMPLETED: 'bg-indigo-100 text-indigo-800',
  CERTIFICATE_ISSUED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800'
}

const fetchApplication = async () => {
  try {
    const response = await $fetch(`/api/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (response.success) {
      application.value = response.data.application
    }
  } catch (err: any) {
    error.value = 'Failed to load application'
  }
}

const fetchDocuments = async () => {
  try {
    const response = await $fetch(`/api/documents?applicationId=${applicationId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (response.success) {
      documents.value = response.data.documents
    }
  } catch (err) {
    console.error('Failed to load documents')
  }
}

const fetchWorkflowHistory = async () => {
  try {
    const response = await $fetch(`/api/applications/${applicationId}/history`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (response.success) {
      workflowHistory.value = response.data.history
    }
  } catch (err) {
    console.error('Failed to load workflow history')
  }
}

const fetchValidTransitions = async () => {
  try {
    const response = await $fetch(`/api/applications/${applicationId}/transitions`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (response.success) {
      validTransitions.value = response.data.validTransitions
    }
  } catch (err) {
    console.error('Failed to load valid transitions')
  }
}

const submitApplication = async () => {
  if (!confirm('Are you sure you want to submit this application?')) return

  try {
    const response = await $fetch(`/api/applications/${applicationId}/transition`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        toStatus: 'SUBMITTED',
        notes: 'Application submitted by applicant'
      }
    })

    if (response.success) {
      await fetchApplication()
      await fetchValidTransitions()
      await fetchWorkflowHistory()
    }
  } catch (err: any) {
    alert(err.data?.message || 'Failed to submit application')
  }
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

const isOfficer = computed(() => {
  return ['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN'].includes(user.value?.role)
})

const canSubmit = computed(() => {
  return application.value?.status === 'DRAFT' && validTransitions.value.includes('SUBMITTED')
})

const hasRole = (roles: string[]) => {
  return roles.includes(user.value?.role)
}

const handlePaymentCreated = () => {
  showPaymentForm.value = false
  // Refresh to see payment status update
  fetchApplication()
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchApplication(),
    fetchDocuments(),
    fetchWorkflowHistory(),
    fetchValidTransitions()
  ])
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <button
              @click="router.back()"
              class="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ application?.applicationNumber || 'Application Details' }}
              </h1>
              <p v-if="application" class="text-sm text-gray-600">
                Type: {{ application.type.replace(/_/g, ' ') }}
              </p>
            </div>
          </div>
          <div v-if="application">
            <span
              :class="[
                'px-3 py-1 text-sm font-semibold rounded-full',
                statusColors[application.status] || 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ formatStatus(application.status) }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading application...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">{{ error }}</div>
      </div>

      <!-- Content -->
      <div v-else-if="application">
        <!-- Actions -->
        <div v-if="canSubmit || isOfficer" class="mb-6 flex gap-3">
          <button
            v-if="canSubmit"
            @click="submitApplication"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Submit Application
          </button>
        </div>

        <!-- Tabs -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'details'"
              :class="[
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Details
            </button>
            <button
              @click="activeTab = 'documents'"
              :class="[
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Documents ({{ documents.length }})
            </button>
            <button
              @click="activeTab = 'payment'"
              :class="[
                activeTab === 'payment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              Payment
            </button>
            <button
              @click="activeTab = 'history'"
              :class="[
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              ]"
            >
              History
            </button>
          </nav>
        </div>

        <!-- Tab Content: Details -->
        <div v-if="activeTab === 'details'" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Application Information</h3>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl class="sm:divide-y sm:divide-gray-200">
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Application Number</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ application.applicationNumber }}
                </dd>
              </div>
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Applicant</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ application.user?.name }} ({{ application.user?.email }})
                </dd>
              </div>
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Created Date</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ formatDate(application.createdAt) }}
                </dd>
              </div>
              <div v-if="application.submissionDate" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Submission Date</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ formatDate(application.submissionDate) }}
                </dd>
              </div>
              <div v-if="application.formData" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Form Data</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <pre class="text-xs bg-gray-50 p-3 rounded">{{ JSON.stringify(application.formData, null, 2) }}</pre>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Tab Content: Documents -->
        <div v-if="activeTab === 'documents'">
          <DocumentList :applicationId="applicationId" />
        </div>

        <!-- Tab Content: Payment -->
        <div v-if="activeTab === 'payment'">
          <PaymentVerification
            :applicationId="applicationId"
            :canVerify="hasRole(['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN'])"
          />

          <!-- Create Payment Button (for applicants or officers) -->
          <div v-if="!isOfficer || hasRole(['ADMIN'])" class="mt-4">
            <button
              @click="showPaymentForm = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Create Payment
            </button>
          </div>

          <!-- Payment Form Modal -->
          <div
            v-if="showPaymentForm"
            class="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75"
            @click.self="showPaymentForm = false"
          >
            <div class="flex min-h-full items-center justify-center p-4">
              <PaymentForm
                :applicationId="applicationId"
                :applicationType="application.type"
                @paid="handlePaymentCreated"
                @close="showPaymentForm = false"
              />
            </div>
          </div>
        </div>

        <!-- Tab Content: History -->
        <div v-if="activeTab === 'history'" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Workflow History</h3>
          </div>
          <div class="border-t border-gray-200">
            <ul v-if="workflowHistory.length > 0" class="divide-y divide-gray-200">
              <li v-for="history in workflowHistory" :key="history.id" class="px-4 py-4">
                <div class="flex items-start">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">
                      <span v-if="history.fromStatus">{{ formatStatus(history.fromStatus) }} →</span>
                      {{ formatStatus(history.toStatus) }}
                    </p>
                    <p v-if="history.notes" class="text-sm text-gray-600 mt-1">{{ history.notes }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ formatDate(history.createdAt) }}
                      <span v-if="history.actionByRole"> | {{ history.actionByRole.replace(/_/g, ' ') }}</span>
                    </p>
                  </div>
                </div>
              </li>
            </ul>
            <div v-else class="px-4 py-12 text-center">
              <p class="text-gray-500">No history available</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
