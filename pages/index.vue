<script setup lang="ts">
const { isAuthenticated, user, fetchUser } = useAuth()
const router = useRouter()

onMounted(async () => {
  // Try to fetch user if there's a token
  if (!user.value) {
    await fetchUser()
  }

  // Redirect based on authentication status
  if (isAuthenticated.value && user.value) {
    if (user.value.role === 'PEMOHON') {
      router.push('/dashboard')
    } else if (['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN'].includes(user.value.role)) {
      router.push('/officer/dashboard')
    }
  } else {
    router.push('/login')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
</template>
