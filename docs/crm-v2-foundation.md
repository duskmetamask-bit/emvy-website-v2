# CRM V2 foundation — slice 001

## Outcome

This slice adds the canonical CRM data spine without changing any live provider
configuration or activating new automation.

## Invariants

- `leads` remains the only prospect/client record.
- Exact normalized email wins; exact normalized phone is only used when no
  email match exists. Multiple candidates always create merge review.
- `provider_events` is append-only and idempotent on `(provider, providerEventId)`.
- Legacy rows are preserved. Reconciliation only flags them as `unverified`
  and disables automation until an operator resolves them.
- A completed AI Consult creates an internal assessment and one operator task;
  it never sends email.
- Retell webhook activation, Cal.com duration changes, and outbound sending are
  explicitly deferred to their separate acceptance-gated slices.

## Operator migration runbook

1. Deploy this additive schema from `emvy-website-v2` only.
2. Run `internal.crm.reconcileLegacyLeads` in small batches and reconcile its
   output against the retained Legacy Board inventory.
3. Review open `identity_merge_reviews`; resolve records before enabling them
   for automation.
4. Do not enable Retell-to-CRM webhooks until the ten-call pilot passes.
