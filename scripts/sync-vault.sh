#!/usr/bin/env bash
# sync-vault.sh — auto-sync latest commit state from ALL repos to the Obsidian vault.
# Designed to run on every Claude Code Stop hook (idempotent + fast).
#
# What it does:
#   1. Discovers all git repos under configurable roots
#   2. For each repo: captures branch, latest commit, dirty status
#   3. Appends a one-line checkpoint to Inbox.md (only when state changed)
#   4. Writes per-repo .latest-commit pointer files
#   5. Prints a one-line summary
#
# It does NOT write narrative session notes — that's still done by Claude
# with full context. This script is the always-on "minimum viable sync".

set -euo pipefail

VAULT="/Users/DuskWunz/Documents/Claude/Claude Vault"
INBOX="$VAULT/Inbox.md"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
DATE_LONG=$(date "+%Y-%m-%d %H:%M %Z")

# Configurable repo roots — add new projects here as they spin up.
REPO_ROOTS=(
  "$HOME/Documents"
)

# Skip paths containing any of these substrings (trash, vendor, etc.)
REPO_BLACKLIST=(
  ".Trash"
  "node_modules"
  ".tmp"
  "vendor_imports"
)

# Optional: limit to specific repo dir names. If empty, all git repos are picked up.
# Useful when ~/Documents has unrelated dirs.
REPO_WHITELIST=(
  "emvy-website-v2"
  "emvy-board"
  "skills"
  # Add new projects here as they come online
)

# Color helpers (no-op if not a TTY)
if [ -t 1 ]; then
  GREEN='\033[0;32m'; DIM='\033[2m'; YELLOW='\033[0;33m'; NC='\033[0m'
else
  GREEN=''; DIM=''; YELLOW=''; NC=''
fi

# --- 1. Discover all git repos --------------------------------------------
declare -a REPOS
for root in "${REPO_ROOTS[@]}"; do
  [ -d "$root" ] || continue
  while IFS= read -r gitdir; do
    repo=$(dirname "$gitdir")
    name=$(basename "$repo")
    # Skip blacklisted paths (trash, vendor, etc.)
    skip_blacklist=0
    for b in "${REPO_BLACKLIST[@]}"; do
      if [[ "$gitdir" == *"$b"* ]]; then skip_blacklist=1; break; fi
    done
    [ "$skip_blacklist" -eq 1 ] && continue
    if [ ${#REPO_WHITELIST[@]} -gt 0 ]; then
      skip=1
      for w in "${REPO_WHITELIST[@]}"; do
        if [ "$name" = "$w" ]; then skip=0; break; fi
      done
      [ "$skip" -eq 1 ] && continue
    fi
    REPOS+=("$repo")
  done < <(find "$root" -maxdepth 4 -type d -name ".git" 2>/dev/null)
done

if [ ${#REPOS[@]} -eq 0 ]; then
  echo -e "${YELLOW}! no repos found under: ${REPO_ROOTS[*]}${NC}"
  exit 0
fi

# --- 2. Capture state for each repo ----------------------------------------
SUMMARY=()
CHANGED=0
ANY_SHA=""

for repo in "${REPOS[@]}"; do
  name=$(basename "$repo")
  sha=$(git -C "$repo" rev-parse --short HEAD 2>/dev/null || echo "???????")
  msg=$(git -C "$repo" log -1 --pretty=format:'%s' 2>/dev/null | head -c 60 || echo "")
  branch=$(git -C "$repo" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
  dirty=""
  if ! git -C "$repo" diff --quiet 2>/dev/null || \
     ! git -C "$repo" diff --cached --quiet 2>/dev/null; then
    dirty="*"
  fi
  uncommitted=$(git -C "$repo" diff --shortstat 2>/dev/null | head -c 40 || echo "")
  uncommitted_staged=$(git -C "$repo" diff --cached --shortstat 2>/dev/null | head -c 40 || echo "")

  SUMMARY+=("$name:$branch:$sha$dirty")

  # Write per-repo pointer
  POINTER_DIR="$VAULT/Projects/$name"
  mkdir -p "$POINTER_DIR"
  {
    echo "date: $DATE_LONG"
    echo "branch: $branch"
    echo "commit: $sha"
    echo "message: $msg"
    if [ -n "$uncommitted" ]; then
      echo "uncommitted: $uncommitted"
    fi
    if [ -n "$uncommitted_staged" ]; then
      echo "staged: $uncommitted_staged"
    fi
  } > "$POINTER_DIR/.latest-commit"

  # Check if this SHA differs from the last sync (Inbox pointer)
  if [ -f "$INBOX" ]; then
    last_sha=$(grep -oE "$name:\`[a-f0-9]{7,}\`" "$INBOX" | tail -1 | grep -oE '[a-f0-9]{7,}' || true)
    if [ -n "$sha" ] && [ "$sha" != "$last_sha" ] && [ "$sha" != "???????" ]; then
      CHANGED=$((CHANGED + 1))
    fi
  elif [ -n "$sha" ] && [ "$sha" != "???????" ]; then
    CHANGED=$((CHANGED + 1))
  fi
  ANY_SHA="$ANY_SHA $name:$sha"
done

# --- 3. Append checkpoint to Inbox.md --------------------------------------

if [ -f "$INBOX" ]; then
  TODAYS_COUNT=$(grep -c "<!-- last-sync: $DATE" "$INBOX" 2>/dev/null || echo 0)
else
  TODAYS_COUNT=0
fi

if [ "$CHANGED" -gt 0 ] || [ "$TODAYS_COUNT" = "0" ]; then
  # Create Inbox.md with a header if missing
  if [ ! -f "$INBOX" ]; then
    mkdir -p "$(dirname "$INBOX")"
    cat > "$INBOX" <<'HDR'
# Inbox

Quick captures, auto-sync checkpoints, and unfiled notes.

HDR
  fi

  {
    echo ""
    echo "### $DATE $TIME — auto-sync ($CHANGED repo$( [ "$CHANGED" -eq 1 ] && echo '' || echo 's') changed)"
    for entry in "${SUMMARY[@]}"; do
      IFS=':' read -r name branch sha_dirty <<< "$entry"
      sha="${sha_dirty%\*}"; dirty=""
      [[ "$sha_dirty" == *\** ]] && dirty=" ⚠"
      echo "  - $name @ $sha on \`$branch\`$dirty"
    done
    echo "<!-- last-sync: $DATE-$TIME -->"
  } >> "$INBOX"

  echo -e "${GREEN}✓${NC} vault synced · $CHANGED changed"
else
  echo -e "${DIM}· vault current · ${#REPOS[@]} repo$( [ ${#REPOS[@]} -eq 1 ] && echo '' || echo 's') monitored, no new commits${NC}"
fi

exit 0
