import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { to, clientName, freelancerName, jobTitle, jobId, applicationUrl } = await req.json()

    const emailBody = `
      <h2>New Job Application</h2>
      <p>Hello ${clientName},</p>
      <p><strong>${freelancerName}</strong> has applied for your job: <strong>${jobTitle}</strong></p>
      <p><a href="${applicationUrl}">View Application</a></p>
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
        subject: `New Application: ${jobTitle}`,
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

