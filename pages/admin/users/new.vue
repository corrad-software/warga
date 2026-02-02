<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { token } = useAuth()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref(false)

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'PEMOHON',
  icNumber: '',
  phoneNumber: '',
  address: '',
  dateOfBirth: '',
  placeOfBirth: ''
})

const roles = [
  { value: 'PEMOHON', label: 'Applicant (Pemohon)' },
  { value: 'PEGAWAI_KONSUL', label: 'Consular Officer' },
  { value: 'PEGAWAI_PENDAFTARAN', label: 'Registration Officer' },
  { value: 'ADMIN', label: 'Administrator' }
]

const validateForm = () => {
  error.value = ''

  if (!formData.value.name || !formData.value.email || !formData.value.password) {
    error.value = 'Name, email, and password are required'
    return false
  }

  if (formData.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return false
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    error.value = 'Please enter a valid email address'
    return false
  }

  return true
}

const createUser = async () => {
  if (!validateForm()) return

  loading.value = true
  error.value = ''
  success.value = false

  try {
    const response = await $fetch('/api/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password,
        role: formData.value.role,
        icNumber: formData.value.icNumber || undefined,
        phoneNumber: formData.value.phoneNumber || undefined,
        address: formData.value.address || undefined,
        dateOfBirth: formData.value.dateOfBirth || undefined,
        placeOfBirth: formData.value.placeOfBirth || undefined
      }
    })

    if (response.success) {
      success.value = true
      // Reset form
      formData.value = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'PEMOHON',
        icNumber: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        placeOfBirth: ''
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/users')
      }, 2000)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to create user'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-bold text-gray-900">Add New User</h3>
          <p class="mt-1 text-sm text-gray-600">Create a new user account</p>
        </div>
        <NuxtLink
          to="/admin/users"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </NuxtLink>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mb-6 rounded-md bg-green-50 p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">
            User created successfully! Redirecting...
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="createUser" class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6 space-y-6">
        <!-- Account Information -->
        <div>
          <h4 class="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- Name -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Enter full name"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="user@example.com"
              />
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Role <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.role"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option v-for="role in roles" :key="role.value" :value="role.value">
                  {{ role.label }}
                </option>
              </select>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Password <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.password"
                type="password"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Minimum 8 characters"
              />
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Confirm Password <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.confirmPassword"
                type="password"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Re-enter password"
              />
            </div>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="pt-6 border-t border-gray-200">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Personal Information (Optional)</h4>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <!-- IC Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700">IC Number</label>
              <input
                v-model="formData.icNumber"
                type="text"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="e.g., 901234-56-7890"
              />
            </div>

            <!-- Phone Number -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                v-model="formData.phoneNumber"
                type="tel"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="+60123456789"
              />
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                v-model="formData.dateOfBirth"
                type="date"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <!-- Place of Birth -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Place of Birth</label>
              <input
                v-model="formData.placeOfBirth"
                type="text"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="City, Country"
              />
            </div>

            <!-- Address -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                v-model="formData.address"
                rows="3"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Full address"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
        <NuxtLink
          to="/admin/users"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
        >
          Cancel
        </NuxtLink>
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Creating...' : 'Create User' }}
        </button>
      </div>
    </form>
  </div>
</template>
