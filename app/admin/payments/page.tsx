import { Banknote, BellRing, ReceiptText, Repeat } from 'lucide-react'

const paymentItems = [
  { title: 'Invoices', body: 'One-off and staged invoices for audits, builds, and services.', icon: ReceiptText },
  { title: 'Deposits', body: 'Upfront collection before work begins.', icon: Banknote },
  { title: 'Recurring plans', body: 'Maintenance and subscription payments with visibility.', icon: Repeat },
  { title: 'Reminders', body: 'Overdue prompts and payment status alerts.', icon: BellRing },
]

export default function PaymentsPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Payments</p>
          <h2>Deposits, invoices, and recurring plans should all live in the same flow.</h2>
          <p>
            The payments layer needs to support audit deposits, build milestones, maintenance
            plans, and any future product subscriptions.
          </p>
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {paymentItems.map((item) => (
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

