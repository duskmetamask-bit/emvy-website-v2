import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Phone, Clock, Zap, MessageSquare, CheckCircle2, Calendar, Shield } from 'lucide-react'
import TrackedLink from '../../components/TrackedLink'
import CalBookingGate from '../../components/CalBookingGate'

export const metadata: Metadata = {
  title: 'Spark Response — AI Receptionist for Electricians',
  description:
    'Never miss another job enquiry. An AI phone receptionist that answers every call 24/7, captures leads, and books callbacks — even when you are on the tools.',
}

const FAKE_CALL_STEPS = [
  {
    who: 'caller',
    text: 'Hi, I need an electrician. Got a fault on my switchboard.',
    time: '9:02 AM',
  },
  {
    who: 'ai',
    text: "Hi! I'm Jake's AI assistant. Happy to help. What's your address so I can check availability?",
    time: '9:02 AM',
  },
  {
    who: 'caller',
    text: '14 Larkham Court, Warnbro. RCD keeps tripping.',
    time: '9:03 AM',
  },
  {
    who: 'ai',
    text: "Got it — switchboard fault is a common one. Jake is free Thursday 2pm. Want me to book you in?",
    time: '9:03 AM',
  },
  {
    who: 'caller',
    text: 'Yes, Thursday works. Can you send me the address again?',
    time: '9:04 AM',
  },
  {
    who: 'ai',
    text: "Booked! Jake will be at 14 Larkham Court, Warnbro, Thursday 2pm. I've sent a confirmation to your number. See you then!",
    time: '9:04 AM',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Call comes in',
    body: 'Your existing number rings the AI receptionist. No new hardware, no app to download. Calls are answered in 2 seconds or less.',
  },
  {
    step: '02',
    title: 'AI captures the job',
    body: 'Name, phone, address, and job type are extracted naturally during the conversation. FAQs are handled on the spot — no time wasted on hold.',
  },
  {
    step: '03',
    title: 'You get the lead',
    body: 'SMS + Telegram arrives with the full job details. If the caller wants a callback, a Cal.com slot is booked automatically.',
  },
]

const PRICING_FEATURES = [
  '24/7 inbound call answering',
  'Lead capture: name, phone, address, job type',
  'FAQ handling (common electrical questions)',
  'After-hours message + callback booking',
  'SMS confirmation to caller',
  'Telegram + SMS alert to you with full lead details',
  'Call logging to dashboard',
  'Cal.com booking integration',
]

