import { ref } from 'vue';
import type { Booking } from '~/types/calendar';

export function useCalendar() {
  const bookings = ref<Booking[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedPeriod = ref<'all' | 'upcoming' | 'past' | 'today' | 'week' | 'month'>('month');

  const fetchBookings = async (period?: typeof selectedPeriod.value) => {
    if (period) {
      selectedPeriod.value = period;
    }

    loading.value = true;
    error.value = null;

    try {
      let url = '/api/cal/bookings';
      const params = new URLSearchParams();

      // Only add date filters if not showing all bookings
      if (selectedPeriod.value !== 'all') {
        const now = new Date();
        
        switch (selectedPeriod.value) {
          case 'today': {
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            
            params.set('after', startOfDay.toISOString());
            params.set('before', endOfDay.toISOString());
            break;
          }
          
          case 'week': {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            params.set('after', startOfWeek.toISOString());
            params.set('before', endOfWeek.toISOString());
            break;
          }
          
          case 'month': {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            
            params.set('after', startOfMonth.toISOString());
            params.set('before', endOfMonth.toISOString());
            break;
          }

          case 'upcoming':
            params.set('after', now.toISOString());
            break;

          case 'past':
            params.set('before', now.toISOString());
            break;
        }
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      bookings.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      bookings.value = [];
    } finally {
      loading.value = false;
    }
  };

  const getMeetingUrl = (bookingId: string): string | null => {
    const booking = bookings.value.find(b => b.id === bookingId);
    return booking?.meetingUrl || null;
  };

  return {
    bookings,
    loading,
    error,
    selectedPeriod,
    fetchBookings,
    getMeetingUrl,
  };
}