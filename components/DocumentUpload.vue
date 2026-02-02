<script setup lang="ts">
const props = defineProps<{
  applicationId: string
}>()

const emit = defineEmits<{
  uploaded: []
}>()

const { token } = useAuth()

const selectedFile = ref<File | null>(null)
const documentType = ref('')
const uploading = ref(false)
const error = ref('')
const success = ref(false)

const documentTypes = [
  { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'IC_PARENTS', label: 'Parent IC' },
  { value: 'MARRIAGE_CERTIFICATE', label: 'Marriage Certificate' },
  { value: 'SUPPORTING_LETTER', label: 'Supporting Letter' },
  { value: 'OTHER', label: 'Other' }
]

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    error.value = ''
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    error.value = 'Please select a file'
    return
  }

  if (!documentType.value) {
    error.value = 'Please select a document type'
    return
  }

  uploading.value = true
  error.value = ''
  success.value = false

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('applicationId', props.applicationId)
    formData.append('documentType', documentType.value)

    const response = await $fetch('/api/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: formData
    })

    if (response.success) {
      success.value = true
      selectedFile.value = null
      documentType.value = ''

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      emit('uploaded')

      setTimeout(() => {
        success.value = false
      }, 3000)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to upload document'
  } finally {
    uploading.value = false
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>

    <!-- Success Message -->
    <div v-if="success" class="mb-4 rounded-md bg-green-50 p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="ml-3">
          <p class="text-sm text-green-700">Document uploaded successfully!</p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 rounded-md bg-red-50 p-4">
      <div class="text-sm text-red-700">{{ error }}</div>
    </div>

    <div class="space-y-4">
      <!-- Document Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Document Type <span class="text-red-500">*</span>
        </label>
        <select
          v-model="documentType"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select document type</option>
          <option v-for="type in documentTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>

      <!-- File Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Select File <span class="text-red-500">*</span>
        </label>
        <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
          <div class="space-y-1 text-center">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="flex text-sm text-gray-600">
              <label
                class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  type="file"
                  class="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  @change="handleFileSelect"
                >
              </label>
              <p class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs text-gray-500">
              PDF, JPG, PNG, DOC up to 10MB
            </p>
          </div>
        </div>

        <!-- Selected File Info -->
        <div v-if="selectedFile" class="mt-2 text-sm text-gray-600">
          <p>
            <strong>Selected:</strong> {{ selectedFile.name }}
            ({{ formatFileSize(selectedFile.size) }})
          </p>
        </div>
      </div>

      <!-- Upload Button -->
      <div>
        <button
          @click="handleUpload"
          :disabled="uploading || !selectedFile || !documentType"
          class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="uploading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ uploading ? 'Uploading...' : 'Upload Document' }}
        </button>
      </div>
    </div>
  </div>
</template>
