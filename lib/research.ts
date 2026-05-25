export type ResearchTopic = {
  slug: string
  name: string
  description: string
  overview: string
  accent: 'cyan' | 'green' | 'amber' | 'violet' | 'rose'
  keySignals: string[]
}

export type ResearchSection = {
  heading: string
  paragraphs: string[]
}

export type ResearchPost = {
  slug: string
  title: string
  deck: string
  summary: string
  whyItMatters: string
  sections: ResearchSection[]
  operatorTakeaway: string
  watchNext: string[]
  topics: string[]
  sourceName: string
  sourceUrl: string
  heroImage: string
  publishedAt: string
  draftStatus: 'published' | 'review' | 'draft'
  editorPriority: 'high' | 'medium' | 'low'
  issueSlug: string
}

export type ResearchIssue = {
  slug: string
  issueNumber: number
  title: string
  openingNote: string
  thisWeekInAI: string
  publishedAt: string
  access: 'public' | 'subscriber'
}

export type ResearchSubscriber = {
  email: string
  name?: string
  role?: string
  company?: string
  source: 'research_hero' | 'article_inline' | 'archive_gate' | 'overview_cta' | 'digest_archive' | 'homepage'
}

export const researchTopics: ResearchTopic[] = [
  {
    slug: 'models',
    name: 'Models',
    description: 'How the base model layer is shifting and what that means for cost, quality, and deployment.',
    overview:
      'Model progress matters most when it changes the practical cost of getting useful work done. This hub keeps the focus on reliability, context windows, multimodality, and the economics of choosing a stack.',
    accent: 'cyan',
    keySignals: ['Performance', 'Cost curves', 'Context windows', 'Multimodal support'],
  },
  {
    slug: 'agents',
    name: 'Agents',
    description: 'Agent products, orchestration, supervision, and the move from demos to controlled execution.',
    overview:
      'Agents only become valuable when they are constrained, observable, and easy to trust. This area tracks the stack required to make them useful inside real businesses.',
    accent: 'green',
    keySignals: ['Tool use', 'Guardrails', 'Human-in-the-loop', 'Workflow autonomy'],
  },
  {
    slug: 'tooling',
    name: 'Tooling',
    description: 'The developer, ops, and product tools that make AI systems actually shippable.',
    overview:
      'This covers the infrastructure layer around the model: evals, observability, memory, integrations, and the building blocks that reduce drift and production risk.',
    accent: 'amber',
    keySignals: ['Observability', 'Memory', 'Integrations', 'Evaluation'],
  },
  {
    slug: 'enterprise-ai',
    name: 'Enterprise AI',
    description: 'How AI changes real operating processes, delivery teams, and commercial workflows.',
    overview:
      'The enterprise lens is about adoption, governance, and measurable outcomes. It is less about novelty and more about systems that fit how organisations already work.',
    accent: 'violet',
    keySignals: ['Governance', 'Change management', 'Adoption', 'ROI'],
  },
  {
    slug: 'regulation',
    name: 'Regulation',
    description: 'Policy, compliance, safety, and the rules shaping how AI can be used in production.',
    overview:
      'Regulation affects product design, procurement, and trust. This hub tracks how legal and policy shifts affect commercial deployment.',
    accent: 'rose',
    keySignals: ['Policy', 'Compliance', 'Safety', 'Data handling'],
  },
]

