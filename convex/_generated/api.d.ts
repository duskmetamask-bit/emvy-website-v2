/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as assessment_submissions from "../assessment/submissions.js";
import type * as bootstrapActions from "../bootstrapActions.js";
import type * as case_studies from "../case_studies.js";
import type * as crons from "../crons.js";
import type * as email_inbox from "../email_inbox.js";
import type * as hermes_actions from "../hermes/actions.js";
import type * as hermes_cronEntry from "../hermes/cronEntry.js";
import type * as hermes_leads from "../hermes/leads.js";
import type * as hermes_outreach from "../hermes/outreach.js";
import type * as hermes_runner from "../hermes/runner.js";
import type * as hermesAuth from "../hermesAuth.js";
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
  actions: typeof actions;
  "assessment/submissions": typeof assessment_submissions;
  bootstrapActions: typeof bootstrapActions;
  case_studies: typeof case_studies;
  crons: typeof crons;
  email_inbox: typeof email_inbox;
  "hermes/actions": typeof hermes_actions;
  "hermes/cronEntry": typeof hermes_cronEntry;
  "hermes/leads": typeof hermes_leads;
  "hermes/outreach": typeof hermes_outreach;
  "hermes/runner": typeof hermes_runner;
  hermesAuth: typeof hermesAuth;
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
