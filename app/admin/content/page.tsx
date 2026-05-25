import { BrainCircuit, MailPlus, Megaphone, PenTool } from 'lucide-react'

const contentItems = [
  { title: 'Email ops', body: 'Newsletters, sequences, and follow-up broadcasts.', icon: MailPlus },
  { title: 'Social content', body: 'Draft, approve, schedule, and reuse content across platforms.', icon: Megaphone },
  { title: 'Knowledge base', body: 'Keep playbooks, SOPs, and reusable notes in one place.', icon: BrainCircuit },
  { title: 'Publishing', body: 'Turn ideas into posts, pages, and assets with an approval step.', icon: PenTool },
]

export default function ContentPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Email + content</p>
          <h2>Operate email, newsletter, and social workflows from the same system.</h2>
          <p>
            Content should support acquisition and retention, not sit in a separate disconnected
            tool.
          </p>
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {contentItems.map((item) => (
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

