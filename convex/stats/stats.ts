import { query } from '../_generated/server'

export const getLeadStats = query({
  args: {},
  handler: async (ctx) => {
    // Total leads
    const allLeads = await ctx.db.query('leads').collect()
    const totalLeads = allLeads.length

    // Leads by stage
    const byStage: Record<string, number> = {}
    for (const lead of allLeads) {
      const stage = lead.stage || 'unknown'
      byStage[stage] = (byStage[stage] || 0) + 1
    }

    // Leads with emails sent (messaged)
    const emailSends = await ctx.db.query('email_sends').collect()
    const messagedLeadIds = new Set(emailSends.map(s => s.leadId))
    const totalMessaged = messagedLeadIds.size

    // Leads that replied
    const repliedLeads = emailSends.filter(s => s.status === 'replied')
    const repliedLeadIds = new Set(repliedLeads.map(s => s.leadId))
    const totalReplied = repliedLeadIds.size

    // Reply rate
    const replyRate = totalMessaged > 0 ? Math.round((totalReplied / totalMessaged) * 100) : 0

    // Recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const recentActivity = await ctx.db.query('activity_log').collect()
    const recentFiltered = recentActivity.filter(a => a.timestamp >= sevenDaysAgo)

    const recentLeads = recentFiltered.filter(a => a.action === 'lead_created').length
    const recentEmails = recentFiltered.filter(a => a.action.startsWith('email_')).length

    return {
      totalLeads,
      totalMessaged,
      totalReplied,
      replyRate,
      byStage,
      recent: {
        leadsLast7Days: recentLeads,
        emailsLast7Days: recentEmails,
      },
    }
  },
})

export const getEmailStats = query({
  args: {},
  handler: async (ctx) => {
    const emailSends = await ctx.db.query('email_sends').collect()

    const byStatus: Record<string, number> = {}
    for (const send of emailSends) {
      byStatus[send.status] = (byStatus[send.status] || 0) + 1
    }

    const total = emailSends.length
    const delivered = byStatus['delivered'] || 0
    const opened = byStatus['opened'] || 0
    const replied = byStatus['replied'] || 0
    const bounced = byStatus['bounced'] || 0

    return {
      total,
      delivered,
      opened,
      replied,
      bounced,
      openRate: total > 0 ? Math.round((opened / total) * 100) : 0,
      replyRate: total > 0 ? Math.round((replied / total) * 100) : 0,
    }
  },
})