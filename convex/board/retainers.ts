import { query } from '../_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const activeLeads = await ctx.db
      .query('leads')
      .withIndex('by_stage', (q) => q.eq('stage', 'active'))
      .take(100);

    const clients = await Promise.all(
      activeLeads.map(async (lead) => {
        const payments = await ctx.db
          .query('payments')
          .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
          .order('desc')
          .take(50);
        const succeeded = payments.filter((p) => p.status === 'succeeded');
        const lastPayment = succeeded[0];
        const totalPaid = succeeded.reduce((sum, p) => sum + p.amount, 0);
        const lastActivity = await ctx.db
          .query('activity_log')
          .withIndex('by_lead', (q) => q.eq('leadId', lead._id))
          .order('desc')
          .first();
        return {
          lead,
          totalPaid,
          paymentCount: succeeded.length,
          lastPaymentAt: lastPayment?.createdAt ?? null,
          lastActivity,
        };
      })
    );

    return clients.sort((a, b) => b.totalPaid - a.totalPaid);
  },
});