export const researchPosts: ResearchPost[] = [
  {
    slug: 'agent-supervision-patterns',
    title: 'Agent supervision is becoming the real product',
    deck: 'The most successful agent systems are the ones that keep humans in the loop at the right points.',
    summary:
      'The market is moving away from fully autonomous fantasies and toward supervised workflows that give people visibility, control, and confidence.',
    whyItMatters:
      'Businesses do not buy autonomy for its own sake. They buy reduced friction, lower labour cost, and a safer way to complete repeated work. Supervision is the missing layer that makes those outcomes commercially usable.',
    sections: [
      {
        heading: 'Why supervision matters',
        paragraphs: [
          'When an agent can hand work back for approval, flag uncertainty, and keep a full trail of decisions, the system becomes far easier to trust.',
          'That trust is what allows the product to move from an experimental demo into a real operating layer.',
        ],
      },
      {
        heading: 'What teams should design for',
        paragraphs: [
          'Teams should design around checkpoints, not raw autonomy. The best systems are defined by what they allow the agent to do without human help and where escalation happens.',
        ],
      },
    ],
    operatorTakeaway:
      'Use supervision as a feature, not a weakness. The best agent products will often feel calm, explicit, and easily reversible.',
    watchNext: ['Approval checkpoints', 'Task boundaries', 'Escalation logging'],
    topics: ['agents', 'tooling'],
    sourceName: 'EMVY research desk',
    sourceUrl: 'https://emvyai.com/research/topics/agents',
    heroImage:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1600&q=90&auto=format&fit=crop',
    publishedAt: '2026-05-20T08:00:00.000Z',
    draftStatus: 'published',
    editorPriority: 'high',
    issueSlug: 'issue-12',
  },
  {
    slug: 'workflow-observability',
    title: 'Observability is now part of the AI stack',
    deck: 'If you cannot see what the system did, you cannot manage it properly.',
    summary:
      'Logging, traceability, replay, and evaluation are moving from nice-to-have engineering extras into core product requirements.',
    whyItMatters:
      'The more AI touches real business tasks, the more important it becomes to understand how decisions were made and where failures started. Observability protects delivery quality and supports faster iteration.',
    sections: [
      {
        heading: 'The operational need',
        paragraphs: [
          'A production AI layer needs enough instrumentation to answer basic questions: what was run, what was returned, what changed, and who approved it.',
        ],
      },
      {
        heading: 'What this changes for product teams',
        paragraphs: [
          'Teams building AI tools should treat logging and replay as product features, not hidden engineering chores.',
        ],
      },
    ],
    operatorTakeaway:
      'If a workflow cannot be inspected after the fact, it is not ready for a serious client environment.',
    watchNext: ['Trace IDs', 'Replay tooling', 'Evaluation sets'],
    topics: ['tooling', 'enterprise-ai'],
    sourceName: 'EMVY research desk',
    sourceUrl: 'https://emvyai.com/research/topics/tooling',
    heroImage:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=90&auto=format&fit=crop',
    publishedAt: '2026-05-18T08:00:00.000Z',
    draftStatus: 'published',
    editorPriority: 'high',
    issueSlug: 'issue-12',
  },
  {
    slug: 'enterprise-governance-stack',
    title: 'Governance is becoming part of the buying decision',
    deck: 'Enterprise buyers increasingly want evidence that AI can be managed, not just admired.',
    summary:
      'Governance, access control, data handling, and review processes are now part of the commercial conversation whenever AI touches important workflows.',
    whyItMatters:
      'A smart prototype is not enough for an enterprise sale. Buyers need to understand who can access the system, how data is stored, what gets logged, and what happens when things go wrong.',
    sections: [
      {
        heading: 'The commercial shift',
        paragraphs: [
          'The AI conversation is moving from “can it do the task?” to “can we run this safely in our environment?”',
        ],
      },
      {
        heading: 'What to prepare',
        paragraphs: [
          'Teams should package AI delivery with security, access, support, and handover language from the start.',
        ],
      },
    ],
    operatorTakeaway:
      'Governance is not paperwork. It is the visible proof that the system can live inside a real business.',
    watchNext: ['Security review', 'Permission design', 'Client handover'],
    topics: ['enterprise-ai', 'regulation'],
    sourceName: 'EMVY research desk',
    sourceUrl: 'https://emvyai.com/research/topics/enterprise-ai',
    heroImage:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&q=90&auto=format&fit=crop',
    publishedAt: '2026-05-15T08:00:00.000Z',
    draftStatus: 'published',
    editorPriority: 'medium',
    issueSlug: 'issue-11',
  },
  {
    slug: 'model-selection-practicality',
    title: 'Model selection is about fit, not hype',
    deck: 'The right model is the one that fits the task, the budget, and the support model.',
    summary:
      'Commercial AI choices increasingly depend on latency, context size, cost, and the surrounding system rather than leaderboard bragging rights.',
    whyItMatters:
      'Businesses do not need the best benchmark score. They need a stack that is predictable, affordable, and capable of supporting the workflow end to end.',
    sections: [
      {
        heading: 'Choosing by fit',
        paragraphs: [
          'The more specialised the workflow, the more important it becomes to choose the model based on task behaviour and operational constraints.',
        ],
      },
    ],
    operatorTakeaway:
      'Default to fit for purpose. The winning stack is the one that makes delivery easier to own.',
    watchNext: ['Latency', 'Cost caps', 'Fallback routing'],
    topics: ['models', 'tooling'],
    sourceName: 'EMVY research desk',
    sourceUrl: 'https://emvyai.com/research/topics/models',
    heroImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=90&auto=format&fit=crop',
    publishedAt: '2026-05-12T08:00:00.000Z',
    draftStatus: 'published',
    editorPriority: 'medium',
    issueSlug: 'issue-11',
  },
  {
    slug: 'safe-ai-rollout-patterns',
    title: 'Safe rollout patterns matter more than launch velocity',
    deck: 'The best AI systems are introduced gradually, with clear boundaries and feedback loops.',
    summary:
      'Fast rollout is only useful if the business can observe, control, and correct the system as it expands.',
    whyItMatters:
      'A controlled rollout reduces the chance of building something impressive that the team cannot maintain. It is the difference between a demo and a usable operating capability.',
    sections: [
      {
        heading: 'How to launch properly',
        paragraphs: [
          'Start with a narrow workflow, instrument it well, and only then expand the surface area.',
        ],
      },
    ],
    operatorTakeaway:
      'A measured rollout often beats a flashy one because it keeps the system credible after day one.',
    watchNext: ['Pilot scope', 'Feedback loops', 'Rollback design'],
    topics: ['enterprise-ai', 'agents'],
    sourceName: 'EMVY research desk',
    sourceUrl: 'https://emvyai.com/research/topics/enterprise-ai',
    heroImage:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1600&q=90&auto=format&fit=crop',
    publishedAt: '2026-05-08T08:00:00.000Z',
    draftStatus: 'review',
    editorPriority: 'low',
    issueSlug: 'issue-10',
  },
  {
    slug: 'regulatory-readiness',
    title: 'Regulatory readiness is becoming a product expectation',
    deck: 'Security, privacy, and policy are increasingly part of the first buying conversation.',
    summary:
      'Teams that prepare their AI systems with clearer controls and documentation will be easier to approve, easier to trust, and easier to scale.',
    whyItMatters:
      'The cost of retrofitting control after launch is often higher than building it into the product from the start.',
    sections: [
      {
        heading: 'Build for explainability',
        paragraphs: [
          'The more sensitive the workflow, the more valuable it becomes to document what data is used, where it lives, and who can see it.',
        ],
      },
    ],
    operatorTakeaway:
      'Treat compliance as a product quality issue, not an afterthought.',
    watchNext: ['Policy changes', 'Privacy controls', 'Audit trails'],
    topics: ['regulation', 'enterprise-ai'],
    sourceName: 'EMVY research desk',
    sourceUrl: 'https://emvyai.com/research/topics/regulation',
    heroImage:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=90&auto=format&fit=crop',
    publishedAt: '2026-05-03T08:00:00.000Z',
    draftStatus: 'draft',
    editorPriority: 'low',
    issueSlug: 'issue-10',
  },
]

