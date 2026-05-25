import { ClipboardCheck, FileSearch, Sparkles, Target } from 'lucide-react'

const auditItems = [
  { title: 'Discovery intake', body: 'Collect the client context and the process to be audited.', icon: Target },
  { title: 'Review', body: 'Document workflow bottlenecks, opportunities, and constraints.', icon: FileSearch },
  { title: 'Recommendations', body: 'Translate the findings into buildable next steps.', icon: ClipboardCheck },
  { title: 'Delivery', body: 'Package the audit into a clear client-ready output.', icon: Sparkles },
]

export default function AuditsPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Client audits</p>
          <h2>Structured audits that feed the rest of the delivery system.</h2>
          <p>
            Audits should create the material that powers lead qualification, builds, and portal
            delivery.
          </p>
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {auditItems.map((item) => (
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

