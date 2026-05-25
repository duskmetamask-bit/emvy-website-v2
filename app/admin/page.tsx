import Link from 'next/link'
import { ArrowRight, Building2, Sparkles, TriangleAlert } from 'lucide-react'
import {
  boardModules,
  dashboardHighlights,
  emvyPhases,
  missingPieces,
  productCoverage,
} from '@/lib/emvy-board'

export default function AdminHomePage() {
  return (
    <div className="emvy-board-page">
      <section className="emvy-hero-card">
        <div className="emvy-hero-card__copy">
          <p className="section-kicker">EMVY operating system</p>
          <h2>One modular base that powers marketing, lead gen, sales, delivery, builds, and future products.</h2>
          <p>
            This board is the internal control center for EMVY. It is designed to stay expandable,
            so you can keep adding features later without rebuilding the foundation.
          </p>
          <div className="hero-actions">
            <Link href="/admin/builds" className="button primary">
              Open builds
            </Link>
            <Link href="/admin/leads" className="button secondary">
              Review lead engine
            </Link>
          </div>
        </div>

        <div className="emvy-hero-card__stats">
          {dashboardHighlights.map((item) => (
            <article key={item.label} className="emvy-stat">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="emvy-grid emvy-grid--three">
        {boardModules.map((module) => (
          <Link key={module.id} href={module.href} className="emvy-module-card">
            <div className="emvy-module-card__topline">
              <span style={{ color: module.accent, borderColor: `${module.accent}33` }}>{module.status}</span>
              <module.icon size={18} />
            </div>
            <h3>{module.label}</h3>
            <p>{module.summary}</p>
            <div className="emvy-module-card__metrics">
              {module.metrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
            <span className="emvy-module-card__cta">
              Open module <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </section>

      <section className="emvy-split">
        <article className="emvy-panel">
          <div className="emvy-panel__heading">
            <div>
              <p className="section-kicker">Roadmap</p>
              <h3>Build this once, extend it forever.</h3>
            </div>
            <Sparkles size={18} />
          </div>
          <div className="emvy-phase-list">
            {emvyPhases.map((phase) => (
              <div key={phase.name} className="emvy-phase">
                <p>{phase.name}</p>
                <h4>{phase.title}</h4>
                <span>{phase.summary}</span>
                <ul>
                  {phase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>

        <article className="emvy-panel">
          <div className="emvy-panel__heading">
            <div>
              <p className="section-kicker">Coverage check</p>
              <h3>What the platform should cover.</h3>
            </div>
            <Building2 size={18} />
          </div>
          <div className="emvy-coverage">
            {productCoverage.map((product) => (
              <div key={product.title} className="emvy-coverage__card">
                <h4>{product.title}</h4>
                <p>{product.items.join(' · ')}</p>
              </div>
            ))}
          </div>

          <div className="emvy-gap">
            <div className="emvy-gap__heading">
              <TriangleAlert size={16} />
              <h4>Common missing pieces to add later</h4>
            </div>
            <div className="emvy-gap__chips">
              {missingPieces.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

