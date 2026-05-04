export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/theme.css'],
  runtimeConfig: {
    public: {
      backendBaseUrl: 'http://localhost:8082'
    }
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:8080/api',
        changeOrigin: true
      }
    }
  }
})