export type ProcessStep = {
  phase: string
  title: string
  summary: string
  owner: string
}

export type CallQuestionSet = {
  title: string
  purpose: string
  questions: string[]
}

export const engagementFlow: ProcessStep[] = [
  {
    phase: '1',
    title: 'Discovery call',
    summary: 'A short first call to understand fit, urgency, and whether the work is an audit or a build.',
    owner: 'EMVY',
  },
  {
    phase: '2',
    title: 'Decision email',
    summary: 'Send a concise follow-up with the recommended path, scope summary, and a payment link or invoice.',
    owner: 'EMVY',
  },
  {
    phase: '3',
    title: 'Audit or build deposit',
    summary: 'Collect payment before detailed work begins. Audits are paid up front; builds are paid by milestone or deposit.',
    owner: 'Client',
  },
  {
    phase: '4',
    title: 'Audit deep-dive call',
    summary: 'Run a structured call to gather workflow detail, constraints, systems, people, and edge cases.',
    owner: 'EMVY + client',
  },
  {
    phase: '5',
    title: 'Audit review pack',
    summary: 'Turn the notes into a clean, presentable audit deliverable that highlights opportunities and recommendations.',
    owner: 'EMVY',
  },
  {
    phase: '6',
    title: 'Findings call',
    summary: 'Present the audit findings, answer questions, and agree the build or implementation path.',
    owner: 'EMVY + client',
  },
  {
    phase: '7',
    title: 'Build proposal and payment',
    summary: 'Confirm the implementation scope, pricing, timeline, and payment structure before build work starts.',
    owner: 'EMVY + client',
  },
  {
    phase: '8',
    title: 'Build kickoff',
    summary: 'Use the audit outputs to start the build, set milestones, and create the working system.',
    owner: 'EMVY',
  },
  {
    phase: '9',
    title: 'Demo and feedback',
    summary: 'Review the build with the client, capture amendments, and agree the next changes.',
    owner: 'EMVY + client',
  },
  {
    phase: '10',
    title: 'Implementation assistance',
    summary: 'Make revisions, support adoption, and help the team actually use the system in daily work.',
    owner: 'EMVY',
  },
  {
    phase: '11',
    title: 'Maintenance plan',
    summary: 'Move the client onto a monthly maintenance or support arrangement for ongoing changes and oversight.',
    owner: 'EMVY',
  },
]

export const paymentStandard = [
  'Collect payment before detailed audit work begins.',
  'Send a simple scope summary + payment link or invoice after the discovery call.',
  'Use milestone or deposit payments for builds before kickoff.',
  'Invoice maintenance monthly in advance.',
]

export const auditQuestions: CallQuestionSet = {
  title: 'Audit call questions',
  purpose: 'Questions to uncover how the business really works before creating the audit report.',
  questions: [
    'What is the business trying to improve right now?',
    'Where does the current workflow slow down or break?',
    'What tools, inboxes, forms, spreadsheets, or CRMs are already in use?',
    'Who owns each step and where do handoffs get lost?',
    'What happens when something goes wrong or sits unanswered?',
    'What would a successful audit need to show the client?',
  ],
}

export const buildQuestions: CallQuestionSet = {
  title: 'Build call questions',
  purpose: 'Questions to define scope, delivery, risk, and implementation details before the build starts.',
  questions: [
    'What exact system or workflow are we building?',
    'What does success look like in the first 30 days?',
    'What must be automated versus kept manual?',
    'What systems need to integrate or share data?',
    'What are the approval, security, or permissions requirements?',
    'What does the handover and maintenance plan need to include?',
  ],
}

export const noteTakingFlow = [
  'join the call with a structured note template',
  'capture goals, pain points, tools, and edge cases',
  'tag action items, open questions, and follow-up owners',
  'generate a client-ready summary after the meeting',
  'feed the notes into audit, build, and maintenance tasks',
]

