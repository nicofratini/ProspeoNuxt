export interface Booking {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  attendees: Array<{
    email: string;
    name: string;
    timeZone?: string;
  }>;
  responses?: {
    attendeePhoneNumber?: string;
  };
  meetingUrl?: string;
}