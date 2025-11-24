@echo off
echo ============================================
echo  Deploying to Cloudflare via GitHub
echo ============================================
echo.

echo Step 1: Pulling latest changes from GitHub...
git pull origin main
echo.

echo Step 2: Staging all changes...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Enhanced model management with Ollama support and improved UI"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo Step 5: Deploying to Cloudflare...
npm run deploy
echo.

echo ============================================
echo  Deployment Complete!
echo ============================================
echo.
echo Your changes are now live on Cloudflare.
echo.
echo To view your deployment:
echo   - Check Cloudflare dashboard: https://dash.cloudflare.com
echo   - View logs: npm run wrangler tail
echo.
pause
