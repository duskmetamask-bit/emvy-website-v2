/**
 * Per-stage webhook feed for the EMVY sales process.
 *
 * The board's /document-control page renders a Mermaid diagram of the
 * full EMVY pipeline (see docs/emvy-process-flow.md). Below the
 * diagram, each subgraph gets a panel showing the last N webhook
 * events that touched that stage.
 *
 * Pure helpers here — the actual Convex queries live in
 * convex/board/webhookFeed.ts. Keep this file side-effect-free so the
 * stage classifier is unit-testable.
 */

export type StageId =
  | 'lead-generation'
  | 'capture-score'
  | 'outreach'
  | 'triage'
  | 'calls'
  | 'payment'
  | 'implementation';

export type StageDefinition = {
  id: StageId;
  /** Display label, matches the Mermaid subgraph title. */
  label: string;
  /** Sources that feed this stage. Used to label pills + colour-code. */
  sources: WebhookSource[];
};

export type WebhookSource =
  | 'audit-chatbot'
  | 'contact-form'
  | 'assessment'
  | 'resend'
  | 'purelymail'
  | 'cal-com'
  | 'stripe'
  | 'lead-create'
  | 'stage-change';

export const STAGES: StageDefinition[] = [
  {
    id: 'lead-generation',
    label: 'Lead Generation',
    sources: ['audit-chatbot'],
  },
  {
    id: 'capture-score',
    label: 'Capture & Score',
    sources: ['contact-form', 'assessment', 'lead-create'],
  },
  {
    id: 'outreach',
    label: 'Outreach',
    sources: ['resend'],
  },
  {
    id: 'triage',
    label: 'Triage',
    sources: ['purelymail', 'resend'],
  },
  {
    id: 'calls',
    label: 'Calls',
    sources: ['cal-com'],
  },
  {
    id: 'payment',
    label: 'Payment Gate',
    sources: ['stripe'],
  },
  {
    id: 'implementation',
    label: 'Implementation',
    sources: ['stage-change'],
  },
];

/** A flat webhook event, already classified into a stage. */
export type WebhookEvent = {
  /** Stable id for React keys. */
  id: string;
  /** Which stage this event belongs to. */
  stage: StageId;
  /** Original source label. */
  source: WebhookSource;
  /** Epoch ms. */
  timestamp: number;
  /** One-line summary for the panel row. */
  summary: string;
  /** Optional secondary line (recipient, lead name, amount). */
  detail?: string;
};

/**
 * Classify a row from any of the source tables into a WebhookEvent.
 *
 * Returns null when the row shouldn't be surfaced (e.g. an outbound
 * 'sent' event in the Triage stage — that's Outreach).
 */
