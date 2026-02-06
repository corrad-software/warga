<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const { token } = useAuth()

const appId = route.params.id as string

const application = ref<any>(null)
const loading = ref(true)
const error = ref('')
const submitting = ref(false)

// Approval form
const approvalForm = ref({
  status: '',
  notes: ''
})

const fetchApplication = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/pendaftaran/${appId}`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (response.success) {
      application.value = response.data.application
      // Initialize approval form with existing data if available
      if (response.data.application.latestApproval) {
        approvalForm.value = {
          status: response.data.application.latestApproval.decision || '',
          notes: response.data.application.latestApproval.decisionNotes || ''
        }
      }
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal memuatkan butiran permohonan'
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatType = (type: string) => {
  const typeMap: Record<string, string> = {
    PERKARA_15_2: 'Perkara 15(2)',
    KELAHIRAN_LUAR: 'Kelahiran Luar Negara',
    TADBIR_SUMPAH: 'Pentadbiran Sumpah'
  }
  return typeMap[type] || type || '-'
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    PRA_LENGKAP: 'Pra-Lengkap',
    TIDAK_LENGKAP: 'Tidak Lengkap',
    BARU: 'Baru',
    DALAM_SEMAKAN: 'Dalam Semakan',
    MENUNGGU_DOKUMEN: 'Menunggu Dokumen',
    DILULUSKAN: 'Diluluskan',
    DITOLAK: 'Ditolak',
    SELESAI: 'Selesai'
  }
  return statusMap[status] || status?.replace(/_/g, ' ') || '-'
}

const getMotherInfo = computed(() => {
  return application.value?.preApplication?.applicant?.parents?.find((p: any) => p.parentCategory === 'MOTHER')
})

const getFatherInfo = computed(() => {
  return application.value?.preApplication?.applicant?.parents?.find((p: any) => p.parentCategory === 'FATHER')
})

// Submit approval
const submitApproval = async () => {
  if (!approvalForm.value.status) {
    alert('Sila pilih status kelulusan')
    return
  }
  
  submitting.value = true
  try {
    const response = await $fetch(`/api/pendaftaran/${appId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        decision: approvalForm.value.status,
        decisionNotes: approvalForm.value.notes
      }
    })
    
    if (response.success) {
      alert('Kelulusan berjaya disimpan')
      await fetchApplication()
    }
  } catch (err: any) {
    alert(err.data?.message || 'Gagal menyimpan kelulusan')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchApplication()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto">
      <!-- Back Button -->
      <div class="mb-6 flex items-center">
        <button
          @click="router.back()"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm"
        >
          <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow rounded-lg text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Memuatkan butiran permohonan...</p>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="bg-white shadow rounded-lg mb-6 rounded-md bg-red-50 p-4">
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

      <!-- Content: Review Section (View Only) -->
      <div v-else-if="application" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6 space-y-6">
          <!-- Header -->
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Butiran Permohonan</h2>
            <p class="mt-2 text-sm text-gray-600">Paparan Maklumat Permohonan (Mod Lihat Sahaja)</p>
            <div class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ application.applicationRef }}
            </div>
          </div>

          <!-- Section A: Applicant Information -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Seksyen A - Butir-butir mengenai pemohon
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Nama Penuh</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.fullName || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">No. Kad Pengenalan</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.idNumber || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Hubungan dengan Subjek</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.relationWithEnrolledPerson || '-' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Alamat Kediaman</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ [application.preApplication?.applicant?.permAddress1, application.preApplication?.applicant?.permAddress2, application.preApplication?.applicant?.permAddress3, application.preApplication?.applicant?.permCity, application.preApplication?.applicant?.permPostcode, application.preApplication?.applicant?.permState, application.preApplication?.applicant?.permCountry].filter(Boolean).join(', ') || '-' }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Section B: Person to be Registered -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Seksyen B - Butir-butir orang yang hendak didaftarkan
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-xs font-medium text-gray-500">Nama Penuh</dt>
                <dd class="mt-1 text-sm font-medium text-gray-900">{{ application.preApplication?.applicant?.enrolledPersName || application.preApplication?.applicant?.fullName || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Tarikh Lahir</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(application.preApplication?.applicant?.dateOfBirth) }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Tempat Lahir</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.placeOfBirth || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Jantina</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.gender === 'M' ? 'Lelaki' : 'Perempuan' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Bangsa</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.race || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Agama</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.religion || '-' }}</dd>
              </div>
              <div v-if="application.preApplication?.applicant?.occupation">
                <dt class="text-xs font-medium text-gray-500">Pekerjaan</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.occupation }}</dd>
              </div>
            </dl>
          </div>

          <!-- Section C: Criminal and Detention Records -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Seksyen C - Rekod Jenayah dan Tahanan
            </h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-medium text-gray-500">Pernah Disabitkan Kesalahan</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.anyOffence === 'Y' ? 'YA' : 'TIDAK' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500">Pernah Dikurung dalam Penjara/Institusi Psikiatrik</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ application.preApplication?.applicant?.anyConfination === 'Y' ? 'YA' : 'TIDAK' }}</dd>
              </div>
            </dl>
            <div v-if="application.preApplication?.applicant?.offenceConfinations?.length > 0" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Butir-butir Rekod:</h4>
              <div class="space-y-2">
                <div v-for="(record, index) in application.preApplication?.applicant?.offenceConfinations" :key="index" class="bg-gray-50 rounded-lg p-3">
                  <p class="text-sm font-medium text-gray-900">{{ index + 1 }}. {{ record.offence || '-' }}</p>
                  <p class="text-xs text-gray-500">Denda: {{ record.fineAmount || '-' }} | Tarikh: {{ formatDate(record.confinationStartDate) }} hingga {{ formatDate(record.confinationEndDate) }} | Negara: {{ record.country || '-' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section D: Parent Information -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Seksyen D - Maklumat mengenai Ibu dan Bapa
            </h3>

            <!-- Mother -->
            <div v-if="getMotherInfo" class="mb-4">
              <h4 class="text-sm font-semibold text-pink-600 mb-2">Ibu</h4>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium text-gray-500">Nama</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getMotherInfo.parentName || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Bangsa</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getMotherInfo.race || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">No. K/P</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getMotherInfo.idNumber || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Kewarganegaraan Semasa</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getMotherInfo.nationality || '-' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Father -->
            <div v-if="getFatherInfo">
              <h4 class="text-sm font-semibold text-blue-600 mb-2">Bapa</h4>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt class="text-xs font-medium text-gray-500">Nama</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getFatherInfo.parentName || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Bangsa</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getFatherInfo.race || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">No. K/P</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getFatherInfo.idNumber || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-gray-500">Kewarganegaraan Semasa</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getFatherInfo.nationality || '-' }}</dd>
                </div>
              </dl>
            </div>

            <div v-if="!getMotherInfo && !getFatherInfo" class="text-center py-8">
              <p class="text-sm text-gray-500">Tiada maklumat ibu bapa</p>
            </div>
          </div>

          <!-- Section E: Siblings -->
          <div v-if="application.preApplication?.applicant?.siblings?.length > 0" class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Seksyen E - Maklumat mengenai Adik Beradik
            </h3>
            <div class="space-y-3">
              <div v-for="(sibling, index) in application.preApplication?.applicant?.siblings" :key="index" class="bg-gray-50 rounded-lg p-3">
                <p class="text-sm font-medium text-gray-900">{{ index + 1 }}. {{ sibling.siblingName }}</p>
                <p class="text-xs text-gray-500">{{ sibling.age }} tahun | {{ sibling.nationality }}</p>
              </div>
            </div>
          </div>

          <!-- Documents -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Dokumen yang Dimuat Naik
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex items-center space-x-2 text-sm">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Borang Permohonan Lengkap</span>
              </div>
            </div>
            <p class="mt-3 text-xs text-gray-500">Dokumen dikemukakan bersama permohonan</p>
          </div>

          <!-- Pengesahan Section (Read-Only) -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pengesahan (Paparan Sahaja)
            </h3>
            <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div class="space-y-4">
                <!-- Status (Read-Only) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div class="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700">
                    {{ formatStatus(application.status) }}
                  </div>
                </div>

                <!-- Catatan (Read-Only) -->
                <div v-if="application.preApplication?.reviewNotes">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                  <div class="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 min-h-[100px]">
                    {{ application.preApplication?.reviewNotes }}
                  </div>
                </div>

                <p class="text-xs text-gray-500 italic">
                  ℹ️ Halaman ini dalam mod paparan sahaja. Untuk mengemaskini maklumat, sila gunakan halaman pengurusan yang berkaitan.
                </p>
              </div>
            </div>
          </div>

          <!-- Kelulusan Section -->
          <div class="border-t border-gray-200 pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kelulusan
            </h3>
            <div class="bg-green-50 rounded-lg p-5 border border-green-200">
              <div class="space-y-4">
                <!-- Status Dropdown -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Status <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="approvalForm.status"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Pilih Status</option>
                    <option value="LULUS">Lulus</option>
                    <option value="TIDAK_LULUS">Tidak Lulus</option>
                  </select>
                </div>

                <!-- Catatan TextField -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    v-model="approvalForm.notes"
                    rows="4"
                    placeholder="Masukkan catatan atau ulasan mengenai kelulusan..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end pt-2">
                  <button
                    @click="submitApproval"
                    :disabled="submitting || !approvalForm.status"
                    class="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg v-if="submitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{{ submitting ? 'Menyimpan...' : 'Simpan' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
