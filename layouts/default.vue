<template>
  <div class="min-h-screen bg-background flex flex-col">
    <nav class="border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center space-x-3">
          <img src="/images/jpn_logo.png" alt="JPN Logo" class="h-10 w-auto" />
          <div>
            <h1 class="text-2xl font-bold">SPK</h1>
            <p class="text-xs text-gray-600">Sistem Pengurusan Kewarganegaraan</p>
          </div>
        </div>
      </div>
    </nav>
    <main class="flex-grow">
      <slot />
    </main>

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