export const newsletterIssues: ResearchIssue[] = [
  {
    slug: 'issue-12',
    issueNumber: 12,
    title: 'Control, observability, and trust',
    openingNote: 'This week shows the market settling around supervised systems rather than pure autonomy.',
    thisWeekInAI:
      'Agent supervision and workflow traceability are becoming the most commercially valuable parts of the stack.',
    publishedAt: '2026-05-21T08:00:00.000Z',
    access: 'public',
  },
  {
    slug: 'issue-11',
    issueNumber: 11,
    title: 'Model fit and enterprise readiness',
    openingNote: 'The conversation is shifting from model novelty to product fit and operational readiness.',
    thisWeekInAI:
      'Teams are starting to buy for reliability, governance, and integration quality instead of benchmark headlines.',
    publishedAt: '2026-05-14T08:00:00.000Z',
    access: 'public',
  },
  {
    slug: 'issue-10',
    issueNumber: 10,
    title: 'Safer rollouts and compliance',
    openingNote: 'The archive begins here, with earlier issues focused on launch discipline and controls.',
    thisWeekInAI:
      'The best systems are being rolled out in tighter scopes with clearer review points and stronger documentation.',
    publishedAt: '2026-05-07T08:00:00.000Z',
    access: 'subscriber',
  },
  {
    slug: 'issue-9',
    issueNumber: 9,
    title: 'Signals from the tooling layer',
    openingNote: 'Earlier issue on the infrastructure around AI systems.',
    thisWeekInAI:
      'Observability, memory, and evaluation remain the practical layer beneath every serious deployment.',
    publishedAt: '2026-04-30T08:00:00.000Z',
    access: 'subscriber',
  },
]

export function getResearchTopic(slug: string) {
  return researchTopics.find((topic) => topic.slug === slug)
}

export function getResearchPost(slug: string) {
  return researchPosts.find((post) => post.slug === slug)
}

export function getPostsForTopic(slug: string) {
  return researchPosts.filter((post) => post.topics.includes(slug))
}

export function getLatestResearch(limit = 3) {
  return [...researchPosts]
    .filter((post) => post.draftStatus === 'published')
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, limit)
}

export function getFeaturedResearch() {
  return getLatestResearch(3)
}

export function getPostsForIssue(issue: ResearchIssue) {
  return researchPosts.filter((post) => post.issueSlug === issue.slug && post.draftStatus === 'published')
}

export function getPublicIssues() {
  return newsletterIssues.filter((issue) => issue.access === 'public')
}

export function getLockedIssues() {
  return newsletterIssues.filter((issue) => issue.access === 'subscriber')
}

export function getNewsletterIssue(slug: string) {
  return newsletterIssues.find((issue) => issue.slug === slug)
}

export function computeLeadScore(input: Pick<Partial<ResearchSubscriber>, 'role' | 'company'>) {
  let score = 10

  if (input.role) score += 20
  if (input.company) score += 20
  if (input.role?.toLowerCase().includes('founder')) score += 20
  if (input.role?.toLowerCase().includes('operator')) score += 15
  if (input.company && input.company.length > 3) score += 5

  return Math.min(score, 100)
}
