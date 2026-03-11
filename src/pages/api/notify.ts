/**
 * POST /api/notify
 *
 * Receives an email address from the "notify me" modal
 * and forwards it via Resend.
 */
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = body.email?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const toEmail = import.meta.env.CONTACT_TO_EMAIL ?? 'contact@reedly.ai';
  const fromEmail = import.meta.env.CONTACT_FROM_EMAIL ?? 'noreply@reedly.ai';

  if (!apiKey) {
    console.error('[notify] RESEND_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: `Reedly Notify <${fromEmail}>`,
      to: [toEmail],
      replyTo: email,
      subject: `[Reedly] Nouvelle inscription liste d'attente — ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #111;">
          <h2 style="color: #16a34a;">Nouvelle inscription — liste d'attente app</h2>
          <p style="font-size: 16px;">
            <strong>${email}</strong> souhaite être prévenu(e) quand l'application sera disponible.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #9ca3af; font-size: 12px;">
            Envoyé depuis le formulaire de notification reedly.ai
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[notify] Resend error:', error);
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
    console.error('[notify] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
