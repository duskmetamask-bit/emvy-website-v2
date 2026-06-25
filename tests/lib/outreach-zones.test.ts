import { describe, expect, it } from 'vitest';
import { inferZone, inferSequenceStage } from '@/lib/outreach-zones';

describe('inferZone', () => {
  it('returns zone1 when lead.source is saas-replacement-audit', () => {
    expect(inferZone({ leadSource: 'saas-replacement-audit' })).toBe('zone1');
  });

  it('returns zone1 when outreach_queue.source is $500-free-for-10', () => {
    expect(inferZone({ queueSource: '$500-free-for-10' })).toBe('zone1');
  });

  it('returns zone1 when notes mention $500 free for 10', () => {
    expect(inferZone({ leadNotes: 'Contact from $500 free for 10 campaign' })).toBe(
      'zone1',
    );
  });

  it('returns zone1 when internalNotes mention saas-replacement-audit', () => {
    expect(inferZone({ leadInternalNotes: 'saas-replacement-audit pilot' })).toBe(
      'zone1',
    );
  });

  it('returns zone2 for blando_outbox source with no notes', () => {
    expect(
      inferZone({
        leadSource: 'blando_outbox',
        queueSource: 'blando_outbox',
        leadNotes: '',
      }),
    ).toBe('zone2');
  });

  it('returns zone2 for hipages source', () => {
    expect(inferZone({ leadSource: 'hipages' })).toBe('zone2');
  });

  it('returns zone2 when no fields supplied', () => {
    expect(inferZone({})).toBe('zone2');
  });

  it('handles undefined fields without throwing', () => {
    expect(inferZone({ leadSource: undefined, leadNotes: null })).toBe('zone2');
  });
});

describe('inferSequenceStage', () => {
  it('returns replied when hasRepliedEvent is true', () => {
    expect(
      inferSequenceStage({
        hasRepliedEvent: true,
        cancelledReasons: [],
        sentFollowupCount: 0,
      }),
    ).toEqual({ kind: 'replied', label: 'replied' });
  });

  it('returns paused when a followup was cancelled with a hold reason', () => {
    expect(
      inferSequenceStage({
        hasRepliedEvent: false,
        cancelledReasons: ['on hold until next quarter'],
        sentFollowupCount: 0,
      }),
    ).toEqual({ kind: 'paused', label: 'paused' });
  });

  it('returns paused when cancelled with stop reason', () => {
    expect(
      inferSequenceStage({
        hasRepliedEvent: false,
        cancelledReasons: ['stop — bounced'],
        sentFollowupCount: 1,
      }),
    ).toEqual({ kind: 'paused', label: 'paused' });
  });

  it('returns E1 when no followups sent yet', () => {
    expect(
      inferSequenceStage({
        hasRepliedEvent: false,
        cancelledReasons: [],
        sentFollowupCount: 0,
      }),
    ).toEqual({ kind: 'stage', label: 'E1' });
  });

  it('returns E2 after one sent followup', () => {
    expect(
      inferSequenceStage({
        hasRepliedEvent: false,
        cancelledReasons: [],
        sentFollowupCount: 1,
      }),
    ).toEqual({ kind: 'stage', label: 'E2' });
  });

  it('returns E3 after two sent followups', () => {
    expect(
      inferSequenceStage({
        hasRepliedEvent: false,
        cancelledReasons: [],
        sentFollowupCount: 2,
      }),
    ).toEqual({ kind: 'stage', label: 'E3' });
  });

  it('returns done after three sent followups', () => {
    expect(
      inferSequenceStage({
        hasRepliedEvent: false,
        cancelledReasons: [],
        sentFollowupCount: 3,
      }),
    ).toEqual({ kind: 'done', label: 'done' });
  });

  it('replied wins over paused', () => {
    expect(
      inferSequenceStage({
        hasRepliedEvent: true,
        cancelledReasons: ['hold'],
        sentFollowupCount: 0,
      }),
    ).toEqual({ kind: 'replied', label: 'replied' });
  });
});