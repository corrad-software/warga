<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user, logout, token } = useAuth()
const router = useRouter()

const applications = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const stats = ref({
  total: 0,
  pending: 0,
  underReview: 0,
  approved: 0
})

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

const fetchApplications = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/applications', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      applications.value = response.data.applications

      // Calculate stats
      stats.value.total = applications.value.length
      stats.value.pending = applications.value.filter((app: any) =>
        ['SUBMITTED', 'PENDING_REVIEW'].includes(app.status)
      ).length
      stats.value.underReview = applications.value.filter((app: any) =>
        app.status === 'UNDER_REVIEW'
      ).length
      stats.value.approved = applications.value.filter((app: any) =>
        ['APPROVED', 'CERTIFICATE_ISSUED', 'COMPLETED'].includes(app.status)
      ).length
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load applications'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

onMounted(() => {
  fetchApplications()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <img src="/assets/images/jpn_logo.png" alt="JPN Logo" class="h-12 w-auto hidden sm:block" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
            <p class="text-sm text-gray-600">{{ user?.name }} | {{ user?.role?.replace(/_/g, ' ') }}</p>
          </div>
        </div>
        <button
          @click="logout"
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Logout
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.total }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

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
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.pending }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Under Review</dt>
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.underReview }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

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
                  <dt class="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd class="text-lg font-semibold text-gray-900">{{ stats.approved }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">
          {{ error }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading applications...</p>
      </div>

      <!-- Applications List -->
      <div v-else-if="applications.length > 0">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Applications</h2>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            <li
              v-for="application in applications"
              :key="application.id"
              class="hover:bg-gray-50 cursor-pointer"
              @click="router.push(`/applications/${application.id}`)"
            >
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-blue-600 truncate">
                      {{ application.applicationNumber }}
                    </p>
                    <p class="mt-1 text-sm text-gray-600">
                      Applicant: {{ application.user?.name }}
                    </p>
                    <p class="text-sm text-gray-600">
                      Type: {{ application.type.replace(/_/g, ' ') }}
                    </p>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <span
                      :class="[
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        statusColors[application.status] || 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ formatStatus(application.status) }}
                    </span>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                      Created: {{ formatDate(application.createdAt) }}
                    </p>
                  </div>
                  <div v-if="application.submissionDate" class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    Submitted: {{ formatDate(application.submissionDate) }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No applications</h3>
        <p class="mt-1 text-sm text-gray-500">No applications have been submitted yet.</p>
      </div>
    </main>
  </div>
</template>
