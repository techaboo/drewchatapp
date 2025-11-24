@echo off
echo ============================================
echo  Fixing Git Conflict - Emergency Fix
echo ============================================
echo.

echo This will reset your repository and force push your changes.
echo Press Ctrl+C to cancel, or
pause

echo Step 1: Aborting any merge in progress...
git merge --abort
echo.

echo Step 2: Checking status...
git status
echo.

echo Step 3: Adding all files...
git add .
echo.

echo Step 4: Committing changes...
git commit -m "Enhanced model management with Ollama support - force update"
echo.

echo Step 5: Force pushing to GitHub (this will overwrite remote)...
git push origin main --force
echo.

echo Step 6: Deploying to Cloudflare...
npm run deploy
echo.

echo ============================================
echo  Done!
echo ============================================
echo.
echo Your changes are now on GitHub and Cloudflare.
echo.
pause
