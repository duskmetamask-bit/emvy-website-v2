import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import Stripe from 'stripe';

const { mockMutation, mockConstructEvent } = vi.hoisted(() => ({
  mockMutation: vi.fn().mockResolvedValue({ ok: true }),
  mockConstructEvent: vi.fn(),
}));

vi.mock('convex/browser', () => ({
  ConvexHttpClient: vi.fn().mockImplementation(function () {
    return { mutation: mockMutation };
  }),
}));
vi.mock('@/convex/_generated/api', () => ({
  api: {
    webhooks: {
      stripe: { handlePaymentEvent: 'webhooks/stripe:handlePaymentEvent' },
    },
  },
}));

// Stripe SDK is mocked so we can drive `constructEvent` deterministically.
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(function () {
      return { webhooks: { constructEvent: mockConstructEvent } };
    }),
  };
});

import { POST } from '@/app/api/stripe/route';
import { NextRequest } from 'next/server';

const SECRET = 'whsec_test_stripe_secret_at_least_32_chars';

beforeAll(() => {
  process.env.NEXT_PUBLIC_CONVEX_URL = 'https://test.convex.cloud';
  process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
});

beforeEach(() => {
  mockMutation.mockClear();
  mockConstructEvent.mockReset();
});

function makeStripeRequest(body: string, headers: Record<string, string>): NextRequest {
  return new NextRequest('https://example.com/api/stripe', {
    method: 'POST',
    body,
    headers,
  });
}

describe('POST /api/stripe', () => {
  it('accepts a valid signed event and forwards to Convex', async () => {
    const event = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          amount: 5000,
          currency: 'aud',
          status: 'succeeded',
          description: null,
          metadata: {},
        },
      },
    } as unknown as Stripe.Event;
    mockConstructEvent.mockReturnValue(event);

    const req = makeStripeRequest(JSON.stringify(event), { 'stripe-signature': 'valid' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(mockConstructEvent).toHaveBeenCalledWith(JSON.stringify(event), 'valid', SECRET);
    expect(mockMutation).toHaveBeenCalledWith(
      'webhooks/stripe:handlePaymentEvent',
      expect.objectContaining({
        type: 'payment_intent.succeeded',
        data: expect.objectContaining({
          object: expect.objectContaining({ id: 'pi_123', amount: 5000, currency: 'aud' }),
        }),
      }),
    );
  });

  it('rejects 400 when stripe-signature header is missing', async () => {
    const req = makeStripeRequest('{}', {});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/missing signature/i);
    expect(mockConstructEvent).not.toHaveBeenCalled();
    expect(mockMutation).not.toHaveBeenCalled();
  });

  it('rejects 400 when constructEvent throws (bad signature)', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature for payload');
    });

    const req = makeStripeRequest('{}', { 'stripe-signature': 'bogus' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/invalid signature/i);
    expect(mockMutation).not.toHaveBeenCalled();
  });

  it('maps known Stripe event types to internal type names', async () => {
    for (const stripeType of [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'payment_intent.canceled',
      'charge.refunded',
    ]) {
      const event = {
        type: stripeType,
        data: {
          object: { id: 'pi_x', amount: 100, currency: 'aud', status: 'succeeded' },
        },
      } as unknown as Stripe.Event;
      mockConstructEvent.mockReturnValue(event);

      const req = makeStripeRequest('{}', { 'stripe-signature': 'valid' });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockMutation).toHaveBeenLastCalledWith(
        'webhooks/stripe:handlePaymentEvent',
        expect.objectContaining({ type: stripeType }),
      );
    }
  });

  it('forwards unknown event types as-is (no silent swallow)', async () => {
    const event = {
      type: 'customer.subscription.updated',
      data: {
        object: { id: 'sub_x', amount: 0, currency: 'aud', status: 'active' },
      },
    } as unknown as Stripe.Event;
    mockConstructEvent.mockReturnValue(event);

    const req = makeStripeRequest('{}', { 'stripe-signature': 'valid' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockMutation).toHaveBeenLastCalledWith(
      'webhooks/stripe:handlePaymentEvent',
      expect.objectContaining({ type: 'customer.subscription.updated' }),
    );
  });

  it('returns 500 when Convex mutation throws', async () => {
    const event = {
      type: 'payment_intent.succeeded',
      data: {
        object: { id: 'pi_999', amount: 1, currency: 'aud', status: 'succeeded' },
      },
    } as unknown as Stripe.Event;
    mockConstructEvent.mockReturnValue(event);
    mockMutation.mockRejectedValueOnce(new Error('convex down'));

    const req = makeStripeRequest('{}', { 'stripe-signature': 'valid' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
