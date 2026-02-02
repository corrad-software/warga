<script setup lang="ts">
const props = defineProps<{
  documentId: string
  show?: boolean
}>()

const emit = defineEmits<{
  close: []
  deleted: []
}>()

const { token, user } = useAuth()

const document = ref<any>(null)
const loading = ref(true)
const error = ref('')
const deleting = ref(false)

const downloadUrl = computed(() => {
  return `/api/documents/${props.documentId}/download?inline=true`
})

const isPDF = computed(() => {
  return document.value?.mimeType === 'application/pdf'
})

const isImage = computed(() => {
  return document.value?.mimeType?.startsWith('image/')
})

const canDelete = computed(() => {
  if (!user.value || !document.value) return false
  return ['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(user.value.role)
})

const ocrText = computed(() => {
  return document.value?.ocrResult?.text || 'No OCR data available'
})

const ocrConfidence = computed(() => {
  const confidence = document.value?.ocrResult?.confidence
  return confidence ? Math.round(confidence * 100) : 0
})

const extractedFields = computed(() => {
  return document.value?.ocrResult?.metadata?.detectedFields || {}
})

const fetchDocument = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/documents/${props.documentId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      document.value = response.data.document
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load document'
  } finally {
    loading.value = false
  }
}

const handleDownload = () => {
  window.open(`/api/documents/${props.documentId}/download`, '_blank')
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this document?')) return

  deleting.value = true

  try {
    await $fetch(`/api/documents/${props.documentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    emit('deleted')
    emit('close')
  } catch (err: any) {
    alert(err.data?.message || 'Failed to delete document')
  } finally {
    deleting.value = false
  }
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-800',
    OCR_PROCESSING: 'bg-blue-100 text-blue-800',
    OCR_COMPLETED: 'bg-green-100 text-green-800',
    VERIFIED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    REQUIRES_MANUAL_CHECK: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchDocument()
  }
})

onMounted(() => {
  if (props.show) {
    fetchDocument()
  }
})
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="emit('close')"></div>

    <!-- Modal panel -->
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
        <!-- Header -->
        <div class="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900">
              {{ document?.fileName || 'Loading...' }}
            </h3>
            <div v-if="document" class="mt-1 flex items-center gap-2">
              <span :class="['px-2 py-1 text-xs font-semibold rounded-full', statusColor(document.verificationStatus)]">
                {{ formatStatus(document.verificationStatus) }}
              </span>
              <span class="text-xs text-gray-500">
                {{ document.documentType.replace(/_/g, ' ') }}
              </span>
            </div>
          </div>
          <button
            @click="emit('close')"
            class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="px-4 py-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading document...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="px-4 py-12">
          <div class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">{{ error }}</div>
          </div>
        </div>

        <!-- Document Content -->
        <div v-else class="bg-gray-50">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            <!-- Document Preview (2/3 width) -->
            <div class="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
              <!-- PDF Viewer -->
              <iframe
                v-if="isPDF"
                :src="downloadUrl"
                class="w-full h-96 lg:h-[600px]"
                frameborder="0"
              ></iframe>

              <!-- Image Viewer -->
              <div v-else-if="isImage" class="p-4">
                <img
                  :src="downloadUrl"
                  :alt="document.fileName"
                  class="w-full h-auto max-h-[600px] object-contain"
                />
              </div>

              <!-- Unsupported Type -->
              <div v-else class="p-12 text-center text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="mt-2">Preview not available for this file type</p>
                <button
                  @click="handleDownload"
                  class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Download to view
                </button>
              </div>
            </div>

            <!-- OCR Results Panel (1/3 width) -->
            <div class="bg-white rounded-lg shadow p-4 max-h-[600px] overflow-y-auto">
              <h4 class="text-sm font-medium text-gray-900 mb-3">OCR Results</h4>

              <!-- OCR Status -->
              <div class="mb-4">
                <div class="text-xs text-gray-500 mb-1">Status</div>
                <span :class="['px-2 py-1 text-xs font-semibold rounded-full', statusColor(document.verificationStatus)]">
                  {{ formatStatus(document.verificationStatus) }}
                </span>
              </div>

              <!-- Confidence Score -->
              <div v-if="ocrConfidence > 0" class="mb-4">
                <div class="text-xs text-gray-500 mb-1">Confidence</div>
                <div class="flex items-center">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      :class="[
                        'h-2 rounded-full',
                        ocrConfidence >= 80 ? 'bg-green-500' :
                        ocrConfidence >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      ]"
                      :style="{ width: ocrConfidence + '%' }"
                    ></div>
                  </div>
                  <span class="ml-2 text-sm font-medium text-gray-900">{{ ocrConfidence }}%</span>
                </div>
              </div>

              <!-- Extracted Fields -->
              <div v-if="Object.keys(extractedFields).length > 0" class="mb-4">
                <div class="text-xs text-gray-500 mb-2">Extracted Data</div>
                <div class="space-y-2">
                  <div
                    v-for="(value, key) in extractedFields"
                    :key="key"
                    class="text-sm"
                  >
                    <span class="font-medium text-gray-700">{{ key }}:</span>
                    <span class="text-gray-900 ml-1">{{ value }}</span>
                  </div>
                </div>
              </div>

              <!-- OCR Text -->
              <div class="mb-4">
                <div class="text-xs text-gray-500 mb-2">Extracted Text</div>
                <pre class="text-xs bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap max-h-64 overflow-y-auto">{{ ocrText }}</pre>
              </div>

              <!-- Verification Notes -->
              <div v-if="document.verificationNotes" class="mb-4">
                <div class="text-xs text-gray-500 mb-1">Notes</div>
                <p class="text-sm text-gray-900">{{ document.verificationNotes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-500">
            Size: {{ (document?.fileSize / 1024).toFixed(2) }} KB
            <span v-if="document?.uploadedAt" class="ml-4">
              Uploaded: {{ new Date(document.uploadedAt).toLocaleDateString() }}
            </span>
          </div>
          <div class="flex gap-3">
            <button
              @click="handleDownload"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              v-if="canDelete"
              @click="handleDelete"
              :disabled="deleting"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
