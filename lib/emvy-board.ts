import {
  ArrowUpRight,
  Building2,
  CreditCard,
  Database,
  Mail,
  Megaphone,
  Package,
  Plug,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react'

export type BoardModule = {
  id: string
  label: string
  href: string
  summary: string
  status: string
  accent: string
  icon: typeof Sparkles
  metrics: { label: string; value: string }[]
}

export type Phase = {
  name: string
  title: string
  summary: string
  items: string[]
}

export const boardModules: BoardModule[] = [
  {
    id: 'lead-gen',
    label: 'Lead Gen',
    href: '/admin/leads',
    summary: 'Outbound lists, enrichment, outreach email, reply handling, and follow-up routing.',
    status: 'Active',
    accent: '#56d9ff',
    icon: Megaphone,
    metrics: [
      { label: 'Sequences', value: '8' },
      { label: 'Warm replies', value: '24' },
    ],
  },
  {
    id: 'crm',
    label: 'Sales CRM',
    href: '/admin/crm',
    summary: 'Contacts, pipeline stages, opportunities, notes, tasks, and close tracking.',
    status: 'Ready',
    accent: '#7c8cff',
    icon: Users,
    metrics: [
      { label: 'Deals', value: '16' },
      { label: 'Stages', value: '6' },
    ],
  },
  {
    id: 'builds',
    label: 'Builds',
    href: '/admin/builds',
    summary: 'Codex and Claude Code project control for EMVY, TeachWise, Site AI, and future products.',
    status: 'Active',
    accent: '#2be3a3',
    icon: Sparkles,
    metrics: [
      { label: 'Projects', value: '4' },
      { label: 'Launches', value: '2' },
    ],
  },
  {
    id: 'portal',
    label: 'Client Portal',
    href: '/admin/portal',
    summary: 'Audit results, deliverables, approvals, tasks, and service visibility.',
    status: 'Designing',
    accent: '#f2c94c',
    icon: ShieldCheck,
    metrics: [
      { label: 'Clients', value: '11' },
      { label: 'Views', value: '34' },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    href: '/admin/payments',
    summary: 'Deposits, invoices, subscriptions, maintenance plans, and overdue follow-up.',
    status: 'Ready',
    accent: '#fb7185',
    icon: CreditCard,
    metrics: [
      { label: 'Invoices', value: '21' },
      { label: 'Recurring', value: '7' },
    ],
  },
  {
    id: 'ops',
    label: 'Operations',
    href: '/admin/operations',
    summary: 'Internal admin, workflow alerts, shared inboxes, and activity monitoring.',
    status: 'Core',
    accent: '#94a3b8',
    icon: Workflow,
    metrics: [
      { label: 'Automations', value: '14' },
      { label: 'Alerts', value: '5' },
    ],
  },
  {
    id: 'process',
    label: 'Engagement Flow',
    href: '/admin/process',
    summary: 'Post-call steps, payment stages, audit questions, and build handoff structure.',
    status: 'Defined',
    accent: '#f2c94c',
    icon: Workflow,
    metrics: [
      { label: 'Stages', value: '11' },
      { label: 'Call sets', value: '2' },
    ],
  },
]

export const emvyPhases: Phase[] = [
  {
    name: 'Phase 1',
    title: 'Core platform foundation',
    summary: 'Build the shared skeleton once so every future product can attach to the same base.',
    items: ['Auth and roles', 'Shared workspace data model', 'Dashboard shell', 'Notifications and audit trail'],
  },
  {
    name: 'Phase 2',
    title: 'Public EMVY front door',
    summary: 'Keep emvyai.com as the conversion engine for audits, builds, and maintenance.',
    items: ['Audience landing pages', 'CTA routing', 'Newsletter capture', 'Booking and quiz flow'],
  },
  {
    name: 'Phase 3',
    title: 'Outbound lead engine',
    summary: 'Move outreach, enrichment, and follow-up into a true workflow layer.',
    items: ['Lead sourcing', 'Enrichment', 'Email sequences', 'Reply and follow-up routing'],
  },
  {
    name: 'Phase 4',
    title: 'Sales CRM and acquisition',
    summary: 'Manage the path from first contact to signed client and handoff.',
    items: ['Pipeline stages', 'Calls and notes', 'Proposal tracking', 'Deal accountability'],
  },
  {
    name: 'Phase 5',
    title: 'Client portal and delivery',
    summary: 'Give clients a clean place to see progress, audits, and deliverables.',
    items: ['Client access', 'Audit views', 'Approvals', 'Support lane'],
  },
  {
    name: 'Phase 6',
    title: 'Build command center',
    summary: 'Make Codex and Claude Code project management first-class inside EMVY.',
    items: ['Project launcher', 'Templates', 'Deployment refs', 'Build boards'],
  },
  {
    name: 'Phase 7',
    title: 'Payments and internal ops',
    summary: 'Add the business backbone needed to run and scale reliably.',
    items: ['Invoices and deposits', 'Subscriptions', 'Email ops', 'Content workflows'],
  },
  {
    name: 'Phase 8',
    title: 'Portfolio expansion',
    summary: 'Add TeachWise, Site AI, and brother-business workspaces without changing the core.',
    items: ['Multi-brand workspaces', 'Reusable templates', 'Product-specific modules', 'Shared platform rules'],
  },
  {
    name: 'Phase 9',
    title: 'Personal suite',
    summary: 'Keep your personal tools separate but built on the same platform logic.',
    items: ['Expenses', 'Health', 'Build launcher', 'Superannuation and travel'],
  },
]

export const leadFlow = [
  { title: 'Source', detail: 'Lists, forms, referrals, and inbound capture', icon: ArrowUpRight },
  { title: 'Enrich', detail: 'Company data, contacts, context, and fit scoring', icon: Database },
  { title: 'Outreach', detail: 'Email sequences with tailored follow-up loops', icon: Mail },
  { title: 'Hand off', detail: 'Replies, qualification, and CRM creation', icon: Plug },
]

export const buildPortfolio = [
  {
    title: 'EMVY',
    subtitle: 'Public site + internal operating system',
    detail: 'The anchor product and delivery engine for the consultancy.',
    accent: '#56d9ff',
  },
  {
    title: 'TeachWise',
    subtitle: 'Codex-built teaching assistant platform',
    detail: 'A separate product workspace with its own roadmap and release states.',
    accent: '#7c8cff',
  },
  {
    title: 'Site AI',
    subtitle: 'Codex-built website and content system',
    detail: 'A parallel build that reuses the shared platform core and branding rules.',
    accent: '#2be3a3',
  },
  {
    title: "Brother's Coolroom Business",
    subtitle: 'Full business-in-a-box',
    detail: 'Website, lead gen, CRM, quoting, jobs, payments, and operations.',
    accent: '#f2c94c',
  },
]

export const missingPieces = [
  'support/ticketing',
  'knowledge base and SOPs',
  'role-based access and audit logs',
  'analytics and reporting',
  'document generation and file storage',
  'integration registry and monitoring',
  'backup and reliability alerts',
]

export const productCoverage = [
  {
    title: 'EMVY',
    items: ['marketing', 'lead gen', 'sales CRM', 'client portal', 'audits', 'payments', 'build management', 'email/content ops'],
  },
  {
    title: 'TeachWise',
    items: ['product roadmap', 'Codex builds', 'content workflow', 'launch plan', 'maintenance'],
  },
  {
    title: 'Site AI',
    items: ['product workspace', 'site generation', 'content production', 'campaign tracking', 'release management'],
  },
  {
    title: "Brother's Business",
    items: ['business setup', 'website', 'lead gen', 'CRM', 'quotes', 'jobs', 'invoicing', 'maintenance'],
  },
  {
    title: 'Personal Suite',
    items: ['expenses', 'fitness', 'messaging', 'project launcher', 'superannuation', 'travel deals'],
  },
]

export const dashboardHighlights = [
  { label: 'Active workspaces', value: '5', note: 'EMVY, TeachWise, Site AI, brother business, personal' },
  { label: 'Core modules', value: '9', note: 'Modular, attachable, and reusable' },
  { label: 'Automation layer', value: 'Hermes', note: 'Cron and workflow orchestration' },
  { label: 'Build assistants', value: '2', note: 'Codex and Claude Code' },
]
