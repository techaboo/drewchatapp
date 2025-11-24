# Git Quick Reference for DrewChatApp

## Initial Backup (Run Once)

```cmd
# Run the automated script
git-backup.bat

# Or manually:
git init
git add .
git commit -m "✅ STABLE: All 22 Workers AI models working"
git tag -a v1.0-stable -m "Working version"
git checkout -b experimental
```

## Daily Workflow

### Switch Between Branches
```cmd
# Work on experimental features
git checkout experimental

# Return to stable version
git checkout main

# Return to tagged stable version
git checkout v1.0-stable
```

### Save Your Work
```cmd
# See what changed
git status

# Save changes
git add .
git commit -m "Description of changes"
```

### Create Feature Branches
```cmd
# Create new feature branch
git checkout -b feature/theme-toggle

# Switch back to experimental
git checkout experimental

# Merge feature when done
git merge feature/theme-toggle
```

### Undo Changes
```cmd
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Discard all local changes
git checkout .

# Return to stable version
git checkout v1.0-stable
```

### View History
```cmd
# See commit history
git log --oneline --graph --all

# See all branches
git branch -a

# See all tags
git tag -l

# See what changed in last commit
git show
```

## Merge to Production

```cmd
# Switch to main
git checkout main

# Merge experimental (when ready)
git merge experimental

# Tag new version
git tag -a v1.1-stable -m "Added theme toggle"
```

## Push to GitHub (Optional)

```cmd
# Create repo on GitHub first, then:
git remote add origin https://github.com/techaboo/drewchatapp.git
git branch -M main
git push -u origin main
git push origin --tags
git push -u origin experimental
```

## Emergency Recovery

```cmd
# Nuclear option - reset experimental to match main
git checkout experimental
git reset --hard main

# Or go back to tagged version
git checkout main
git reset --hard v1.0-stable
```

## Check Current Status

```cmd
# Where am I?
git branch

# What changed?
git status

# What's different from main?
git diff main
```
