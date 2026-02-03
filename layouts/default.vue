<template>
  <div class="min-h-screen bg-background">
    <nav class="border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center space-x-3">
          <img src="/assets/images/jpn_logo.png" alt="JPN Logo" class="h-10 w-auto" />
          <div>
            <h1 class="text-2xl font-bold">SPK</h1>
            <p class="text-xs text-gray-600">Sistem Pengurusan Kewarganegaraan</p>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Add your layout logic here
</script>
