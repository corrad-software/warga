<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { token } = useAuth()
const router = useRouter()
const route = useRoute()

// Add print styles on mount
onMounted(() => {
  if (process.client) {
    const style = document.createElement('style')
    style.id = 'receipt-print-styles'
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print\\:hidden {
          display: none !important;
        }
        #receipt-content, #receipt-content * {
          visibility: visible;
        }
        #receipt-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `
    if (!document.getElementById('receipt-print-styles')) {
      document.head.appendChild(style)
    }
  }
})

const applicationId = route.params.id as string

const application = ref<any>(null)
const loading = ref(true)
const error = ref('')
const isEditMode = ref(true)
const saveLoading = ref(false)

// Edit form data
const editForm = ref({
  decision: '',
  decisionReason: '',
  requiresOath: false,
  oathScheduledDate: ''
})

const fetchApplication = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/applications/${applicationId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      application.value = response.data.application
      // Populate edit form
      editForm.value = {
        decision: application.value.decision || '',
        decisionReason: application.value.decisionReason || '',
        requiresOath: application.value.requiresOath || false,
        oathScheduledDate: application.value.oathScheduledDate
          ? new Date(application.value.oathScheduledDate).toISOString().split('T')[0]
          : ''
      }
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load application'
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    // Reset form when canceling edit
    editForm.value = {
      decision: application.value.decision || '',
      decisionReason: application.value.decisionReason || '',
      requiresOath: application.value.requiresOath || false,
      oathScheduledDate: application.value.oathScheduledDate
        ? new Date(application.value.oathScheduledDate).toISOString().split('T')[0]
        : ''
    }
  }
}

const saveApplication = async () => {
  saveLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const updateData: any = {
      decision: editForm.value.decision || undefined,
      decisionReason: editForm.value.decisionReason || undefined,
      requiresOath: editForm.value.requiresOath,
      oathScheduledDate: editForm.value.oathScheduledDate
        ? new Date(editForm.value.oathScheduledDate).toISOString()
        : undefined
    }

    const response = await $fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: updateData
    })

    if (response.success) {
      successMessage.value = 'Application updated successfully!'
      isEditMode.value = false
      await fetchApplication()
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to update application'
  } finally {
    saveLoading.value = false
  }
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateShort = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

const formatType = (type: string) => {
  const typeMap: Record<string, string> = {
    BORANG_H: 'Birth Abroad (Borang H)',
    BORANG_G: 'Article 15(2) Fastlane (Borang G)',
    TADBIR_SUMPAH: 'Oath Administration'
  }
  return typeMap[type] || type
}

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    DOCUMENTS_VERIFIED: 'bg-cyan-100 text-cyan-800',
    PENDING_BIOMETRIC: 'bg-orange-100 text-orange-800',
    BIOMETRIC_CAPTURED: 'bg-teal-100 text-teal-800',
    PENDING_PAYMENT: 'bg-purple-100 text-purple-800',
    PAYMENT_COMPLETED: 'bg-indigo-100 text-indigo-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PENDING_OATH: 'bg-pink-100 text-pink-800',
    OATH_COMPLETED: 'bg-emerald-100 text-emerald-800',
    CERTIFICATE_ISSUED: 'bg-lime-100 text-lime-800',
    COMPLETED: 'bg-green-100 text-green-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getDocumentVerificationColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-800',
    OCR_PROCESSING: 'bg-blue-100 text-blue-800',
    OCR_COMPLETED: 'bg-cyan-100 text-cyan-800',
    VERIFIED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    REQUIRES_MANUAL_CHECK: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// Workflow modals
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const showStatusModal = ref(false)
const actionLoading = ref(false)
const actionError = ref('')
const successMessage = ref('')

// Receipt modal
const showReceiptModal = ref(false)
const selectedPayment = ref<any>(null)

const openReceiptModal = (payment: any) => {
  console.log('Opening receipt modal for payment:', payment)
  selectedPayment.value = payment
  showReceiptModal.value = true
  console.log('Modal state:', { showReceiptModal: showReceiptModal.value, selectedPayment: selectedPayment.value })
}

const printReceipt = () => {
  window.print()
}

const closeReceiptModal = () => {
  showReceiptModal.value = false
  selectedPayment.value = null
}

// Document modal
const showDocumentModal = ref(false)
const selectedDocument = ref<any>(null)

