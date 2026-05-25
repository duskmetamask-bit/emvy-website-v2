import type { ReactNode } from 'react'

interface PageHeroProps {
  eyebrow?: string
  title: string
  description?: string
  image?: string
  children?: ReactNode
}

export default function PageHero({ eyebrow, title, description, image, children }: PageHeroProps) {
  return (
    <section className="page-hero">
      {image ? (
        <div className="page-hero__media" aria-hidden="true">
          <img src={image} alt="" />
        </div>
      ) : null}
      <div className="page-hero__overlay" aria-hidden="true" />
      <div className="page-hero-copy">
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {children ? <div className="page-hero-actions">{children}</div> : null}
      </div>
    </section>
  )
}
