'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck, Sparkles } from 'lucide-react'
import CalBookingGate from './CalBookingGate'

type AnswerKey = 'team' | 'urgency' | 'offer' | 'support'

type QuizAnswer = {
  value: string
  label: string
  score: number
}

const questions: Array<{
  key: AnswerKey
  label: string
  prompt: string
  help: string
  options: QuizAnswer[]
}> = [
  {
    key: 'team',
    label: 'Team size',
    prompt: 'How big is the team that would use this system?',
    help: 'This helps us judge how much workflow structure and handoff support you need.',
    options: [
      { value: 'solo', label: 'Just me', score: 12 },
      { value: 'small', label: '2 to 5 people', score: 24 },
      { value: 'growing', label: '6 to 15 people', score: 36 },
      { value: 'scale', label: '15+ people', score: 48 },
    ],
  },
  {
    key: 'urgency',
    label: 'Urgency',
    prompt: 'How soon do you want this solved?',
    help: 'Urgency changes whether we start with an audit, a build, or a staged delivery plan.',
    options: [
      { value: 'exploring', label: 'Just exploring', score: 8 },
      { value: 'quarter', label: 'Within this quarter', score: 18 },
      { value: 'month', label: 'Within 30 days', score: 28 },
      { value: 'now', label: 'We need it now', score: 40 },
    ],
  },
  {
    key: 'offer',
    label: 'Current state',
    prompt: 'What best describes where you are right now?',
    help: 'We want to know if you need strategy, delivery, or operational cleanup.',
    options: [
      { value: 'idea', label: 'We only have an idea', score: 10 },
      { value: 'manual', label: 'We do this manually', score: 22 },
      { value: 'some-tools', label: 'We have tools, but no system', score: 34 },
      { value: 'legacy', label: 'We have an existing system to improve', score: 46 },
    ],
  },
  {
    key: 'support',
    label: 'Support level',
    prompt: 'What kind of help are you expecting?',
    help: 'This helps us decide whether the right fit is an audit, build, maintenance, or the full stack.',
    options: [
      { value: 'audit', label: 'A clear audit and recommendations', score: 12 },
      { value: 'build', label: 'A build or automation project', score: 28 },
      { value: 'ongoing', label: 'Ongoing maintenance and ops', score: 40 },
      { value: 'full', label: 'A complete business system', score: 50 },
    ],
  },
]

const nextSteps = [
  {
    icon: <Clock3 size={18} />,
    title: 'Discovery call',
    body: 'We confirm the problem, the goal, and whether the best next step is an audit or a build.',
  },
  {
    icon: <ShieldCheck size={18} />,
    title: 'Review and payment',
    body: 'If you move forward, we send the correct invoice or payment link before the deeper work begins.',
  },
  {
    icon: <Sparkles size={18} />,
    title: 'Audit or build',
    body: 'We document the findings, map the deliverables, and move into the delivery workflow.',
  },
]

function getResult(score: number) {
  if (score >= 145) {
    return {
      title: 'Full system build',
      body: 'You look like a strong fit for a larger build with process design, delivery, and ongoing maintenance.',
      recommendation: 'Book the discovery call, then move into a scoped build plan and payment step.',
    }
  }

  if (score >= 95) {
    return {
      title: 'Audit first, then build',
      body: 'You likely need a structured audit to identify the highest-value improvements before implementation.',
      recommendation: 'Book the call, complete the audit, and use the findings to scope the build.',
    }
  }

  return {
    title: 'Start with discovery',
    body: 'You are likely in the early stage, so the best move is to clarify the problem and map the right path.',
    recommendation: 'Book the discovery call and decide whether an audit or a build is the next step.',
  }
}

export default function OperationsAuditQuiz() {
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>({
    team: '',
    urgency: '',
    offer: '',
    support: '',
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      const selected = question.options.find((option) => option.value === answers[question.key])
      return total + (selected?.score ?? 0)
    }, 0)
  }, [answers])

  const result = useMemo(() => getResult(score), [score])

  if (submitted) {
    return (
      <section className="section">
        <div className="quiz-summary-card quiz-result-card">
          <p className="section-kicker">Quiz complete</p>
          <h2>{result.title}</h2>
          <p>{result.body}</p>
          <div className="quiz-result-grid">
            <div className="quiz-score-tile">
              <span>Score</span>
              <strong>{score}</strong>
              <p>Higher scores usually mean more operational complexity.</p>
            </div>
            <div className="quiz-score-tile">
              <span>Lead type</span>
              <strong>{result.title}</strong>
              <p>{result.recommendation}</p>
            </div>
            <div className="quiz-score-tile">
              <span>Next action</span>
              <strong>Book call</strong>
              <p>We use the discovery call to decide audit, build, or maintenance.</p>
            </div>
          </div>

          <div className="quiz-breakdown">
            {questions.map((question) => {
              const selected = question.options.find((option) => option.value === answers[question.key])
              return (
                <div key={question.key}>
                  <strong>{question.label}</strong>
                  <span>{selected?.label ?? 'Not answered'}</span>
                  <p>{question.help}</p>
                </div>
              )
            })}
          </div>

          <div className="quiz-actions">
            <CalBookingGate triggerLabel="Book discovery call" className="button primary" />
            <a href="/process" className="button secondary">
              Review the process
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="lp-grid quiz-grid">
        <div className="quiz-intro quiz-copy">
          <p className="section-kicker">AI readiness quiz</p>
          <h1 className="section-title">See which next step fits your business best.</h1>
          <p className="section-text">
            This quiz gives a quick directional score so we can tell whether you need a discovery
            conversation, an audit, or a more substantial build and maintenance plan.
          </p>

          <div className="quiz-start-panel">
            {nextSteps.map((step, index) => (
              <div key={step.title} className="quiz-start-steps">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>
                  {step.icon} {step.title}
                </strong>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="quiz-card">
          <div className="quiz-topbar">
            <div>
              <p className="quiz-step-label">Step 1 of 4</p>
              <strong>Quick intake</strong>
            </div>
            <span>{score} points</span>
          </div>

          <div className="quiz-progress" aria-hidden="true">
            <div style={{ width: `${Math.min(100, (score / 184) * 100)}%` }} />
          </div>

          <form
            className="quiz-form"
          onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
              if (typeof window !== 'undefined') {
                const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer ?? []
                dataLayer.push({
                  event: 'quiz_submit',
                  score,
                  email,
                  name,
                })
                ;(window as Window & { dataLayer?: unknown[] }).dataLayer = dataLayer
              }
            }}
          >
            <div className="quiz-questions">
              {questions.map((question) => (
                <fieldset key={question.key} className="quiz-question">
                  <legend>
                    <strong>{question.prompt}</strong>
                    <span>{question.help}</span>
                  </legend>

                  <div className="quiz-options">
                    {question.options.map((option) => {
                      const selected = answers[question.key] === option.value
                      return (
                        <label key={option.value} className={`quiz-option ${selected ? 'is-selected' : ''}`}>
                          <input
                            type="radio"
                            name={question.key}
                            value={option.value}
                            checked={selected}
                            onChange={() => setAnswers((prev) => ({ ...prev, [question.key]: option.value }))}
                            required
                          />
                          <span>{option.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="quiz-contact-grid">
              <label>
                <span>Name</span>
                <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </label>
            </div>

            <div className="quiz-actions">
              <button type="submit" className="button primary">
                See my result <ArrowRight size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)' }}>
                <CheckCircle2 size={16} />
                <span>We use this to guide the next call.</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
