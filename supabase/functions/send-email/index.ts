import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequestPayload {
  type: 'welcome' | 'password_reset' | 'custom'
  to: string
  name?: string
  resetUrl?: string
  subject?: string
  html?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not configured')
    }

    const payload: EmailRequestPayload = await req.json()
    const { type, to, name, resetUrl, subject, html } = payload

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Missing required "to" email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let emailSubject = subject || 'Notification from Reward Chart'
    let emailHtml = html || ''
    const sender = Deno.env.get('RESEND_SENDER_EMAIL') || 'Reward Chart <onboarding@resend.dev>'

    if (type === 'welcome') {
      const userName = name || 'Parent'
      emailSubject = 'Welcome to Reward Chart! 🌟'
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { text-align: center; margin-bottom: 24px; }
            .badge { display: inline-block; background: #fff7ed; color: #f97316; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; border: 1px solid #ffedd5; }
            h1 { font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 12px 0; }
            p { font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 16px 0; }
            .card { background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
            .btn { display: inline-block; background: linear-gradient(to right, #f59e0b, #f97316); color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; margin-top: 12px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25); }
            .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #9ca3af; border-t: 1px solid #f3f4f6; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="badge">Reward Chart</div>
              <h1>Welcome to Reward Chart, ${userName}! 🎉</h1>
            </div>
            <p>Thank you for joining Reward Chart! We are super excited to help you transform everyday chores and responsibilities into fun, engaging digital conquests for your family.</p>
            
            <div class="card">
              <h3 style="margin: 0 0 8px 0; color: #9a3412;">Ready to Get Started?</h3>
              <p style="margin: 0; font-size: 14px; color: #7c2d12;">Create your children's profiles, add custom tasks, and start setting up exciting rewards!</p>
            </div>

            <p>If you have any questions or feedback, simply reply to this email. We're here to help!</p>
            
            <div class="footer">
              © 2026 Reward Chart. Transforming family responsibilities into magical digital conquests.
            </div>
          </div>
        </body>
        </html>
      `
    } else if (type === 'password_reset') {
      const userName = name || 'User'
      emailSubject = 'Reset Your Password - Reward Chart 🔒'
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { text-align: center; margin-bottom: 24px; }
            .badge { display: inline-block; background: #fef2f2; color: #ef4444; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; border: 1px solid #fee2e2; }
            h1 { font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 12px 0; }
            p { font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 16px 0; }
            .btn-container { text-align: center; margin: 28px 0; }
            .btn { display: inline-block; background: #ef4444; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25); }
            .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #9ca3af; border-t: 1px solid #f3f4f6; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="badge">Security Notification</div>
              <h1>Password Reset Request</h1>
            </div>
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password for your Reward Chart account. Click the button below to choose a new password:</p>
            
            ${resetUrl ? `
            <div class="btn-container">
              <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
            </div>
            <p style="font-size: 13px; color: #6b7280;">If the button above does not work, copy and paste this link into your browser:<br><a href="${resetUrl}" style="color: #ef4444; word-break: break-all;">${resetUrl}</a></p>
            ` : `<p>Please follow the password reset link sent to your device.</p>`}

            <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <div class="footer">
              © 2026 Reward Chart Security Team
            </div>
          </div>
        </body>
        </html>
      `
    }

    // Call Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [to],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API Error:', resendData)
      return new Response(
        JSON.stringify({ error: resendData.message || 'Failed to send email via Resend' }),
        { status: resendResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Send email error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
