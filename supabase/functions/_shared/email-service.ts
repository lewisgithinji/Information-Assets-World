/**
 * Email Service using Resend API
 *
 * Resend is a modern email API that's perfect for Supabase Edge Functions
 * Sign up at: https://resend.com
 *
 * Set RESEND_API_KEY in Supabase secrets:
 * npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
 */

import { EmailAttachment } from './calendar-generator.ts';

export interface SendEmailOptions {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using Resend API
 */
export const sendEmail = async (
  options: SendEmailOptions
): Promise<EmailResponse> => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    console.error('RESEND_API_KEY not set in environment variables');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || 'Information Assets Training <noreply@notifications.informationassetsworld.com>',
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo || 'info@informationassetsworld.com',
        attachments: options.attachments,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return {
        success: false,
        error: errorData.message || 'Failed to send email',
      };
    }

    const data = await response.json();
    console.log('Email sent successfully:', data.id);

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Send email with fallback to console logging for development
 */
export const sendEmailWithFallback = async (
  options: SendEmailOptions
): Promise<EmailResponse> => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  // If no API key, log to console (development mode)
  if (!resendApiKey) {
    console.log('============================================');
    console.log('EMAIL WOULD BE SENT (Development Mode)');
    console.log('============================================');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('From:', options.from || 'Information Assets Training <noreply@notifications.informationassetsworld.com>');
    console.log('Reply-To:', options.replyTo || 'info@informationassetsworld.com');
    if (options.attachments && options.attachments.length > 0) {
      console.log('Attachments:', options.attachments.map(a => a.filename).join(', '));
    }
    console.log('---');
    console.log('Text Content:', options.text || '(HTML only)');
    console.log('============================================\n');

    return {
      success: true,
      messageId: 'dev-mode-' + Date.now(),
    };
  }

  return sendEmail(options);
};

/**
 * Validate email address format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};
