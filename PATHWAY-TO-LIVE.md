# EMVY Website Pathway to Live

## Project Overview
Launching the assessment feature for EMVY website v2. This document tracks the deliverables and their completion status.

## Current State (as of 2026-05-30)
- Assessment page at `/assessment` (renamed from `/quiz`)
- 10 questions with step-by-step flow
- PDF report generation via @react-pdf/renderer
- Email delivery via Resend API
- **No Convex integration** - need to add

## Deliverables

### 1. Review Copy on the Website
**Status:** In progress

- [x] Renamed service routes to match nav labels
- [x] Discovery Call page - updated content, CTA
- [x] AI Assessment page - added CTA
- [x] AI Builds page - updated hero text, CTA
- [x] Systems Maintenance page - updated description, CTA
- [x] Case Studies - added 3 new cards, CTA
- [x] Why AI page - complete rewrite to position AI as helpful
- [ ] Audit all page copy for consistency
- [ ] Review hero sections and CTAs
- [ ] Check all service descriptions
- [ ] Verify contact/pricing pages

### 2. Finalise Questions for the Assessment
**Status:** Done

- [x] 10 questions covering:
  - Q1: Call handling
  - Q2: Time waste
  - Q3: Bottlenecks
  - Q4: Automate first
  - Q5: Double entry
  - Q6: Team size
  - Q7: Tools (multi-select)
  - Q8: Problem duration
  - Q9: Tried fixes
  - Q10: Time back
- [x] Define scoring rubric per category
- [x] Write result interpretation copy for each tier
- [x] Create email output template

### 3. Finalise Visual Component on the Assessment
**Status:** Done

- [x] Step-by-step flow with one question at a time
- [x] "Start Here" button to begin
- [x] Progress bar
- [x] Back/Next navigation
- [x] Contact form on last question
- [x] Results display after submission

### 4. Finalise Output Document of the Assessment
**Status:** Done

- [x] PDF template created at `lib/pdf/AssessmentReport.tsx`
- [x] API route at `app/api/assessment/route.ts`
- [x] Email delivery via Resend with PDF attachment
- [ ] Set up result storage (Convex)

### 5. Capture in Convex as a New Project
**Status:** Not started

**To do:**
- [ ] Initialize Convex project (`npx convex dev`)
- [ ] Create project schema in `convex/` directory
- [ ] Define tables: projects, tasks, assessment_submissions
- [ ] Set up admin dashboard queries
- [ ] Configure real-time subscriptions

---

## Convex Schema (Draft)

```
tables:
  - name: projects
    columns:
      - { name: name, type: string }
      - { name: description, type: string }
      - { name: status, type: string }  // "planning" | "in_progress" | "review" | "done"
      - { name: createdAt, type: float }

  - name: tasks
    columns:
      - { name: projectId, type: id("projects") }
      - { name: title, type: string }
      - { name: description, type: string }
      - { name: status, type: string }  // "todo" | "in_progress" | "done"
      - { name: deliverable, type: string }
      - { name: createdAt, type: float }

  - name: assessment_submissions
    columns:
      - { name: name, type: string }
      - { name: email, type: string }
      - { name: score, type: number }
      - { name: answers, type: json }
      - { name: resultTier, type: string }
      - { name: createdAt, type: float }
```

## Notes
- EMVY uses Resend for email delivery (already in dependencies)
- Assessment quiz at /assessment route
- PDF generation via @react-pdf/renderer
- Convex will replace any in-memory state for production
- Link this project to emvy-board for operational tracking