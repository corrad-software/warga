<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { token } = useAuth()
const router = useRouter()

const form = ref({
  type: '',
  formData: {
    // Common fields
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    currentAddress: '',
    phoneNumber: '',
    email: '',

    // Parent information
    fatherName: '',
    fatherIC: '',
    motherName: '',
    motherIC: '',

    // Additional information
    reasonForApplication: ''
  }
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const applicationTypes = [
  { value: 'BORANG_H', label: 'Borang H - Birth Abroad (Kelahiran Luar Negara)' },
  { value: 'BORANG_G', label: 'Borang G - Article 15(2) Fastlane' },
  { value: 'TADBIR_SUMPAH', label: 'Tadbir Sumpah - Oath Administration' }
]

const handleSubmit = async () => {
  if (!form.value.type) {
    error.value = 'Please select an application type'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/applications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        type: form.value.type,
        formData: form.value.formData
      }
    })

    if (response.success) {
      success.value = true
      // Redirect to application detail page
      setTimeout(() => {
        router.push(`/applications/${response.data.application.id}`)
      }, 1500)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to create application'
  } finally {
    loading.value = false
  }
}

const handleSaveDraft = async () => {
  await handleSubmit()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center">
          <button
            @click="router.push('/dashboard')"
            class="mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-900">New Application</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Success Message -->
      <div v-if="success" class="mb-6 rounded-md bg-green-50 p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="ml-3">
            <p class="text-sm text-green-700">
              Application created successfully! Redirecting...
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">
          {{ error }}
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <!-- Application Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Application Type <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.type"
              required
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select application type</option>
              <option
                v-for="type in applicationTypes"
                :key="type.value"
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>

          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  v-model="form.formData.fullName"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  v-model="form.formData.dateOfBirth"
                  type="date"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Place of Birth</label>
                <input
                  v-model="form.formData.placeOfBirth"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>

              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Current Address</label>
                <textarea
                  v-model="form.formData.currentAddress"
                  rows="3"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  v-model="form.formData.phoneNumber"
                  type="tel"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="form.formData.email"
                  type="email"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700">Father's Name</label>
                <input
                  v-model="form.formData.fatherName"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Father's IC Number</label>
                <input
                  v-model="form.formData.fatherIC"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Mother's Name</label>
                <input
                  v-model="form.formData.motherName"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Mother's IC Number</label>
                <input
                  v-model="form.formData.motherIC"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700">Reason for Application</label>
              <textarea
                v-model="form.formData.reasonForApplication"
                rows="4"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Please describe your reason for applying..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3 rounded-b-lg">
          <button
            type="button"
            @click="handleSaveDraft"
            :disabled="loading"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ loading ? 'Creating...' : 'Create Application' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>
