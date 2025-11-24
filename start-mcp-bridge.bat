@echo off
echo ============================================
echo  DrewChatApp - Start MCP Bridge (Web Search)
echo ============================================
echo.
echo This starts the MCP bridge for web search via DuckDuckGo
echo.
echo Requirements:
echo   - Docker Desktop must be running
echo   - MCP bridge container configured
echo.
pause

echo.
echo Starting MCP Bridge with Docker Compose...
echo.
cd /d "%~dp0"
docker-compose up
echo.
echo MCP Bridge is running on http://localhost:3001
echo.
echo Press Ctrl+C to stop
pause
