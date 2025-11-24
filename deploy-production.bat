@echo off
echo ============================================
echo  DrewChatApp - Production Deployment
echo ============================================
echo.
echo This will deploy your app to Cloudflare Workers
echo.
pause

echo.
echo [1/4] Staging all changes...
git add .
echo.

echo [2/4] Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" (
    git commit -m "Production deployment: Theme toggle, model indicator, local Ollama support"
) else (
    git commit -m "%commit_msg%"
)
echo.

echo [3/4] Pushing to GitHub...
git push origin main
echo.

echo [4/4] Deploying to Cloudflare Workers...
npx wrangler deploy
echo.

echo ============================================
echo  Deployment Complete!
echo ============================================
echo.
echo Your app is now live at:
echo   https://drewchatapp.cloudflare-liftoff137.workers.dev
echo.
echo Useful commands:
echo   - View logs: npx wrangler tail
echo   - Check deployments: npx wrangler deployments list
echo   - Rollback: npx wrangler rollback
echo.
pause
