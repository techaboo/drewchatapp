@echo off
echo ============================================
echo  DrewChatApp - Start Ollama Server
echo ============================================
echo.
echo This will start the Ollama server for local models
echo.
echo Make sure Ollama is installed from: https://ollama.ai
echo.
pause

echo.
echo Starting Ollama server on http://localhost:11434
echo.
echo Leave this window open while using local models
echo Press Ctrl+C to stop the server
echo.
ollama serve
