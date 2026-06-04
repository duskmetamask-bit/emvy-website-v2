// Cron entry points. These are internal actions that read the Hermes
// token from the server env and call the public runner actions.
//
// Convex crons can only call internal functions, so this thin wrapper
// is the bridge between the schedule and the token-gated public surface.

import { internalAction } from '../_generated/server'
import { api } from '../_generated/api'

function getToken(): string {
  const t = process.env.HERMES_ACTIONS_TOKEN
  if (!t) {
    throw new Error('HERMES_ACTIONS_TOKEN not configured on server')
  }
  return t
}

export const runDailyCron = internalAction({
  args: {},
  handler: async (ctx): Promise<{ planned: number; sent: number; failed: number; suppressed: number; errors: string[] }> => {
    return await ctx.runAction(api.hermes.runner.runDaily, {
      token: getToken(),
    })
  },
})

export const runFollowupsCron = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: number; failed: number; errors: string[] }> => {
    return await ctx.runAction(api.hermes.runner.runFollowups, {
      token: getToken(),
    })
  },
})
