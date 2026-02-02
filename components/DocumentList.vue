<script setup lang="ts">
const props = defineProps<{
  applicationId: string
}>()

const { token } = useAuth()

const documents = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const selectedDocument = ref<string | null>(null)
const showUploadModal = ref(false)

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  OCR_PROCESSING: 'bg-blue-100 text-blue-800',
  OCR_COMPLETED: 'bg-green-100 text-green-800',
  VERIFIED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  REQUIRES_MANUAL_CHECK: 'bg-yellow-100 text-yellow-800'
}

const fetchDocuments = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/documents?applicationId=${props.applicationId}`, {
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

const openViewer = (documentId: string) => {
  selectedDocument.value = documentId
}

const closeViewer = () => {
  selectedDocument.value = null
}

const handleUploaded = () => {
  showUploadModal.value = false
  fetchDocuments()
}

const handleDeleted = () => {
  selectedDocument.value = null
  fetchDocuments()
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

const getThumbnailUrl = (doc: any) => {
  if (doc.mimeType.startsWith('image/')) {
    return `/api/documents/${doc.id}/download?inline=true`
  }
  return null
}

onMounted(() => {
  fetchDocuments()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header with Upload Button -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">Documents</h3>
      <button
        @click="showUploadModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Upload Document
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading documents...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-md bg-red-50 p-4">
      <div class="text-sm text-red-700">{{ error }}</div>
    </div>

    <!-- Documents Grid -->
    <div v-else-if="documents.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="doc in documents"
        :key="doc.id"
        @click="openViewer(doc.id)"
        class="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      >
        <!-- Thumbnail -->
        <div class="h-40 bg-gray-100 flex items-center justify-center relative">
          <!-- Image Thumbnail -->
          <img
            v-if="getThumbnailUrl(doc)"
            :src="getThumbnailUrl(doc)"
            :alt="doc.fileName"
            class="h-full w-full object-cover"
          />

          <!-- PDF Icon -->
          <div v-else-if="doc.mimeType === 'application/pdf'" class="text-red-500">
            <svg class="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
              <text x="5" y="14" font-size="4" fill="currentColor">PDF</text>
            </svg>
          </div>

          <!-- Generic Document Icon -->
          <div v-else class="text-gray-400">
            <svg class="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <!-- OCR Processing Indicator -->
          <div v-if="doc.verificationStatus === 'OCR_PROCESSING'" class="absolute top-2 right-2">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>

        <!-- Document Info -->
        <div class="p-4">
          <h4 class="text-sm font-medium text-gray-900 truncate" :title="doc.fileName">
            {{ doc.fileName }}
          </h4>
          <p class="text-xs text-gray-500 mt-1">
            {{ doc.documentType.replace(/_/g, ' ') }}
          </p>
          <div class="mt-2 flex items-center justify-between">
            <span :class="['px-2 py-1 text-xs font-semibold rounded-full', statusColors[doc.verificationStatus]]">
              {{ formatStatus(doc.verificationStatus) }}
            </span>
            <span class="text-xs text-gray-500">
              {{ (doc.fileSize / 1024).toFixed(1) }} KB
            </span>
          </div>

          <!-- OCR Confidence -->
          <div v-if="doc.ocrResult?.confidence" class="mt-2">
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>OCR Confidence</span>
              <span>{{ Math.round(doc.ocrResult.confidence * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div
                :class="[
                  'h-1.5 rounded-full',
                  doc.ocrResult.confidence >= 0.8 ? 'bg-green-500' :
                  doc.ocrResult.confidence >= 0.6 ? 'bg-yellow-500' :
                  'bg-red-500'
                ]"
                :style="{ width: (doc.ocrResult.confidence * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No documents</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
      <div class="mt-6">
        <button
          @click="showUploadModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Upload Document
        </button>
      </div>
    </div>

    <!-- Document Viewer Modal -->
    <DocumentViewer
      v-if="selectedDocument"
      :documentId="selectedDocument"
      :show="!!selectedDocument"
      @close="closeViewer"
      @deleted="handleDeleted"
    />

    <!-- Upload Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="upload-modal"
      role="dialog"
      aria-modal="true"
    >
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="showUploadModal = false"></div>

      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Upload Document</h3>
            <button
              @click="showUploadModal = false"
              class="rounded-md text-gray-400 hover:text-gray-500"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-4">
            <DocumentUpload
              :applicationId="applicationId"
              @uploaded="handleUploaded"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
