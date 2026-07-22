// One-time helper to obtain a Google refresh token for the booking host account.
// Prereqs (see .env.example): a Google Cloud OAuth 2.0 "Desktop" client with the
// redirect URI http://localhost:53682 registered, and Calendar API enabled.
//
// Usage:
//   GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/google-oauth.mjs
import http from 'node:http';
import { OAuth2Client } from 'google-auth-library';

const PORT = 53682;
const REDIRECT = `http://localhost:${PORT}`;
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment first.');
  process.exit(1);
}

const client = new OAuth2Client(clientId, clientSecret, REDIRECT);
const authUrl = client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400).end('Missing code');
    return;
  }
  try {
    const { tokens } = await client.getToken(code);
    res
      .writeHead(200, { 'Content-Type': 'text/plain' })
      .end('Done. You can close this tab and return to the terminal.');
    console.log('\n=== GOOGLE_REFRESH_TOKEN ===\n' + tokens.refresh_token + '\n');
    if (!tokens.refresh_token) {
      console.log(
        'No refresh_token returned. Revoke prior access at ' +
          'https://myaccount.google.com/permissions and retry.',
      );
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500).end('Token exchange failed, see terminal.');
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('Open this URL, sign in with the HOST Workspace account, and grant access:\n');
  console.log(authUrl + '\n');
});
