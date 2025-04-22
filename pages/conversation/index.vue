<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">{{ $t('conversation.title') }}</h1>
        <div class="flex items-center space-x-4">
          <button 
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
            @click="fetchConversations"
            :disabled="loading"
          >
            {{ loading ? 'Loading...' : $t('conversation.refresh') }}
          </button>
        </div>
      </div>

      <div v-if="error" class="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
        {{ error }}
      </div>

      <div v-if="selectedConversation">
        <ConversationDetails 
          :conversation="selectedConversation"
          :is-playing="isPlaying"
          @close="selectedConversation = null"
          @toggle-audio="toggleAudio"
        />
      </div>
      <div v-else>
        <ConversationList 
          :conversations="conversations"
          @select="handleSelectConversation"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useConversations } from '~/composables/useConversations';

const { t } = useI18n();
const { 
  conversations, 
  selectedConversation,
  loading,
  error,
  isPlaying,
  fetchConversations,
  fetchConversationDetails,
  toggleAudio,
  stopAudio
} = useConversations();

const handleSelectConversation = async (conversationId: string) => {
  await fetchConversationDetails(conversationId);
};

// Fetch conversations on mount
onMounted(() => {
  fetchConversations();
});

// Clean up audio when component is unmounted
onUnmounted(() => {
  stopAudio();
});
</script>