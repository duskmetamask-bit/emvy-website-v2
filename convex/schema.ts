import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  assessment_submissions: defineTable({
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
    createdAt: v.number(),
  }).index('by_email', ['email']).index('by_createdAt', ['createdAt']),

  projects: defineTable({
    name: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('planning'),
      v.literal('in_progress'),
      v.literal('review'),
      v.literal('done')
    ),
    createdAt: v.number(),
  }).index('by_status', ['status']),

  tasks: defineTable({
    projectId: v.id('projects'),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('todo'),
      v.literal('in_progress'),
      v.literal('done')
    ),
    deliverable: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_project', ['projectId']),
})
