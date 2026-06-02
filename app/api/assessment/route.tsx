import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { Resend } from 'resend'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import AssessmentReport from '@/lib/pdf/AssessmentReport'

const resend = new Resend(process.env.RESEND_API_KEY)
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

const questions = [
  { key: 'call_handling', prompt: 'When clients call and you are busy, what actually happens?' },
  { key: 'time_waste', prompt: 'What takes up the most time each week?' },
  { key: 'bottlenecks', prompt: 'Where do things slow down or get stuck?' },
  { key: 'automate_first', prompt: 'What would you automate first?' },
  { key: 'double_entry', prompt: 'Where does the same information get typed more than once?' },
  { key: 'team_size', prompt: 'How many people work in your business?' },
  { key: 'tools', prompt: 'What tools does your team currently use?' },
  { key: 'problem_duration', prompt: 'How long has this been a problem?' },
  { key: 'tried_fix', prompt: 'What have you already tried to fix this?' },
  { key: 'time_back', prompt: 'If you got 40% of your time back, what would change?' },
]

function getResult(score: number) {
  if (score >= 120) {
    return {
      title: 'High Priority',
      body: 'Your business has significant operational inefficiencies. A targeted build would free up substantial time and improve client experience.',
      recommendation: 'Book a discovery call to discuss a full automation and workflow rebuild.',
    }
  }
  if (score >= 80) {
    return {
      title: 'Moderate Priority',
      body: 'There are clear areas where AI and automation could reduce your admin load and improve response times.',
      recommendation: 'Book a discovery call to discuss an audit and targeted improvements.',
    }
  }
  if (score >= 50) {
    return {
      title: 'Early Stage',
      body: 'You are in the early stages of identifying inefficiencies. A structured approach would help you prioritise what to fix first.',
      recommendation: 'Book a discovery call to map out the right starting point.',
    }
  }
  return {
    title: 'Good Foundation',
    body: 'Your operations are relatively streamlined. Small improvements could still create meaningful time savings.',
    recommendation: 'Book a discovery call to explore quick wins.',
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, score, answers } = body

    if (!name || !email || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = getResult(score)

    // Save to Convex first (capture leadId for CTA attribution)
    let leadId: string | null = null
    try {
      const saved = await convex.mutation(api.assessment.submissions.saveSubmission, {
        name,
        email,
        score,
        priorityLevel: result.title,
        priorityDescription: result.body,
        recommendation: result.recommendation,
        answers,
      })
      leadId = saved?.leadId ?? null
    } catch (convexError) {
      console.error('Convex save error:', convexError)
    }

    // Build Cal.com CTA URL with leadId + UTM
    const ctaUrl = (() => {
      const base = process.env.CALCOM_BOOKING_URL || 'https://cal.com/emvy/discovery-call'
      const url = new URL(base)
      url.searchParams.set('utm_source', 'pdf')
      url.searchParams.set('utm_medium', 'email')
      url.searchParams.set('utm_campaign', 'assessment')
      if (leadId) url.searchParams.set('leadId', leadId)
      return url.toString()
    })()

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <AssessmentReport
        name={name}
        score={score}
        priorityLevel={result.title}
        priorityDescription={result.body}
        recommendation={result.recommendation}
        answers={answers}
        questions={questions}
        calUrl={ctaUrl}
      />
    )

    // Send email with PDF
    const { data, error } = await resend.emails.send({
      from: 'EMVY <noreply@emvyai.com>',
      to: email,
      subject: 'Your EMVY Mini Ops Assessment Report',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #05070b; font-size: 24px; margin-bottom: 20px;">Your Ops Efficiency Report</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thanks for completing the EMVY Mini Ops Assessment. Based on your responses, here is your personalised ops efficiency report.
          </p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #333; margin: 0 0 10px;"><strong>Your Score:</strong> ${score}</p>
            <p style="color: #333; margin: 0 0 10px;"><strong>Priority Level:</strong> ${result.title}</p>
            <p style="color: #333; margin: 0;">${result.body}</p>
          </div>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
<strong>Recommended Next Steps:</strong> ${result.recommendation}
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Your full report is attached as a PDF.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Ready to take the next step?<a href="${ctaUrl}" style="color: #56d9ff;">Book a free discovery call</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            emvy.ai
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'EMVY-Ops-Assessment-Report.pdf',
          content: pdfBuffer.toString('base64'),
        },
      ],
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Assessment API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
