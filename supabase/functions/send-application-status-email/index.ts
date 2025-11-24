import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, freelancerName, jobTitle, status, reason, jobUrl } = await req.json()

    const statusText = status === 'accepted' ? 'accepted' : 'declined'
    const statusEmoji = status === 'accepted' ? '✅' : '❌'
    
    const emailBody = `
      <h2>${statusEmoji} Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h2>
      <p>Hello ${freelancerName},</p>
      <p>Your application for <strong>${jobTitle}</strong> has been <strong>${statusText}</strong>.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p><a href="${jobUrl}">View Job</a></p>
      <p>Best regards,<br>NaijaFreelance Team</p>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'NaijaFreelance <onboarding@resend.dev>',
        to: [to],
        subject: `Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}: ${jobTitle}`,
        html: emailBody,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

