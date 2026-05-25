import { FileCheck2, LockKeyhole, MessageSquareText, Upload } from 'lucide-react'

const portalItems = [
  { title: 'Audit results', body: 'Findings, recommendations, and next actions in one place.', icon: FileCheck2 },
  { title: 'Approvals', body: 'Track sign-off on content, scope, and deliverables.', icon: Upload },
  { title: 'Support lane', body: 'Escalations, issues, and questions with visibility.', icon: MessageSquareText },
  { title: 'Permissioning', body: 'Client-specific access so each workspace stays isolated.', icon: LockKeyhole },
]

export default function PortalPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Client portal</p>
          <h2>The client-facing layer for delivery, visibility, and approvals.</h2>
          <p>
            This should feel like SaaS, not a shared folder. Clients need a clean place to see what
            is happening, what they owe, and what happens next.
          </p>
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {portalItems.map((item) => (
          <article key={item.title} className="emvy-card">
            <item.icon size={18} />
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

