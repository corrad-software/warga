<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { token } = useAuth()
const users = ref<any[]>([])
const loading = ref(true)
const error = ref('')

// Filters
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

const roles = ['PEMOHON', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN']
const statuses = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' }
]

const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/users', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      users.value = response.data.users
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.icNumber?.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  // Status filter
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'true'
    filtered = filtered.filter(user => user.isActive === isActive)
  }

  return filtered
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
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

const clearFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h3 class="text-2xl font-bold text-gray-900">User Management</h3>
      <p class="mt-1 text-sm text-gray-600">Manage all system users and their roles</p>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <!-- Search -->
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or IC number..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- Role Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            v-model="roleFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option v-for="role in roles" :key="role" :value="role">
              {{ formatRole(role) }}
            </option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option v-for="status in statuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Showing {{ filteredUsers.length }} of {{ users.length }} users
        </div>
        <button
          v-if="searchQuery || roleFilter || statusFilter"
          @click="clearFilters"
          class="text-sm text-blue-600 hover:text-blue-500"
        >
          Clear filters
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4">
      <div class="text-sm text-red-700">{{ error }}</div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 bg-white rounded-lg shadow">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading users...</p>
    </div>

    <!-- Users Table -->
    <div v-else-if="filteredUsers.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IC Number</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
            <!-- User Info -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-blue-600 font-medium text-sm">{{ user.name?.charAt(0) }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>

            <!-- Role -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getRoleBadgeColor(user.role)
                ]"
              >
                {{ formatRole(user.role) }}
              </span>
            </td>

            <!-- IC Number -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user.icNumber || '-' }}
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <!-- Nationality Status -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatRole(user.nationalityStatus) }}
            </td>

            <!-- Joined Date -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.createdAt) }}
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <NuxtLink
                :to="`/admin/users/${user.id}`"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                View
              </NuxtLink>
              <button class="text-gray-600 hover:text-gray-900">
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery || roleFilter || statusFilter ? 'Try adjusting your filters' : 'No users in the system yet' }}
      </p>
    </div>
  </div>
</template>
