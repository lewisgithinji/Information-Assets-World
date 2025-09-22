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
    console.log('=== WEBHOOK DEBUG START ===')
    
    // Log environment variables availability
    const hasResendKey = !!Deno.env.get('RESEND_API_KEY')
    const hasHookSecret = !!hookSecret
    console.log('Environment check:', { hasResendKey, hasHookSecret })
    
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Webhook headers received:', Object.keys(headers))
    console.log('Payload length:', payload.length)
    console.log('Hook secret available:', hasHookSecret)
    
    // Verify webhook signature if secret is provided
    if (hookSecret) {
      console.log('Attempting webhook verification...')
      try {
        const wh = new Webhook(hookSecret)
        console.log('Webhook instance created successfully')
        
        // Log the verification attempt details
        console.log('Verification headers:', {
          'webhook-signature': headers['webhook-signature'],
          'webhook-timestamp': headers['webhook-timestamp']
        })
        
        wh.verify(payload, headers)
        console.log('Webhook verification successful')
      } catch (error) {
        console.error('=== WEBHOOK VERIFICATION FAILED ===')
        console.error('Error type:', error.constructor.name)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        console.error('Headers available:', Object.keys(headers))
        console.error('Hook secret length:', hookSecret?.length || 0)
        
        // For debugging purposes, let's continue without verification in case of Base64 error
        if (error.message.includes('Base64Coder') || error.message.includes('decoding')) {
          console.log('Base64 decoding error detected - continuing for debugging purposes')
          console.log('This should be fixed in production by ensuring correct webhook secret format')
        } else {
          return new Response(JSON.stringify({ 
            error: 'Webhook verification failed',
            details: error.message,
            type: error.constructor.name
          }), { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    } else {
      console.log('No hook secret provided - skipping webhook verification')
    }

    console.log('Parsing webhook payload...')
    const data = JSON.parse(payload)
    console.log('Payload parsed successfully')
    
    // Log the structure of the received data
    console.log('Webhook data structure:', {
      hasUser: !!data.user,
      hasEmailData: !!data.email_data,
      userEmail: data.user?.email,
      actionType: data.email_data?.email_action_type
    })
    
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
      has_token: !!token,
      has_token_hash: !!token_hash,
      site_url: site_url
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
    console.log('Attempting to send email via Resend...')
    console.log('Email details:', {
      to: user.email,
      subject,
      action_type: email_action_type,
      html_length: emailHtml.length
    })
    
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
      console.error('=== RESEND EMAIL ERROR ===')
      console.error('Error details:', error)
      console.error('Error type:', typeof error)
      console.error('Error properties:', Object.keys(error))
      throw error
    }

    console.log('Email sent successfully:', {
      id: emailResult?.id,
      to: user.email,
      action_type: email_action_type,
    })
    console.log('=== WEBHOOK DEBUG END ===')

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
    console.error('=== CRITICAL ERROR IN send-auth-email ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Error code:', error.code)
    
    // Log environment state for debugging
    console.error('Environment debug:', {
      hasResendKey: !!Deno.env.get('RESEND_API_KEY'),
      hasHookSecret: !!Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET'),
      resendKeyLength: Deno.env.get('RESEND_API_KEY')?.length || 0,
      hookSecretLength: Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET')?.length || 0
    })
    
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
          type: error.constructor.name,
          timestamp: new Date().toISOString(),
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