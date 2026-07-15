import { describe, expect, it } from 'vitest'
import { normalizeEmail, normalizePhone, selectIdentityMatch } from '@/convex/crm/identity'

describe('CRM V2 identity matching', () => {
  it('normalizes exact email and Australian phone identities', () => {
    expect(normalizeEmail('  Person@Example.COM ')).toBe('person@example.com')
    expect(normalizePhone('+61 412 345 678')).toBe('61412345678')
    expect(normalizePhone('0412 345 678')).toBe('61412345678')
  })

  it('uses a unique email match before considering a phone match', () => {
    expect(selectIdentityMatch(['email-lead'], ['other-phone-lead'])).toEqual({ status: 'resolved', matches: ['email-lead'] })
  })

  it('routes ambiguous identity candidates into merge review', () => {
    expect(selectIdentityMatch(['one', 'two'], [])).toEqual({ status: 'merge_review', matches: ['one', 'two'] })
    expect(selectIdentityMatch([], ['one', 'two'])).toEqual({ status: 'merge_review', matches: ['one', 'two'] })
  })
})
