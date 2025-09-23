// Imports
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { Webhook } from 'npm:@standard-api/webhooks';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { SignupConfirmationEmail } from './_templates/signup-confirmation.tsx';
import { PasswordResetEmail } from './_templates/password-reset.tsx';

// Environment variables
const resend = new Resend(Deno.env.get('RESEND_API_KEY') || '');
const webhookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';

// Webhook verifier
const wh = new Webhook(webhookSecret);

// Helper: Error response
function createErrorResponse(status: number, message: string, details: string, code: string) {
  return new Response(JSON.stringify({ error: message, details, code }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Main handler
serve(async (req) => {
  if (req.method !== 'POST') {
    return createErrorResponse(405, 'Method not allowed', 'Only POST requests are accepted', 'METHOD_NOT_ALLOWED');
  }

  let payload: string;
  try {
    payload = await req.text();
    const signature = req.headers.get('supabase-signature');
    wh.verify(payload, signature || '');
  } catch (err: any) {
    return createErrorResponse(401, 'Unauthorized', err.message, 'SIGNATURE_VERIFICATION_FAILED');
  }

  let data;
  try {
    data = JSON.parse(payload);
    console.log('Incoming payload:', data);
  } catch (err: any) {
    return createErrorResponse(400, 'Invalid JSON', err.message, 'INVALID_JSON');
  }

  // Handle standard auth events
  if (data?.user?.email && data?.email_data?.email_action_type) {
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url },
    } = data;

    const baseUrl = site_url || SUPABASE_URL;
    const confirmationUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || baseUrl)}`;

    let emailHtml: string;
    let subject: string;

    try {
      switch (email_action_type) {
        case 'signup':
          subject = 'Welcome to Information Assets World – Confirm your account';
          emailHtml = await renderAsync(SignupConfirmationEmail({ confirmationUrl, siteName: 'Information Assets World' }));
          break;
        case 'recovery':
          subject = 'Reset your Information Assets World password';
          emailHtml = await renderAsync(PasswordResetEmail({ resetUrl: confirmationUrl, siteName: 'Information Assets World' }));
          break;
        case 'email_change':
          subject = 'Confirm your new email address';
          emailHtml = await renderAsync(SignupConfirmationEmail({ confirmationUrl, siteName: 'Information Assets World' }));
          break;
        default:
          subject = 'Verify your Information Assets World account';
          emailHtml = await renderAsync(SignupConfirmationEmail({ confirmationUrl, siteName: 'Information Assets World' }));
      }
    } catch (err: any) {
      return createErrorResponse(500, 'Email rendering failed', err.message, 'EMAIL_RENDER_FAILED');
    }

    try {
      const { error } = await resend.emails.send({
        from: 'Information Assets World <onboarding@notifications.informationassetsworld.com>',
        to: user.email,
        subject,
        html: emailHtml,
      });

      if (error) {
        return createErrorResponse(500, 'Resend error', error.message, 'RESEND_ERROR');
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return createErrorResponse(500, 'Email sending failed', err.message, 'EMAIL_SEND_FAILED');
    }
  }

  // Handle user_invited event
  if (data?.action === 'user_invited' && data?.traits?.user_email) {
    const email = data.traits.user_email;
    const confirmationUrl = `${SUPABASE_URL}/auth/v1/verify?token=invite&redirect_to=${encodeURIComponent('https://information-assets-world.netlify.app/auth')}`;

    let emailHtml: string;
    try {
      emailHtml = await renderAsync(SignupConfirmationEmail({ confirmationUrl, siteName: 'Information Assets World' }));
    } catch (err: any) {
      return createErrorResponse(500, 'Email rendering failed', err.message, 'EMAIL_RENDER_FAILED');
    }

    try {
      const { error } = await resend.emails.send({
        from: 'Information Assets World <onboarding@notifications.informationassetsworld.com>',
        to: email,
        subject: 'You’ve been invited to Information Assets World',
        html: emailHtml,
      });

      if (error) {
        return createErrorResponse(500, 'Resend error', error.message, 'RESEND_ERROR');
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return createErrorResponse(500, 'Email sending failed', err.message, 'EMAIL_SEND_FAILED');
    }
  }

  // Fallback for unsupported payloads
  return createErrorResponse(400, 'Unsupported webhook payload', 'Unrecognized structure', 'UNSUPPORTED_PAYLOAD');
});
