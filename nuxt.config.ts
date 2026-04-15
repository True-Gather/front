// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/theme.css'],
  runtimeConfig: {
    public: {
      backendBaseUrl: 'http://localhost:8080'
    }
  }
})