const openDocumentModal = (document: any) => {
  selectedDocument.value = document
  showDocumentModal.value = true
}

const closeDocumentModal = () => {
  showDocumentModal.value = false
  selectedDocument.value = null
}

// Approve form
const approveForm = ref({
  decision: '',
  decisionReason: ''
})

// Reject form
const rejectForm = ref({
  decisionReason: ''
})

// Status update form
const statusForm = ref({
  toStatus: '',
  notes: ''
})

const statusOptions = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'DOCUMENTS_VERIFIED', label: 'Documents Verified' },
  { value: 'PENDING_BIOMETRIC', label: 'Pending Biometric' },
  { value: 'BIOMETRIC_CAPTURED', label: 'Biometric Captured' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PAYMENT_COMPLETED', label: 'Payment Completed' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'PENDING_OATH', label: 'Pending Oath' },
  { value: 'OATH_COMPLETED', label: 'Oath Completed' },
  { value: 'CERTIFICATE_ISSUED', label: 'Certificate Issued' },
  { value: 'COMPLETED', label: 'Completed' }
]

const openApproveModal = () => {
  approveForm.value = { decision: '', decisionReason: '' }
  actionError.value = ''
  showApproveModal.value = true
}

const openRejectModal = () => {
  rejectForm.value = { decisionReason: '' }
  actionError.value = ''
  showRejectModal.value = true
}

const openStatusModal = () => {
  statusForm.value = { toStatus: '', notes: '' }
  actionError.value = ''
  showStatusModal.value = true
}

const approveApplication = async () => {
  actionLoading.value = true
  actionError.value = ''
  successMessage.value = ''

  try {
    const response = await $fetch(`/api/applications/${applicationId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: approveForm.value
    })

    if (response.success) {
      successMessage.value = 'Application approved successfully!'
      showApproveModal.value = false
      await fetchApplication()
    }
  } catch (err: any) {
    actionError.value = err.data?.message || 'Failed to approve application'
  } finally {
    actionLoading.value = false
  }
}

const rejectApplication = async () => {
  if (!rejectForm.value.decisionReason) {
    actionError.value = 'Decision reason is required for rejection'
    return
  }

  actionLoading.value = true
  actionError.value = ''
  successMessage.value = ''

  try {
    const response = await $fetch(`/api/applications/${applicationId}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: rejectForm.value
    })

    if (response.success) {
      successMessage.value = 'Application rejected'
      showRejectModal.value = false
      await fetchApplication()
    }
  } catch (err: any) {
    actionError.value = err.data?.message || 'Failed to reject application'
  } finally {
    actionLoading.value = false
  }
}

