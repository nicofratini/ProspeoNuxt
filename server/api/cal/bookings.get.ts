import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const CAL_KEY = config.private?.CAL_KEY;
  const CAL_API_VERSION = '2024-08-13'; // Hardcode the correct version
  const { after, before } = getQuery(event);

  // Validate API key exists
  if (!CAL_KEY) {
    console.error('[API /api/cal/bookings] Missing CAL_KEY in environment variables');
    throw createError({
      statusCode: 500,
      statusMessage: 'Calendar API configuration error',
    });
  }

  try {
    // Build URL with query parameters
    const url = new URL('https://api.cal.com/v2/bookings');

    // Add pagination parameters to get all bookings
    url.searchParams.append('limit', '100');
    url.searchParams.append('page', '1');

    // Only add date filters if provided
    if (after) url.searchParams.append('after', after as string);
    if (before) url.searchParams.append('before', before as string);

    console.log('[API /api/cal/bookings] Fetching from URL:', url.toString());

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${CAL_KEY}`,
        'Content-Type': 'application/json',
        'cal-api-version': CAL_API_VERSION,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API /api/cal/bookings] Cal.com API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });

      throw createError({
        statusCode: response.status,
        statusMessage: `Calendar API error: ${response.statusText}`,
      });
    }

    const data = await response.json();

    // Add cache control headers
    event.node.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    event.node.res.setHeader('Pragma', 'no-cache');
    event.node.res.setHeader('Expires', '0');

    // The API returns { status: "success", data: [...] }
    if (!data?.data || !Array.isArray(data.data)) {
      console.error('[API /api/cal/bookings] Unexpected data format:', data);
      return [];
    }

    // Map the bookings array to our booking format
    return data.data.map((booking: any) => ({
      id: booking.id,
      title: booking.title,
      description: booking.description || '',
      start: booking.start,
      end: booking.end,
      attendees: booking.attendees || [],
      responses: booking.bookingFieldsResponses || {},
      meetingUrl: booking.meetingUrl || booking.location || null,
    }));
  }
  catch (err: any) {
    console.error('[API /api/cal/bookings] Error:', err);

    throw createError({
      statusCode: err.statusCode || 502,
      statusMessage: `Calendar API error: ${err.message || 'Unknown error'}`,
    });
  }
});
