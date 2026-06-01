/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assessment_submissions from "../assessment/submissions.js";
import type * as leads_leads from "../leads/leads.js";
import type * as outreach_outreach from "../outreach/outreach.js";
import type * as stats_stats from "../stats/stats.js";
import type * as webhooks_cal from "../webhooks/cal.js";
import type * as webhooks_contact from "../webhooks/contact.js";
import type * as webhooks_resend from "../webhooks/resend.js";
import type * as webhooks_stripe from "../webhooks/stripe.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "assessment/submissions": typeof assessment_submissions;
  "leads/leads": typeof leads_leads;
  "outreach/outreach": typeof outreach_outreach;
  "stats/stats": typeof stats_stats;
  "webhooks/cal": typeof webhooks_cal;
  "webhooks/contact": typeof webhooks_contact;
  "webhooks/resend": typeof webhooks_resend;
  "webhooks/stripe": typeof webhooks_stripe;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
