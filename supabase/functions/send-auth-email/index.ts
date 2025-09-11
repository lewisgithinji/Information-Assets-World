import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { SignupConfirmationEmail } from './_templates/signup-confirmation.tsx'
import { PasswordResetEmail } from './_templates/password-reset.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    // Verify webhook signature if secret is provided
    if (hookSecret) {
      const wh = new Webhook(hookSecret)
      try {
        wh.verify(payload, headers)
      } catch (error) {
        console.error('Webhook verification failed:', error)
        return new Response('Unauthorized', { 
          status: 401,
          headers: corsHeaders
        })
      }
    }

    const data = JSON.parse(payload)
    const {
      user,
      email_data: { 
        token, 
        token_hash, 
        redirect_to, 
        email_action_type,
        site_url 
      },
    } = data

    console.log('Processing auth email:', {
      email: user.email,
      action_type: email_action_type,
      redirect_to,
    })

    let emailHtml: string
    let subject: string
    let confirmationUrl: string

    // Build the confirmation URL
    const baseUrl = site_url || Deno.env.get('SUPABASE_URL')
    confirmationUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || baseUrl}`

    // Generate email based on action type
    switch (email_action_type) {
      case 'signup':
        subject = 'Welcome to Information Assets World - Confirm your account'
        emailHtml = await renderAsync(
          React.createElement(SignupConfirmationEmail, {
            confirmationUrl,
            siteName: 'Information Assets World',
          })
        )
        break

      case 'recovery':
        subject = 'Reset your Information Assets World password'
        emailHtml = await renderAsync(
          React.createElement(PasswordResetEmail, {
            resetUrl: confirmationUrl,
            siteName: 'Information Assets World',
          })
        )
        break

      case 'email_change':
        subject = 'Confirm your new email address'
        emailHtml = await renderAsync(
          React.createElement(SignupConfirmationEmail, {
            confirmationUrl,
            siteName: 'Information Assets World',
          })
        )
        break

      default:
        console.log('Unknown email action type:', email_action_type)
        subject = 'Information Assets World - Account Verification'
        emailHtml = await renderAsync(
          React.createElement(SignupConfirmationEmail, {
            confirmationUrl,
            siteName: 'Information Assets World',
          })
        )
    }

    // Send email using Resend
    const { data: emailResult, error } = await resend.emails.send({
      from: 'Information Assets World <noreply@informationassetsworld.com>',
      to: [user.email],
      subject,
      html: emailHtml,
      tags: [
        { name: 'category', value: 'auth' },
        { name: 'action_type', value: email_action_type },
      ],
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    console.log('Email sent successfully:', {
      id: emailResult?.id,
      to: user.email,
      action_type: email_action_type,
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: emailResult?.id 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error: any) {
    console.error('Error in send-auth-email function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
        },
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})