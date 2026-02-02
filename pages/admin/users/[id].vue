<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { token } = useAuth()
const router = useRouter()
const route = useRoute()

const userId = route.params.id as string

const user = ref<any>(null)
const loading = ref(true)
const error = ref('')

const fetchUser = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      user.value = response.data.user
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load user'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatRole = (role: string) => {
  return role.replace(/_/g, ' ')
}

const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    PEGAWAI_KONSUL: 'bg-blue-100 text-blue-800',
    PEGAWAI_PENDAFTARAN: 'bg-purple-100 text-purple-800',
    PEMOHON: 'bg-gray-100 text-gray-800'
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-bold text-gray-900">User Details</h3>
          <p class="mt-1 text-sm text-gray-600">View user information and activity</p>
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

    <!-- Error Message -->
    <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
      <div class="text-sm text-red-700">{{ error }}</div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 bg-white rounded-lg shadow">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading user details...</p>
    </div>

    <!-- User Details -->
    <div v-else-if="user" class="space-y-6">
      <!-- Personal Information Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center mb-6">
            <div class="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-blue-600 font-bold text-2xl">{{ user.name?.charAt(0) }}</span>
            </div>
            <div class="ml-6">
              <h3 class="text-2xl font-bold text-gray-900">{{ user.name }}</h3>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
              <div class="mt-2">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getRoleBadgeColor(user.role)
                  ]"
                >
                  {{ formatRole(user.role) }}
                </span>
                <span
                  :class="[
                    'ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">IC Number</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.icNumber || '-' }}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.phoneNumber || '-' }}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.dateOfBirth) }}</dd>
              </div>

              <div>
                <dt class="text-sm font-medium text-gray-500">Place of Birth</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.placeOfBirth || '-' }}</dd>
              </div>

              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-gray-500">Address</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ user.address || '-' }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Account Information Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Nationality Status</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatRole(user.nationalityStatus) }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Biometric Status</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatRole(user.biometricStatus) }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Email Verified</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ user.emailVerified ? 'Verified' : 'Not Verified' }}
                </span>
              </dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Account Status</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Created At</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.createdAt) }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(user.updatedAt) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Actions Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Actions</h4>
          <div class="flex gap-3">
            <button
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit User
            </button>
            <button
              v-if="user.isActive"
              class="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Deactivate User
            </button>
            <button
              v-else
              class="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Activate User
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
