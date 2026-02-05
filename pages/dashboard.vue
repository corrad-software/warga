<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user, logout, token } = useAuth()
const router = useRouter()

const applications = ref([])
const loading = ref(true)
const error = ref('')

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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Left: Logo and System Name -->
          <div class="flex items-center space-x-3">
            <img src="/images/jpn_logo.png" alt="JPN Logo" class="h-10 w-auto" />
            <div>
              <h1 class="text-lg font-bold text-gray-900">SPK</h1>
              <p class="text-xs text-gray-600">Sistem Pengurusan Kewarganegaraan</p>
            </div>
          </div>

          <!-- Right: Menu -->
          <nav class="flex items-center space-x-6">
            <NuxtLink
              to="/dashboard"
              class="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              My Applications
            </NuxtLink>
            <NuxtLink
              to="/payments"
              class="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              My Payments
            </NuxtLink>
            <button
              @click="logout"
              class="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Welcome, {{ user?.name }}</h2>
        <p class="text-gray-600 mt-2">Manage your citizenship applications</p>
      </div>

      <!-- Actions -->
      <div class="mb-6 flex flex-wrap gap-3">
        <button
          @click="router.push('/applications/new')"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Application
        </button>
        <button
          @click="router.push('/payments')"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          My Payments
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">
          {{ error }}
        </div>
      </div>

      <!-- Quick Stats -->
      <div v-if="!loading && applications.length > 0" class="mb-6">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-3">
          <!-- Total Applications -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="rounded-md bg-blue-500 p-3">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Total Applications
                    </dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">
                        {{ applications.length }}
                      </div>
                    </dd>
                    <dd class="text-xs text-gray-500 mt-1">
                      All time
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- In Progress -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="rounded-md bg-yellow-500 p-3">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      In Progress
                    </dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">
                        3
                      </div>
                    </dd>
                    <dd class="text-xs text-gray-500 mt-1">
                      Pending review
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Completed -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="rounded-md bg-green-500 p-3">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Completed
                    </dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">
                        {{ applications.filter(app => app.status === 'COMPLETED' || app.status === 'APPROVED' || app.status === 'CERTIFICATE_ISSUED').length }}
                      </div>
                    </dd>
                    <dd class="text-xs text-gray-500 mt-1">
                      Successfully processed
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading your applications...</p>
      </div>

      <!-- Applications List -->
      <div v-else-if="applications.length > 0" class="bg-white shadow overflow-hidden sm:rounded-md">
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
                    <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Created: {{ formatDate(application.createdAt) }}
                  </p>
                </div>
                <div v-if="application.submissionDate" class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submitted: {{ formatDate(application.submissionDate) }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No applications</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new application.</p>
        <div class="mt-6">
          <button
            @click="router.push('/applications/new')"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Application
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-center text-sm text-gray-600">
          © 2025 Sistem Pengurusan Kewarganegaraan (SPK) - Jabatan Pendaftaran Negara Malaysia
        </p>
      </div>
    </footer>
  </div>
</template>
