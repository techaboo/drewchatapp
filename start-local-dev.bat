@echo off
echo ============================================
echo  DrewChatApp - Local Development Server
echo ============================================
echo.
echo This will start the local development server
echo with Cloudflare Workers AI (cloud models)
echo.
echo NOTE: For local Ollama models, run start-ollama.bat first
echo.
pause

echo.
echo Starting Wrangler dev server...
echo.
echo Available at: http://localhost:8787 or http://127.0.0.1:8787
echo.
echo Press Ctrl+C to stop the server
echo.
npm run dev
