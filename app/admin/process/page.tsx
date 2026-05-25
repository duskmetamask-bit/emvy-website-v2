import { ClipboardList, MailQuestion, Mic, Sparkles } from 'lucide-react'
import { auditQuestions, buildQuestions, engagementFlow, paymentStandard } from '@/lib/emvy-process'

const opsCards = [
  { title: 'Email handoff', body: 'Send the decision email with the recommended next step and payment link.', icon: MailQuestion },
  { title: 'Meeting notes', body: 'Capture structured notes from audit and build calls so nothing gets lost.', icon: Mic },
  { title: 'Deliverable format', body: 'Turn the notes into a presentable audit or build summary for the client.', icon: ClipboardList },
  { title: 'Automation path', body: 'Later, the same flow can be triggered and documented by an agent.', icon: Sparkles },
]

export default function AdminProcessPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Engagement flow</p>
          <h2>The workflow from booked call to payment, delivery, and maintenance.</h2>
          <p>
            This private view keeps the engagement steps clear so the operating board matches the
            client journey.
          </p>
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {opsCards.map((item) => (
          <article key={item.title} className="emvy-card">
            <item.icon size={18} />
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="emvy-panel">
        <div className="emvy-panel__heading">
          <div>
            <p className="section-kicker">Payment standard</p>
            <h3>How the money step should work.</h3>
          </div>
        </div>
        <div className="emvy-gap__chips">
          {paymentStandard.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {[auditQuestions, buildQuestions].map((set) => (
          <article key={set.title} className="emvy-panel">
            <p className="section-kicker">{set.title}</p>
            <h3>{set.purpose}</h3>
            <ul className="detail-list">
              {set.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="emvy-panel">
        <div className="emvy-panel__heading">
          <div>
            <p className="section-kicker">Stages</p>
            <h3>Current client journey states.</h3>
          </div>
        </div>
        <div className="emvy-phase-list">
          {engagementFlow.map((step) => (
            <div key={step.title} className="emvy-phase">
              <p>{step.phase}</p>
              <h4>{step.title}</h4>
              <span>{step.summary}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

