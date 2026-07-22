import { OAuth2Client } from 'google-auth-library';
import type { BusyInterval } from './availability';

const CAL_API = 'https://www.googleapis.com/calendar/v3';

export function isGoogleConfigured(): boolean {
  return Boolean(
    import.meta.env.GOOGLE_CLIENT_ID &&
      import.meta.env.GOOGLE_CLIENT_SECRET &&
      import.meta.env.GOOGLE_REFRESH_TOKEN,
  );
}

async function getAccessToken(): Promise<string> {
  const client = new OAuth2Client(
    import.meta.env.GOOGLE_CLIENT_ID,
    import.meta.env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({ refresh_token: import.meta.env.GOOGLE_REFRESH_TOKEN });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Failed to obtain Google access token');
  return token;
}

export async function getBusy(
  timeMinIso: string,
  timeMaxIso: string,
  calendarId: string,
): Promise<BusyInterval[]> {
  const token = await getAccessToken();
  const res = await fetch(`${CAL_API}/freeBusy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: timeMinIso,
      timeMax: timeMaxIso,
      items: [{ id: calendarId }],
    }),
  });
  if (!res.ok) throw new Error(`freeBusy failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const cal = data.calendars?.[calendarId];
  if (cal?.errors?.length) throw new Error(`freeBusy calendar error: ${JSON.stringify(cal.errors)}`);
  return (cal?.busy ?? []) as BusyInterval[];
}

export interface CreateEventParams {
  startIso: string;
  endIso: string;
  timezone: string;
  summary: string;
  description: string;
  attendeeEmail: string;
  attendeeName: string;
  calendarId: string;
}

export async function createEvent(
  p: CreateEventParams,
): Promise<{ meetLink: string; eventId: string }> {
  const token = await getAccessToken();
  const res = await fetch(
    `${CAL_API}/calendars/${encodeURIComponent(p.calendarId)}/events` +
      `?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: p.summary,
        description: p.description,
        start: { dateTime: p.startIso, timeZone: p.timezone },
        end: { dateTime: p.endIso, timeZone: p.timezone },
        attendees: [{ email: p.attendeeEmail, displayName: p.attendeeName }],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`events.insert failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const meetLink =
    data.hangoutLink ||
    data.conferenceData?.entryPoints?.find((e: { entryPointType?: string; uri?: string }) =>
      e.entryPointType === 'video')?.uri ||
    '';
  return { meetLink, eventId: data.id };
}
