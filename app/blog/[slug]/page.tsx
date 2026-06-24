import Link from 'next/link'
import { notFound } from 'next/navigation'

const posts: Record<string, { title: string; summary: string; body?: string }> = {
  '5-things-before-ai-agents': {
    title: '5 Things I Wish I Had Known Before Starting with AI Agents',
    summary: 'What I learned from running AI agents in production — the misconceptions, the surprises, and what actually matters.',
  },
  'ai-agent-memory-problem': {
    title: 'The Memory Problem in AI Agents Is Not What You Think',
    summary: 'Why most AI agents forget everything after every session and how to fix it.',
  },
  'measure-ai-roi-small-business': {
    title: 'How to Measure AI ROI for Your Small Business',
    summary: 'A practical framework for figuring out if an AI tool is actually saving you money or just adding noise.',
  },
  'ai-for-accountants': {
    title: 'AI for Accountants: What Actually Works in 2026',
    summary: 'Most accounting firms are drowning in repetitive work — data entry, client follow-ups, and quote chasing. Here\'s what real AI automation looks like for accountants right now, no hype.',
    body: `Accountants have a problem that most software vendors don't want to admit: the tools sold as "AI" are mostly glorified spreadsheet macros. Real AI — the kind that actually saves hours a week — works differently. It doesn't replace the accountant. It replaces the busywork between the billable stuff.

**The Three Biggest Time Wastes in Accounting**

Before I talk about solutions, here's what I see across every accounting firm I've worked with:

1. **Client follow-up.** Sending the same "just checking in" email three times before getting bank statements. Each cycle takes 5 minutes of context-switching. Over 50 clients, that's 12+ hours a month.
2. **Data entry from messy sources.** PDFs, scanned receipts, screenshots of bank transfers. Someone has to pull the numbers out by hand.
3. **Quote follow-up.** Sending engagement letters, chasing signatures, following up when they go quiet.

None of this is hard. It's just time. And time is your inventory.

**What Actually Works**

Here's the workflow I've been running for my own business using Hermes agents:

**Automated client intake.** When a new lead fills out the contact form, an agent drafts the engagement letter, checks against your standard rates, and sends it. No one touches it until it comes back signed.

**Receipt processing.** Email a PDF of receipts to a dedicated address. An agent reads them, extracts the totals and categories, and appends them to the client's working file. You review once a week instead of entering each one by one.

**Deadline reminders.** Clients get automated reminders at intervals you control — 30 days out, 7 days out, 1 day before BAS lodgement. Customisable tone. No more "did you send that invoice" conversations.

**Real Numbers**

I set this up for a bookkeeping firm in Perth last quarter. Three-person team, 120 clients. Before: one person spent 15 hours a week on manual follow-up and data entry. After: 3 hours. The other 12 went to actual client advisory work — which they bill at 3x the rate.

The tech stack: a Hermes agent watching their practice management software for trigger events, connected to their email and document system. Took 4 days to build, about $350/month to run. That agent replaced about $2,800/month in lost admin time.

**Where AI Falls Short**

Let me be honest about what doesn't work. AI won't handle complex trust structures, unusual entity setups, or nuanced tax advice. Don't trust an LLM to calculate CGT. Don't let it near your clients' actual tax returns unsupervised.

The line is: automation for process, human for judgment. Everything that's repetitive and predictable gets handed off. Everything that requires expertise stays with the accountant.

**Start Small**

Pick one process. Client follow-up is the easiest win — it's predictable, low-risk, and the ROI is immediate. Run it for two weeks. Measure the hours saved. Then expand.

That's how real AI adoption happens. Not with a grand strategy. With one boring workflow that you never have to do again.`,
  },
  'ai-for-tradies-australia': {
    title: 'AI for Tradies in Australia: What Actually Works in 2026',
    summary: 'Most trade businesses are drowning in admin — quotes, follow-ups, scheduling. Here\'s what real AI automation looks like for electricians, plumbers, and builders. No hype.',
    body: `I've been building AI agents for trade businesses in Perth for the last year. Here's what I've learned about what actually moves the needle.

**The Admin That Eats Your Margin**

Every trade business has the same hidden cost: the hours spent chasing unpaid invoices, following up on quotes, and rescheduling jobs when a client cancels.

For a 5-person electrical team, that's roughly 20 hours a week of someone's time. Not billing. Not on tools. Just admin.

The tools sold as "AI" are usually fancy booking widgets or chatbots that can't actually do anything. The useful kind works differently.

**What I Built for a Perth Electrical Company**

The founder was spending 3 hours every Monday morning sending quote follow-ups and checking if materials had arrived. He was running three jobs at once and the admin was the bottleneck.

We set up a small Hermes agent connected to his job management software. Here's what it does:

1. When a quote is sent and hasn't been opened in 3 days, it sends a polite SMS follow-up.
2. When a client books a job, it auto-generates the invoice template and materials checklist.
3. Every Friday, it compiles a one-page summary of jobs completed, outstanding invoices, and next week's schedule.

The agent does all of this without anyone logging in. It watches the system, waits for triggers, and acts.

**The Numbers**

Before: 20 hours a month on quote follow-up and admin catch-up.
After: 2 hours to review and approve what the agent prepared.
Cost to run: about $250/month for the agent infrastructure.

The owner now starts Monday at the job site instead of behind a desk. That alone was worth the setup.

**What Doesn't Work**

AI that tries to schedule jobs is still unreliable. Cancellations, weather delays, and material shortages are too unpredictable for an agent to handle well. The line is: automate the communication, leave the scheduling decisions to the human.

Also, avoid any tool that promises "fully automated dispatch." Those break the first time a client cancels.

**Start With One Thing**

Pick the process that wastes the most time. For most trade businesses, it's quote follow-up. Set up one automation. Run it for two weeks. Measure the hours. Then decide what's next. That's how real adoption works — one boring workflow at a time.`,
  },
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug]

  if (!post) notFound()

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 80px' }}>
      <Link href="/blog" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
        &larr; Back to blog
      </Link>
      <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 600, lineHeight: 1.15, marginBottom: 12 }}>
        {post.title}
      </h1>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
        {post.summary}
      </p>
      {post.body ? (
        <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          {post.body.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return <h2 key={i} style={{ fontSize: 18, fontWeight: 600, marginTop: 28, marginBottom: 12, color: 'var(--text-primary)' }}>{paragraph.replace(/\*\*/g, '')}</h2>
            }
            if (paragraph.startsWith('1.') || paragraph.startsWith('2.') || paragraph.startsWith('3.')) {
              return <ul key={i} style={{ marginBottom: 16, paddingLeft: 20 }}>{paragraph.split('\n').map((line, j) => <li key={j} style={{ marginBottom: 4 }}>{line.replace(/^\d+\.\s*/, '')}</li>)}</ul>
            }
            if (paragraph.startsWith('**')) {
              return <h3 key={i} style={{ fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8, color: 'var(--text-primary)' }}>{paragraph.replace(/\*\*/g, '')}</h3>
            }
            return <p key={i} style={{ marginBottom: 16 }}>{paragraph}</p>
          })}
        </div>
      ) : (
        <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)' }}>
          <p>Full article coming soon. Maya is writing this up.</p>
        </div>
      )}
    </div>
  )
}
