<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Page not found</h1>
    <NuxtLink to="/" class="text-primary-600 hover:text-primary-700">
      Return to home
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
});
</script>