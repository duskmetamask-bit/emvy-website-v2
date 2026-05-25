import { Factory, Globe2, GraduationCap, UserCog } from 'lucide-react'

const portfolioItems = [
  { title: 'EMVY', body: 'Public website, outbound engine, CRM, portal, and delivery.', icon: Globe2 },
  { title: 'TeachWise', body: 'Separate Codex-built product workspace with its own build track.', icon: GraduationCap },
  { title: 'Site AI', body: 'A product build for sites, content, and launch workflows.', icon: Factory },
  { title: "Brother's coolroom business", body: 'Full business setup, website, lead gen, CRM, and operations.', icon: UserCog },
]

export default function PortfolioPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Portfolio</p>
          <h2>All products should sit in one portfolio view.</h2>
          <p>
            This is where you can manage product-specific workspaces while keeping the platform
            core shared.
          </p>
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {portfolioItems.map((item) => (
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

