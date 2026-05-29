# Checkpoint - Commit and push all changes

## Command
```
/checkpoint
```

## Description
Stages all changes, commits with timestamp, and pushes to origin main.

## Action
1. Run `git status` to show changes
2. Run `git add -A`
3. Run `git commit -m "Checkpoint: $(date '+%Y-%m-%d %H:%M")"`
4. Run `git push origin main`

## Use when
- Quick save point before risky changes
- End of work session
- Before major refactor