export default function SparkResponsePage() {
  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="page-hero__media" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1800&q=90&auto=format&fit=crop"
            alt=""
          />
        </div>
        <div className="page-hero__overlay" />
        <div className="page-hero-copy">
          <p className="section-kicker">For electricians</p>
          <h1>Never miss another job enquiry.</h1>
          <p>
            An AI phone receptionist that answers every call 24/7, captures the job details,
            and books a callback — even when you are under a house or on a roof.
          </p>
          <div className="page-hero-actions">
            <CalBookingGate
              triggerLabel="Book a free demo call"
              className="button primary"
              eventLabel="spark-response-hero"
            />
            <TrackedLink
              href="/assessment"
              className="button secondary"
              eventName="quiz_start"
              eventLabel="spark-response-hero"
            >
              Take the 2-min Mini AI Strategy Assessment
            </TrackedLink>
          </div>
          <div className="hero-ribbon">
            <strong>No setup fees.</strong>
            <span>$300–$500/month. Cancel any time.</span>
          </div>
        </div>
      </section>

      {/* LIVE DEMO */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">See it in action</p>
          <h2 className="section-title">What a real call looks like.</h2>
          <p className="section-text">
            This is a simulated conversation. The AI handles the call while you stay on the tools.
          </p>
        </div>

        <div className="spark-call-demo">
          <div className="spark-call-header">
            <div className="spark-call-header-left">
              <Phone size={14} />
              <span>Incoming call — 9:02:14 AM</span>
            </div>
            <div className="spark-call-status">
              <span className="spark-live-dot" aria-hidden="true" />
              LIVE
            </div>
          </div>

          <div className="spark-call-body">
            {FAKE_CALL_STEPS.map((msg, i) => (
              <div
                key={i}
                className={`spark-msg spark-msg--${msg.who}`}
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                <div className="spark-msg-bubble">{msg.text}</div>
                <div className="spark-msg-time">{msg.time}</div>
              </div>
            ))}
          </div>

          <div className="spark-call-footer">
            <div className="spark-lead-captured">
              <CheckCircle2 size={14} />
              <span>Lead captured — SMS sent to caller — Cal.com slot booked</span>
            </div>
          </div>
        </div>

        <div className="spark-call-legend">
          <div className="spark-legend-item">
            <div className="spark-legend-dot spark-legend-dot--caller" />
            <span>Customer</span>
          </div>
          <div className="spark-legend-item">
            <div className="spark-legend-dot spark-legend-dot--ai" />
            <span>AI Receptionist</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">How it works</p>
          <h2 className="section-title">Three steps from call to booked job.</h2>
        </div>
        <div className="process-grid process-grid-strong">
          {HOW_IT_WORKS.map((step) => (
            <article key={step.step} className="process-card process-card-strong">
              <span className="process-number">Step {step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PAINS */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">The problem</p>
          <h2 className="section-title">Every missed call is a job you never got paid for.</h2>
          <p className="section-text">
            Industry data puts the average electrical job at $1,200. A 5-minute voicemail delay
            means the customer has already booked someone else.
          </p>
        </div>
        <div className="lead-grid">
          <article className="proof-card">
            <Clock size={18} />
            <h3>You finish a job at 5pm</h3>
            <p>You call back the enquiry — it goes to voicemail. You leave a message. They have already booked another electrician.</p>
          </article>
          <article className="proof-card">
            <Phone size={18} />
            <h3>You are on a roof</h3>
            <p>The phone rings. You cannot answer. The caller rings the next name on Google. You never find out the job existed.</p>
          </article>
          <article className="proof-card">
            <Zap size={18} />
            <h3>After-hours enquiries vanish</h3>
            <p>A business owner calls at 7pm with an urgent fault. Your voicemail does not answer. They call an emergency electrician — not you.</p>
          </article>
          <article className="proof-card">
            <MessageSquare size={18} />
            <h3>You spend evenings quoting</h3>
            <p>You get home, assess the photos, write a quote. The customer already has three quotes. Speed wins — and you were too slow.</p>
          </article>
        </div>
      </section>

      {/* PRICING */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Pricing</p>
          <h2 className="section-title">Simple, all-inclusive pricing.</h2>
          <p className="section-text">
            No setup fees. No per-call charges. Just one flat monthly rate.
          </p>
        </div>
        <div className="spark-pricing-card">
          <div className="spark-pricing-header">
            <div>
              <p className="spark-pricing-label">Spark Response</p>
              <p className="spark-pricing-sublabel">For independent electricians</p>
            </div>
            <div className="spark-pricing-amount">
              <span className="spark-pricing-dollar">$</span>
              <span className="spark-pricing-number">300</span>
              <span className="spark-pricing-period">/month</span>
            </div>
          </div>
          <p className="spark-pricing-range">$300–$500 based on call volume</p>
          <ul className="spark-pricing-features">
            {PRICING_FEATURES.map((f) => (
              <li key={f}>
                <CheckCircle2 size={14} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="spark-pricing-cta">
            <CalBookingGate
              triggerLabel="Book a free demo"
              className="button primary"
              eventLabel="spark-response-pricing"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="section-header">
          <p className="section-kicker">Common questions</p>
          <h2 className="section-title">What electricians ask before signing up.</h2>
        </div>
        <div className="lead-grid">
          <article className="proof-card">
            <h3>Do I need new hardware?</h3>
            <p>No. Spark Response forwards your existing number — calls come straight to the AI. Your customers call the same number they always have.</p>
          </article>
          <article className="proof-card">
            <h3>What if the AI cannot answer a question?</h3>
            <p>The AI handles common electrical FAQs — pricing, service areas, booking questions. For anything complex, it takes a message and flags you immediately via Telegram.</p>
          </article>
          <article className="proof-card">
            <h3>What if I want to talk to the customer myself?</h3>
            <p>You can dial in at any time or set after-hours routing. The AI captures the lead and sends you everything before you call back — so you sound like you already know the job.</p>
          </article>
          <article className="proof-card">
            <h3>How does the booking integration work?</h3>
            <p>Cal.com syncs your availability. The AI offers the next open slot to the caller and books it directly — no back-and-forth, no manual entry.</p>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="section final-cta-section">
        <div className="section-header">
          <p className="section-kicker">Next step</p>
          <h2 className="section-title">Book a 15-minute demo call.</h2>
          <p className="section-text">
            We will call your number, show you what the AI sounds like on a live call,
            and answer any questions. No pitch, no commitment.
          </p>
        </div>
        <div className="final-cta-grid">
          <article className="final-cta-card">
            <p className="service-flow-number">01</p>
            <h3>
              <Calendar size={18} /> Book the demo
            </h3>
            <p>15 minutes. We call you, show the AI live, answer questions.</p>
            <CalBookingGate
              triggerLabel="Book Free Demo Call"
              className="button primary"
              eventLabel="spark-response-final-cta"
            />
          </article>
          <article className="final-cta-card">
            <p className="service-flow-number">02</p>
            <h3>
              <Shield size={18} /> Take the assessment first
            </h3>
            <p>2-minute quiz scores your current admin load and identifies your biggest time leak.</p>
            <TrackedLink
              href="/assessment"
              className="button secondary"
              eventName="quiz_start"
              eventLabel="spark-response-final-cta"
            >
              Start the quiz
            </TrackedLink>
          </article>
        </div>
      </section>
    </>
  )
}
