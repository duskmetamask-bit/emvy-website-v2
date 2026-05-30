'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import CalBookingGate from './CalBookingGate'

type QuestionKey = 'call_handling' | 'time_waste' | 'bottlenecks' | 'automate_first' | 'double_entry' | 'team_size' | 'tools' | 'problem_duration' | 'tried_fix' | 'time_back'

type Question = {
  key: QuestionKey
  prompt: string
  help?: string
  options?: { value: string; label: string; score: number }[]
  multiSelect?: boolean
}

const questions: Question[] = [
  {
    key: 'call_handling',
    prompt: 'When clients call and you are busy, what actually happens?',
    options: [
      { value: 'voicemail_forget', label: 'They leave a voicemail I forget about', score: 10 },
      { value: 'hang_up', label: 'They hang up and I never hear from them', score: 15 },
      { value: 'call_back_late', label: 'I call back but it takes hours', score: 8 },
      { value: 'email_inbox', label: 'They email instead — adding to my inbox', score: 5 },
      { value: 'book_online', label: 'They book online and I get a notification', score: 3 },
    ],
  },
  {
    key: 'time_waste',
    prompt: 'What takes up the most time each week?',
    options: [
      { value: 'emails_admin', label: 'Emails, admin, and paperwork', score: 12 },
      { value: 'client_comm', label: 'Client communication and follow-ups', score: 10 },
      { value: 'scheduling', label: 'Scheduling, appointments, and dispatch', score: 8 },
      { value: 'invoicing', label: 'Invoicing, payments, and chasing money', score: 10 },
      { value: 'data_entry', label: 'Data entry and reporting', score: 12 },
      { value: 'marketing', label: 'Social media and marketing', score: 5 },
    ],
  },
  {
    key: 'bottlenecks',
    prompt: 'Where do things slow down or get stuck?',
    options: [
      { value: 'approvals', label: 'Getting client approvals and sign-offs', score: 10 },
      { value: 'follow_ups', label: 'Following up with clients — they go quiet', score: 12 },
      { value: 'quotes', label: 'Getting quotes and proposals out the door', score: 8 },
      { value: 'handoffs', label: 'Handoffs between team members', score: 10 },
      { value: 'scheduling', label: 'Job scheduling and dispatching', score: 8 },
      { value: 'decisions', label: 'Getting information to make decisions', score: 10 },
    ],
  },
  {
    key: 'automate_first',
    prompt: 'What would you automate first?',
    options: [
      { value: 'client_comm', label: 'Client communication and updates', score: 12 },
      { value: 'reminders', label: 'Appointment reminders and scheduling', score: 10 },
      { value: 'invoices', label: 'Invoices, payments, and follow-ups', score: 12 },
      { value: 'job_alloc', label: 'Job allocation and dispatch', score: 8 },
      { value: 'reporting', label: 'Reporting and business summaries', score: 8 },
      { value: 'data_entry', label: 'Data entry across multiple tools', score: 10 },
    ],
  },
  {
    key: 'double_entry',
    prompt: 'Where does the same information get typed more than once?',
    options: [
      { value: 'client_details', label: 'Client details and contacts', score: 10 },
      { value: 'quotes_invoices', label: 'Quotes and invoices', score: 12 },
      { value: 'job_notes', label: 'Job notes and descriptions', score: 10 },
      { value: 'addresses', label: 'Addresses and locations', score: 8 },
      { value: 'team_messages', label: 'Team messages and updates', score: 5 },
      { value: 'product_info', label: 'Product and service information', score: 8 },
    ],
  },
  {
    key: 'team_size',
    prompt: 'How many people work in your business?',
    options: [
      { value: 'solo', label: 'Just me', score: 5 },
      { value: '2_5', label: '2–5 people', score: 10 },
      { value: '6_15', label: '6–15 people', score: 15 },
      { value: '16_50', label: '16–50 people', score: 20 },
      { value: '50_plus', label: '50+', score: 25 },
    ],
  },
  {
    key: 'tools',
    prompt: 'What tools does your team currently use?',
    help: 'Select all that apply',
    multiSelect: true,
    options: [
      { value: 'xero', label: 'Xero / MYOB / QuickBooks', score: 5 },
      { value: 'calendly', label: 'Calendly / Acuity / Dubsado', score: 5 },
      { value: 'email', label: 'Gmail / Outlook', score: 3 },
      { value: 'slack', label: 'Slack / Teams', score: 3 },
      { value: 'jobber', label: 'Jobber / Tradify / ServiceM8', score: 5 },
      { value: 'none', label: 'None / pen and paper', score: 0 },
    ],
  },
  {
    key: 'problem_duration',
    prompt: 'How long has this been a problem?',
    options: [
      { value: 'few_weeks', label: 'A few weeks', score: 5 },
      { value: 'few_months', label: 'A few months', score: 10 },
      { value: 'about_year', label: 'About a year', score: 15 },
      { value: 'over_year', label: 'Over a year — I have tried things', score: 20 },
    ],
  },
  {
    key: 'tried_fix',
    prompt: 'What have you already tried to fix this?',
    options: [
      { value: 'nothing', label: 'Nothing yet — just looking', score: 0 },
      { value: 'tool_complicated', label: 'Tried a tool but it was too complicated', score: 10 },
      { value: 'hired_no', label: 'Hired someone but they did not get it', score: 12 },
      { value: 'started_stopped', label: 'Started something but could not finish', score: 8 },
      { value: 'ai_no_stick', label: 'Tried AI tools but they did not stick', score: 10 },
    ],
  },
  {
    key: 'time_back',
    prompt: 'If you got 40% of your time back, what would change?',
    options: [
      { value: 'no_weekends', label: 'I would stop working on weekends', score: 12 },
      { value: 'more_clients', label: 'I could take on more clients', score: 15 },
      { value: 'family_time', label: 'I would spend more time with family', score: 12 },
      { value: 'grow_business', label: 'I would focus on growing the business', score: 15 },
      { value: 'holiday', label: 'I would actually take a holiday', score: 10 },
    ],
  },
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

export default function OperationsAuditQuiz() {
  const [answers, setAnswers] = useState<Record<QuestionKey, string | string[]>>({
    call_handling: '',
    time_waste: '',
    bottlenecks: '',
    automate_first: '',
    double_entry: '',
    team_size: '',
    tools: [],
    problem_duration: '',
    tried_fix: '',
    time_back: '',
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      const answer = answers[question.key]
      if (Array.isArray(answer)) {
        return total + answer.reduce((sum, val) => {
          const opt = question.options?.find((o) => o.value === val)
          return sum + (opt?.score ?? 0)
        }, 0)
      }

      const selected = question.options?.find((option) => option.value === answer)
      return total + (selected?.score ?? 0)
    }, 0)
  }, [answers])

  const result = useMemo(() => getResult(score), [score])

  const handleMultiSelect = (key: QuestionKey, value: string) => {
    setAnswers((prev) => {
      const current = (prev[key] as string[]) || []
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((v) => v !== value) }
      }
      return { ...prev, [key]: [...current, value] }
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setSending(true)
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, score, answers }),
      })
      if (response.ok) {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Failed to send report:', err)
    } finally {
      setSending(false)
    }
  }

  const currentQ = questions[currentQuestion]
  const currentAnswer = answers[currentQ.key]
  const isAnswered = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : !!currentAnswer

  if (submitted) {
    return (
      <section className="section">
        <div className="quiz-summary-card quiz-result-card">
          <p className="section-kicker">Assessment complete</p>
          <h2>{result.title}</h2>
          <p>{result.body}</p>
          <div className="quiz-result-grid">
            <div className="quiz-score-tile">
              <span>Score</span>
              <strong>{score}</strong>
              <p>Based on your operational efficiency across key areas.</p>
            </div>
            <div className="quiz-score-tile">
              <span>Priority Level</span>
              <strong>{result.title}</strong>
              <p>{result.recommendation}</p>
            </div>
          </div>

          <div className="quiz-actions">
            <CalBookingGate triggerLabel="Book discovery call" className="button primary" />
            <a href="/contact" className="button secondary">
              Contact us
            </a>
          </div>
        </div>
      </section>
    )
  }

  if (!quizStarted) {
    return (
      <section className="section">
        <div className="lp-grid quiz-grid">
          <div className="quiz-intro quiz-copy">
            <p className="section-kicker">Mini Ops Assessment</p>
            <h1 className="section-title">See which next step fits your business best.</h1>
            <p className="section-text">
              Focused around the mini ops assessment of 10 questions that will give a prioritised action plan. A specific gaps mapped with fixes and realistic ROI.
            </p>
            <div className="quiz-start-info">
              <div className="quiz-start-item">
                <CheckCircle2 size={20} />
                <span>10 questions</span>
              </div>
              <div className="quiz-start-item">
                <CheckCircle2 size={20} />
                <span>Takes 2 minutes</span>
              </div>
              <div className="quiz-start-item">
                <CheckCircle2 size={20} />
                <span>Free ops efficiency report</span>
              </div>
            </div>
            <button
              type="button"
              className="button primary"
              onClick={() => setQuizStarted(true)}
            >
              Start Here <ArrowRight size={16} />
            </button>
          </div>

          <div className="quiz-card quiz-card-start">
            <div className="quiz-start-graphic">
              <span>10</span>
              <p>Questions</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="quiz-container">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
        </div>
        <div className="quiz-progress-text">
          Question {currentQuestion + 1} of {questions.length}
        </div>

        <div className="quiz-question-card">
          <h2>{currentQ.prompt}</h2>
          {currentQ.help && <span className="quiz-help">{currentQ.help}</span>}

          {currentQ.multiSelect ? (
            <div className="quiz-options quiz-options-multi">
              {currentQ.options?.map((option) => {
                const selected = ((currentAnswer as string[]) || []).includes(option.value)
                return (
                  <label key={option.value} className={`quiz-option ${selected ? 'is-selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleMultiSelect(currentQ.key, option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                )
              })}
            </div>
          ) : (
            <div className="quiz-options">
              {currentQ.options?.map((option) => {
                const selected = currentAnswer === option.value
                return (
                  <label key={option.value} className={`quiz-option ${selected ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name={currentQ.key}
                      value={option.value}
                      checked={selected}
                      onChange={() => setAnswers((prev) => ({ ...prev, [currentQ.key]: option.value }))}
                    />
                    <span>{option.label}</span>
                  </label>
                )
              })}
            </div>
          )}

          <div className="quiz-nav-buttons">
            <button
              type="button"
              className="button secondary"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              Back
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button
                type="button"
                className="button primary"
                onClick={handleNext}
                disabled={!isAnswered}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="button primary"
                onClick={handleSubmit}
                disabled={!isAnswered || !name || !email || sending}
              >
                {sending ? 'Sending...' : 'See Results'} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {currentQuestion === questions.length - 1 && (
          <div className="quiz-contact-section">
            <h3>Where should we send your report?</h3>
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
          </div>
        )}
      </div>
    </section>
  )
}
