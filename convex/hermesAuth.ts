// HMAC Bearer auth for the Hermes function surface.
// v1: simple equality against HERMES_ACTIONS_TOKEN env var.
// Q1 of the Hermes Access Plan asks whether to wrap this in a proxy
// (Next.js API route adds the HMAC). v1 ships the direct path; the
// proxy can be added without changing the function signatures.

const ENV_VAR = 'HERMES_ACTIONS_TOKEN'

function getExpected(): string | null {
  const v = process.env[ENV_VAR]
  return v && v.length > 0 ? v : null
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export function requireHermes(token: string | null | undefined): void {
  if (!token) {
    throw new Error('Hermes auth: missing token')
  }
  const expected = getExpected()
  if (!expected) {
    throw new Error(`Hermes auth: ${ENV_VAR} not configured on server`)
  }
  if (!safeEqual(token, expected)) {
    throw new Error('Hermes auth: invalid token')
  }
}

// Returns true if the env var is configured. Useful for the bootstrap
// path or read-only diagnostics.
export function hermesAuthConfigured(): boolean {
  return getExpected() !== null
}
