@echo off
echo ============================================
echo  Deploying to Cloudflare via GitHub
echo ============================================
echo.

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Staging all changes...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Enhanced model management: Added Ollama support, improved UI with local/cloud model organization, and better model download functionality"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo Step 5: Deploying to Cloudflare...
wrangler deploy
echo.

echo ============================================
echo  Deployment Complete!
echo ============================================
echo.
echo Your changes are now live on Cloudflare.
echo.
echo To view your deployment:
echo   - Production URL: Check your Cloudflare dashboard
echo   - View logs: wrangler tail
echo   - Check status: wrangler deployments list
echo.
pause