export function classifyEvent(input: {
  source: WebhookSource;
  id: string;
  timestamp: number;
  payload: Record<string, unknown>;
}): WebhookEvent | null {
  const { source, id, timestamp, payload } = input;

  switch (source) {
    case 'audit-chatbot': {
      const score = payload.score as number | undefined;
      const business = (payload.business ?? payload.email ?? 'unknown') as string;
      return {
        id,
        stage: 'lead-generation',
        source,
        timestamp,
        summary: typeof score === 'number' && score > 0
          ? `Audit completed — score ${score}/100`
          : 'Audit started',
        detail: business,
      };
    }

    case 'contact-form': {
      const name = (payload.name ?? payload.email ?? 'unknown') as string;
      return {
        id,
        stage: 'capture-score',
        source,
        timestamp,
        summary: 'Contact form submitted',
        detail: name,
      };
    }

    case 'assessment': {
      const vertical = (payload.vertical ?? payload.email ?? 'unknown') as string;
      return {
        id,
        stage: 'capture-score',
        source,
        timestamp,
        summary: 'AI Strategy assessment completed',
        detail: vertical,
      };
    }

    case 'lead-create': {
      const company = (payload.company ?? 'unknown') as string;
      const source2 = (payload.source ?? '') as string;
      return {
        id,
        stage: 'capture-score',
        source,
        timestamp,
        summary: 'New lead created',
        detail: source2 ? `${company} · ${source2}` : company,
      };
    }

    case 'resend': {
      const eventType = (payload.eventType ?? '') as string;
      const subject = (payload.subject ?? '') as string;
      const recipient = (payload.recipient ?? payload.email ?? '') as string;

      // 'replied' Resend events are inbound replies → Triage, not Outreach.
      if (eventType === 'replied' || eventType === 'reply') {
        return {
          id,
          stage: 'triage',
          source: 'resend',
          timestamp,
          summary: 'Reply received (Resend)',
          detail: recipient || subject,
        };
      }
      // Outbound lifecycle: sent / delivered / opened / clicked / bounced.
      return {
        id,
        stage: 'outreach',
        source,
        timestamp,
        summary: `Email ${eventType || 'event'}`,
        detail: subject || recipient,
      };
    }

    case 'purelymail': {
      const from = (payload.from ?? 'unknown') as string;
      const subject = (payload.subject ?? '(no subject)') as string;
      return {
        id,
        stage: 'triage',
        source,
        timestamp,
        summary: `Inbound from ${from}`,
        detail: subject,
      };
    }

    case 'cal-com': {
      const type = (payload.type ?? 'call') as string;
      const name = (payload.name ?? payload.email ?? 'unknown') as string;
      const bookingTime = payload.bookingTime as number | undefined;
      const detail =
        typeof bookingTime === 'number'
          ? `${name} · ${new Date(bookingTime).toLocaleString('en-AU')}`
          : name;
      return {
        id,
        stage: 'calls',
        source,
        timestamp,
        summary: `${type} booked`,
        detail,
      };
    }

    case 'stripe': {
      const amount = payload.amount as number | undefined;
      const currency = (payload.currency ?? 'AUD') as string;
      const description = (payload.description ?? 'payment') as string;
      const dollars = typeof amount === 'number' ? (amount / 100).toFixed(2) : '?';
      return {
        id,
        stage: 'payment',
        source,
        timestamp,
        summary: `${currency} ${dollars} · ${description}`,
      };
    }

    case 'stage-change': {
      const leadId = (payload.leadId ?? '') as string;
      const toStage = (payload.toStage ?? payload.stage ?? '') as string;
      const company = (payload.company ?? leadId) as string;
      return {
        id,
        stage: 'implementation',
        source,
        timestamp,
        summary: `Stage → ${toStage || 'updated'}`,
        detail: company,
      };
    }

    default:
      return null;
  }
}

/**
 * Group a flat list of events by stage, preserving the stage order
 * declared in STAGES (so the panel grid renders top-down).
 */
export function groupEventsByStage(events: WebhookEvent[]): Map<StageId, WebhookEvent[]> {
  const out = new Map<StageId, WebhookEvent[]>();
  for (const stage of STAGES) out.set(stage.id, []);
  for (const e of events) {
    const list = out.get(e.stage);
    if (list) list.push(e);
  }
  // Sort each bucket newest first.
  for (const list of out.values()) {
    list.sort((a, b) => b.timestamp - a.timestamp);
  }
  return out;
}

/** Cap each stage to N events. Default 5. */
export function capByStage(
  grouped: Map<StageId, WebhookEvent[]>,
  perStage: number,
): Map<StageId, WebhookEvent[]> {
  const out = new Map<StageId, WebhookEvent[]>();
  for (const [stage, list] of grouped) {
    out.set(stage, list.slice(0, perStage));
  }
  return out;
}

/**
 * Total event count per stage (for the stat strip on the panel header).
 */
export function stageCounts(grouped: Map<StageId, WebhookEvent[]>): Record<StageId, number> {
  const out = {} as Record<StageId, number>;
  for (const [stage, list] of grouped) out[stage] = list.length;
  return out;
}

/** Source pill colour tokens — align with the Mermaid classDef palette. */
export const SOURCE_PILL_BG: Record<WebhookSource, string> = {
  'audit-chatbot': 'rgba(86, 217, 255, 0.10)',
  'contact-form': 'rgba(255, 244, 212, 0.10)',
  assessment: 'rgba(255, 244, 212, 0.10)',
  resend: 'rgba(86, 217, 255, 0.10)',
  purelymail: 'rgba(251, 113, 133, 0.10)',
  'cal-com': 'rgba(167, 139, 250, 0.10)',
  stripe: 'rgba(43, 227, 163, 0.10)',
  'lead-create': 'rgba(43, 227, 163, 0.10)',
  'stage-change': 'rgba(148, 163, 184, 0.10)',
};

export const SOURCE_PILL_FG: Record<WebhookSource, string> = {
  'audit-chatbot': '#56d9ff',
  'contact-form': '#f2c94c',
  assessment: '#f2c94c',
  resend: '#56d9ff',
  purelymail: '#fb7185',
  'cal-com': '#a78bfa',
  stripe: '#2be3a3',
  'lead-create': '#2be3a3',
  'stage-change': '#94a3b8',
};