# EMVY Website v2 - Status

**Last Updated:** 2026-05-30

## Assessment Feature - COMPLETE

### What was done:
1. **Copy Review** - Reviewed and updated all service pages
2. **Service Routes** - Renamed to match nav labels
   - `/services/discovery-call`
   - `/services/ai-assessment`
   - `/services/ai-builds`
   - `/services/systems-maintenance`
3. **Assessment Quiz** - Complete rebuild
   - 10 questions with step-by-step flow
   - "Start Here" button
   - One question at a time
   - Contact form on last question
   - PDF report generation
   - Email delivery via Resend
4. **PDF & Email** - Set up at `/api/assessment`
   - PDF template with EMVY branding
   - Sends to user email
   - Sender: noreply@emvyai.com
5. **Convex** - Initialized
   - Project: emvy-website
   - Deployment: dev:benevolent-hound-735
   - Schema with assessment_submissions table

### Convex Setup:
- Run `npx convex dev` to start dev server
- Dashboard: https://dashboard.convex.dev/t/duskmetamask/emvy-website

### Next Steps:
- Set up Convex admin dashboard to view submissions
- Add more case studies
- Continue copy review if needed

## Pages Updated:
- Discovery Call - Content + CTA
- AI Assessment - CTA added
- AI Builds - Hero text + CTA
- Systems Maintenance - Description + CTA
- Case Studies - 3 new cards + CTA
- Why AI - Complete rewrite (AI as helpful, not scary)
- Assessment - New 10-question flow with PDF email
