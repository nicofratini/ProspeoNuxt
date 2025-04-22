<template>
  <div class="space-y-4">
    <div v-for="conversation in conversations" :key="conversation.conversation_id" 
         class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
         @click="$emit('select', conversation.conversation_id)">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ conversation.agent_name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ new Date(conversation.start_time_unix_secs * 1000).toLocaleString() }}
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <span :class="[
            'px-2 py-1 text-xs rounded-full',
            conversation.status === 'done' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          ]">
            {{ conversation.status }}
          </span>
        </div>
      </div>
      <div class="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
        <span>{{ conversation.message_count }} messages</span>
        <span>{{ Math.floor(conversation.call_duration_secs / 60) }}:{{ (conversation.call_duration_secs % 60).toString().padStart(2, '0') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types/conversation';

defineProps<{
  conversations: Conversation[]
}>();

defineEmits<{
  (e: 'select', conversationId: string): void
}>();
</script>