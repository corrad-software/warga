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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Applicant Dashboard</h1>
            <p class="text-sm text-gray-600">Welcome, {{ user?.name }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink
              to="/dashboard"
              class="text-sm font-medium text-gray-700 hover:text-blue-600 hidden sm:block"
            >
              My Applications
            </NuxtLink>
            <NuxtLink
              to="/payments"
              class="text-sm font-medium text-gray-700 hover:text-blue-600 hidden sm:block"
            >
              My Payments
            </NuxtLink>
            <button
              @click="logout"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <!-- Statistics Overview -->
      <div v-if="!loading" class="mb-8">
        <!-- Summary Cards - 4 Columns -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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

          <!-- Approved -->
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
                      Approved
                    </dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">
                        5
                      </div>
                    </dd>
                    <dd class="text-xs text-gray-500 mt-1">
                      Completed
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Rejected -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="rounded-md bg-red-500 p-3">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                      Rejected
                    </dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">
                        1
                      </div>
                    </dd>
                    <dd class="text-xs text-gray-500 mt-1">
                      Requires resubmission
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
          <!-- Bar Chart - Application Status -->
          <div class="bg-white shadow rounded-lg p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Application Status Distribution</h4>
            <div class="space-y-4">
              <!-- Bar 1 - Submitted -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">Submitted</span>
                  <span class="text-sm font-medium text-gray-700">2</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-blue-600 h-3 rounded-full transition-all duration-300" style="width: 22%"></div>
                </div>
              </div>

              <!-- Bar 2 - Under Review -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">Under Review</span>
                  <span class="text-sm font-medium text-gray-700">3</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-yellow-500 h-3 rounded-full transition-all duration-300" style="width: 33%"></div>
                </div>
              </div>

              <!-- Bar 3 - Approved -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">Approved</span>
                  <span class="text-sm font-medium text-gray-700">5</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-green-600 h-3 rounded-full transition-all duration-300" style="width: 56%"></div>
                </div>
              </div>

              <!-- Bar 4 - Rejected -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">Rejected</span>
                  <span class="text-sm font-medium text-gray-700">1</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-red-600 h-3 rounded-full transition-all duration-300" style="width: 11%"></div>
                </div>
              </div>

              <!-- Bar 5 - Pending Payment -->
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">Pending Payment</span>
                  <span class="text-sm font-medium text-gray-700">4</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div class="bg-orange-500 h-3 rounded-full transition-all duration-300" style="width: 44%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Line Chart - Application Trend -->
          <div class="bg-white shadow rounded-lg p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Application Trend (Last 6 Months)</h4>
            <div class="relative">
              <!-- Y-axis labels -->
              <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                <span>10</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
              </div>

              <!-- Chart area -->
              <div class="ml-8">
                <svg viewBox="0 0 400 200" class="w-full h-48">
                  <!-- Grid lines -->
                  <line x1="0" y1="0" x2="400" y2="0" stroke="#e5e7eb" stroke-width="1"/>
                  <line x1="0" y1="40" x2="400" y2="40" stroke="#e5e7eb" stroke-width="1"/>
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#e5e7eb" stroke-width="1"/>
                  <line x1="0" y1="120" x2="400" y2="120" stroke="#e5e7eb" stroke-width="1"/>
                  <line x1="0" y1="160" x2="400" y2="160" stroke="#e5e7eb" stroke-width="1"/>
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#e5e7eb" stroke-width="1"/>

                  <!-- Line chart path (hardcoded data: 3, 5, 4, 7, 6, 9) -->
                  <polyline
                    points="0,140 80,100 160,120 240,60 320,80 400,20"
                    fill="none"
                    stroke="#3B82F6"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <!-- Data points -->
                  <circle cx="0" cy="140" r="4" fill="#3B82F6"/>
                  <circle cx="80" cy="100" r="4" fill="#3B82F6"/>
                  <circle cx="160" cy="120" r="4" fill="#3B82F6"/>
                  <circle cx="240" cy="60" r="4" fill="#3B82F6"/>
                  <circle cx="320" cy="80" r="4" fill="#3B82F6"/>
                  <circle cx="400" cy="20" r="4" fill="#3B82F6"/>

                  <!-- Fill area under line -->
                  <polygon
                    points="0,200 0,140 80,100 160,120 240,60 320,80 400,20 400,200"
                    fill="#3B82F6"
                    opacity="0.1"
                  />
                </svg>

                <!-- X-axis labels -->
                <div class="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                  <span>Jan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Donut Chart and Quick Stats -->
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-3 mb-8">
          <!-- Donut Chart - Application Types -->
          <div class="bg-white shadow rounded-lg p-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Application Types</h4>
            <div class="flex items-center justify-center">
              <svg viewBox="0 0 200 200" class="w-40 h-40">
                <!-- Background circle -->
                <circle cx="100" cy="100" r="80" fill="#f3f4f6"/>

                <!-- Citizenship: 60% (blue) -->
                <circle
                  cx="100"
                  cy="100"
                  r="40"
                  fill="none"
                  stroke="#3B82F6"
                  stroke-width="80"
                  stroke-dasharray="150.8 251.3"
                  transform="rotate(-90 100 100)"
                />

                <!-- Registration: 30% (green) -->
                <circle
                  cx="100"
                  cy="100"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  stroke-width="80"
                  stroke-dasharray="75.4 251.3"
                  transform="rotate(126 100 100)"
                />

                <!-- Others: 10% (purple) -->
                <circle
                  cx="100"
                  cy="100"
                  r="40"
                  fill="none"
                  stroke="#8B5CF6"
                  stroke-width="80"
                  stroke-dasharray="25.1 251.3"
                  transform="rotate(234 100 100)"
                />

                <!-- Center white circle -->
                <circle cx="100" cy="100" r="50" fill="white"/>

                <!-- Center text -->
                <text x="100" y="100" text-anchor="middle" dy=".3em" class="text-2xl font-bold fill-gray-900">
                  9
                </text>
                <text x="100" y="120" text-anchor="middle" class="text-xs fill-gray-500">
                  Total
                </text>
              </svg>
            </div>

            <!-- Legend -->
            <div class="mt-4 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-700">Citizenship</span>
                </div>
                <span class="text-sm font-medium text-gray-900">60%</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-700">Registration</span>
                </div>
                <span class="text-sm font-medium text-gray-900">30%</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-700">Others</span>
                </div>
                <span class="text-sm font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white shadow rounded-lg p-6 lg:col-span-2">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
            <div class="flow-root">
              <ul class="-mb-8">
                <!-- Activity 1 -->
                <li>
                  <div class="relative pb-8">
                    <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p class="text-sm text-gray-900">Application <span class="font-medium">#APP-2024-001</span> approved</p>
                          <p class="mt-0.5 text-xs text-gray-500">Your citizenship application has been approved</p>
                        </div>
                        <div class="text-right text-xs whitespace-nowrap text-gray-500">
                          2 days ago
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                <!-- Activity 2 -->
                <li>
                  <div class="relative pb-8">
                    <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p class="text-sm text-gray-900">Documents verified for <span class="font-medium">#APP-2024-002</span></p>
                          <p class="mt-0.5 text-xs text-gray-500">All required documents have been verified</p>
                        </div>
                        <div class="text-right text-xs whitespace-nowrap text-gray-500">
                          3 days ago
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                <!-- Activity 3 -->
                <li>
                  <div class="relative">
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                          <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                          </svg>
                        </span>
                      </div>
                      <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p class="text-sm text-gray-900">New application <span class="font-medium">#APP-2024-003</span> submitted</p>
                          <p class="mt-0.5 text-xs text-gray-500">Your application is under review</p>
                        </div>
                        <div class="text-right text-xs whitespace-nowrap text-gray-500">
                          5 days ago
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
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
  </div>
</template>
