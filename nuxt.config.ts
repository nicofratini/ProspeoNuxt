// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint-config',
  ],
  devtools: { enabled: false },
  css: ['~/assets/css/main.scss'],
  runtimeConfig: {
    private: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      CAL_KEY: process.env.CAL_KEY,
      CAL_API_VERSION: process.env.CAL_API_VERSION || '2024-01-01',
    },
    public: {
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    },
  },
  compatibilityDate: '2025-03-03',
  typescript: {
    strict: true,
  },
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    vueI18n: './i18n.config.ts',
    strategy: 'prefix',
  },
});