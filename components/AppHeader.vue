<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm">
    <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
      <NuxtLink
        :to="localePath('/')"
        class="flex items-center space-x-2"
      >
        <span class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ $t('common.appName') }}</span>
      </NuxtLink>

      <div class="flex items-center space-x-6">
        <NuxtLink
          :to="localePath('/calendar')"
          class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
        >
          <span>{{ $t('navigation.calendar') }}</span>
        </NuxtLink>
        
        <NuxtLink
          :to="localePath('/conversation')"
          class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
        >
          <span>{{ $t('navigation.conversation') }}</span>
        </NuxtLink>
        
        <NuxtLink
          :to="localePath('/database')"
          class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
        >
          <span>{{ $t('navigation.database') }}</span>
        </NuxtLink>

        <div class="flex items-center space-x-4">
          <div class="relative">
            <select
              v-model="locale"
              class="appearance-none bg-transparent border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              @change="switchLocale"
            >
              <option value="en">{{ $t('common.english') }}</option>
              <option value="fr">{{ $t('common.french') }}</option>
            </select>
          </div>

          <button
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            :aria-label="isDarkMode ? $t('common.lightMode') : $t('common.darkMode')"
            @click="toggleTheme"
          >
            <span v-if="isDarkMode" class="text-yellow-400">
              <!-- Sun icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            <span v-else class="text-gray-700">
              <!-- Moon icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useThemeStore } from '~/stores/theme';

const localePath = useLocalePath();
const { locale } = useI18n();
const themeStore = useThemeStore();

const isDarkMode = computed(() => themeStore.isDarkMode);

const toggleTheme = () => {
  themeStore.toggleTheme();
};

const switchLocale = () => {
  // Locale is automatically updated by v-model
};
</script>