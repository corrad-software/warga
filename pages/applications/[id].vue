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
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <NuxtLink to="/dashboard" class="hover:text-gray-700">Dashboard</NuxtLink>
          </li>
          <li>
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </li>
          <li>
            <NuxtLink to="/dashboard" class="hover:text-gray-700">Permohonan</NuxtLink>
          </li>
          <li>
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </li>
          <li class="text-gray-900 font-medium">
            {{ application?.applicationNumber || 'Butiran Permohonan' }}
          </li>
        </ol>
      </nav>

      <!-- Page Title Card -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h2 class="text-3xl font-bold text-gray-900">
              {{ application?.applicationNumber || 'Butiran Permohonan' }}
            </h2>
            <p v-if="application" class="text-gray-600 mt-2">
              Jenis: {{ application.type.replace(/_/g, ' ') }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
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
            <button
              @click="router.push('/dashboard')"
              class="text-gray-400 hover:text-gray-600"
              title="Kembali"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

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
        <div v-if="activeTab === 'details'" class="space-y-6">
          <!-- Application Overview -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Application Overview</h3>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Application Number</dt>
                  <dd class="mt-1 text-sm font-semibold text-gray-900">{{ application.applicationNumber }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Application Type</dt>
                  <dd class="mt-1 text-sm font-semibold text-gray-900">{{ application.type.replace(/_/g, ' ') }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Applicant Name</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.user?.name || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.user?.email || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Created Date</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(application.createdAt) }}</dd>
                </div>
                <div v-if="application.submissionDate">
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Submission Date</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(application.submissionDate) }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Application Progress Timeline -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Application Progress</h3>
              <p class="mt-1 text-sm text-gray-500">Track the status and progress of your application</p>
            </div>
            <div class="px-4 py-6 sm:px-6">
              <div class="flow-root">
                <ul v-if="workflowHistory.length > 0" role="list" class="-mb-8">
                  <li v-for="(event, eventIdx) in workflowHistory" :key="event.id">
                    <div class="relative pb-8">
                      <span
                        v-if="eventIdx !== workflowHistory.length - 1"
                        class="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                      <div class="relative flex items-start space-x-3">
                        <div>
                          <div class="relative px-1">
                            <div class="flex h-10 w-10 items-center justify-center rounded-full ring-8 ring-white"
                                 :class="eventIdx === 0 ? 'bg-blue-500' : 'bg-gray-400'">
                              <svg v-if="eventIdx === 0" class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <svg v-else class="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="3" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div class="min-w-0 flex-1">
                          <div>
                            <div class="text-sm">
                              <span class="font-medium text-gray-900">
                                {{ formatStatus(event.toStatus) }}
                              </span>
                            </div>
                            <p class="mt-0.5 text-sm text-gray-500">
                              {{ formatDate(event.createdAt) }}
                            </p>
                          </div>
                          <div v-if="event.notes" class="mt-2 text-sm text-gray-700">
                            <p>{{ event.notes }}</p>
                          </div>
                          <div v-if="event.actionByRole" class="mt-1">
                            <span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                              {{ event.actionByRole.replace(/_/g, ' ') }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
                <div v-else class="text-center py-12">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">No progress history available yet</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Applicant Information -->
          <div v-if="application.formData?.applicantInfo" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Applicant Information</h3>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.applicantInfo.fullName || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">IC Number</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.applicantInfo.icNumber || '-' }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Residential Address</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ [
                      application.formData.applicantInfo.residentialAddress,
                      application.formData.applicantInfo.city,
                      application.formData.applicantInfo.postcode,
                      application.formData.applicantInfo.state,
                      application.formData.applicantInfo.country
                    ].filter(Boolean).join(', ') || '-' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Relationship to Subject</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.applicantInfo.relationshipToChild || '-' }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Subject Information -->
          <div v-if="application.formData?.childInfo" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Subject Information</h3>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.childInfo.fullName || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">IC Number</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.childInfo.icNumber || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.childInfo.dateOfBirth || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Place of Birth</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.childInfo.placeOfBirth || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Country of Birth</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.childInfo.countryOfBirth || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Race</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.childInfo.race || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Religion</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ application.formData.childInfo.religion || '-' }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Parent Information -->
          <div v-if="application.formData?.parentInfo" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Parent Information</h3>
            </div>
            <div class="px-4 py-5 sm:p-6 space-y-8">
              <!-- Mother -->
              <div v-if="application.formData.parentInfo.mother">
                <h4 class="text-sm font-semibold text-pink-600 mb-3">Mother</h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.formData.parentInfo.mother.name || '-' }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">IC Number</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.formData.parentInfo.mother.icNumber || '-' }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Race</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.formData.parentInfo.mother.race || '-' }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Citizenship</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.formData.parentInfo.mother.currentCitizenship || '-' }}</dd>
                  </div>
                </dl>
              </div>

              <!-- Father -->
              <div v-if="application.formData.parentInfo.father">
                <h4 class="text-sm font-semibold text-blue-600 mb-3">Father</h4>
                <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.formData.parentInfo.father.name || '-' }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">IC Number</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.formData.parentInfo.father.icNumber || '-' }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Race</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.formData.parentInfo.father.race || '-' }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Citizenship</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ application.formData.parentInfo.father.currentCitizenship || '-' }}</dd>
                  </div>
                </dl>
              </div>
            </div>
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
