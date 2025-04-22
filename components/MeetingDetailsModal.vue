<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ meeting.title }}
        </h3>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="px-6 py-4">
        <div class="space-y-4">
          <!-- Date and Time -->
          <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <span class="w-5">📅</span>
            <span>{{ formatDate(meeting.start) }}</span>
            <span class="px-2 text-gray-400">•</span>
            <span>{{ formatTime(meeting.start) }} - {{ formatTime(meeting.end) }}</span>
            <span class="px-2 text-gray-400">•</span>
            <span>{{ formatDuration(meeting.start, meeting.end) }}</span>
          </div>

          <!-- Description -->
          <div v-if="meeting.description" class="text-gray-600 dark:text-gray-300">
            <p>{{ meeting.description }}</p>
          </div>

          <!-- Attendee Information -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
            <h4 class="font-medium text-gray-900 dark:text-white">Participant</h4>
            
            <div v-if="meeting.attendees?.[0]" class="space-y-2">
              <div class="flex items-center space-x-2">
                <span class="w-5">👤</span>
                <span class="text-gray-700 dark:text-gray-300">{{ meeting.attendees[0].name }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="w-5">✉️</span>
                <span class="text-gray-700 dark:text-gray-300">{{ meeting.attendees[0].email }}</span>
              </div>
              <div v-if="meeting.responses?.attendeePhoneNumber" class="flex items-center space-x-2">
                <span class="w-5">📱</span>
                <span class="text-gray-700 dark:text-gray-300">{{ meeting.responses.attendeePhoneNumber }}</span>
              </div>
            </div>
          </div>

          <!-- Meeting Link -->
          <div v-if="meeting.meetingUrl" class="mt-6">
            <a 
              :href="meeting.meetingUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <span>Rejoindre la réunion</span>
              <span class="ml-2">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/types/calendar';

const props = defineProps<{
  show: boolean;
  meeting: Booking;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateStr));
};

const formatTime = (dateStr: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateStr));
};

const formatDuration = (startStr: string, endStr: string) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  return `${durationMinutes} min`;
};
</script>