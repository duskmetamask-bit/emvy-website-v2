/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _admin_cleanup from "../_admin_cleanup.js";
import type * as actions from "../actions.js";
import type * as assessment_submissions from "../assessment/submissions.js";
import type * as audit_chatbot_leads from "../audit_chatbot_leads.js";
import type * as audit_chatbot_notify from "../audit_chatbot_notify.js";
import type * as audit_chatbot_notify_action from "../audit_chatbot_notify_action.js";
import type * as blog from "../blog.js";
import type * as board_actions from "../board/actions.js";
import type * as board_activity from "../board/activity.js";
import type * as board_assessment from "../board/assessment.js";
import type * as board_audit from "../board/audit.js";
import type * as board_audit_chatbot from "../board/audit_chatbot.js";
import type * as board_bookings from "../board/bookings.js";
import type * as board_builds from "../board/builds.js";
import type * as board_contacts from "../board/contacts.js";
import type * as board_cronRuns from "../board/cronRuns.js";
import type * as board_dashboard from "../board/dashboard.js";
import type * as board_drafts from "../board/drafts.js";
import type * as board_email_inbox from "../board/email_inbox.js";
import type * as board_followups from "../board/followups.js";
import type * as board_intelligence from "../board/intelligence.js";
import type * as board_leads from "../board/leads.js";
import type * as board_maya from "../board/maya.js";
import type * as board_mayaTopics from "../board/mayaTopics.js";
import type * as board_notifications from "../board/notifications.js";
import type * as board_outreach from "../board/outreach.js";
import type * as board_outreach_ops from "../board/outreach_ops.js";
import type * as board_personal from "../board/personal.js";
import type * as board_pricing from "../board/pricing.js";
import type * as board_process from "../board/process.js";
import type * as board_retainers from "../board/retainers.js";
import type * as board_sent from "../board/sent.js";
import type * as board_triage from "../board/triage.js";
import type * as board_webhookFeed from "../board/webhookFeed.js";
import type * as board_webmail from "../board/webmail.js";
import type * as bootstrapActions from "../bootstrapActions.js";
import type * as case_studies from "../case_studies.js";
import type * as contact_notify from "../contact_notify.js";
import type * as contact_notify_action from "../contact_notify_action.js";
import type * as crons from "../crons.js";
import type * as diag_sentBodies from "../diag_sentBodies.js";
import type * as email_inbox from "../email_inbox.js";
import type * as hermes_actions from "../hermes/actions.js";
import type * as hermes_audit from "../hermes/audit.js";
import type * as hermes_builds from "../hermes/builds.js";
import type * as hermes_cronEntry from "../hermes/cronEntry.js";
import type * as hermes_emailTemplate from "../hermes/emailTemplate.js";
import type * as hermes_intelligence from "../hermes/intelligence.js";
import type * as hermes_leads from "../hermes/leads.js";
import type * as hermes_marketing from "../hermes/marketing.js";
import type * as hermes_ops from "../hermes/ops.js";
import type * as hermes_outreach from "../hermes/outreach.js";
import type * as hermes_pricing from "../hermes/pricing.js";
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
  _admin_cleanup: typeof _admin_cleanup;
  actions: typeof actions;
  "assessment/submissions": typeof assessment_submissions;
  audit_chatbot_leads: typeof audit_chatbot_leads;
  audit_chatbot_notify: typeof audit_chatbot_notify;
  audit_chatbot_notify_action: typeof audit_chatbot_notify_action;
  blog: typeof blog;
  "board/actions": typeof board_actions;
  "board/activity": typeof board_activity;
  "board/assessment": typeof board_assessment;
  "board/audit": typeof board_audit;
  "board/audit_chatbot": typeof board_audit_chatbot;
  "board/bookings": typeof board_bookings;
  "board/builds": typeof board_builds;
  "board/contacts": typeof board_contacts;
  "board/cronRuns": typeof board_cronRuns;
  "board/dashboard": typeof board_dashboard;
  "board/drafts": typeof board_drafts;
  "board/email_inbox": typeof board_email_inbox;
  "board/followups": typeof board_followups;
  "board/intelligence": typeof board_intelligence;
  "board/leads": typeof board_leads;
  "board/maya": typeof board_maya;
  "board/mayaTopics": typeof board_mayaTopics;
  "board/notifications": typeof board_notifications;
  "board/outreach": typeof board_outreach;
  "board/outreach_ops": typeof board_outreach_ops;
  "board/personal": typeof board_personal;
  "board/pricing": typeof board_pricing;
  "board/process": typeof board_process;
  "board/retainers": typeof board_retainers;
  "board/sent": typeof board_sent;
  "board/triage": typeof board_triage;
  "board/webhookFeed": typeof board_webhookFeed;
  "board/webmail": typeof board_webmail;
  bootstrapActions: typeof bootstrapActions;
  case_studies: typeof case_studies;
  contact_notify: typeof contact_notify;
  contact_notify_action: typeof contact_notify_action;
  crons: typeof crons;
  diag_sentBodies: typeof diag_sentBodies;
  email_inbox: typeof email_inbox;
  "hermes/actions": typeof hermes_actions;
  "hermes/audit": typeof hermes_audit;
  "hermes/builds": typeof hermes_builds;
  "hermes/cronEntry": typeof hermes_cronEntry;
  "hermes/emailTemplate": typeof hermes_emailTemplate;
  "hermes/intelligence": typeof hermes_intelligence;
  "hermes/leads": typeof hermes_leads;
  "hermes/marketing": typeof hermes_marketing;
  "hermes/ops": typeof hermes_ops;
  "hermes/outreach": typeof hermes_outreach;
  "hermes/pricing": typeof hermes_pricing;
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
