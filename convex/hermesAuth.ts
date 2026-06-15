// Per-agent Bearer auth for the Hermes function surface.
//
// v2 model (deployed 2026-06-15 PM): per-agent tokens, server-side agent
// identity is checked. The mutation caller passes (token, agent) as args.
// `requireHermesAgent(token, agent)` reads HERMES_TOKEN_${AGENT_UPPER} from
// the Convex deployment env and constant-time compares the provided token.
//
// Rules:
// - Each bound agent has a unique 32-byte token in its own .env on the VPS.
// - The same token is set in the Convex deployment env under
//   HERMES_TOKEN_<AGENT_UPPER>.
// - Each mutation HARD-CODES the agent it serves (agentId: 'sage' in
//   audit.ts, etc.) AND validates the caller's `agent` arg matches.
// - Cross-agent calls (e.g. blando token calling hermes/audits:appendEntry)
//   throw and do not write.
// - Mewy (the main agent) has NO token — it can only call board/* read
//   queries via the deploy key, never write to hermes/* mutations.
//
// Migration: `requireHermes(token)` (the v1 single-shared-token check) is
// kept as a temporary shim. New code should call requireHermesAgent.

const ALLOWED_AGENTS = new Set([
  'builds',
  'blando',
  'sage',
  'maya',
  'intelligence',
  'mewy', // mewy is READ-ONLY — see notes on cronEntry:appendRun
])

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function getExpected(agent: string): string | null {
  if (!ALLOWED_AGENTS.has(agent)) {
    return null
  }
  const envName = `HERMES_TOKEN_${agent.toUpperCase()}`
  const v = process.env[envName]
  return v && v.length > 0 ? v : null
}

export function requireHermesAgent(token: string | null | undefined, agent: string | null | undefined): void {
  if (!token) {
    throw new Error('Hermes auth: missing token')
  }
  if (!agent) {
    throw new Error('Hermes auth: missing agent claim')
  }
  if (!ALLOWED_AGENTS.has(agent)) {
    throw new Error(`Hermes auth: unknown agent "${agent}"`)
  }
  const expected = getExpected(agent)
  if (!expected) {
    throw new Error(`Hermes auth: HERMES_TOKEN_${agent.toUpperCase()} not configured on server`)
  }
  if (!safeEqual(token, expected)) {
    throw new Error('Hermes auth: invalid token for agent')
  }
}

// v1 shim. New code must use requireHermesAgent(token, agent). Kept so any
// unmigrated caller gets a clear error rather than silent auth bypass.
export function requireHermes(token: string | null | undefined): void {
  if (!token) {
    throw new Error('Hermes auth: missing token (v1 shim — use requireHermesAgent)')
  }
  // The v1 shared token is no longer valid. Force callers to migrate.
  throw new Error('Hermes auth: v1 shared token retired. Use requireHermesAgent(token, agent).')
}

// Returns true if the named agent's token env var is configured. Useful
// for read-only diagnostics or bootstrap checks.
export function hermesAgentConfigured(agent: string): boolean {
  return getExpected(agent) !== null
}
