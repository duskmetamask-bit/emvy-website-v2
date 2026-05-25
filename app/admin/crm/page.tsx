import { CalendarCheck2, ClipboardList, MessageSquareMore, UserRound } from 'lucide-react'

const crmStages = [
  { title: 'New lead', body: 'Captured from outreach, website, or referral sources.', icon: UserRound },
  { title: 'Qualified', body: 'Fit confirmed, problem understood, and next step agreed.', icon: ClipboardList },
  { title: 'Proposal', body: 'Scope, pricing, and deliverables are in motion.', icon: MessageSquareMore },
  { title: 'Won / active', body: 'Client handoff, delivery tracking, and task ownership start.', icon: CalendarCheck2 },
]

export default function CRMPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Sales CRM</p>
          <h2>The full path from first contact to signed client.</h2>
          <p>
            Contacts, companies, deals, notes, tasks, and close history all need to live in the
            same workspace so you can see the business in motion.
          </p>
        </div>
      </section>

      <section className="emvy-grid emvy-grid--four">
        {crmStages.map((stage) => (
          <article key={stage.title} className="emvy-card">
            <stage.icon size={18} />
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
          </article>
        ))}
      </section>

      <section className="emvy-panel">
        <h3>CRM must include</h3>
        <div className="emvy-rule-grid">
          {['contact records', 'company records', 'deal stages', 'call notes', 'tasks & reminders', 'proposal snapshots', 'invoice handoff', 'ownership view'].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </div>
  )
}

