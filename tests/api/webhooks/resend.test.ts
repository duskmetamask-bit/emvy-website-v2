import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { Webhook } from 'standardwebhooks';

// vi.mock is hoisted, so hoist the mock fn with vi.hoisted to make it
// available inside the factory body.
const { mockMutation } = vi.hoisted(() => ({
  mockMutation: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock('convex/browser', () => ({
  ConvexHttpClient: vi.fn().mockImplementation(function () {
    return { mutation: mockMutation };
  }),
}));
vi.mock('@/convex/_generated/api', () => ({
  api: {
    webhooks: {
      resend: { handleEmailEvent: 'webhooks/resend:handleEmailEvent' },
    },
  },
}));

import { POST } from '@/app/api/webhooks/resend/route';
import { NextRequest } from 'next/server';

const SECRET = 'whsec_' + Buffer.from('a'.repeat(32)).toString('base64').replace(/=+$/, '');
let webhook: Webhook;

beforeAll(() => {
  process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud';
  process.env.RESEND_WEBHOOK_SECRET = SECRET;
  webhook = new Webhook(SECRET);
});

beforeEach(() => {
  mockMutation.mockClear();
});

function makeResendRequest(body: string, headers: Record<string, string>): NextRequest {
  const req = new NextRequest('https://example.com/api/webhooks/resend', {
    method: 'POST',
    body,
    headers,
  });
  return req;
}

// standardwebhooks's `sign()` returns a raw signature string. We build the
// svix-* (or unbranded webhook-*) header set around it, mirroring what
// Resend/Stripe send.
function buildSignedHeaders(
  msgId: string,
  timestamp: Date,
  payload: string,
  signature: string,
  useUnbranded: boolean = true,
): Record<string, string> {
  const ts = Math.floor(timestamp.getTime() / 1000).toString();
  const prefix = useUnbranded ? 'webhook-' : 'svix-';
  return {
    [`${prefix}id`]: msgId,
    [`${prefix}timestamp`]: ts,
    [`${prefix}signature`]: signature,
  };
}

describe('POST /api/webhooks/resend', () => {
  it('accepts a valid svix-signed payload and forwards to Convex', async () => {
    const payload = JSON.stringify({
      type: 'email.delivered',
      created_at: 1700000000,
      recipient: 'lead@example.com',
      email_id: 'abc123',
      data: { email_id: 'abc123' },
    });
    const sig = webhook.sign('msg_test_1', new Date(), payload);
    const headers = buildSignedHeaders('msg_test_1', new Date(), payload, sig, true);

    const req = makeResendRequest(payload, headers);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(mockMutation).toHaveBeenCalledWith(
      'webhooks/resend:handleEmailEvent',
      expect.objectContaining({
        type: 'email.delivered',
        recipient: 'lead@example.com',
        email_id: 'abc123',
      }),
    );
  });

  it('accepts unbranded webhook-* headers', async () => {
    const payload = JSON.stringify({
      type: 'email.opened',
      created_at: 1700000000,
      recipient: 'lead@example.com',
      email_id: 'xyz789',
      data: {},
    });
    const sig = webhook.sign('msg_test_2', new Date(), payload);
    const headers = buildSignedHeaders('msg_test_2', new Date(), payload, sig, true);

    const req = makeResendRequest(payload, headers);
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('rejects 400 when svix-id header is missing', async () => {
    const payload = JSON.stringify({ type: 'email.delivered' });
    const sig = webhook.sign('msg_test_3', new Date(), payload);
    const headers = buildSignedHeaders('msg_test_3', new Date(), payload, sig, true);
    delete headers['webhook-id'];

    const req = makeResendRequest(payload, headers);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/missing signature/i);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  it('rejects 400 when svix-timestamp header is missing', async () => {
    const payload = JSON.stringify({ type: 'email.delivered' });
    const sig = webhook.sign('msg_test_4', new Date(), payload);
    const headers = buildSignedHeaders('msg_test_4', new Date(), payload, sig, true);
    delete headers['webhook-timestamp'];

    const req = makeResendRequest(payload, headers);
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  it('rejects 400 when svix-signature header is missing', async () => {
    const payload = JSON.stringify({ type: 'email.delivered' });
    const sig = webhook.sign('msg_test_5', new Date(), payload);
    const headers = buildSignedHeaders('msg_test_5', new Date(), payload, sig, true);
    delete headers['webhook-signature'];

    const req = makeResendRequest(payload, headers);
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  it('rejects 400 when the body is tampered after signing', async () => {
    const ts = new Date();
    const original = JSON.stringify({ type: 'email.delivered', recipient: 'a@b.com' });
    const sig = webhook.sign('msg_test_6', ts, original);
    const headers = buildSignedHeaders('msg_test_6', ts, original, sig, true);
    const tampered = JSON.stringify({ type: 'email.delivered', recipient: 'attacker@evil.com' });

    const req = makeResendRequest(tampered, headers);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/invalid signature/i);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  it('rejects 400 when signed with a different secret', async () => {
    const payload = JSON.stringify({ type: 'email.delivered' });
    const rogueSecret = 'whsec_' + Buffer.from('z'.repeat(32)).toString('base64').replace(/=+$/, '');
    const rogue = new Webhook(rogueSecret);
    const sig = rogue.sign('msg_test_7', new Date(), payload);
    const headers = buildSignedHeaders('msg_test_7', new Date(), payload, sig, true);

    const req = makeResendRequest(payload, headers);
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  it('rejects 400 when the event type is missing', async () => {
    const payload = JSON.stringify({ recipient: 'a@b.com' }); // no `type`
    const sig = webhook.sign('msg_test_8', new Date(), payload);
    const headers = buildSignedHeaders('msg_test_8', new Date(), payload, sig, true);

    const req = makeResendRequest(payload, headers);
    const res = await POST(req);
    // Signature passes first; then the type check fails.
    expect(res.status).toBe(400);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  it('returns 500 when Convex mutation throws', async () => {
    mockMutation.mockRejectedValueOnce(new Error('convex down'));
    const payload = JSON.stringify({ type: 'email.bounced', recipient: 'a@b.com' });
    const sig = webhook.sign('msg_test_9', new Date(), payload);
    const headers = buildSignedHeaders('msg_test_9', new Date(), payload, sig, true);

    const req = makeResendRequest(payload, headers);
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
