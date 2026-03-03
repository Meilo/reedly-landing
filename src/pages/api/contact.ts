/**
 * POST /api/contact
 *
 * Receives contact form submissions and sends them via Resend.
 * Requires RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL in .env
 */
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// This endpoint is server-rendered (not static)
export const prerender = false;

interface ContactPayload {
  firstname: string;
  lastname: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  demo: 'Demande de démo',
  team: 'Déploiement équipe / Hub',
  partnership: 'Partenariat & intégration',
  sector: 'Nouveau secteur',
  support: 'Support technique',
  other: 'Autre',
};

function buildEmailHtml(data: ContactPayload): string {
  const subjectLabel = SUBJECT_LABELS[data.subject] ?? data.subject;
  return `
    <div style="font-family: sans-serif; max-width: 600px; color: #111;">
      <h2 style="color: #16a34a;">Nouveau message — ${subjectLabel}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; width: 120px;">Nom</td>
          <td style="padding: 8px 0;">${data.firstname} ${data.lastname}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Email</td>
          <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
        </tr>
        ${data.company ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Société</td>
          <td style="padding: 8px 0;">${data.company}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Sujet</td>
          <td style="padding: 8px 0;">${subjectLabel}</td>
        </tr>
      </table>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <h3 style="margin-top: 0;">Message</h3>
      <p style="white-space: pre-line; line-height: 1.6;">${data.message}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="color: #9ca3af; font-size: 12px;">
        Envoyé depuis le formulaire de contact reedly.ai
      </p>
    </div>
  `;
}

export const POST: APIRoute = async ({ request }) => {
  // Parse body
  let data: ContactPayload;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate required fields
  const required = ['firstname', 'lastname', 'email', 'subject', 'message'] as const;
  for (const field of required) {
    if (!data[field]?.trim()) {
      return new Response(JSON.stringify({ error: `Missing field: ${field}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Validate email format (basic)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check env vars
  const apiKey = import.meta.env.RESEND_API_KEY;
  const toEmail = import.meta.env.CONTACT_TO_EMAIL ?? 'contact@reedly.ai';
  const fromEmail = import.meta.env.CONTACT_FROM_EMAIL ?? 'noreply@reedly.ai';

  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(apiKey);
  const subjectLabel = SUBJECT_LABELS[data.subject] ?? data.subject;

  try {
    const { error } = await resend.emails.send({
      from: `Reedly Contact <${fromEmail}>`,
      to: [toEmail],
      replyTo: data.email,
      subject: `[Reedly] ${subjectLabel} — ${data.firstname} ${data.lastname}`,
      html: buildEmailHtml(data),
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return new Response(JSON.stringify({ error: 'Email sending failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
