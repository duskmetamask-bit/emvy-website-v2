import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'

export const saveSubmission = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    score: v.number(),
    priorityLevel: v.string(),
    priorityDescription: v.string(),
    recommendation: v.string(),
    answers: v.object({
      call_handling: v.union(v.string(), v.array(v.string())),
      time_waste: v.string(),
      bottlenecks: v.string(),
      automate_first: v.string(),
      double_entry: v.string(),
      team_size: v.string(),
      tools: v.array(v.string()),
      problem_duration: v.string(),
      tried_fix: v.string(),
      time_back: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert('assessment_submissions', {
      name: args.name,
      email: args.email,
      score: args.score,
      priorityLevel: args.priorityLevel,
      priorityDescription: args.priorityDescription,
      recommendation: args.recommendation,
      answers: args.answers,
      createdAt: Date.now(),
    })
    return submissionId
  },
})

export const listSubmissions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('assessment_submissions').order('desc').take(100)
  },
})

export const getSubmissionsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('assessment_submissions')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .take(10)
  },
})

export const getSubmissionStats = query({
  args: {},
  handler: async (ctx) => {
    const submissions = await ctx.db.query('assessment_submissions').take(1000)

    const total = submissions.length
    const avgScore = total > 0
      ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / total)
      : 0

    const byPriority = {
      high: submissions.filter(s => s.priorityLevel === 'High Priority').length,
      moderate: submissions.filter(s => s.priorityLevel === 'Moderate Priority').length,
      early: submissions.filter(s => s.priorityLevel === 'Early Stage').length,
      good: submissions.filter(s => s.priorityLevel === 'Good Foundation').length,
    }

    return { total, avgScore, byPriority }
  },
})
