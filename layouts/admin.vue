<script setup lang="ts">
const { user, logout } = useAuth()
const router = useRouter()

const expandedMenus = ref<Record<string, boolean>>({})

// Menu sections with category labels for future role-based control
const navigationSections = [
  {
    category: 'pegawai', // Menu Pegawai Konsulat / JPN
    label: 'Pegawai Konsulat / JPN',
    items: [
      {
        name: 'Papan Pemuka',
        href: '/admin',
        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
      },
      {
        name: 'Senarai Pra-Permohonan',
        href: '/admin/pra-permohonan',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
      },
      {
        name: 'Pendaftaran Permohonan',
        href: '/admin/pendaftaran',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      },
      {
        name: 'Pengesahan Dokumen',
        href: '/admin/pengesahan-dokumen',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        name: 'Transaksi Bayaran',
        href: '/admin/pengesahan-bayaran',
        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        name: 'Biometrik',
        href: '/admin/biometrik',
        icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4'
      },
      {
        name: 'Jadual Angkat Sumpah',
        href: '/admin/jadual-sumpah',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      {
        name: 'Pelaksanaan Angkat Sumpah',
        href: '/admin/pelaksanaan-sumpah',
        icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
      },
      {
        name: 'Pengeluaran Sijil',
        href: '/admin/pengeluaran-sijil',
        icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
      },
      {
        name: 'Pelaporan',
        href: '/admin/pelaporan',
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      }
    ]
  },
  {
    category: 'pengurusan', // Menu Pengurusan / Audit
    label: 'Pengurusan / Audit',
    items: [
      {
        name: 'Dashboard Statistik',
        href: '/admin/statistik',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      },
      {
        name: 'Pelaporan Pengurusan',
        href: '/admin/pelaporan-pengurusan',
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      },
      {
        name: 'Audit Sistem',
        href: '/admin/audit',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
      },
      {
        name: 'Eksport Data',
        href: '/admin/eksport',
        icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
      }
    ]
  },
  {
    category: 'pentadbir', // Menu Pentadbir Sistem
    label: 'Pentadbir Sistem',
    items: [
      {
        name: 'Pengurusan Pengguna',
        href: '/admin/pengguna',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      },
      {
        name: 'Peranan & Kebenaran',
        href: '/admin/peranan',
        icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
      }
    ]
  }
]

// Flatten navigation for backward compatibility
const navigation = navigationSections.flatMap(section => section.items)

const toggleMenu = (itemName: string) => {
  expandedMenus.value[itemName] = !expandedMenus.value[itemName]
}

const isActive = (href: string) => {
  const currentPath = router.currentRoute.value.path
  if (href === '/admin') {
    return currentPath === '/admin'
  }
  return currentPath.startsWith(href)
}

const isParentActive = (children: any[]) => {
  const currentPath = router.currentRoute.value.path
  return children.some(child => currentPath.startsWith(child.href))
}

// Auto-expand active parent menus
onMounted(() => {
  navigation.forEach(item => {
    if (item.children && isParentActive(item.children)) {
      expandedMenus.value[item.name] = true
    }
  })
})

// Watch for route changes to auto-expand
watch(() => router.currentRoute.value.path, () => {
  navigation.forEach(item => {
    if (item.children && isParentActive(item.children)) {
      expandedMenus.value[item.name] = true
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex h-screen">
      <!-- Sidebar -->
      <div class="hidden md:flex md:w-60 md:flex-col">
        <div class="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
          <!-- Logo -->
          <div class="flex items-center flex-shrink-0 px-3 py-4 border-b border-gray-200">
            <div class="flex items-center">
              <img src="/images/jpn_logo.png" alt="JPN Logo" class="h-10 w-auto" />
              <div class="ml-2">
                <h1 class="text-sm font-semibold text-gray-900">SPK</h1>
                <p class="text-xs text-gray-500">Panel Pentadbir</p>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 py-2 overflow-y-auto">
            <template v-for="(section, sectionIndex) in navigationSections" :key="section.category">
              <!-- Section Header -->
              <div 
                :class="[
                  'px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider',
                  sectionIndex > 0 ? 'mt-4 border-t border-gray-200 pt-4' : ''
                ]"
              >
                {{ section.label }}
              </div>

              <!-- Section Items -->
              <template v-for="item in section.items" :key="item.name">
                <!-- Menu item with children (collapsible) -->
                <div v-if="item.children">
                  <button
                    @click="toggleMenu(item.name)"
                    :class="[
                      isParentActive(item.children)
                        ? 'bg-gray-100 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent',
                      'group flex items-center w-full px-3 py-2 text-sm font-medium transition-all'
                    ]"
                  >
                    <svg
                      :class="[
                        isParentActive(item.children) ? 'text-blue-600' : 'text-gray-400',
                        'mr-2 flex-shrink-0 h-5 w-5'
                      ]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                    </svg>
                    <span class="flex-1 text-left text-sm">{{ item.name }}</span>
                    <svg
                      :class="[
                        expandedMenus[item.name] ? 'rotate-90' : '',
                        'ml-auto h-4 w-4 transform transition-transform text-gray-400'
                      ]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <!-- Submenu -->
                  <div v-if="expandedMenus[item.name]" class="bg-gray-50">
                    <NuxtLink
                      v-for="child in item.children"
                      :key="child.name"
                      :to="child.href"
                      :class="[
                        isActive(child.href)
                          ? 'text-blue-600 bg-white border-l-4 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white border-l-4 border-transparent',
                        'group flex items-center pl-11 pr-3 py-2 text-sm transition-all'
                      ]"
                    >
                      {{ child.name }}
                    </NuxtLink>
                  </div>
                </div>

                <!-- Regular menu item without children -->
                <NuxtLink
                  v-else
                  :to="item.href"
                  :class="[
                    isActive(item.href)
                      ? 'bg-gray-100 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent',
                    'group flex items-center px-3 py-2 text-sm font-medium transition-all'
                  ]"
                >
                  <svg
                    :class="[
                      isActive(item.href) ? 'text-blue-600' : 'text-gray-400',
                      'mr-2 flex-shrink-0 h-5 w-5'
                    ]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                  </svg>
                  <span class="text-sm">{{ item.name }}</span>
                </NuxtLink>
              </template>
            </template>
          </nav>

          <!-- Logout -->
          <div class="flex-shrink-0 border-t border-gray-200">
            <button
              @click="logout"
              class="w-full flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg class="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="text-sm">Log Keluar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Top bar -->
        <div class="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div class="flex-1 px-4 flex justify-between items-center">
            <div class="flex-1 flex">
              <h2 class="text-xl font-semibold text-gray-900">
                <slot name="header">Papan Pemuka Pentadbir</slot>
              </h2>
            </div>
            <div class="ml-4 flex items-center md:ml-6">
              <!-- Notifications icon placeholder -->
              <button class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Page content -->
        <main class="flex-1 relative overflow-y-auto focus:outline-none">
          <div class="py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <slot />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
