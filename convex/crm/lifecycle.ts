export const LIFECYCLE_STAGES = [
  'discover', 'prospect', 'engage', 'qualified', 'proposal_pilot',
  'onboarding', 'active', 'expansion',
] as const

export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number]
export type LifecycleState = 'active' | 'nurture' | 'lost' | 'closed'

export function isTerminalOrPaused(state: LifecycleState | undefined) {
  return state === 'nurture' || state === 'lost' || state === 'closed'
}

export function requireCurrentTask(input: {
  ownerKey?: string
  currentTaskTitle?: string
  currentTaskDueAt?: number
  lifecycleState?: LifecycleState
}) {
  if (isTerminalOrPaused(input.lifecycleState)) return
  if (!input.ownerKey?.trim()) throw new Error('An active relationship requires a human owner')
  if (!input.currentTaskTitle?.trim() || !input.currentTaskDueAt) {
    throw new Error('An active relationship requires one current task with owner and due date')
  }
}

export function requireOnboardingAuthority(input: {
  stage: LifecycleStage
  approvedScopeReference?: string
  approvedBy?: string
  approvedAt?: number
}) {
  if (input.stage !== 'onboarding') return
  if (!input.approvedScopeReference?.trim() || !input.approvedBy?.trim() || !input.approvedAt) {
    throw new Error('Onboarding requires recorded approved scope, approver, date, and evidence reference')
  }
}
