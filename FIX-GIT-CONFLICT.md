# Fix Git Conflict - Quick Guide

## What Happened

Your local changes conflict with changes on GitHub. Someone (maybe you from another computer?) made changes that aren't in your local repository.

## Quick Fix (Recommended)

Run these commands in order:

```bash
# Step 1: Pull and merge remote changes
git pull origin main --no-rebase

# Step 2: If there are conflicts, Git will tell you which files
# Open those files and resolve the conflicts manually
# Look for markers like: <<<<<<< HEAD

# Step 3: After resolving conflicts (if any), add the resolved files
git add .

# Step 4: Complete the merge
git commit -m "Merged remote changes"

# Step 5: Push everything
git push origin main

# Step 6: Deploy to Cloudflare
npm run deploy
```

## Alternative: Force Push (Use Carefully!)

**⚠️ WARNING: This will overwrite remote changes!**

Only use if you're sure the remote changes don't matter:

```bash
git push origin main --force
npm run deploy
```

## Best Practice Solution

```bash
# 1. Save your current work
git stash

# 2. Pull remote changes
git pull origin main

# 3. Apply your changes on top
git stash pop

# 4. Add and commit
git add .
git commit -m "Enhanced model management with Ollama support"

# 5. Push
git push origin main

# 6. Deploy
npm run deploy
```

## Check What's Different

To see what's on GitHub that you don't have:

```bash
git fetch origin
git log HEAD..origin/main --oneline
```

## Quick Reference

| Command | What It Does |
|---------|-------------|
| `git pull origin main` | Get remote changes and merge |
| `git stash` | Temporarily save your changes |
| `git stash pop` | Restore your saved changes |
| `git push --force` | Overwrite remote (dangerous!) |
| `git fetch origin` | Check what's on remote |

## Need Help?

If you're stuck, you can:
1. Open GitHub Desktop (if installed)
2. Or create a new branch: `git checkout -b my-new-branch`
3. Or force push (if you're sure): `git push origin main --force`

## After Fixing

Once you successfully push, run:
```bash
npm run deploy
```

Your app will be live on Cloudflare!
