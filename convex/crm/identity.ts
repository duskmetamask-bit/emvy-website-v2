export function normalizeEmail(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase()
  return normalized && normalized.includes('@') ? normalized : undefined
}

export function normalizePhone(value: string | undefined): string | undefined {
  const digits = value?.replace(/\D/g, '')
  if (!digits) return undefined
  if (digits.length === 10 && digits.startsWith('0')) return `61${digits.slice(1)}`
  if (digits.length === 11 && digits.startsWith('61')) return digits
  return digits.length >= 8 ? digits : undefined
}

export type IdentityMatch<T> =
  | { status: 'unverified'; matches: [] }
  | { status: 'resolved'; matches: [T] }
  | { status: 'merge_review'; matches: T[] }

export function selectIdentityMatch<T>(emailMatches: T[], phoneMatches: T[]): IdentityMatch<T> {
  // Email is canonical when it identifies exactly one record. Phone is only
  // consulted when email has no match; disagreement must never silently merge.
  if (emailMatches.length === 1) return { status: 'resolved', matches: [emailMatches[0]] }
  if (emailMatches.length > 1) return { status: 'merge_review', matches: emailMatches }
  if (phoneMatches.length === 1) return { status: 'resolved', matches: [phoneMatches[0]] }
  if (phoneMatches.length > 1) return { status: 'merge_review', matches: phoneMatches }
  return { status: 'unverified', matches: [] }
}
