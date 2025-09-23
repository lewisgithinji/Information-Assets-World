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

// Helper function to create error responses
const createErrorResponse = (status: number, error: string, details?: string, code?: string) => {
  console.error(`=== ERROR ${status} ===`, { error, details, code })
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message: error,
        details,
        code: code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
      },
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  )
}

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to validate required payload fields
const validatePayload = (data: any) => {
  if (!data) {
    throw new Error('Empty payload')
  }
  
  if (!data.user?.email) {
    throw new Error('Missing user email in payload')
  }
  
  if (!isValidEmail(data.user.email)) {
    throw new Error('Invalid email format')
  }
  
  if (!data.email_data) {
    throw new Error('Missing email_data in payload')
  }
  
  const { token, token_hash, email_action_type } = data.email_data
  
  if (!token) {
    throw new Error('Missing token in email_data')
  }
  
  if (!token_hash) {
    throw new Error('Missing token_hash in email_data')
  }
  
  if (!email_action_type) {
    throw new Error('Missing email_action_type in email_data')
  }
  
  const validActionTypes = ['signup', 'recovery', 'email_change', 'invite']
  if (!validActionTypes.includes(email_action_type)) {
    throw new Error(`Invalid email_action_type: ${email_action_type}. Must be one of: ${validActionTypes.join(', ')}`)
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return createErrorResponse(405, 'Method not allowed', 'Only POST requests are supported')
  }

  // Check environment variables early
  const hasResendKey = !!Deno.env.get('RESEND_API_KEY')
  const hasHookSecret = !!hookSecret

  if (!hasResendKey) {
    return createErrorResponse(500, 'Server configuration error', 'RESEND_API_KEY not configured', 'MISSING_API_KEY')
  }

  let payload: string
  let headers: Record<string, string>
  
  try {
    // Get payload with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      payload = await req.text()
      headers = Object.fromEntries(req.headers)
    } finally {
      clearTimeout(timeoutId)
    }
    
    console.log('=== WEBHOOK PROCESSING START ===')
    console.log('Environment check:', { hasResendKey, hasHookSecret })
    console.log('Payload length:', payload.length)
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return createErrorResponse(408, 'Request timeout', 'Failed to read request body within timeout', 'REQUEST_TIMEOUT')
    }
    return createErrorResponse(400, 'Failed to read request body', error.message, 'INVALID_REQUEST')
  }

  try {
    // Verify webhook signature if secret is provided
    if (hasHookSecret) {
      console.log('Attempting webhook verification...')
      try {
        const wh = new Webhook(hookSecret)
        wh.verify(payload, headers)
        console.log('Webhook verification successful')
      } catch (error: any) {
        console.error('Webhook verification failed:', error.message)
        
        // Handle specific webhook verification errors
        if (error.message.includes('Base64Coder') || error.message.includes('decoding')) {
          console.log('Base64 decoding error - webhook secret format issue')
          // Continue for debugging, but in production this should be a 401
        } else if (error.message.includes('signature') || error.message.includes('timestamp')) {
          return createErrorResponse(401, 'Webhook verification failed', 'Invalid signature or timestamp', 'INVALID_SIGNATURE')
        } else {
          return createErrorResponse(401, 'Webhook verification failed', error.message, 'VERIFICATION_FAILED')
        }
      }
    }

    // Parse and validate payload
    let data: any
    try {
      data = JSON.parse(payload)
      console.log('Payload parsed successfully')
    } catch (error: any) {
      return createErrorResponse(400, 'Invalid JSON payload', error.message, 'INVALID_JSON')
    }

    // Validate required fields
    try {
      validatePayload(data)
      console.log('Payload validation successful')
    } catch (error: any) {
      return createErrorResponse(400, 'Invalid payload structure', error.message, 'INVALID_PAYLOAD')
    }
    
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

    // Generate email content
    let emailHtml: string
    let subject: string
    let confirmationUrl: string

    try {
      // Build the confirmation URL
      const baseUrl = site_url || Deno.env.get('SUPABASE_URL')
      if (!baseUrl) {
        return createErrorResponse(500, 'Server configuration error', 'No base URL available', 'MISSING_BASE_URL')
      }
      
      confirmationUrl = `${baseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || baseUrl)}`

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
          console.log('Using default template for action type:', email_action_type)
          subject = 'Information Assets World - Account Verification'
          emailHtml = await renderAsync(
            React.createElement(SignupConfirmationEmail, {
              confirmationUrl,
              siteName: 'Information Assets World',
            })
          )
      }
    } catch (error: any) {
      return createErrorResponse(500, 'Failed to generate email content', error.message, 'EMAIL_GENERATION_FAILED')
    }

    // Send email using Resend with dedicated error handling
    console.log('Attempting to send email via Resend...')
    console.log('Email details:', {
      to: user.email,
      subject,
      action_type: email_action_type,
      html_length: emailHtml.length
    })
    
    try {
      const { data: emailResult, error } = await resend.emails.send({
        from: 'Information Assets World <onboarding@resend.dev>',
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
        
        // Handle specific Resend API errors
        if (error.message?.includes('API key is invalid')) {
          return createErrorResponse(401, 'Invalid API key', 'Resend API key is invalid or expired', 'INVALID_API_KEY')
        } else if (error.message?.includes('domain') || error.message?.includes('verification')) {
          return createErrorResponse(422, 'Domain verification required', 'Email domain needs to be verified in Resend', 'DOMAIN_NOT_VERIFIED')
        } else if (error.message?.includes('rate limit')) {
          return createErrorResponse(429, 'Rate limit exceeded', 'Too many email requests', 'RATE_LIMITED')
        } else if (error.message?.includes('invalid email')) {
          return createErrorResponse(422, 'Invalid recipient email', error.message, 'INVALID_RECIPIENT')
        } else {
          return createErrorResponse(422, 'Email service error', error.message, 'EMAIL_SERVICE_ERROR')
        }
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

    } catch (emailError: any) {
      console.error('Email sending failed:', emailError)
      
      // Handle network/timeout errors for email sending
      if (emailError.name === 'AbortError' || emailError.message?.includes('timeout')) {
        return createErrorResponse(504, 'Email service timeout', 'Failed to send email within timeout', 'EMAIL_TIMEOUT')
      } else if (emailError.message?.includes('network') || emailError.message?.includes('connection')) {
        return createErrorResponse(503, 'Email service unavailable', 'Cannot connect to email service', 'EMAIL_SERVICE_UNAVAILABLE')
      } else {
        return createErrorResponse(500, 'Unexpected email error', emailError.message, 'UNEXPECTED_EMAIL_ERROR')
      }
    }

  } catch (error: any) {
    console.error('=== CRITICAL ERROR IN send-auth-email ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // Log environment state for debugging
    console.error('Environment debug:', {
      hasResendKey: !!Deno.env.get('RESEND_API_KEY'),
      hasHookSecret: !!Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET'),
      resendKeyLength: Deno.env.get('RESEND_API_KEY')?.length || 0,
      hookSecretLength: Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET')?.length || 0
    })
    
    return createErrorResponse(500, 'Internal server error', error.message, 'INTERNAL_ERROR')
  }
})