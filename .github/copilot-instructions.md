# Copilot Instructions for DrewChatApp

## Project Architecture

DrewChatApp is a Cloudflare Workers-based AI chat application with dual-model support (Workers AI + local Ollama). The architecture consists of:

- **Backend**: TypeScript Worker (`src/index.ts`) - serverless edge runtime handling auth, chat API, model routing
- **Frontend**: Vanilla JavaScript (`public/`) - no framework, uses native Web APIs with SSE streaming
- **Database**: Cloudflare D1 (SQLite) - user auth, sessions, conversations
- **Optional**: MCP Bridge (`mcp-bridge/server.js`) - Node.js Express proxy for DuckDuckGo web search via Docker

## Critical Development Workflows

### Local Development
```bash
# Start Ollama server (for local model testing)
ollama serve

# Start Workers dev server (uses cloud Workers AI binding even locally)
npm run dev
```

**Important**: `wrangler dev` still uses Cloudflare Workers AI binding (requires auth), NOT local Ollama. Local Ollama requires explicit routing logic in `handleChatRequest()`.

### Deployment
```bash
# Deploy to Cloudflare Workers
npx wrangler deploy

# Apply database migrations
npx wrangler d1 migrations apply techaboo_chat
```

### Model Selection Logic
The app auto-detects model type in `handleChatRequest()`:
- Models prefixed with `@cf/` → Routes to Workers AI
- Other models → Routes to Ollama (if available)
- Fallback: Uses Workers AI if Ollama unavailable

## Project-Specific Conventions

### Authentication (Custom Implementation)
**Do NOT use external auth libraries.** The app uses custom-built authentication:

```typescript
// Password hashing: SHA-256 with random salt
const salt = crypto.randomUUID();
const hash = await hashPassword(password + salt);

// Session tokens: Base64-encoded JSON with 30-day expiry
const sessionToken = encodeSession({ userId, expiresAt });

// Session validation: Check cookie against D1 database
const session = await validateSession(request);
```

Key auth functions in `src/index.ts`:
- `generateId()` - Crypto-based ID generation
- `hashPassword()` / `verifyPassword()` - SHA-256 with salt
- `encodeSession()` / `decodeSession()` - Base64 token encoding
- `createSession()` - Stores in D1 with 30-day TTL
- `validateSession()` - Verifies session from cookies

### SSE Streaming Pattern
All AI responses use Server-Sent Events for real-time streaming:

**Backend** (`src/index.ts`):
```typescript
// Create SSE stream
const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of aiResponse) {
      const text = chunk.response || '';
      controller.enqueue(`data: ${JSON.stringify({ text })}\n\n`);
    }
    controller.enqueue('data: [DONE]\n\n');
    controller.close();
  }
});

return new Response(stream, {
  headers: { 'Content-Type': 'text/event-stream' }
});
```

**Frontend** (`public/chat.js`):
```javascript
const eventSource = new EventSource('/api/chat');
eventSource.onmessage = (event) => {
  const { text } = JSON.parse(event.data);
  if (text === '[DONE]') {
    eventSource.close();
  } else {
    appendToMessage(text);
  }
};
```

### Workers AI vs Ollama Routing
The `handleChatRequest()` function determines model routing:

```typescript
const isWorkersAiModel = requestedModel?.startsWith('@cf/');
const useOllama = await isOllamaAvailable();

if (isWorkersAiModel || !useOllama) {
  return await handleWorkersAiRequest(messages, model, env);
}
return await handleOllamaRequest(messages);
```

**Workers AI models**: 22 cloud models (Llama 3.3 70B, Qwen 2.5 Coder 32B, QwQ 32B, Mistral, Gemma, DeepSeek, LoRA variants)  
**Ollama models**: 19+ local models (llama3.2:1b, qwen2.5-coder:7b, mistral:7b, etc.)

### Database Schema (D1)
Located in `migrations/0001_init_auth.sql`:

- `users` - email, username, password_hash (SHA-256+salt)
- `sessions` - session tokens with 30-day expiry, user_id FK
- `conversations` - chat threads, archived flag, user_id FK
- `messages` - role (user/assistant/system), content, conversation_id FK

All queries use parameterized statements via `env.DB.prepare()`.

### Web Search Integration
Optional MCP Bridge provides web search via DuckDuckGo:

1. Docker container: `docker run -i --rm mcp/duckduckgo`
2. Express server: `mcp-bridge/server.js` on port 3001
3. Proxies search queries to SearXNG instance
4. Workers fetch results via `/api/search` endpoint

