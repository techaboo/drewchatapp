# Drew Chat App - AI Coding Agent Instructions

## Project Overview
This is a Cloudflare Workers-based AI chat application with authentication, D1 database, and web search via MCP bridge. Built for edge deployment with local dev support via Ollama.

## Architecture

### Three-Tier System
1. **Cloudflare Workers** (`src/index.ts`) - Main application logic, auth, AI routing
2. **MCP Bridge Server** (`mcp-bridge/server.js`) - HTTP-to-stdio bridge for DuckDuckGo MCP
3. **D1 Database** - User auth, sessions, conversations (see `migrations/0001_init_auth.sql`)

### AI Provider Logic
- **Production**: Uses Workers AI with model `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- **Local Dev**: Auto-detects Ollama on `localhost:11434`, falls back to Workers AI
- Detection: `isOllamaAvailable()` checks `/api/tags` endpoint with 1s timeout
- Model selection stored in-memory via `selectedModel` global variable

### Web Search Integration
- Frontend toggle (`public/chat.js`) sends `webSearch: true` to `/api/chat`
- Backend calls `performWebSearch()` → `http://localhost:3001/search` (MCP bridge)
- MCP bridge spawns Docker container (`mcp/duckduckgo`) using stdio protocol
- Search results appended to last user message as context
- Health check: `/api/search/status` returns bridge connectivity status

## Key Development Patterns

### Authentication Flow
- **Registration**: Email → pending approval → admin clicks link → temp password generated → sent to admin
- **Session**: Base64-encoded JSON tokens (`{userId, expiresAt}`), 30-day expiry
- **Password hashing**: `sha256:salt:hash` format using Web Crypto API
- **Email**: Resend API (`env.RESEND_API_KEY`), sends to `env.ADMIN_EMAIL`
- Auth functions: `hashPassword()`, `verifyPassword()`, `validateSession()`, `createSession()`

### Streaming Responses
- Backend returns `text/event-stream` with newline-delimited JSON
- Ollama format: `{"message":{"content":"..."}}` → transformed to `{"text":"...","response":"..."}`
- Workers AI format: `data: {"response":"..."}` → accumulated in `fullText`
- Frontend: No native EventSource, uses `fetch()` + manual stream parsing

### Database Access
- Binding: `env.DB` (D1Database type)
- Schema: `users`, `sessions`, `conversations`, `messages` tables
- Auth queries use `env.DB.prepare()` with bound parameters
- No ORM - raw SQL with D1 API

## Common Workflows

### Local Development
```bash
# Terminal 1: MCP Bridge (required for web search)
cd mcp-bridge
npm start  # Spawns Docker MCP container

# Terminal 2: Workers Dev Server
npm run dev  # Auto-detects Ollama if available

# Optional: Local Ollama (avoids Workers AI charges)
ollama pull llama3.2:1b
ollama serve  # Runs on 11434 automatically
```

### Docker Compose (Full Stack)
```bash
docker-compose up -d  # Starts both mcp-bridge and workers-dev
```

### Deployment
```bash
npm run deploy  # Uses wrangler.jsonc config
```

### Environment Variables
- **Required in `wrangler.jsonc`**: `RESEND_API_KEY`, `ADMIN_EMAIL`, `SMTP_*`
- **D1 binding**: `DB` → `techaboo_chat` database
- **AI binding**: `AI` → Workers AI platform

## API Route Structure
All routes in single `src/index.ts` file:
- `/api/chat` - POST streaming chat (handles Ollama vs Workers AI)
- `/api/models` - GET list, POST select, POST download (Ollama only)
- `/api/search/status` - GET MCP bridge health check
- `/api/auth/*` - register, login, verify, reset-password, approve, generate-temp-password

## File Responsibilities
- `src/index.ts` - All backend logic (auth, AI, routing) in 1308 lines
- `src/auth.ts` - Auth utilities (duplicated in index.ts for convenience)
- `src/types.ts` - TypeScript interfaces (`Env`, `ChatMessage`)
- `public/chat.js` - Frontend: streaming UI, model selection, web search toggle
- `public/index.html` - Chat interface (mobile-responsive)
- `wrangler.jsonc` - Worker config, D1 bindings, environment vars
- `migrations/0001_init_auth.sql` - Database schema

## Testing & Debugging
- MCP Bridge health: `curl http://localhost:3001/health`
- Test search: `curl -X POST http://localhost:3001/search -H "Content-Type: application/json" -d ''{"query":"test","max_results":3}''`
- Workers logs: `wrangler tail` (production) or terminal output (dev)
- Console logging: Extensive emoji-prefixed logs (📧, 🔍, ✅, ❌) for tracing

## Code Style Conventions
- TypeScript strict mode enabled
- Web Crypto API for password hashing (Workers-compatible)
- No external crypto libraries (use built-in `crypto.subtle`)
- Streaming uses TransformStream for backpressure handling
- Error handling: try-catch with console.error, fallback responses (never crash)
- Cookie parsing: Manual regex (`/session=([^;]+)/`)
- Email templates: Inline HTML in template literals

## Do NOT
- Use Node.js crypto module (Workers doesn't support it)
- Use EventSource API in frontend (not compatible with custom JSON streaming)
- Assume environment variables are set (check for `env.RESEND_API_KEY` existence)
- Deploy without running `npm run cf-typegen` first (generates Worker types)
- Modify `templates/` folder (separate Cloudflare template monorepo, not part of app)
