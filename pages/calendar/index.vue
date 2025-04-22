<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
        {{ $t('calendar.title') }}
      </h1>
      <button
        class="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="loading"
        @click="refreshData"
      >
        <span
          v-if="loading"
          class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
        />
        <span>{{ loading ? $t('conversation.loading') : $t('conversation.refresh') }}</span>
      </button>
    </div>

    <!-- Period Selector -->
    <div class="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
      <div class="flex items-center space-x-4">
        <label class="text-gray-700 dark:text-gray-300 font-medium">Période :</label>
        <select
          v-model="selectedPeriod"
          class="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
          @change="handlePeriodChange"
        >
          <option value="all">
            Tous les rendez-vous
          </option>
          <option value="past">
            Rendez-vous passés
          </option>
          <option value="upcoming">
            Rendez-vous à venir
          </option>
          <option value="today">
            Aujourd'hui
          </option>
          <option value="week">
            Cette semaine
          </option>
          <option value="month">
            Ce mois
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="error"
      class="mb-8 p-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl shadow-sm"
    >
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
          <span class="text-red-600 dark:text-red-200 text-xl">!</span>
        </div>
        <div class="flex-1">
          <p class="font-medium">
            {{ error }}
          </p>
          <button
            class="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline hover:no-underline transition-colors"
            @click="refreshData"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <div class="p-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <span>{{ $t('calendar.upcoming') }}</span>
            <span
              class="text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full"
            >
              {{ bookings.length }}
            </span>
          </h2>
          <div class="flex space-x-4">
            <button
              class="px-3 py-1.5 rounded-lg transition-colors"
              :class="viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
              @click="viewMode = 'list'"
            >
              Liste
            </button>
            <button
              class="px-3 py-1.5 rounded-lg transition-colors"
              :class="viewMode === 'calendar' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
              @click="viewMode = 'calendar'"
            >
              Calendrier
            </button>
          </div>
        </div>

        <div
          v-if="loading"
          class="flex justify-center items-center py-12"
        >
          <div class="animate-spin rounded-full h-12 w-12 border-3 border-primary-600 border-t-transparent" />
        </div>

        <div
          v-else-if="bookings.length === 0"
          class="text-center py-12 px-4"
        >
          <div class="text-gray-400 dark:text-gray-500 text-6xl mb-4">
            📅
          </div>
          <p class="text-gray-600 dark:text-gray-300 text-lg">
            {{ $t('calendar.noEvents') }}
          </p>
        </div>

        <div v-else>
          <!-- List View -->
          <div
            v-if="viewMode === 'list'"
            class="space-y-6"
          >
            <div
              v-for="group in groupedMeetings"
              :key="group.date"
              class="space-y-4"
            >
              <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 sticky top-0 bg-white dark:bg-gray-800 py-2">
                {{ formatDate(group.date) }}
              </h3>

              <div
                v-for="meeting in group.meetings"
                :key="meeting.id"
                class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-gray-600 cursor-pointer"
                @click="showMeetingDetails(meeting)"
              >
                <div class="flex justify-between items-start">
                  <div class="space-y-2">
                    <h4 class="text-xl font-semibold text-gray-900 dark:text-white">
                      {{ meeting.title }}
                    </h4>
                    <div class="space-y-1">
                      <p class="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                        <span class="w-4 h-4">👤</span>
                        <span>{{ meeting.attendees[0]?.name }}</span>
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                        <span class="w-4 h-4">✉️</span>
                        <span>{{ meeting.attendees[0]?.email }}</span>
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                        <span class="w-4 h-4">📱</span>
                        <span>{{ meeting.responses?.attendeePhoneNumber || 'Non spécifié' }}</span>
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="text-right">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ formatTime(meeting.start) }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatDuration(meeting.start, meeting.end) }}
                      </p>
                    </div>
                    <div
                      v-if="getMeetingUrl(meeting.id)"
                      class="flex items-center"
                    >
                      <a
                        :href="getMeetingUrl(meeting.id)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200"
                        @click.stop
                      >
                        <span>Rejoindre</span>
                        <span class="ml-2">→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Calendar View -->
          <div
            v-else
          >
            <FullCalendar
              ref="calendar"
              :options="{
                plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
                initialView: 'dayGridMonth',
                events: calendarEvents,
                headerToolbar: {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                },
                locale: 'fr',
                firstDay: 1,
                buttonText: {
                  today: 'Aujourd\'hui',
                  month: 'Mois',
                  week: 'Semaine',
                  day: 'Jour',
                  list: 'Liste',
                },
                eventClick: handleEventClick,
                eventTimeFormat: {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                },
                slotMinTime: '08:00:00',
                slotMaxTime: '20:00:00',
                allDaySlot: false,
                slotDuration: '00:30:00',
                expandRows: true,
                height: 'auto',
                dayMaxEvents: true,
                nowIndicator: true,
                weekNumbers: false,
                businessHours: {
                  daysOfWeek: [1, 2, 3, 4, 5],
                  startTime: '09:00',
                  endTime: '18:00',
                },
                scrollTime: '08:00:00',
                views: {
                  timeGrid: {
                    dayMaxEventRows: 6,
                    dayMinWidth: 200,
                  },
                },
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Meeting Details Modal -->
    <MeetingDetailsModal
      :show="!!selectedMeeting"
      :meeting="selectedMeeting"
      @close="selectedMeeting = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Booking } from '~/types/calendar';

