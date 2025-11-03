/**
 * Calendar Invite (.ics) Generator
 *
 * Generates iCalendar format files for event invitations
 */

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  organizerEmail?: string;
  organizerName?: string;
  attendeeEmail: string;
  attendeeName: string;
  url?: string;
}

/**
 * Format date for iCalendar (YYYYMMDDTHHMMSSZ)
 */
const formatICalDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generate a unique UID for the event
 */
const generateUID = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}@informationassets.com`;
};

/**
 * Escape special characters for iCalendar format
 */
const escapeICalString = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

/**
 * Wrap long lines to 75 characters (iCalendar spec)
 */
const wrapLines = (text: string): string => {
  const lines: string[] = [];
  let currentLine = '';

  text.split('\n').forEach(line => {
    if (line.length <= 75) {
      lines.push(line);
    } else {
      // First line can be 75 chars
      lines.push(line.substring(0, 75));
      let remaining = line.substring(75);

      // Continuation lines start with a space and can be 74 chars
      while (remaining.length > 0) {
        lines.push(' ' + remaining.substring(0, 74));
        remaining = remaining.substring(74);
      }
    }
  });

  return lines.join('\r\n');
};

/**
 * Generate iCalendar (.ics) file content
 */
export const generateICalendar = (event: CalendarEvent): string => {
  const now = formatICalDate(new Date().toISOString());
  const uid = generateUID();
  const startDate = formatICalDate(event.startDate);
  const endDate = formatICalDate(event.endDate);

  const organizerLine = event.organizerEmail
    ? `ORGANIZER;CN=${escapeICalString(event.organizerName || 'Information Assets')}:mailto:${event.organizerEmail}`
    : '';

  const urlLine = event.url ? `URL:${event.url}` : '';

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Information Assets//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${escapeICalString(event.title)}
DESCRIPTION:${escapeICalString(event.description)}
LOCATION:${escapeICalString(event.location)}
${organizerLine}
ATTENDEE;CN=${escapeICalString(event.attendeeName)};RSVP=TRUE:mailto:${event.attendeeEmail}
STATUS:CONFIRMED
SEQUENCE:0
${urlLine}
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICalString(event.title)} tomorrow
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICalString(event.title)} in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return wrapLines(icsContent);
};

/**
 * Generate calendar invite for an event registration
 */
export const generateEventInvite = (
  eventTitle: string,
  eventDescription: string,
  eventLocation: string,
  eventStartDate: string,
  eventEndDate: string,
  attendeeEmail: string,
  attendeeName: string
): string => {
  return generateICalendar({
    title: eventTitle,
    description: eventDescription || `You are registered for ${eventTitle}`,
    location: eventLocation,
    startDate: eventStartDate,
    endDate: eventEndDate,
    organizerEmail: 'events@informationassets.com',
    organizerName: 'Information Assets Training',
    attendeeEmail,
    attendeeName,
  });
};

/**
 * Convert .ics content to base64 for email attachment
 */
export const icsToBase64 = (icsContent: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(icsContent);
  // Deno provides btoa for base64 encoding
  return btoa(String.fromCharCode(...data));
};

/**
 * Generate email attachment object for calendar invite
 */
export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
  type: string;
  disposition: string;
}

export const generateCalendarAttachment = (
  eventTitle: string,
  eventDescription: string,
  eventLocation: string,
  eventStartDate: string,
  eventEndDate: string,
  attendeeEmail: string,
  attendeeName: string
): EmailAttachment => {
  const icsContent = generateEventInvite(
    eventTitle,
    eventDescription,
    eventLocation,
    eventStartDate,
    eventEndDate,
    attendeeEmail,
    attendeeName
  );

  // Create safe filename from event title
  const safeFilename = eventTitle
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  return {
    filename: `${safeFilename}-invite.ics`,
    content: icsToBase64(icsContent),
    type: 'text/calendar',
    disposition: 'attachment',
  };
};
