// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  typescript: {
    strict: false,
    typeCheck: false
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
    public: {
      appName: process.env.APP_NAME || 'SPK'
    }
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    experimental: {
      openAPI: false
    }
  },
  vite: {
    optimizeDeps: {
      exclude: ['@prisma/client']
    }
  },
  experimental: {
    payloadExtraction: false
  }
})
