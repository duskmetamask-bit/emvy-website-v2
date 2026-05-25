import { ArrowRight, Database, Mail, Target, Users } from 'lucide-react'
import { leadFlow } from '@/lib/emvy-board'

const leadWork = [
  { title: 'List sourcing', body: 'Import, segment, and prioritize leads before outreach begins.', icon: Target },
  { title: 'Enrichment', body: 'Attach company context, contact details, fit notes, and trigger data.', icon: Database },
  { title: 'Outbound email', body: 'Run tailored sequences with timing, branching, and escalation rules.', icon: Mail },
  { title: 'Follow-up handoff', body: 'Route replies into CRM records and next-step tasks automatically.', icon: Users },
]

export default function LeadGenPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Lead generation</p>
          <h2>Outreach, enrichment, and follow-up live here, not just on the dashboard.</h2>
          <p>
            This module is the outbound engine for EMVY. It should track who to contact, what
            they need, what sequence they are in, and what happens after they reply.
          </p>
        </div>
        <div className="emvy-flow">
          {leadFlow.map((step) => (
            <article key={step.title} className="emvy-flow__step">
              <step.icon size={18} />
              <div>
                <strong>{step.title}</strong>
                <span>{step.detail}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {leadWork.map((item) => (
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
            <p className="section-kicker">Follow-up rules</p>
            <h3>What this system must automate.</h3>
          </div>
          <ArrowRight size={18} />
        </div>
        <div className="emvy-rule-grid">
          {[
            'fresh lead detection',
            'sequence step scheduling',
            'reply classification',
            'manual override / pause',
            'CRM task creation',
            're-engagement after no reply',
          ].map((rule) => (
            <span key={rule}>{rule}</span>
          ))}
        </div>
      </section>
    </div>
  )
}

