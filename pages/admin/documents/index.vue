<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { token } = useAuth()
const router = useRouter()

const documents = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')

const documentTypes = [
  { value: '', label: 'All Types' },
  { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
  { value: 'IC_PARENTS', label: 'IC Parents' },
  { value: 'MARRIAGE_CERTIFICATE', label: 'Marriage Certificate' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'SUPPORTING_LETTER', label: 'Supporting Letter' },
  { value: 'OTHER', label: 'Other' }
]

const verificationStatuses = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'OCR_PROCESSING', label: 'OCR Processing' },
  { value: 'OCR_COMPLETED', label: 'OCR Completed' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'REQUIRES_MANUAL_CHECK', label: 'Requires Manual Check' }
]

const fetchDocuments = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/documents', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      documents.value = response.data.documents
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load documents'
  } finally {
    loading.value = false
  }
}

const filteredDocuments = computed(() => {
  let filtered = documents.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((doc: any) =>
      doc.fileName?.toLowerCase().includes(query) ||
      doc.application?.applicationNumber?.toLowerCase().includes(query) ||
      doc.application?.user?.name?.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter((doc: any) => doc.documentType === selectedType.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter((doc: any) => doc.verificationStatus === selectedStatus.value)
  }

  return filtered
})

// Statistics computed properties
const stats = computed(() => {
  const docs = documents.value

  return {
    total: docs.length,
    pending: docs.filter(d => d.verificationStatus === 'PENDING').length,
    ocrProcessing: docs.filter(d => d.verificationStatus === 'OCR_PROCESSING').length,
    ocrCompleted: docs.filter(d => d.verificationStatus === 'OCR_COMPLETED').length,
    verified: docs.filter(d => d.verificationStatus === 'VERIFIED').length,
    rejected: docs.filter(d => d.verificationStatus === 'REJECTED').length,
    manualCheck: docs.filter(d => d.verificationStatus === 'REQUIRES_MANUAL_CHECK').length,

    // By type
    byType: {
      birthCertificate: docs.filter(d => d.documentType === 'BIRTH_CERTIFICATE').length,
      icParents: docs.filter(d => d.documentType === 'IC_PARENTS').length,
      marriageCert: docs.filter(d => d.documentType === 'MARRIAGE_CERTIFICATE').length,
      passport: docs.filter(d => d.documentType === 'PASSPORT').length,
      supportingLetter: docs.filter(d => d.documentType === 'SUPPORTING_LETTER').length,
      other: docs.filter(d => d.documentType === 'OTHER').length,
    }
  }
})

// Percentages
const verifiedPercentage = computed(() => {
  if (stats.value.total === 0) return '0.0'
  return ((stats.value.verified / stats.value.total) * 100).toFixed(1)
})

const rejectedPercentage = computed(() => {
  if (stats.value.total === 0) return '0.0'
  return ((stats.value.rejected / stats.value.total) * 100).toFixed(1)
})

const pendingPercentage = computed(() => {
  if (stats.value.total === 0) return '0.0'
  return ((stats.value.pending / stats.value.total) * 100).toFixed(1)
})

const ocrSuccessRate = computed(() => {
  const total = stats.value.ocrProcessing + stats.value.ocrCompleted + stats.value.manualCheck
  if (total === 0) return '0.0'
  const successful = stats.value.ocrCompleted
  return ((successful / total) * 100).toFixed(1)
})

// Get max count for horizontal bar chart
const maxTypeCount = computed(() => {
  const counts = Object.values(stats.value.byType)
  return Math.max(...counts, 1)
})

const formatDate = (date: string) => {
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

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const getVerificationColor = (status: string) => {
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

const viewDocument = (documentId: string, applicationId: string) => {
  router.push(`/admin/applications/${applicationId}`)
}

onMounted(() => {
  fetchDocuments()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h3 class="text-2xl font-bold text-gray-900">Documents Dashboard</h3>
      <p class="mt-1 text-sm text-gray-600">Overview and statistics of all documents</p>
    </div>

    <!-- Statistics Section -->
    <div v-if="!loading" class="mb-8">
      <!-- Row 1: Overview Stats (4 cards) -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-5">
        <!-- Total Documents Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Documents</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-blue-600">{{ stats.total }}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Review Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-yellow-600">{{ stats.pending }}</div>
                    <div class="ml-2 text-sm text-gray-600">{{ pendingPercentage }}%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Verified Documents Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Verified</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-green-600">{{ stats.verified }}</div>
                    <div class="ml-2 text-sm text-gray-600">{{ verifiedPercentage }}%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Rejected Documents Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-red-600">{{ stats.rejected }}</div>
                    <div class="ml-2 text-sm text-gray-600">{{ rejectedPercentage }}%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Document Types Breakdown -->
      <div class="bg-white shadow rounded-lg p-5 mb-5">
        <h4 class="text-sm font-medium text-gray-900 mb-4">Documents by Type</h4>
        <div class="space-y-3">
          <!-- Birth Certificate -->
          <div>
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-700">Birth Certificate</span>
              <span class="font-medium text-gray-900">{{ stats.byType.birthCertificate }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all"
                :style="{ width: `${(stats.byType.birthCertificate / maxTypeCount) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- IC Parents -->
          <div>
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-700">IC Parents</span>
              <span class="font-medium text-gray-900">{{ stats.byType.icParents }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-indigo-600 h-2 rounded-full transition-all"
                :style="{ width: `${(stats.byType.icParents / maxTypeCount) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Marriage Certificate -->
          <div>
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-700">Marriage Certificate</span>
              <span class="font-medium text-gray-900">{{ stats.byType.marriageCert }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-purple-600 h-2 rounded-full transition-all"
                :style="{ width: `${(stats.byType.marriageCert / maxTypeCount) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Passport -->
          <div>
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-700">Passport</span>
              <span class="font-medium text-gray-900">{{ stats.byType.passport }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-pink-600 h-2 rounded-full transition-all"
                :style="{ width: `${(stats.byType.passport / maxTypeCount) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Supporting Letter -->
          <div>
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-700">Supporting Letter</span>
              <span class="font-medium text-gray-900">{{ stats.byType.supportingLetter }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-600 h-2 rounded-full transition-all"
                :style="{ width: `${(stats.byType.supportingLetter / maxTypeCount) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- Other -->
          <div v-if="stats.byType.other > 0">
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-gray-700">Other</span>
              <span class="font-medium text-gray-900">{{ stats.byType.other }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-gray-600 h-2 rounded-full transition-all"
                :style="{ width: `${(stats.byType.other / maxTypeCount) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: Status Details (2 cards) -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <!-- Verification Status Breakdown -->
        <div class="bg-white shadow rounded-lg p-5">
          <h4 class="text-sm font-medium text-gray-900 mb-4">Verification Status</h4>
          <dl class="space-y-2">
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <dt class="flex items-center text-sm text-gray-700">
                <span class="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                Pending
              </dt>
              <dd class="text-sm font-medium text-gray-900">{{ stats.pending }} <span class="text-gray-500">({{ pendingPercentage }}%)</span></dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <dt class="flex items-center text-sm text-gray-700">
                <span class="h-2 w-2 rounded-full bg-cyan-400 mr-2"></span>
                OCR Completed
              </dt>
              <dd class="text-sm font-medium text-gray-900">{{ stats.ocrCompleted }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <dt class="flex items-center text-sm text-gray-700">
                <span class="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                Verified
              </dt>
              <dd class="text-sm font-medium text-gray-900">{{ stats.verified }} <span class="text-gray-500">({{ verifiedPercentage }}%)</span></dd>
            </div>
            <div class="flex items-center justify-between py-2">
              <dt class="flex items-center text-sm text-gray-700">
                <span class="h-2 w-2 rounded-full bg-red-400 mr-2"></span>
                Rejected
              </dt>
              <dd class="text-sm font-medium text-gray-900">{{ stats.rejected }} <span class="text-gray-500">({{ rejectedPercentage }}%)</span></dd>
            </div>
          </dl>
        </div>

        <!-- OCR Processing Status -->
        <div class="bg-white shadow rounded-lg p-5">
          <h4 class="text-sm font-medium text-gray-900 mb-4">OCR Processing</h4>
          <dl class="space-y-2">
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <dt class="flex items-center text-sm text-gray-700">
                <span class="h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
                OCR Processing
              </dt>
              <dd class="text-sm font-medium text-gray-900">{{ stats.ocrProcessing }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <dt class="flex items-center text-sm text-gray-700">
                <span class="h-2 w-2 rounded-full bg-cyan-400 mr-2"></span>
                OCR Completed
              </dt>
              <dd class="text-sm font-medium text-gray-900">{{ stats.ocrCompleted }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <dt class="flex items-center text-sm text-gray-700">
                <span class="h-2 w-2 rounded-full bg-yellow-400 mr-2"></span>
                Manual Check Required
              </dt>
              <dd class="text-sm font-medium text-gray-900">{{ stats.manualCheck }}</dd>
            </div>
            <div class="flex items-center justify-between py-2 bg-blue-50 -mx-5 px-5 mt-3 rounded">
              <dt class="text-sm font-semibold text-blue-900">
                Success Rate
              </dt>
              <dd class="text-sm font-bold text-blue-900">{{ ocrSuccessRate }}%</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by filename, application, or name..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Document Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
          <select
            v-model="selectedType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="type in documentTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <!-- Verification Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="status in verificationStatuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
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
      <p class="mt-2 text-gray-600">Loading documents...</p>
    </div>

    <!-- Documents Grid -->
    <div v-else-if="filteredDocuments.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="doc in filteredDocuments"
        :key="doc.id"
        @click="viewDocument(doc.id, doc.applicationId)"
        class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group bg-white"
      >
        <!-- Document Thumbnail/Icon -->
        <div class="bg-gray-50 h-32 flex items-center justify-center relative">
          <!-- Image Thumbnail -->
          <div v-if="doc.mimeType && doc.mimeType.startsWith('image/')" class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
            <svg class="h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <!-- PDF Icon -->
          <div v-else-if="doc.mimeType === 'application/pdf'" class="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
            <svg class="h-12 w-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
              <path d="M14 2v6h6M10 13v6m-2-2h4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <!-- Generic File Icon -->
          <div v-else class="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <!-- Verification Badge -->
          <div class="absolute top-2 right-2">
            <span
              :class="[
                'px-2 py-1 text-xs font-semibold rounded-full shadow-sm',
                getVerificationColor(doc.verificationStatus)
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
        <div class="p-3 bg-white">
          <p class="text-xs font-medium text-gray-900 truncate" :title="doc.fileName">
            {{ doc.fileName }}
          </p>
          <p class="text-xs text-gray-500 truncate mt-1">{{ formatStatus(doc.documentType) }}</p>
          <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{{ formatFileSize(doc.fileSize) }}</span>
            <span>{{ formatDate(doc.uploadedAt) }}</span>
          </div>
          <p v-if="doc.application" class="text-xs text-blue-600 truncate mt-1" :title="doc.application.applicationNumber">
            {{ doc.application.applicationNumber }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
    </div>
  </div>
</template>