const viewMode = ref<'list' | 'calendar'>('list');
const { bookings, loading, error, selectedPeriod, fetchBookings, getMeetingUrl } = useCalendar();
const calendar = ref(null);
const selectedMeeting = ref<Booking | null>(null);

// Calendar events computed property
const calendarEvents = computed(() => {
  return bookings.value.map(booking => ({
    id: booking.id,
    title: booking.title,
    start: booking.start,
    end: booking.end,
    extendedProps: {
      attendees: booking.attendees,
      responses: booking.responses,
      meetingUrl: getMeetingUrl(booking.id),
    },
  }));
});

// Group meetings by date for list view
const groupedMeetings = computed(() => {
  const groups: { date: string; meetings: any[] }[] = [];

  bookings.value.forEach((meeting) => {
    const date = new Date(meeting.start);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString();

    let group = groups.find(g => g.date === dateStr);
    if (!group) {
      group = { date: dateStr, meetings: [] };
      groups.push(group);
    }

    group.meetings.push(meeting);
  });

  return groups;
});

// Event handlers
const handleEventClick = (info: EventClickArg) => {
  const meeting = bookings.value.find(b => parseInt(b.id) === parseInt(info.event.id));
  if (meeting) {
    showMeetingDetails(meeting);
  }
};

const showMeetingDetails = (meeting: Booking) => {
  selectedMeeting.value = meeting;
};

const handlePeriodChange = async () => {
  await fetchBookings(selectedPeriod.value);
};

// Formatting helpers
const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(dateStr));
};

const formatTime = (dateStr: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

const formatDuration = (startStr: string, endStr: string) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  return `${durationMinutes} min`;
};

const refreshData = async () => {
  await fetchBookings();
};

// Initial data fetch
onMounted(() => {
  refreshData();
});
</script>

<style lang="scss">
.fc {
  @apply font-sans;

  .fc-toolbar-title {
    @apply text-xl font-semibold text-gray-900 dark:text-white;
  }

  .fc-button {
    @apply bg-primary-600 hover:bg-primary-700 border-0 shadow-sm;
  }

  .fc-button-active {
    @apply bg-primary-800;
  }

  .fc-event {
    @apply cursor-pointer;
  }

  .fc-daygrid-day {
    @apply hover:bg-gray-50 dark:hover:bg-gray-700/50;
  }

  .fc-day-today {
    @apply bg-primary-50 dark:bg-primary-900/20 !important;
  }

  .fc-timegrid-slot {
    @apply h-12;
  }

  .fc-timegrid-event {
    @apply rounded-lg shadow-md border-none;
  }

  .fc-theme-standard td,
  .fc-theme-standard th {
    @apply border-gray-200 dark:border-gray-700;
  }

  .fc-scrollgrid {
    @apply border-gray-200 dark:border-gray-700;
  }

  .fc-col-header-cell {
    @apply bg-gray-50 dark:bg-gray-800;
  }

  .fc-timegrid-axis,
  .fc-timegrid-slot-label {
    @apply text-gray-500 dark:text-gray-400;
  }

  .fc-event-title {
    @apply font-medium text-ellipsis;
  }

  .fc-event-time {
    @apply text-sm opacity-75;
  }
}
</style>
