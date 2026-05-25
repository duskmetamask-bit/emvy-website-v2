import { BellRing, Inbox, LayoutDashboard, ShieldCheck } from 'lucide-react'

const opsItems = [
  { title: 'Shared inbox', body: 'Route service emails, replies, and internal follow-up.', icon: Inbox },
  { title: 'Monitoring', body: 'Keep workflow failures, overdue actions, and alerts visible.', icon: BellRing },
  { title: 'Admin tools', body: 'Basic controls for managing users, clients, and modules.', icon: LayoutDashboard },
  { title: 'Controls', body: 'Audit trail, permissions, and sensible access boundaries.', icon: ShieldCheck },
]

export default function OperationsPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Operations</p>
          <h2>The internal layer that keeps the whole business moving.</h2>
          <p>
            This is where you watch workflows, inboxes, alerts, and admin controls across the
            entire system.
          </p>
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {opsItems.map((item) => (
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

