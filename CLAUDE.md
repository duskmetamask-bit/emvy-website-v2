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