Enable web search by passing `webSearch: true` in chat request.

## Integration Points

### Email Notifications (Resend)
Registration approval emails sent via `sendEmail()`:

```typescript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ from, to, subject, html })
});
```

Requires `RESEND_API_KEY` in wrangler secrets.

### Cloudflare Workers Bindings
Configured in `wrangler.jsonc`:

- `AI` binding - Workers AI API access
- `ASSETS` binding - Static file serving from `public/`
- `DB` binding - D1 database connection (SQLite)
- Environment vars: SMTP credentials, admin email

### Frontend Dependencies (CDN)
No build process. All dependencies loaded via CDN:

- Marked.js - Markdown rendering
- Highlight.js - Code syntax highlighting
- jsPDF - Export conversations to PDF

## Model-Specific Handling

### Responses API Models (GPT-OSS)
Models like `@cf/openchat/gpt-oss-120b` use different request format:

```typescript
// Standard models use 'messages' array
await env.AI.run(model, { messages });

// Responses API models use 'instructions' + 'input'
await env.AI.run(model, {
  instructions: systemMessage.content,
  input: lastUserMessage.content
});
```

Check model name: `model.includes('gpt-oss')` for detection.

### Vision Models
Llama 3.2 Vision 11B (`@cf/meta/llama-3.2-11b-vision-instruct`) supports image inputs. Handle multimodal content by including base64-encoded images in message content.

## Common Pitfalls

1. **Local dev always uses cloud**: Wrangler's AI binding requires Cloudflare authentication even with `wrangler dev`. True local Ollama requires explicit routing.

2. **Session cookie persistence**: Sessions use `Set-Cookie` header with `HttpOnly; Secure; SameSite=Lax`. Must include credentials in fetch requests:
   ```javascript
   fetch('/api/chat', { credentials: 'include' });
   ```

3. **SSE streaming cleanup**: Always close EventSource connections:
   ```javascript
   eventSource.onerror = () => eventSource.close();
   ```

4. **D1 database writes**: D1 is eventually consistent. Don't assume immediate read-after-write consistency.

5. **Model availability**: Workers AI models may change. Always check `handleListModels()` for current model list.

## File Organization

- `src/index.ts` (1,445 lines) - Main Worker with ALL backend logic (auth, chat, models)
- `src/auth.ts` - Auth utilities (imported by index.ts)
- `src/types.ts` - TypeScript interfaces (Env, ChatMessage)
- `public/index.html` - Chat UI (805 lines, no theme toggle currently)
- `public/chat.js` (1,235 lines) - Frontend logic, SSE streaming, localStorage persistence
- `public/auth.html` & `auth.js` - Login/register pages
- `wrangler.jsonc` - Workers config (bindings, D1, env vars)
- `migrations/0001_init_auth.sql` - Database schema

## Key Development Files

When making changes to:
- **Model handling** → Edit `handleWorkersAiRequest()` or `handleOllamaRequest()` in `src/index.ts`
- **Authentication** → Edit auth functions in `src/index.ts` (custom implementation)
- **UI styling** → Edit CSS in `public/index.html` (CSS variables in `:root`)
- **Chat streaming** → Edit SSE logic in both `handleWorkersAiRequest()` and `public/chat.js`
- **Database schema** → Create new migration in `migrations/`, run `wrangler d1 migrations apply`

## Testing Workflow

1. Test locally: `npm run dev` (uses cloud Workers AI)
2. Test Ollama: Start `ollama serve`, verify routing in console logs
3. Test auth: Register → Wait for admin approval email → Login
4. Test streaming: Send message, verify SSE chunks in Network tab
5. Test database: Query D1 via `wrangler d1 execute techaboo_chat --command "SELECT * FROM users"`

## Examples of Correct Implementation

### Adding a New API Route
```typescript
// In src/index.ts, inside export default
if (url.pathname === '/api/new-feature') {
  if (request.method === 'POST') {
    return handleNewFeature(request, env);
  }
  return new Response('Method not allowed', { status: 405 });
}
```

### Querying D1 Database
```typescript
const result = await env.DB.prepare(
  'SELECT * FROM users WHERE email = ?'
).bind(email).first();
```

### Sending SSE Events
```typescript
const encoder = new TextEncoder();
controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
```

---

**When in doubt**: Reference `src/index.ts` for backend patterns, `public/chat.js` for frontend patterns. The codebase uses vanilla JavaScript/TypeScript with no external frameworks except Workers AI SDK.
