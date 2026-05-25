import { Code2, Rocket, Settings2, WandSparkles } from 'lucide-react'
import { buildPortfolio } from '@/lib/emvy-board'

const buildSteps = [
  { title: 'Create', body: 'Spin up a new build from a template with the project name, stack, and owner.', icon: Rocket },
  { title: 'Track', body: 'Capture prompt history, repo links, notes, files, and deployment references.', icon: Settings2 },
  { title: 'Ship', body: 'Mark readiness, handoff, and launch conditions for each build.', icon: WandSparkles },
  { title: 'Assist', body: 'Keep Codex and Claude Code references attached to each active project.', icon: Code2 },
]

export default function BuildsPage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-panel emvy-panel--hero">
        <div>
          <p className="section-kicker">Build command center</p>
          <h2>Codex and Claude Code need to be first-class in the build workspace.</h2>
          <p>
            This is where EMVY, TeachWise, Site AI, and future products get managed as tracked
            builds with launch status, notes, and visible progress.
          </p>
        </div>
      </section>

      <section className="emvy-grid emvy-grid--two">
        {buildSteps.map((step) => (
          <article key={step.title} className="emvy-card">
            <step.icon size={18} />
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </section>

      <section className="emvy-panel">
        <div className="emvy-panel__heading">
          <div>
            <p className="section-kicker">Portfolio</p>
            <h3>Current products and build tracks.</h3>
          </div>
        </div>
        <div className="emvy-grid emvy-grid--two">
          {buildPortfolio.map((item) => (
            <article key={item.title} className="emvy-build-card">
              <span style={{ color: item.accent }}>{item.subtitle}</span>
              <h4>{item.title}</h4>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

