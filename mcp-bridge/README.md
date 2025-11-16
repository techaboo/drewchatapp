# MCP Bridge Server

This is a local Node.js server that bridges Cloudflare Workers to the DuckDuckGo MCP server running in Docker.

## Architecture

```
Cloudflare Workers (Cloud)
    ↓ HTTP
Local Bridge Server (Node.js on localhost:3001)
    ↓ stdio
Docker MCP Server (mcp/duckduckgo)
    ↓
DuckDuckGo Search
```

## Setup

1. Install dependencies:
```bash
cd mcp-bridge
npm install
```

2. Start the bridge server:
```bash
npm start
```

The server will:
- Automatically start the DuckDuckGo MCP Docker container
- Connect to it via stdio protocol
- Expose HTTP endpoints on port 3001

## API Endpoints

### POST /search
Search DuckDuckGo and get results.

**Request:**
```json
{
  "query": "latest AI news",
  "max_results": 5
}
```

**Response:**
```json
{
  "query": "latest AI news",
  "results": "1. Title...\n2. Title...",
  "timestamp": "2025-11-16T..."
}
```

### POST /fetch-content
Fetch and parse content from a URL.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "url": "https://example.com/article",
  "content": "Parsed text content...",
  "timestamp": "2025-11-16T..."
}
```

### GET /health
Check if the bridge server and MCP connection are healthy.

**Response:**
```json
{
  "status": "ok",
  "mcp_connected": true,
  "timestamp": "2025-11-16T..."
}
```

## Requirements

- Node.js 18+
- Docker Desktop running
- DuckDuckGo MCP image: `mcp/duckduckgo`

## Notes

- The bridge server must be running whenever you want to use web search in the chat app
- The Docker container is automatically cleaned up when the server stops
- CORS is enabled to allow requests from localhost:8787 (Workers dev server)
