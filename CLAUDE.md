# EMVY AI Website

This repository is the single source of truth for the EMVY website and operating board.

Rules:
- Make all edits in this repo only.
- Keep public pages, private admin pages, and process flow aligned.
- Prefer modular changes that can accept future features without rewrites.
- Do not introduce duplicate site copies or alternate source folders.
- Keep secrets in environment variables and out of source control.

Operational notes:
- `emvyai.com` is the public front door.
- `/admin` is the private operating board.
- `/process` documents the engagement flow after the first call.
- Build, test, and deploy from this repository before promoting changes anywhere else.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Session Memory & Vault

This project uses a Claude Vault at `~/Documents/Claude Vault/` to capture
session notes, decisions, and project updates. The vault skill runs via `/side`
and syncs notes to:
- `Projects/EMVY AI Website/` — project-specific notes
- `Topics/` — categorized ideas
- `Inbox.md` — quick captures

Use `/vault sync` to sync current session notes, or `/vault note "text"` for
quick captures. Vault status shows last sync time with `/vault status`.

Running notes and key decisions should be captured to the vault throughout
every session — don't wait until the end.