const updateStatus = async () => {
  if (!statusForm.value.toStatus) {
    actionError.value = 'Please select a status'
    return
  }

  actionLoading.value = true
  actionError.value = ''
  successMessage.value = ''

  try {
    const response = await $fetch(`/api/applications/${applicationId}/transition`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: statusForm.value
    })

    if (response.success) {
      successMessage.value = 'Status updated successfully!'
      showStatusModal.value = false
      await fetchApplication()
    }
  } catch (err: any) {
    actionError.value = err.data?.message || 'Failed to update status'
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  fetchApplication()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-bold text-gray-900">{{ isEditMode ? 'Edit Application' : 'Application Details' }}</h3>
          <p class="mt-1 text-sm text-gray-600">{{ isEditMode ? 'Update application information' : 'View and manage application information' }}</p>
        </div>
        <div class="flex gap-3">
          <template v-if="isEditMode">
            <button
              @click="toggleEditMode"
              :disabled="saveLoading"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="saveApplication"
              :disabled="saveLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <svg v-if="saveLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saveLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </template>
          <template v-else>
            <button
              @click="toggleEditMode"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <NuxtLink
              to="/admin/applications"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Applications
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-6 rounded-md bg-green-50 p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
      <div class="text-sm text-red-700">{{ error }}</div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 bg-white rounded-lg shadow">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading application details...</p>
    </div>

    <!-- Application Details -->
    <div v-else-if="application" class="space-y-6">
      <!-- Application Header Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ application.applicationNumber }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ formatType(application.type) }}</p>
            </div>
            <div class="flex gap-2">
              <span
                :class="[
                  'px-3 py-1 inline-flex text-sm font-semibold rounded-full',
                  getStatusBadgeColor(application.status)
                ]"
              >
                {{ formatStatus(application.status) }}
              </span>
            </div>
          </div>

          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Submitted Date</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDateShort(application.submissionDate) }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Review Started</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDateShort(application.reviewStartDate) }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Decision Date</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDateShort(application.decisionDate) }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Completed Date</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDateShort(application.completionDate) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Applicant Information Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Applicant Information</h4>

          <div class="flex items-center mb-6">
            <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-blue-600 font-bold text-xl">{{ application.user?.name?.charAt(0) }}</span>
            </div>
            <div class="ml-4">
              <h5 class="text-lg font-bold text-gray-900">{{ application.user?.name }}</h5>
              <p class="text-sm text-gray-500">{{ application.user?.email }}</p>
            </div>
          </div>

          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">IC Number</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ application.user?.icNumber || '-' }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Phone Number</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ application.user?.phoneNumber || '-' }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Nationality Status</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatStatus(application.user?.nationalityStatus) }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Biometric Status</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatStatus(application.user?.biometricStatus) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Decision & Officer Notes Card (Editable) -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Decision & Officer Notes</h4>

          <template v-if="isEditMode">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Decision</label>
                <input
                  v-model="editForm.decision"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Approved, Rejected, Under Review"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Decision Reason</label>
                <textarea
                  v-model="editForm.decisionReason"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter detailed decision reason..."
                ></textarea>
              </div>

              <div class="flex items-center gap-4">
                <label class="flex items-center">
                  <input
                    v-model="editForm.requiresOath"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span class="ml-2 text-sm text-gray-700">Requires Oath</span>
                </label>
              </div>

              <div v-if="editForm.requiresOath">
                <label class="block text-sm font-medium text-gray-700 mb-1">Oath Scheduled Date</label>
                <input
                  v-model="editForm.oathScheduledDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </template>

          <template v-else>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Decision</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.decision || '-' }}</dd>
              </div>

              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Decision Reason</dt>
                <dd class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ application.decisionReason || '-' }}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">Requires Oath</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  <span
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      application.requiresOath ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ application.requiresOath ? 'Yes' : 'No' }}
                  </span>
                </dd>
              </div>

              <div v-if="application.requiresOath">
                <dt class="text-sm font-medium text-gray-500">Oath Scheduled Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDateShort(application.oathScheduledDate) }}</dd>
              </div>

              <div v-if="application.oathCompletedDate">
                <dt class="text-sm font-medium text-gray-500">Oath Completed Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDateShort(application.oathCompletedDate) }}</dd>
              </div>
            </dl>
          </template>
        </div>
      </div>

      <!-- Form Data Card -->
      <div v-if="application.formData" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Application Form Data</h4>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div v-for="(value, key) in application.formData" :key="key" :class="typeof value === 'string' && value.length > 50 ? 'sm:col-span-2' : ''">
              <dt class="text-sm font-medium text-gray-500 capitalize">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <template v-if="Array.isArray(value)">
                  <ul class="list-disc list-inside">
                    <li v-for="(item, idx) in value" :key="idx">{{ item }}</li>
                  </ul>
                </template>
                <template v-else-if="typeof value === 'object' && value !== null">
                  <pre class="text-xs bg-gray-50 p-2 rounded">{{ JSON.stringify(value, null, 2) }}</pre>
                </template>
                <template v-else>
                  {{ value || '-' }}
                </template>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Documents Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">
            Documents ({{ application.documents?.length || 0 }})
          </h4>

          <div v-if="application.documents && application.documents.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="doc in application.documents"
              :key="doc.id"
              @click="openDocumentModal(doc)"
              class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            >
              <!-- Document Thumbnail/Icon -->
              <div class="bg-gray-50 h-24 flex items-center justify-center relative">
                <!-- Image Thumbnail -->
                <div v-if="doc.mimeType && doc.mimeType.startsWith('image/')" class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <svg class="h-10 w-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <!-- PDF Icon -->
                <div v-else-if="doc.mimeType === 'application/pdf'" class="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                  <svg class="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    <path d="M14 2v6h6M10 13v6m-2-2h4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <!-- Generic File Icon -->
                <div v-else class="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <svg class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <!-- Verification Badge Overlay -->
                <div class="absolute top-1 right-1">
                  <span
                    :class="[
                      'px-1.5 py-0.5 text-xs font-semibold rounded-full shadow-sm',
                      getDocumentVerificationColor(doc.verificationStatus)
                    ]"
                  >
                    <svg v-if="doc.verificationStatus === 'VERIFIED'" class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                  <svg class="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>

              <!-- Document Info -->
              <div class="p-2 bg-white">
                <p class="text-xs font-medium text-gray-900 truncate" :title="doc.fileName">
                  {{ doc.fileName }}
                </p>
                <p class="text-xs text-gray-500 truncate">{{ formatStatus(doc.documentType) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-6 text-gray-500 text-sm">
            No documents uploaded yet
          </div>
        </div>
      </div>

      <!-- Payments Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">
            Payments ({{ application.payments?.length || 0 }})
          </h4>

          <div v-if="application.payments && application.payments.length > 0" class="space-y-3">
            <div
              v-for="payment in application.payments"
              :key="payment.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-medium text-gray-900">{{ payment.paymentNumber }}</p>
                  <span
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      getPaymentStatusColor(payment.status)
                    ]"
                  >
                    {{ formatStatus(payment.status) }}
                  </span>
                </div>
                <div class="flex items-center gap-4 mb-2">
                  <p class="text-sm font-bold text-gray-900">{{ payment.currency }} {{ payment.amount }}</p>
                  <p class="text-xs text-gray-500" v-if="payment.method">{{ formatStatus(payment.method) }}</p>
                  <p class="text-xs text-gray-500">{{ formatDateShort(payment.paidAt || payment.createdAt) }}</p>
                </div>
                <button
                  @click="openReceiptModal(payment)"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg class="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Receipt
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-6 text-gray-500 text-sm">
            No payments recorded yet
          </div>
        </div>
      </div>

      <!-- Workflow History Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">
            Workflow History ({{ application.workflowHistory?.length || 0 }})
          </h4>

          <div v-if="application.workflowHistory && application.workflowHistory.length > 0" class="flow-root">
            <ul class="-mb-8">
              <li v-for="(history, idx) in application.workflowHistory" :key="history.id" class="relative pb-8">
                <span
                  v-if="idx !== application.workflowHistory.length - 1"
                  class="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                ></span>
                <div class="relative flex items-start space-x-3">
                  <div class="relative">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                      <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div>
                      <div class="text-sm">
                        <span class="font-medium text-gray-900">Status changed</span>
                        <span v-if="history.fromStatus" class="text-gray-500"> from </span>
                        <span v-if="history.fromStatus" class="font-medium text-gray-700">{{ formatStatus(history.fromStatus) }}</span>
                        <span class="text-gray-500"> to </span>
                        <span class="font-medium text-gray-700">{{ formatStatus(history.toStatus) }}</span>
                      </div>
                      <p class="mt-0.5 text-xs text-gray-500">
                        {{ formatDate(history.createdAt) }}
                        <span v-if="history.actionByRole"> by {{ formatStatus(history.actionByRole) }}</span>
                      </p>
                    </div>
                    <div v-if="history.notes" class="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {{ history.notes }}
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div v-else class="text-center py-6 text-gray-500 text-sm">
            No workflow history available
          </div>
        </div>
      </div>

      <!-- Actions Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Actions</h4>
          <div class="flex gap-3">
            <button
              @click="openApproveModal"
              class="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approve Application
            </button>
            <button
              @click="openRejectModal"
              class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reject Application
            </button>
            <button
              @click="openStatusModal"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div v-if="showApproveModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Approve Application</h3>
        </div>

        <div class="px-6 py-4">
          <div v-if="actionError" class="mb-4 rounded-md bg-red-50 p-3">
            <p class="text-sm text-red-700">{{ actionError }}</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Decision Summary</label>
              <input
                v-model="approveForm.decision"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Approved for citizenship"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Decision Reason</label>
              <textarea
                v-model="approveForm.decisionReason"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the reason for approval..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button
            @click="showApproveModal = false"
            :disabled="actionLoading"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="approveApplication"
            :disabled="actionLoading"
            class="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {{ actionLoading ? 'Approving...' : 'Approve' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Reject Application</h3>
        </div>

        <div class="px-6 py-4">
          <div v-if="actionError" class="mb-4 rounded-md bg-red-50 p-3">
            <p class="text-sm text-red-700">{{ actionError }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Decision Reason <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="rejectForm.decisionReason"
              rows="4"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the reason for rejection (required)..."
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button
            @click="showRejectModal = false"
            :disabled="actionLoading"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="rejectApplication"
            :disabled="actionLoading"
            class="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {{ actionLoading ? 'Rejecting...' : 'Reject' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Update Application Status</h3>
        </div>

        <div class="px-6 py-4">
          <div v-if="actionError" class="mb-4 rounded-md bg-red-50 p-3">
            <p class="text-sm text-red-700">{{ actionError }}</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                New Status <span class="text-red-500">*</span>
              </label>
              <select
                v-model="statusForm.toStatus"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a status</option>
                <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="statusForm.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional notes about this status change..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button
            @click="showStatusModal = false"
            :disabled="actionLoading"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            @click="updateStatus"
            :disabled="actionLoading"
            class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {{ actionLoading ? 'Updating...' : 'Update Status' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <div v-if="showReceiptModal && selectedPayment" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" @click.self="closeReceiptModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between print:hidden">
          <h3 class="text-lg font-medium text-gray-900">Payment Receipt</h3>
          <button
            @click="closeReceiptModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div id="receipt-content" class="px-8 py-8">
          <!-- Receipt Header -->
          <div class="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <h2 class="text-2xl font-bold text-gray-900">PAYMENT RECEIPT</h2>
            <p class="text-sm text-gray-600 mt-2">Sistem Permohonan Kewarganegaraan (SPK)</p>
            <p class="text-xs text-gray-500 mt-1">Malaysian Citizenship Application System</p>
          </div>

          <!-- Receipt Number & Status -->
          <div class="mb-6 text-center">
            <p class="text-sm text-gray-600">Receipt Number</p>
            <p class="text-xl font-bold text-gray-900">{{ selectedPayment.paymentNumber }}</p>
            <span
              :class="[
                'mt-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                getPaymentStatusColor(selectedPayment.status)
              ]"
            >
              {{ formatStatus(selectedPayment.status) }}
            </span>
          </div>

          <!-- Payment Details -->
          <div class="mb-6 bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-600">Amount Paid</dt>
                <dd class="mt-1 text-2xl font-bold text-green-600">{{ selectedPayment.currency }} {{ Number(selectedPayment.amount).toFixed(2) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">Payment Method</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatStatus(selectedPayment.method) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">Transaction ID</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ selectedPayment.transactionId }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">Payment Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(selectedPayment.paidAt || selectedPayment.createdAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- Gateway Information -->
          <div v-if="selectedPayment.gatewayResponse" class="mb-6 border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Gateway Information</h3>
            <dl class="grid grid-cols-2 gap-4">
              <div v-if="selectedPayment.gatewayResponse.gateway">
                <dt class="text-sm font-medium text-gray-600">Payment Gateway</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ selectedPayment.gatewayResponse.gateway }}</dd>
              </div>
              <div v-if="selectedPayment.gatewayResponse.bankName">
                <dt class="text-sm font-medium text-gray-600">Bank Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ selectedPayment.gatewayResponse.bankName }}</dd>
              </div>
              <div v-if="selectedPayment.gatewayResponse.bankCode">
                <dt class="text-sm font-medium text-gray-600">Bank Code</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ selectedPayment.gatewayResponse.bankCode }}</dd>
              </div>
              <div v-if="selectedPayment.gatewayResponse.referenceNumber">
                <dt class="text-sm font-medium text-gray-600">Reference Number</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ selectedPayment.gatewayResponse.referenceNumber }}</dd>
              </div>
              <div v-if="selectedPayment.gatewayResponse.approvalCode">
                <dt class="text-sm font-medium text-gray-600">Approval Code</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ selectedPayment.gatewayResponse.approvalCode }}</dd>
              </div>
              <div v-if="selectedPayment.gatewayResponse.responseMessage">
                <dt class="text-sm font-medium text-gray-600">Response Message</dt>
                <dd class="mt-1 text-sm text-green-600 font-semibold">{{ selectedPayment.gatewayResponse.responseMessage }}</dd>
              </div>
              <div v-if="selectedPayment.gatewayResponse.maskedAccountNumber">
                <dt class="text-sm font-medium text-gray-600">Account Number</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ selectedPayment.gatewayResponse.maskedAccountNumber }}</dd>
              </div>
            </dl>
          </div>

          <!-- Application Information -->
          <div v-if="application" class="mb-6 border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Application Information</h3>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-600">Application Number</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ application.applicationNumber }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">Application Type</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatType(application.type) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">Applicant Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.user?.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">IC Number</dt>
                <dd class="mt-1 text-sm text-gray-900 font-mono">{{ application.user?.icNumber }}</dd>
              </div>
            </dl>
          </div>

          <!-- Footer Note -->
          <div class="text-center pt-6 border-t border-gray-200">
            <p class="text-xs text-gray-500">
              This is an official payment receipt generated by the Malaysian Citizenship Application System.
            </p>
            <p class="text-xs text-gray-500 mt-1">
              For inquiries, please contact the relevant embassy or high commission.
            </p>
            <p class="text-xs text-gray-400 mt-2">
              Printed on {{ new Date().toLocaleString('en-MY') }}
            </p>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg print:hidden">
          <button
            @click="closeReceiptModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
          <button
            @click="printReceipt"
            class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </button>
        </div>
      </div>
    </div>

    <!-- Document Detail Modal -->
    <div v-if="showDocumentModal && selectedDocument" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" @click.self="closeDocumentModal">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Document Details</h3>
          <button
            @click="closeDocumentModal"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-6 py-6">
          <!-- Document Preview -->
          <div class="mb-6">
            <div class="bg-gray-50 h-64 flex items-center justify-center relative rounded-lg border-2 border-gray-200">
              <!-- Image Thumbnail -->
              <div v-if="selectedDocument.mimeType && selectedDocument.mimeType.startsWith('image/')" class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center rounded-lg">
                <div class="text-center">
                  <svg class="h-24 w-24 text-blue-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="mt-3 text-sm text-gray-500 font-medium">Image Document</p>
                </div>
              </div>
              <!-- PDF Icon -->
              <div v-else-if="selectedDocument.mimeType === 'application/pdf'" class="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center rounded-lg">
                <div class="text-center">
                  <svg class="h-24 w-24 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    <path d="M14 2v6h6M10 13v6m-2-2h4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <p class="mt-3 text-sm text-red-600 font-bold">PDF DOCUMENT</p>
                </div>
              </div>
              <!-- Generic File Icon -->
              <div v-else class="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-lg">
                <svg class="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <!-- Verification Badge -->
              <div class="absolute top-3 right-3">
                <span
                  :class="[
                    'px-3 py-1.5 text-sm font-semibold rounded-full shadow-lg',
                    getDocumentVerificationColor(selectedDocument.verificationStatus)
                  ]"
                >
                  {{ formatStatus(selectedDocument.verificationStatus) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Document Information -->
          <div class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-3">Document Information</h4>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-gray-600">File Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ selectedDocument.fileName }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">Document Type</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatStatus(selectedDocument.documentType) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">File Size</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatFileSize(selectedDocument.fileSize) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-600">Upload Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(selectedDocument.uploadedAt) }}</dd>
              </div>
              <div v-if="selectedDocument.verifiedAt">
                <dt class="text-sm font-medium text-gray-600">Verified Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(selectedDocument.verifiedAt) }}</dd>
              </div>
              <div v-if="selectedDocument.ocrProcessedAt">
                <dt class="text-sm font-medium text-gray-600">OCR Processed</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(selectedDocument.ocrProcessedAt) }}</dd>
              </div>
            </dl>
          </div>

          <!-- OCR Data -->
          <div v-if="selectedDocument.ocrResult && Object.keys(selectedDocument.ocrResult).length > 0" class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              OCR Extracted Data
            </h4>
            <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <dl class="grid grid-cols-1 gap-3">
                <div v-for="(value, key) in selectedDocument.ocrResult" :key="key" class="flex border-b border-blue-100 pb-2 last:border-0">
                  <dt class="text-sm font-medium text-blue-900 capitalize w-48 flex-shrink-0">{{ key.replace(/([A-Z])/g, ' $1').trim() }}:</dt>
                  <dd class="text-sm text-blue-800 flex-1">{{ value }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Verification Notes -->
          <div v-if="selectedDocument.verificationNotes" class="mb-6">
            <h4 class="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verification Notes
            </h4>
            <div class="bg-green-50 rounded-lg p-4 border border-green-100">
              <p class="text-sm text-gray-700 leading-relaxed">{{ selectedDocument.verificationNotes }}</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button
            @click="closeDocumentModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
