<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const { token } = useAuth()

const preAppId = route.params.id as string

const preApplication = ref<any>(null)
const loading = ref(true)
const error = ref('')

const activeTab = ref('details')

const fetchPreApplication = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/pra-permohonan/${preAppId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      preApplication.value = response.data.preApplication
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal memuatkan butiran pra-permohonan'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    PRA_DAFTAR: 'Pra-Daftar',
    PRA_LENGKAP: 'Pra-Lengkap',
    TIDAK_LENGKAP: 'Tidak Lengkap'
  }
  return statusMap[status] || status?.replace(/_/g, ' ') || '-'
}

const formatType = (type: string) => {
  const typeMap: Record<string, string> = {
    PERKARA_15_2: 'Perkara 15(2)',
    KELAHIRAN_LUAR: 'Kelahiran Luar Negara',
    TADBIR_SUMPAH: 'Pentadbiran Sumpah'
  }
  return typeMap[type] || type || '-'
}

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    PRA_DAFTAR: 'bg-gray-100 text-gray-800',
    PRA_LENGKAP: 'bg-green-100 text-green-800',
    TIDAK_LENGKAP: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const hasLinkedApplication = computed(() => {
  return preApplication.value?.applications && preApplication.value.applications.length > 0
})

const navigateToApplication = () => {
  if (hasLinkedApplication.value) {
    const appId = preApplication.value.applications[0].id
    router.push(`/applications/${appId}`)
  }
}

onMounted(() => {
  fetchPreApplication()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div class="flex items-center">
        <button
          @click="router.back()"
          class="mr-4 text-gray-600 hover:text-gray-900"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h3 class="text-2xl font-bold text-gray-900">Butiran Pra-Permohonan</h3>
          <p class="mt-1 text-sm text-gray-600">
            {{ preApplication?.applicant?.fullName || 'Memuat...' }}
          </p>
        </div>
      </div>
      <div v-if="preApplication">
        <span
          :class="[
            'px-3 py-1 text-sm font-semibold rounded-full',
            getStatusBadgeColor(preApplication.status)
          ]"
        >
          {{ formatStatus(preApplication.status) }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 bg-white rounded-lg shadow">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Memuatkan butiran pra-permohonan...</p>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="mb-6 rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="preApplication">
      <!-- Linked Application Alert -->
      <div v-if="hasLinkedApplication" class="mb-6 rounded-md bg-blue-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm text-blue-700">
              Pra-permohonan ini telah ditukar kepada permohonan penuh.
            </p>
          </div>
          <div>
            <button
              @click="navigateToApplication"
              class="text-sm font-medium text-blue-700 hover:text-blue-600"
            >
              Lihat Permohonan →
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'details'"
            :class="[
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Butiran Pemohon
          </button>
          <button
            @click="activeTab = 'birth'"
            :class="[
              activeTab === 'birth'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Maklumat Kelahiran
          </button>
          <button
            @click="activeTab = 'parents'"
            :class="[
              activeTab === 'parents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Maklumat Ibu Bapa
          </button>
          <button
            @click="activeTab = 'address'"
            :class="[
              activeTab === 'address'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            Alamat
          </button>
        </nav>
      </div>

      <!-- Tab Content: Applicant Details -->
      <div v-if="activeTab === 'details'" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Butiran Pemohon</h3>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">ID Permohonan</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant?.idNumber || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Nama Penuh</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant?.fullName || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Jenis Permohonan</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatType(preApplication.applicant?.applicationType) }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Jantina</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant?.gender === 'M' ? 'Lelaki' : 'Perempuan' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Kewarganegaraan</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant?.nationality || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Tarikh Dicipta</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(preApplication.createdDate) }}
              </dd>
            </div>
            <div v-if="preApplication.submittedAt" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Tarikh Dihantar</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(preApplication.submittedAt) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Tab Content: Birth Info -->
      <div v-if="activeTab === 'birth'" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Maklumat Kelahiran</h3>
        </div>
        <div v-if="preApplication.applicant" class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Tarikh Lahir</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(preApplication.applicant.dateOfBirth) }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Tempat Lahir</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.placeOfBirth || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Jenis ID</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.idType || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">No. ID</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.idNumber || '-' }}
              </dd>
            </div>
          </dl>
        </div>
        <div v-else class="px-4 py-12 text-center">
          <p class="text-gray-500">Tiada maklumat kelahiran</p>
        </div>
      </div>

      <!-- Tab Content: Parents -->
      <div v-if="activeTab === 'parents'" class="space-y-6">
        <div
          v-for="parent in preApplication.applicant?.parents || []"
          :key="parent.id"
          class="bg-white shadow overflow-hidden sm:rounded-lg"
        >
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ parent.parentCategory === 'FATHER' ? 'Maklumat Bapa' : 'Maklumat Ibu' }}
            </h3>
          </div>
          <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl class="sm:divide-y sm:divide-gray-200">
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Nama</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ parent.parentName || '-' }}
                </dd>
              </div>
              <div v-if="parent.parentNameBfrMarried" class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Nama Sebelum Kahwin</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ parent.parentNameBfrMarried }}
                </dd>
              </div>
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">No. Kad Pengenalan</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ parent.idNumber || '-' }}
                </dd>
              </div>
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Kewarganegaraan</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ parent.nationality || '-' }}
                </dd>
              </div>
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Tarikh Lahir</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ formatDate(parent.dateOfBirth) }}
                </dd>
              </div>
              <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Tempat Lahir</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ parent.placeOfBirth || '-' }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div v-if="!preApplication.applicant?.parents?.length" class="bg-white shadow overflow-hidden sm:rounded-lg px-4 py-12 text-center">
          <p class="text-gray-500">Tiada maklumat ibu bapa</p>
        </div>
      </div>

      <!-- Tab Content: Address -->
      <div v-if="activeTab === 'address'" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Alamat Tetap</h3>
        </div>
        <div v-if="preApplication.applicant" class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Alamat 1</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.permAddress1 || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Alamat 2</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.permAddress2 || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Alamat 3</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.permAddress3 || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Bandar</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.permCity || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Poskod</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.permPostcode || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Negeri</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.permState || '-' }}
              </dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Negara</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ preApplication.applicant.permCountry || '-' }}
              </dd>
            </div>
          </dl>
        </div>
        <div v-else class="px-4 py-12 text-center">
          <p class="text-gray-500">Tiada maklumat alamat</p>
        </div>
      </div>
    </div>
  </div>
</template>
