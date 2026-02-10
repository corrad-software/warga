<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin'
})

const { token } = useAuth()
const loading = ref(true)
const stats = ref({
  totalUsers: 0,
  totalApplications: 0,
  pendingApplications: 0,
  approvedApplications: 0,
  rejectedApplications: 0,
  totalPayments: 0,
  pendingPayments: 0,
  totalDocuments: 0,
  pendingDocuments: 0
})

const recentApplications = ref([])

const fetchStats = async () => {
  loading.value = true
  try {
    // Fetch users count
    const usersRes = await $fetch('/api/users', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (usersRes.success) {
      stats.value.totalUsers = usersRes.data.users.length
    }

    // Fetch applications
    const appsRes = await $fetch('/api/applications', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (appsRes.success) {
      const apps = appsRes.data.applications
      stats.value.totalApplications = apps.length
      stats.value.pendingApplications = apps.filter((app: any) =>
        ['SUBMITTED', 'PENDING_REVIEW', 'UNDER_REVIEW'].includes(app.status)
      ).length
      stats.value.approvedApplications = apps.filter((app: any) =>
        ['APPROVED', 'CERTIFICATE_ISSUED', 'COMPLETED'].includes(app.status)
      ).length
      stats.value.rejectedApplications = apps.filter((app: any) =>
        app.status === 'REJECTED'
      ).length

      // Get recent 5 applications
      recentApplications.value = apps.slice(0, 5)
    }

    // Fetch payments
    const paymentsRes = await $fetch('/api/payments', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (paymentsRes.success) {
      const payments = paymentsRes.data.payments
      stats.value.totalPayments = payments.length
      stats.value.pendingPayments = payments.filter((p: any) =>
        p.status === 'PENDING'
      ).length
    }

    // Fetch documents
    const docsRes = await $fetch('/api/documents', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (docsRes.success) {
      const docs = docsRes.data.documents
      stats.value.totalDocuments = docs.length
      stats.value.pendingDocuments = docs.filter((d: any) =>
        d.verificationStatus === 'PENDING'
      ).length
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ms-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatStatus = (status: string | null | undefined) => {
  if (!status) return '-'
  const statusMap: Record<string, string> = {
    DRAFT: 'Draf',
    SUBMITTED: 'Dihantar',
    PENDING_REVIEW: 'Menunggu Semakan',
    DOCUMENTS_VERIFIED: 'Dokumen Disahkan',
    PENDING_BIOMETRIC: 'Menunggu Biometrik',
    BIOMETRIC_CAPTURED: 'Biometrik Diambil',
    PENDING_PAYMENT: 'Menunggu Pembayaran',
    PAYMENT_COMPLETED: 'Pembayaran Selesai',
    UNDER_REVIEW: 'Dalam Semakan',
    APPROVED: 'Diluluskan',
    REJECTED: 'Ditolak',
    PENDING_OATH: 'Menunggu Sumpah',
    OATH_COMPLETED: 'Sumpah Selesai',
    CERTIFICATE_ISSUED: 'Sijil Dikeluarkan',
    COMPLETED: 'Selesai',
    BORANG_H: 'Kelahiran Luar Negara',
    BORANG_G: 'Perkara 15(2)',
    TADBIR_SUMPAH: 'Pentadbiran Sumpah',
    KELAHIRAN_LUAR: 'Kelahiran Luar Negara',
    PERKARA_15_2: 'Perkara 15(2)'
  }
  return statusMap[status] || status.replace(/_/g, ' ')
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div>
    <!-- Keadaan Memuatkan -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Memuatkan papan pemuka...</p>
    </div>

    <!-- Kandungan Papan Pemuka -->
    <div v-else>
      <!-- Bahagian Utama -->
      <div class="mb-8">
        <h3 class="text-2xl font-bold text-gray-900">Gambaran Keseluruhan Papan Pemuka</h3>
        <p class="mt-1 text-sm text-gray-600">Pantau dan urus sistem permohonan kewarganegaraan</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Jumlah Pengguna -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-blue-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Jumlah Pengguna</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ stats.totalUsers }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <NuxtLink to="/admin/users" class="text-sm font-medium text-blue-600 hover:text-blue-500">
              Lihat semua →
            </NuxtLink>
          </div>
        </div>

        <!-- Jumlah Permohonan -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-green-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Jumlah Permohonan</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ stats.totalApplications }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <NuxtLink to="/admin/applications" class="text-sm font-medium text-green-600 hover:text-green-500">
              Lihat semua →
            </NuxtLink>
          </div>
        </div>

        <!-- Menunggu Semakan -->
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
                  <dt class="text-sm font-medium text-gray-500 truncate">Menunggu Semakan</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ stats.pendingApplications }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <span class="text-sm text-gray-500">Memerlukan perhatian</span>
          </div>
        </div>

        <!-- Menunggu Pembayaran -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="rounded-md bg-purple-500 p-3">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Menunggu Pembayaran</dt>
                  <dd class="text-2xl font-semibold text-gray-900">{{ stats.pendingPayments }}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-5 py-3">
            <NuxtLink to="/admin/payments" class="text-sm font-medium text-purple-600 hover:text-purple-500">
              Lihat semua →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Statistik Sekunder -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Permohonan Diluluskan</dt>
            <dd class="mt-1 text-3xl font-semibold text-green-600">{{ stats.approvedApplications }}</dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Permohonan Ditolak</dt>
            <dd class="mt-1 text-3xl font-semibold text-red-600">{{ stats.rejectedApplications }}</dd>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Dokumen Menunggu</dt>
            <dd class="mt-1 text-3xl font-semibold text-orange-600">{{ stats.pendingDocuments }}</dd>
          </div>
        </div>
      </div>

      <!-- Bahagian Carta -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
        <!-- Carta Bar - Taburan Status Permohonan -->
        <div class="bg-white shadow rounded-lg p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Gambaran Status Permohonan</h4>
          <div class="space-y-4">
            <!-- Bar 1 - Dihantar -->
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Dihantar</span>
                <span class="text-sm font-medium text-gray-700">{{ stats.pendingApplications }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  :style="`width: ${stats.totalApplications > 0 ? (stats.pendingApplications / stats.totalApplications * 100) : 0}%`"
                ></div>
              </div>
            </div>

            <!-- Bar 2 - Dalam Semakan -->
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Dalam Semakan</span>
                <span class="text-sm font-medium text-gray-700">12</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-yellow-500 h-3 rounded-full transition-all duration-300" style="width: 35%"></div>
              </div>
            </div>

            <!-- Bar 3 - Diluluskan -->
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Diluluskan</span>
                <span class="text-sm font-medium text-gray-700">{{ stats.approvedApplications }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="bg-green-600 h-3 rounded-full transition-all duration-300"
                  :style="`width: ${stats.totalApplications > 0 ? (stats.approvedApplications / stats.totalApplications * 100) : 0}%`"
                ></div>
              </div>
            </div>

            <!-- Bar 4 - Ditolak -->
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Ditolak</span>
                <span class="text-sm font-medium text-gray-700">{{ stats.rejectedApplications }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class="bg-red-600 h-3 rounded-full transition-all duration-300"
                  :style="`width: ${stats.totalApplications > 0 ? (stats.rejectedApplications / stats.totalApplications * 100) : 0}%`"
                ></div>
              </div>
            </div>

            <!-- Bar 5 - Sijil Dikeluarkan -->
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Sijil Dikeluarkan</span>
                <span class="text-sm font-medium text-gray-700">18</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-purple-600 h-3 rounded-full transition-all duration-300" style="width: 52%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carta Garisan - Trend Bulanan -->
        <div class="bg-white shadow rounded-lg p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Trend Permohonan (6 Bulan Terakhir)</h4>
          <div class="relative">
            <!-- Y-axis labels -->
            <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
              <span>50</span>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
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

                <!-- Line chart path (hardcoded data: 15, 22, 18, 28, 35, 42) -->
                <polyline
                  points="0,120 80,72 160,96 240,48 320,24 400,8"
                  fill="none"
                  stroke="#3B82F6"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <!-- Data points -->
                <circle cx="0" cy="120" r="4" fill="#3B82F6"/>
                <circle cx="80" cy="72" r="4" fill="#3B82F6"/>
                <circle cx="160" cy="96" r="4" fill="#3B82F6"/>
                <circle cx="240" cy="48" r="4" fill="#3B82F6"/>
                <circle cx="320" cy="24" r="4" fill="#3B82F6"/>
                <circle cx="400" cy="8" r="4" fill="#3B82F6"/>

                <!-- Fill area under line -->
                <polygon
                  points="0,200 0,120 80,72 160,96 240,48 320,24 400,8 400,200"
                  fill="#3B82F6"
                  opacity="0.1"
                />
              </svg>

              <!-- Label paksi-X -->
              <div class="flex justify-between text-xs text-gray-500 mt-2">
                <span>Ogo</span>
                <span>Sep</span>
                <span>Okt</span>
                <span>Nov</span>
                <span>Dis</span>
                <span>Jan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Carta Donat dan Aktiviti -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3 mb-8">
        <!-- Carta Donat - Status Pembayaran -->
        <div class="bg-white shadow rounded-lg p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Status Pembayaran</h4>
          <div class="flex items-center justify-center">
            <svg viewBox="0 0 200 200" class="w-40 h-40">
              <!-- Bulatan latar belakang -->
              <circle cx="100" cy="100" r="80" fill="#f3f4f6"/>

              <!-- Selesai: 65% (hijau) -->
              <circle
                cx="100"
                cy="100"
                r="40"
                fill="none"
                stroke="#10B981"
                stroke-width="80"
                stroke-dasharray="163.4 251.3"
                transform="rotate(-90 100 100)"
              />

              <!-- Menunggu: 25% (kuning) -->
              <circle
                cx="100"
                cy="100"
                r="40"
                fill="none"
                stroke="#F59E0B"
                stroke-width="80"
                stroke-dasharray="62.8 251.3"
                transform="rotate(144 100 100)"
              />

              <!-- Gagal: 10% (merah) -->
              <circle
                cx="100"
                cy="100"
                r="40"
                fill="none"
                stroke="#EF4444"
                stroke-width="80"
                stroke-dasharray="25.1 251.3"
                transform="rotate(234 100 100)"
              />

              <!-- Bulatan putih tengah -->
              <circle cx="100" cy="100" r="50" fill="white"/>

              <!-- Teks tengah -->
              <text x="100" y="100" text-anchor="middle" dy=".3em" class="text-2xl font-bold fill-gray-900">
                {{ stats.totalPayments }}
              </text>
              <text x="100" y="120" text-anchor="middle" class="text-xs fill-gray-500">
                Jumlah
              </text>
            </svg>
          </div>

          <!-- Legenda -->
          <div class="mt-4 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                <span class="text-sm text-gray-700">Selesai</span>
              </div>
              <span class="text-sm font-medium text-gray-900">65%</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
                <span class="text-sm text-gray-700">Menunggu</span>
              </div>
              <span class="text-sm font-medium text-gray-900">25%</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                <span class="text-sm text-gray-700">Gagal</span>
              </div>
              <span class="text-sm font-medium text-gray-900">10%</span>
            </div>
          </div>
        </div>

        <!-- Garis Masa Aktiviti Terkini -->
        <div class="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Aktiviti Terkini</h4>
          <div class="flow-root">
            <ul class="-mb-8">
              <!-- Aktiviti 1 -->
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
                        <p class="text-sm text-gray-900">Permohonan <span class="font-medium">#APP-2024-045</span> diluluskan</p>
                        <p class="mt-0.5 text-xs text-gray-500">Ahmad bin Abdullah - Permohonan kewarganegaraan</p>
                      </div>
                      <div class="text-right text-xs whitespace-nowrap text-gray-500">
                        1 jam lalu
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <!-- Aktiviti 2 -->
              <li>
                <div class="relative pb-8">
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-900">Pembayaran diterima untuk <span class="font-medium">#APP-2024-042</span></p>
                        <p class="mt-0.5 text-xs text-gray-500">Jumlah: RM 1,250.00</p>
                      </div>
                      <div class="text-right text-xs whitespace-nowrap text-gray-500">
                        2 jam lalu
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <!-- Aktiviti 3 -->
              <li>
                <div class="relative pb-8">
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-900">Dokumen disahkan untuk <span class="font-medium">#APP-2024-038</span></p>
                        <p class="mt-0.5 text-xs text-gray-500">Semua dokumen yang diperlukan diluluskan</p>
                      </div>
                      <div class="text-right text-xs whitespace-nowrap text-gray-500">
                        4 jam lalu
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <!-- Aktiviti 4 -->
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
                        <p class="text-sm text-gray-900">Permohonan baru dihantar <span class="font-medium">#APP-2024-046</span></p>
                        <p class="mt-0.5 text-xs text-gray-500">Memerlukan semakan awal</p>
                      </div>
                      <div class="text-right text-xs whitespace-nowrap text-gray-500">
                        5 jam lalu
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Permohonan Terkini -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Permohonan Terkini</h3>

          <div v-if="recentApplications.length > 0" class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Permohonan</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemohon</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarikh</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="app in recentApplications" :key="app.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <NuxtLink :to="`/admin/pendaftaran/${app.id}`">{{ app.applicationRef || `#${app.id}` }}</NuxtLink>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ app.createdBy || 'N/A' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatStatus(app.applicationType) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {{ formatStatus(app.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(app.createdDate) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-6 text-gray-500">
            Tiada permohonan lagi
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
