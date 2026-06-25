import { Fragment, type ReactNode } from 'react'

// Tiny markdown renderer for the subset Maya uses in blog posts.
// Handles: H1/H2/H3, **bold**, *italic*, paragraphs, ordered/unordered
// lists, `inline code`, --- (hr), blank-line block separation. Not a
// full CommonMark implementation — deliberately scoped so the website
// bundle stays light. If Maya's drafts grow tables, code blocks, or
// images, swap this for `react-markdown` + `remark-gfm`.

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < text.length) {
    const bold = text.slice(i).match(/^\*\*([^*]+)\*\*/)
    if (bold) {
      out.push(<strong key={key++}>{bold[1]}</strong>)
      i += bold[0].length
      continue
    }
    const italic = text.slice(i).match(/^\*([^*]+)\*/)
    if (italic) {
      out.push(<em key={key++}>{italic[1]}</em>)
      i += italic[0].length
      continue
    }
    const code = text.slice(i).match(/^`([^`]+)`/)
    if (code) {
      out.push(
        <code
          key={key++}
          style={{
            background: 'var(--surface-alt)',
            padding: '1px 6px',
            borderRadius: 4,
            fontSize: '0.92em',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          }}
        >
          {code[1]}
        </code>
      )
      i += code[0].length
      continue
    }
    const link = text.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (link) {
      out.push(
        <a key={key++} href={link[2]} rel="noopener noreferrer">
          {link[1]}
        </a>
      )
      i += link[0].length
      continue
    }
    const nextSpecial = text.slice(i).search(/[*`[]/)
    const end = nextSpecial === -1 ? text.length : i + nextSpecial
    out.push(text.slice(i, end))
    i = end
  }
  return out
}

function parseBlocks(src: string): ReactNode[] {
  const lines = src.split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    if (trimmed === '---' || trimmed === '***') {
      blocks.push(<hr key={key++} />)
      i++
      continue
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      const text = heading[2]
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      if (level === 1) {
        blocks.push(
          <h1 key={key++} id={id}>
            {renderInline(text)}
          </h1>
        )
      } else if (level === 2) {
        blocks.push(
          <h2 key={key++} id={id}>
            {renderInline(text)}
          </h2>
        )
      } else {
        blocks.push(
          <h3 key={key++} id={id}>
            {renderInline(text)}
          </h3>
        )
      }
      i++
      continue
    }

    const olItem = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (olItem) {
      const items: string[] = []
      while (i < lines.length) {
        const m = lines[i].trim().match(/^(\d+)\.\s+(.+)$/)
        if (!m) break
        items.push(m[2])
        i++
      }
      blocks.push(
        <ol key={key++}>
          {items.map((t, idx) => (
            <li key={idx}>{renderInline(t)}</li>
          ))}
        </ol>
      )
      continue
    }

    const ulItem = trimmed.match(/^[-*]\s+(.+)$/)
    if (ulItem) {
      const items: string[] = []
      while (i < lines.length) {
        const m = lines[i].trim().match(/^[-*]\s+(.+)$/)
        if (!m) break
        items.push(m[2])
        i++
      }
      blocks.push(
        <ul key={key++}>
          {items.map((t, idx) => (
            <li key={idx}>{renderInline(t)}</li>
          ))}
        </ul>
      )
      continue
    }

    const blockquote = trimmed.match(/^>\s+(.+)$/)
    if (blockquote) {
      const lines_: string[] = []
      while (i < lines.length) {
        const m = lines[i].trim().match(/^>\s+(.+)$/)
        if (!m) break
        lines_.push(m[1])
        i++
      }
      blocks.push(
        <blockquote key={key++}>
          {lines_.map((t, idx) => (
            <p key={idx} style={{ margin: idx === 0 ? 0 : '0.5em 0 0' }}>
              {renderInline(t)}
            </p>
          ))}
        </blockquote>
      )
      continue
    }

    const paraLines: string[] = [trimmed]
    i++
    while (i < lines.length) {
      const next = lines[i].trim()
      if (
        !next ||
        next.startsWith('#') ||
        next === '---' ||
        next === '***' ||
        /^(\d+\.)\s/.test(next) ||
        /^[-*]\s/.test(next) ||
        next.startsWith('> ')
      ) {
        break
      }
      paraLines.push(next)
      i++
    }
    blocks.push(
      <p key={key++}>
        {paraLines.map((t, idx) => (
          <Fragment key={idx}>
            {idx > 0 ? ' ' : ''}
            {renderInline(t)}
          </Fragment>
        ))}
      </p>
    )
  }
  return blocks
}

export default function MarkdownLite({ source }: { source: string }) {
  return <>{parseBlocks(source)}</>
}