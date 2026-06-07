// Personal Board data layer. Single-user (the operator); routes are
// gated by the board's HMAC middleware in /app/(board)/, so the Convex
// functions themselves do not re-check auth.
//
// Four tables: personal_tasks, personal_habits, personal_journal, personal_goals.
// All field shapes mirror emvy-website-v2/convex/schema.ts.

import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

// ============================================================================
// Tasks
// ============================================================================

export const listTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('personal_tasks')
      .withIndex('by_createdAt')
      .order('desc')
      .take(200);
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    priority: v.optional(
      v.union(v.literal('P0'), v.literal('P1'), v.literal('P2'), v.literal('P3'))
    ),
    dueAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('personal_tasks', {
      title: args.title,
      done: false,
      priority: args.priority,
      dueAt: args.dueAt,
      notes: args.notes,
      createdAt: now,
    });
  },
});

export const toggleTask = mutation({
  args: { id: v.id('personal_tasks') },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error('Task not found');
    const now = Date.now();
    const next = !task.done;
    await ctx.db.patch(args.id, {
      done: next,
      completedAt: next ? now : undefined,
    });
  },
});

export const updateTask = mutation({
  args: {
    id: v.id('personal_tasks'),
    title: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal('P0'), v.literal('P1'), v.literal('P2'), v.literal('P3'))
    ),
    dueAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) patch[k] = v;
    }
    if (Object.keys(patch).length === 0) return;
    await ctx.db.patch(id, patch);
  },
});

export const deleteTask = mutation({
  args: { id: v.id('personal_tasks') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============================================================================
// Habits
// ============================================================================

export const listHabits = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('personal_habits')
      .withIndex('by_createdAt')
      .order('desc')
      .take(200);
  },
});

export const createHabit = mutation({
  args: {
    name: v.string(),
    cadence: v.union(v.literal('daily'), v.literal('weekly')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('personal_habits', {
      name: args.name,
      cadence: args.cadence,
      streak: 0,
      lastCheckIn: undefined,
      createdAt: Date.now(),
    });
  },
});

export const checkInHabit = mutation({
  args: { id: v.id('personal_habits') },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.id);
    if (!habit) throw new Error('Habit not found');
    await ctx.db.patch(args.id, {
      streak: habit.streak + 1,
      lastCheckIn: Date.now(),
    });
  },
});

export const resetHabitStreak = mutation({
  args: { id: v.id('personal_habits') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { streak: 0 });
  },
});

export const deleteHabit = mutation({
  args: { id: v.id('personal_habits') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============================================================================
// Journal
// ============================================================================

export const listJournal = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('personal_journal')
      .withIndex('by_date')
      .order('desc')
      .take(200);
  },
});

export const getJournalForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('personal_journal')
      .withIndex('by_date', (q) => q.eq('date', args.date))
      .unique();
  },
});

export const setJournalEntry = mutation({
  args: { date: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('personal_journal')
      .withIndex('by_date', (q) => q.eq('date', args.date))
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { body: args.body, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert('personal_journal', {
      date: args.date,
      body: args.body,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteJournalEntry = mutation({
  args: { id: v.id('personal_journal') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ============================================================================
// Goals
// ============================================================================

export const listGoals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('personal_goals')
      .withIndex('by_createdAt')
      .order('desc')
      .take(200);
  },
});

export const createGoal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    targetDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('personal_goals', {
      title: args.title,
      description: args.description,
      status: 'active',
      targetDate: args.targetDate,
      createdAt: Date.now(),
    });
  },
});

export const updateGoalStatus = mutation({
  args: {
    id: v.id('personal_goals'),
    status: v.union(v.literal('active'), v.literal('done'), v.literal('dropped')),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === 'done') patch.completedAt = Date.now();
    if (args.status !== 'done') patch.completedAt = undefined;
    await ctx.db.patch(args.id, patch);
  },
});

export const deleteGoal = mutation({
  args: { id: v.id('personal_goals') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
