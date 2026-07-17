import { describe, expect, it } from 'vitest'
import { requireCurrentTask, requireOnboardingAuthority } from '@/convex/crm/lifecycle'

describe('CRM V2 lifecycle invariants', () => {
  it('requires a human owner and due current task for active relationships', () => {
    expect(() => requireCurrentTask({ ownerKey: 'dusk', currentTaskTitle: 'Call back', currentTaskDueAt: 1, lifecycleState: 'active' })).not.toThrow()
    expect(() => requireCurrentTask({ ownerKey: 'dusk', lifecycleState: 'active' })).toThrow(/current task/)
    expect(() => requireCurrentTask({ lifecycleState: 'active', currentTaskTitle: 'Call back', currentTaskDueAt: 1 })).toThrow(/human owner/)
  })

  it('permits paused or terminal relationships without a current task', () => {
    expect(() => requireCurrentTask({ lifecycleState: 'nurture' })).not.toThrow()
    expect(() => requireCurrentTask({ lifecycleState: 'lost' })).not.toThrow()
  })

  it('blocks onboarding until authority is recorded', () => {
    expect(() => requireOnboardingAuthority({ stage: 'onboarding' })).toThrow(/approved scope/)
    expect(() => requireOnboardingAuthority({ stage: 'onboarding', approvedScopeReference: 'scope://pilot-1', approvedBy: 'Dusk', approvedAt: 1 })).not.toThrow()
  })
})
