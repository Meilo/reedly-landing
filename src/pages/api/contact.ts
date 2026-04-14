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
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  role?: string;
  users_count?: string | number;
}

const SUBJECT_LABELS: Record<string, string> = {
  demo: 'Demande de démo',
  team: 'Déploiement équipe / Hub',
  partnership: 'Partenariat & intégration',
  sector: 'Nouveau secteur',
  support: 'Support technique',
  trial: 'Demande d\'essai — Try for free',
  other: 'Autre',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml(data: ContactPayload): string {
  const subjectLabel = SUBJECT_LABELS[data.subject] ?? data.subject;
  const safe = {
    firstname: escapeHtml(data.firstname),
    lastname: escapeHtml(data.lastname),
    email: escapeHtml(data.email),
    phone: data.phone ? escapeHtml(data.phone) : '',
    company: data.company ? escapeHtml(data.company) : '',
    role: data.role ? escapeHtml(data.role) : '',
    users_count: data.users_count != null ? escapeHtml(String(data.users_count)) : '',
    subject: escapeHtml(subjectLabel),
    message: escapeHtml(data.message),
  };
  return `
    <div style="font-family: sans-serif; max-width: 600px; color: #111;">
      <h2 style="color: #16a34a;">Nouveau message — ${safe.subject}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; width: 160px;">Nom</td>
          <td style="padding: 8px 0;">${safe.firstname} ${safe.lastname}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Email</td>
          <td style="padding: 8px 0;"><a href="mailto:${safe.email}">${safe.email}</a></td>
        </tr>
        ${safe.phone ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Téléphone</td>
          <td style="padding: 8px 0;"><a href="tel:${safe.phone}">${safe.phone}</a></td>
        </tr>` : ''}
        ${safe.company ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Société</td>
          <td style="padding: 8px 0;">${safe.company}</td>
        </tr>` : ''}
        ${safe.role ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Rôle</td>
          <td style="padding: 8px 0;">${safe.role}</td>
        </tr>` : ''}
        ${safe.users_count ? `
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Utilisateurs potentiels</td>
          <td style="padding: 8px 0;">${safe.users_count}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Sujet</td>
          <td style="padding: 8px 0;">${safe.subject}</td>
        </tr>
      </table>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <h3 style="margin-top: 0;">Message</h3>
      <p style="white-space: pre-line; line-height: 1.6;">${safe.message || '<em style="color:#9ca3af;">(aucun message)</em>'}</p>
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

  // Validate required fields — for trial requests message is optional but role + users_count are required
  const baseRequired = ['firstname', 'lastname', 'email', 'subject'] as const;
  for (const field of baseRequired) {
    if (!data[field]?.trim()) {
      return new Response(JSON.stringify({ error: `Missing field: ${field}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const isTrial = data.subject === 'trial';
  if (isTrial) {
    if (!data.role?.trim()) {
      return new Response(JSON.stringify({ error: 'Missing field: role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const usersStr = data.users_count != null ? String(data.users_count).trim() : '';
    if (!usersStr || !/^\d+$/.test(usersStr) || Number(usersStr) < 1) {
      return new Response(JSON.stringify({ error: 'Invalid field: users_count' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (!data.message?.trim()) {
    return new Response(JSON.stringify({ error: 'Missing field: message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
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
