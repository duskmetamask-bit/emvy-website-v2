// Zone inference for the /outreach page. Pure logic — no Convex imports.
//
// Zone 1 = the $500-free-for-10 AI Strategy Audit campaign
// Zone 2 = standard cold outreach (Blando / yp_scrape / csv_seed / manual)
//
// The plan is to infer from existing fields without adding a `zone` column.
// If inference proves unreliable in practice, add a column in a later slice.

// Markers we look for in lead.source / outreach_queue.source / lead.notes /
// lead.internalNotes that mean "this lead is part of the Zone 1 campaign".
const ZONE1_SOURCE_MARKERS = ['saas-replacement-audit', '$500-free-for-10'];
const ZONE1_NOTE_TOKENS = ['$500-free-for-10', 'saas-replacement-audit', '$500 free for 10'];

export type Zone = 'zone1' | 'zone2';

function hasAnyToken(haystack: string | undefined | null, needles: string[]): boolean {
  if (!haystack) return false;
  const lower = haystack.toLowerCase();
  return needles.some((n) => lower.includes(n.toLowerCase()));
}

export function inferZone(input: {
  leadSource?: string | null;
  leadNotes?: string | null;
  leadInternalNotes?: string | null;
  queueSource?: string | null;
}): Zone {
  if (
    hasAnyToken(input.leadSource, ZONE1_SOURCE_MARKERS) ||
    hasAnyToken(input.queueSource, ZONE1_SOURCE_MARKERS) ||
    hasAnyToken(input.leadNotes, ZONE1_NOTE_TOKENS) ||
    hasAnyToken(input.leadInternalNotes, ZONE1_NOTE_TOKENS)
  ) {
    return 'zone1';
  }
  return 'zone2';
}

// Sequence stage derivation for Zone 2 contacts.
// - 'replied' if any email_events.eventType === 'replied'
// - 'paused' if any outreach_followups.status === 'cancelled' with a
//   hold/pause/stop reason.
// - Otherwise E{n} where n = 1 + count(sent followups for this lead).
//   Cap at 3, then 'done'.
export type SequenceStage =
  | { kind: 'stage'; label: 'E1' | 'E2' | 'E3' }
  | { kind: 'done'; label: 'done' }
  | { kind: 'replied'; label: 'replied' }
  | { kind: 'paused'; label: 'paused' };

const PAUSE_REASON_TOKENS = ['hold', 'pause', 'stop'];

export function inferSequenceStage(input: {
  hasRepliedEvent: boolean;
  cancelledReasons: string[];
  sentFollowupCount: number;
}): SequenceStage {
  if (input.hasRepliedEvent) return { kind: 'replied', label: 'replied' };
  const paused = input.cancelledReasons.some((r) =>
    hasAnyToken(r, PAUSE_REASON_TOKENS),
  );
  if (paused) return { kind: 'paused', label: 'paused' };
  // sentFollowupCount counts follow-ups (touch 2 / 3) that have gone out.
  // Each sent follow-up bumps the next stage by one.
  const stage = input.sentFollowupCount + 1;
  if (stage >= 4) return { kind: 'done', label: 'done' };
  if (stage === 3) return { kind: 'stage', label: 'E3' };
  if (stage === 2) return { kind: 'stage', label: 'E2' };
  return { kind: 'stage', label: 'E1' };
}