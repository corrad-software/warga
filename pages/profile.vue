<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user: authUser, token } = useAuth()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')
const isEditing = ref(false)

const user = ref({
  name: '',
  email: '',
  icNumber: '',
  passportNumber: '',
  phoneNumber: '',
  address: '',
  dateOfBirth: '',
  placeOfBirth: ''
})

// Fetch user profile
const fetchProfile = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      const userData = response.data.user
      user.value = {
        name: userData.name || '',
        email: userData.email || '',
        icNumber: userData.icNumber || '',
        passportNumber: userData.passportNumber || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
        placeOfBirth: userData.placeOfBirth || ''
      }
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

// Update profile
const updateProfile = async () => {
  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch('/api/users/profile', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        name: user.value.name,
        icNumber: user.value.icNumber || null,
        passportNumber: user.value.passportNumber || null,
        phoneNumber: user.value.phoneNumber || null,
        address: user.value.address || null,
        dateOfBirth: user.value.dateOfBirth || null,
        placeOfBirth: user.value.placeOfBirth || null
      }
    })

    if (response.success) {
      success.value = 'Profile updated successfully'
      isEditing.value = false
      setTimeout(() => {
        success.value = ''
      }, 3000)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  fetchProfile()
}

const formatDate = (date: string) => {
  if (!date) return 'Tidak ditetapkan'
  return new Date(date).toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchProfile()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Profil Saya</h2>
        <p class="text-gray-600 mt-2">Urus maklumat peribadi anda</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Memuatkan profil...</p>
      </div>

      <!-- Profile Content -->
      <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-200 bg-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{{ user.name || 'User' }}</h3>
                <p class="text-sm text-gray-600">{{ user.email }}</p>
              </div>
            </div>
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Kemaskini Profil
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="mx-6 mt-6 rounded-md bg-green-50 p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="ml-3 text-sm text-green-700">{{ success }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mx-6 mt-6 rounded-md bg-red-50 p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="ml-3 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="px-6 py-6">
          <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- Name -->
              <div class="sm:col-span-2">
                <label for="name" class="block text-sm font-medium text-gray-700">Nama Penuh *</label>
                <input
                  v-model="user.name"
                  type="text"
                  id="name"
                  :disabled="!isEditing"
                  required
                  class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                >
              </div>

              <!-- Email -->
              <div class="sm:col-span-2">
                <label for="email" class="block text-sm font-medium text-gray-700">Alamat E-mel</label>
                <input
                  v-model="user.email"
                  type="email"
                  id="email"
                  disabled
                  class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                >
                <p class="mt-1 text-xs text-gray-500">E-mel tidak boleh diubah</p>
              </div>

              <!-- IC Number -->
              <div>
                <label for="icNumber" class="block text-sm font-medium text-gray-700">No. Kad Pengenalan</label>
                <input
                  v-model="user.icNumber"
                  type="text"
                  id="icNumber"
                  :disabled="!isEditing"
                  placeholder="cth: 901231-14-5678"
                  class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                >
              </div>

              <!-- Passport Number -->
              <div>
                <label for="passportNumber" class="block text-sm font-medium text-gray-700">No. Pasport</label>
                <input
                  v-model="user.passportNumber"
                  type="text"
                  id="passportNumber"
                  :disabled="!isEditing"
                  placeholder="cth: A12345678"
                  class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                >
              </div>

              <!-- Phone Number -->
              <div>
                <label for="phoneNumber" class="block text-sm font-medium text-gray-700">No. Telefon</label>
                <input
                  v-model="user.phoneNumber"
                  type="tel"
                  id="phoneNumber"
                  :disabled="!isEditing"
                  placeholder="cth: +60123456789"
                  class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                >
              </div>

              <!-- Date of Birth -->
              <div>
                <label for="dateOfBirth" class="block text-sm font-medium text-gray-700">Tarikh Lahir</label>
                <input
                  v-if="isEditing"
                  v-model="user.dateOfBirth"
                  type="date"
                  id="dateOfBirth"
                  class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                <input
                  v-else
                  type="text"
                  :value="formatDate(user.dateOfBirth)"
                  disabled
                  class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                >
              </div>

              <!-- Place of Birth -->
              <div class="sm:col-span-2">
                <label for="placeOfBirth" class="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                <input
                  v-model="user.placeOfBirth"
                  type="text"
                  id="placeOfBirth"
                  :disabled="!isEditing"
                  placeholder="cth: Kuala Lumpur, Malaysia"
                  class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                >
              </div>

              <!-- Address -->
              <div class="sm:col-span-2">
                <label for="address" class="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea
                  v-model="user.address"
                  id="address"
                  rows="3"
                  :disabled="!isEditing"
                  placeholder="Masukkan alamat penuh anda"
                  class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                ></textarea>
              </div>
            </div>

            <!-- Action Buttons -->
            <div v-if="isEditing" class="flex items-center justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                @click="cancelEdit"
                :disabled="saving"
                class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Account Information -->
      <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-6 py-5 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Maklumat Akaun</h3>
        </div>
        <div class="px-6 py-6">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Peranan Akaun</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ authUser?.role || 'PEMOHON' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Status Akaun</dt>
              <dd class="mt-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Aktif
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  </div>
</template>
