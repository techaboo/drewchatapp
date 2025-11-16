# Web Search Setup Guide

Your chat app now uses DuckDuckGo web search via a local MCP (Model Context Protocol) bridge server.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Browser (localhost:8787)                                │
│   ↓                                                     │
│ Cloudflare Workers (npm run dev)                        │
│   ↓ HTTP POST /search                                  │
│ MCP Bridge Server (localhost:3001)                      │
│   ↓ stdio                                               │
│ Docker Container (mcp/duckduckgo)                       │
│   ↓                                                     │
│ DuckDuckGo Search                                       │
└─────────────────────────────────────────────────────────┘
```

## Quick Start (2 Terminals)

### Terminal 1: MCP Bridge Server
Open a **new terminal** (don't use VS Code's terminal for this):

```powershell
cd C:\Users\techa\Desktop\github\repositories\drewchatapp\mcp-bridge
npm start
```

**Leave this terminal open!** Wait for:
```
✅ Connected to DuckDuckGo MCP server
🔧 Available tools: search, fetch_content
🚀 MCP Bridge Server running on http://localhost:3001
```

### Terminal 2: Cloudflare Workers
In a separate terminal:

```powershell
cd C:\Users\techa\Desktop\github\repositories\drewchatapp
npm run dev
```

Wait for: Workers running on `http://localhost:8787`

### Open Your Browser
Visit `http://localhost:8787` and:
1. Enable the **Web Search** toggle
2. Ask: "What are the latest AI developments?"
3. Watch the search results appear in real-time!

### Testing (Optional Third Terminal)
```powershell
# Test the bridge server health
curl http://localhost:3001/health

# Should return:
# {"status":"ok","mcp_connected":true,"timestamp":"..."}

# Test a search
curl -X POST http://localhost:3001/search `
  -H "Content-Type: application/json" `
  -d '{"query":"latest AI news","max_results":3}'
```

## How It Works

1. **User enables web search toggle** in chat UI
2. **Workers calls** `http://localhost:3001/search` with query
3. **Bridge server** translates HTTP → MCP stdio protocol
4. **Docker MCP container** performs DuckDuckGo search
5. **Results flow back** through bridge → Workers → Browser

## Troubleshooting

### "Web search temporarily unavailable"
- Check if MCP bridge is running: `curl http://localhost:3001/health`
- Should return: `{"status":"ok","mcp_connected":true}`

### "Bridge server not running"
- Start it: `cd mcp-bridge && npm start`
- Check Docker Desktop is running
- Verify port 3001 is not in use: `netstat -ano | findstr :3001`

### Docker errors
- Make sure Docker Desktop is running
- Pull the image manually: `docker pull mcp/duckduckgo`
- Test Docker: `docker run -i --rm mcp/duckduckgo` (Ctrl+C to stop)

### Port conflicts
- Bridge uses port 3001 (change in `mcp-bridge/server.js` if needed)
- Workers dev uses port 8787
- Make sure both ports are available

## Files Modified

- ✅ `mcp-bridge/` - New folder with bridge server
- ✅ `src/index.ts` - `performWebSearch()` calls bridge, `/api/search/status` checks health
- ✅ `public/chat.js` - Web search toggle sends requests
- ✅ `public/index.html` - UI toggle for web search

## Testing Checklist

- [ ] MCP bridge starts without errors
- [ ] Health check returns `{"status":"ok","mcp_connected":true}`
- [ ] Workers dev server starts
- [ ] `/api/search/status` returns `available: true`
- [ ] Chat UI shows web search toggle
- [ ] Searching with toggle ON returns real-time results
- [ ] Console shows "✅ Web search completed via MCP bridge"

## Production Notes

⚠️ **This setup is for LOCAL DEVELOPMENT only**

For production, you need either:
1. **Tavily API** (cloud-based, recommended) - https://tavily.com
2. **Hosted bridge server** on a VPS with Docker
3. **Remove web search** and use Ollama/Workers AI offline models only

The MCP bridge MUST run on your machine or a server you control. Cloudflare Workers cannot spawn Docker containers or use stdio-based tools.
