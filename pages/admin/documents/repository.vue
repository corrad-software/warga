<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { token } = useAuth()
const router = useRouter()

const activeTab = ref<'files' | 'applications'>('files')
const documents = ref<any[]>([])
const applications = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const sortBy = ref('uploadedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Application modal
const showApplicationModal = ref(false)
const selectedApplication = ref<any>(null)

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

      // Group documents by application
      const appMap = new Map()
      response.data.documents.forEach((doc: any) => {
        if (doc.application) {
          const appId = doc.application.id
          if (!appMap.has(appId)) {
            appMap.set(appId, {
              ...doc.application,
              documents: []
            })
          }
          appMap.get(appId).documents.push(doc)
        }
      })
      applications.value = Array.from(appMap.values())
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

  // Sort
  filtered = [...filtered].sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]

    if (sortBy.value === 'uploadedAt' || sortBy.value === 'verifiedAt') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return filtered
})

const filteredApplications = computed(() => {
  let filtered = applications.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((app: any) =>
      app.applicationNumber?.toLowerCase().includes(query) ||
      app.user?.name?.toLowerCase().includes(query) ||
      app.user?.icNumber?.toLowerCase().includes(query)
    )
  }

  return filtered
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-indigo-100 text-indigo-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getFileIcon = (mimeType: string) => {
  if (mimeType?.startsWith('image/')) {
    return 'text-blue-500'
  } else if (mimeType === 'application/pdf') {
    return 'text-red-500'
  } else {
    return 'text-gray-500'
  }
}

const openFile = (documentId: string) => {
  // Open file in new tab - will implement download endpoint
  window.open(`/api/documents/${documentId}/download`, '_blank')
}

const openApplicationModal = (application: any) => {
  selectedApplication.value = application
  showApplicationModal.value = true
}

const closeApplicationModal = () => {
  showApplicationModal.value = false
  selectedApplication.value = null
}

const setSortBy = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

onMounted(() => {
  fetchDocuments()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-2xl font-bold text-gray-900">Document Repository</h3>
      <p class="mt-1 text-sm text-gray-600">Fast search documents and applications</p>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'files'"
            :class="[
              activeTab === 'files'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Search Files
          </button>
          <button
            @click="activeTab = 'applications'"
            :class="[
              activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Search Applications
          </button>
        </nav>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <!-- Files Tab Filters -->
      <div v-if="activeTab === 'files'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filename, application, or name..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
          <select
            v-model="selectedType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option v-for="type in documentTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option v-for="status in verificationStatuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Applications Tab Filters -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Application number, name, or IC..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <!-- Results Count -->
      <div class="mt-3 text-sm text-gray-600">
        <span v-if="activeTab === 'files'">
          Showing <span class="font-medium text-gray-900">{{ filteredDocuments.length }}</span> of
          <span class="font-medium text-gray-900">{{ documents.length }}</span> files
        </span>
        <span v-else>
          Showing <span class="font-medium text-gray-900">{{ filteredApplications.length }}</span> of
          <span class="font-medium text-gray-900">{{ applications.length }}</span> applications
        </span>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
      <div class="text-sm text-red-700">{{ error }}</div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 bg-white rounded-lg shadow">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading...</p>
    </div>

    <!-- Files Tab Content -->
    <div v-else-if="activeTab === 'files'">
      <div v-if="filteredDocuments.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  @click="setSortBy('uploadedAt')"
                >
                  <div class="flex items-center">
                    Uploaded
                    <svg v-if="sortBy === 'uploadedAt'" class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="sortOrder === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="doc in filteredDocuments"
                :key="doc.id"
                @click="openFile(doc.id)"
                class="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td class="px-4 py-3 whitespace-nowrap">
                  <svg v-if="doc.mimeType && doc.mimeType.startsWith('image/')" :class="['h-5 w-5', getFileIcon(doc.mimeType)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg v-else-if="doc.mimeType === 'application/pdf'" :class="['h-5 w-5', getFileIcon(doc.mimeType)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                    <path d="M14 2v6h6M10 13v6m-2-2h4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <svg v-else :class="['h-5 w-5', getFileIcon(doc.mimeType)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-gray-900 truncate max-w-xs" :title="doc.fileName">{{ doc.fileName }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ formatStatus(doc.documentType) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-blue-600 font-mono">{{ doc.application?.applicationNumber || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ doc.application?.user?.name || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="['px-2 py-1 inline-flex text-xs font-semibold rounded-full', getVerificationColor(doc.verificationStatus)]">
                    {{ formatStatus(doc.verificationStatus) }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ formatFileSize(doc.fileSize) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ formatDate(doc.uploadedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No files found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
      </div>
    </div>

    <!-- Applications Tab Content -->
    <div v-else>
      <div v-if="filteredApplications.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="app in filteredApplications"
                :key="app.id"
                @click="openApplicationModal(app)"
                class="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-blue-600 font-medium">{{ app.applicationNumber }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ app.user?.name }}</div>
                  <div class="text-xs text-gray-500">{{ app.user?.icNumber }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{{ formatStatus(app.type) }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="['px-2 py-1 inline-flex text-xs font-semibold rounded-full', getStatusColor(app.status)]">
                    {{ formatStatus(app.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">{{ app.documents?.length || 0 }}</span>
                  <span class="text-xs text-gray-500"> files</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ formatDate(app.submittedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
      </div>
    </div>

    <!-- Application Files Modal -->
    <div v-if="showApplicationModal && selectedApplication" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" @click.self="closeApplicationModal">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">Application Documents</h3>
            <p class="text-sm text-gray-600 mt-1 font-mono">{{ selectedApplication.applicationNumber }}</p>
          </div>
          <button @click="closeApplicationModal" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-6 py-4">
          <!-- Applicant Info -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500">Applicant</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedApplication.user?.name }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">IC Number</p>
                <p class="text-sm font-medium text-gray-900">{{ selectedApplication.user?.icNumber }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Application Type</p>
                <p class="text-sm font-medium text-gray-900">{{ formatStatus(selectedApplication.type) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Status</p>
                <span :class="['px-2 py-1 inline-flex text-xs font-semibold rounded-full', getStatusColor(selectedApplication.status)]">
                  {{ formatStatus(selectedApplication.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Documents List -->
          <h4 class="text-sm font-medium text-gray-900 mb-3">Documents ({{ selectedApplication.documents?.length || 0 }})</h4>
          <div class="space-y-2">
            <div
              v-for="doc in selectedApplication.documents"
              :key="doc.id"
              @click="openFile(doc.id)"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div class="flex items-center flex-1 min-w-0">
                <svg v-if="doc.mimeType && doc.mimeType.startsWith('image/')" :class="['h-5 w-5 mr-3', getFileIcon(doc.mimeType)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <svg v-else-if="doc.mimeType === 'application/pdf'" :class="['h-5 w-5 mr-3', getFileIcon(doc.mimeType)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  <path d="M14 2v6h6M10 13v6m-2-2h4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <svg v-else :class="['h-5 w-5 mr-3', getFileIcon(doc.mimeType)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ doc.fileName }}</p>
                  <p class="text-xs text-gray-500">{{ formatStatus(doc.documentType) }} • {{ formatFileSize(doc.fileSize) }}</p>
                </div>
              </div>
              <span :class="['ml-4 px-2 py-1 inline-flex text-xs font-semibold rounded-full', getVerificationColor(doc.verificationStatus)]">
                {{ formatStatus(doc.verificationStatus) }}
              </span>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end rounded-b-lg">
          <button
            @click="closeApplicationModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
