<template>
  <div class="min-h-screen bg-background flex flex-col">
    <div class="flex-grow">
      <slot />
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-center text-sm text-gray-600">
          © 2025 Sistem Pengurusan Kewarganegaraan (SPK) - Jabatan Pendaftaran Negara Malaysia
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Add your layout logic here
</script>
