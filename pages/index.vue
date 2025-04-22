<template>
  <div class="container mx-auto px-4 py-12">
    <div class="text-center">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl mb-8">
        {{ t("common.appName") }}
      </h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <NuxtLink
          to="/calendar"
          class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">Calendar</h2>
          <p class="text-gray-600 dark:text-gray-300">Manage your schedule and appointments</p>
        </NuxtLink>

        <NuxtLink
          to="/conversation"
          class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">Conversation</h2>
          <p class="text-gray-600 dark:text-gray-300">Start a new conversation</p>
        </NuxtLink>

        <NuxtLink
          to="/database"
          class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">Database</h2>
          <p class="text-gray-600 dark:text-gray-300">Access and manage your data</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
