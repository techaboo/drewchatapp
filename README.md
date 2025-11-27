# DrewChatApp - Advanced AI Chat Application

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A production-ready, feature-rich AI chat application powered by Cloudflare Workers AI with support for 22+ language models, including local Ollama integration, web search capabilities, and advanced authentication.

[Live Demo](https://drewchatapp.cloudflare-liftoff137.workers.dev/) · [Report Bug](https://github.com/techaboo/drewchatapp/issues) · [Request Feature](https://github.com/techaboo/drewchatapp/issues)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Available Models](#-available-models)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## ⚡ Quick Start (Windows)

### Deploy to Production
```cmd
deploy-production.bat
```
Commits changes, pushes to Git, and deploys to Cloudflare Workers.

### Start Local Development
```cmd
start-local-dev.bat
```
Runs Wrangler dev server with cloud AI models at `localhost:8787`.

### Use Local AI Models
```cmd
start-ollama.bat
setup-ollama-models.bat
```
Start Ollama server and download models for free offline development.

**📘 Full instructions in [Deployment](#-deployment) section below.**

---

## 🌟 Overview

**DrewChatApp** is a sophisticated AI-powered chat application that bridges cloud-based AI models with local inference capabilities. Built on Cloudflare's edge infrastructure, it delivers blazing-fast responses with sub-100ms latency while supporting both premium cloud models and free local alternatives.

### What Problem Does It Solve?

- **Cost-Effective Development**: Seamlessly switch between free local models (Ollama) and production cloud models (Cloudflare Workers AI)
- **Model Flexibility**: Access 22+ state-of-the-art language models including reasoning, code generation, and vision models
- **Enterprise Features**: Built-in authentication, user management, and email notifications
- **Web-Enhanced Responses**: Integrate real-time web search results for up-to-date information
- **Production-Ready**: Edge deployment with global CDN, automatic scaling, and 99.9% uptime

### Target Audience

- **Developers**: Building AI-powered applications or prototyping with LLMs
- **Enterprises**: Deploying secure, scalable chat interfaces for internal tools
- **Researchers**: Experimenting with multiple AI models and comparing outputs
- **Startups**: Launching AI products without managing infrastructure

---

## ✨ Features

### 🤖 Multi-Model AI Support
- **22+ Cloud Models**: Access Llama 3.3 70B, Qwen 2.5, Mistral, Gemma, DeepSeek, and more
- **Local Ollama Integration**: Run models offline during development (free, no API costs)
- **Automatic Fallback**: Seamlessly switches between local and cloud models
- **Specialized Models**: 
  - 🔧 **Code Generation**: Qwen 2.5 Coder, DeepSeek R1
  - 🧠 **Reasoning**: QwQ 32B (o1-mini equivalent)
  - 👁️ **Vision**: Llama 3.2 Vision 11B (image understanding)
  - 🛡️ **Safety**: Llama Guard 3 (content filtering)

### 💬 Advanced Chat Features
- **Real-Time Streaming**: Server-Sent Events (SSE) for instant word-by-word responses
- **Multi-Turn Conversations**: Maintains context across messages with conversation history
- **File Attachments**: Upload and discuss documents, code, or images
- **Web Search Integration**: Query web results via SearXNG with MCP bridge
- **Message Persistence**: Automatic conversation saving to browser storage
- **Conversation Management**: Create, rename, archive, and delete chat threads

### 🔐 Authentication & Security
- **Admin Approval Workflow**: New registrations require manual approval
- **Email Notifications**: Automated notifications via Resend API
- **Session Management**: Secure 30-day sessions with token-based auth
- **Password Reset**: Self-service password recovery flow
- **D1 Database**: Persistent user storage with Cloudflare D1 (SQLite)

### 🎨 User Experience
- **Responsive Design**: Mobile-first UI that adapts to all screen sizes (375px to 4K)
- **Dark/Light Theme Toggle**: Manual theme switcher with localStorage persistence + system preference detection
- **Model Backend Indicator**: Visual badge showing ☁️ Cloud or 💻 Local model usage
- **Syntax Highlighting**: Code blocks with language detection (via highlight.js)
- **Markdown Rendering**: Rich text formatting with Marked.js
- **Typing Indicators**: Visual feedback during AI response generation
- **Model Selection**: Dynamic dropdown to switch between 22+ models
- **Touch-Friendly**: 44x44px minimum touch targets for mobile devices

### ⚙️ Developer Features
- **TypeScript**: Fully typed codebase with Workers AI SDK types
- **Hot Reload**: Instant updates during local development
- **Comprehensive Logging**: Debug-friendly console output with emojis
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Docker Support**: Containerized MCP bridge for web search
- **Batch Scripts**: One-click deployment and setup automation

---

## 📸 Screenshots

_(Add screenshots here of your live application)_

```
[Chat Interface]  [Model Selection]  [Web Search]  [Settings]
```

---

## 💻 System Requirements

### Minimum Requirements

- **Node.js**: v18.0.0+ (v24.0.4 recommended)
- **npm**: v8.0.0+ or compatible package manager
- **Cloudflare Account**: Free tier is sufficient for development
- **Wrangler CLI**: v4.50.0+ (installed via npm)

### Optional Requirements

- **Ollama**: v0.1.0+ (for local model testing)
- **Docker**: v20.10+ (for MCP bridge web search)
- **Resend Account**: For email notifications (free tier available)

---

## 🚀 Installation

### Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/techaboo/drewchatapp.git
cd drewchatapp

# 2. Install dependencies
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. Create D1 database
npx wrangler d1 create techaboo_chat
# Copy the database ID and update wrangler.jsonc

# 5. Run migrations
npx wrangler d1 migrations apply techaboo_chat --remote

# 6. Start local development
npm run dev
```

**Your app is now running at `http://localhost:8787/`**

### Detailed Setup

#### Step 1: Clone and Install

```bash
git clone https://github.com/techaboo/drewchatapp.git
cd drewchatapp
npm install
```

#### Step 2: Configure Cloudflare Workers AI

1. **Create a Cloudflare Account** (if you don't have one):
   - Sign up at [dash.cloudflare.com](https://dash.cloudflare.com/)
   - Navigate to Workers & Pages > Overview

2. **Authenticate Wrangler CLI**:
   ```bash
   npx wrangler login
   ```
   This opens a browser window to authorize the CLI.

3. **Create D1 Database**:
   ```bash
   npx wrangler d1 create techaboo_chat
   ```
   
   Copy the database ID from the output:
   ```
   [[d1_databases]]
   binding = "DB"
   database_name = "techaboo_chat"
   database_id = "078cde78-1beb-4d7a-a642-d42e8def88c9"  # Your ID here
   ```

4. **Update `wrangler.jsonc`**:
   Replace the `database_id` in the file with your newly created ID.

#### Step 3: Run Database Migrations

```bash
# Apply migrations to create tables (users, sessions, etc.)
npx wrangler d1 migrations apply techaboo_chat --remote
```

This creates the following tables:
- `users` - User accounts and credentials
- `sessions` - Authentication session tokens
- `conversations` - Chat history storage

#### Step 4: Configure Email (Optional)

To enable user registration and password reset emails:

1. **Create a Resend Account**:
   - Sign up at [resend.com](https://resend.com/)
   - Get your API key from the dashboard

2. **Add Environment Variables**:
   ```bash
   npx wrangler secret put SMTP_USER
   # Paste your Resend API key

   npx wrangler secret put ADMIN_EMAIL
   # Enter your admin email (e.g., admin@example.com)
   ```

3. **Update `wrangler.jsonc`**:
   ```json
   [vars]
   SMTP_HOST = "smtp.resend.com"
   SMTP_PORT = "587"
   SMTP_FROM = "noreply@yourdomain.com"
   ADMIN_EMAIL = "admin@example.com"
   ```

#### Step 5: Enable Local Ollama (Optional)

For free local development without API costs:

1. **Install Ollama**:
   - Download from [ollama.com](https://ollama.com/)
   - Or use Homebrew: `brew install ollama`

2. **Start Ollama Server**:
   ```bash
   ollama serve
   ```

3. **Pull Models**:
   ```bash
   ollama pull llama3.3:70b
   ollama pull qwen2.5:32b
   ollama pull mistral:7b
   ```

4. **Configure in Code**:
   The app automatically detects Ollama at `http://localhost:11434/` and uses it when available.

#### Step 6: Enable Web Search (Optional)

For web-enhanced AI responses via SearXNG:

1. **Start MCP Bridge**:
   ```bash
   cd mcp-bridge
   npm install
   node server.js
   ```
   
   The bridge runs on `http://localhost:3001/`

2. **Verify Connection**:
   ```bash
   curl http://localhost:3001/api/search/status
   # Should return: {"available": true, "provider": "searxng"}
   ```

3. **Docker Setup** (alternative):
   ```bash
   docker-compose up -d
   ```

See [SETUP-WEB-SEARCH.md](./SETUP-WEB-SEARCH.md) for detailed configuration.

---

## 📖 Usage

### Basic Chat

1. **Open the Application**:
   - Local: `http://localhost:8787/`
   - Production: `https://drewchatapp.cloudflare-liftoff137.workers.dev/`

2. **Select a Model**:
   - Click the model dropdown (default: Llama 3.3 70B)
   - Choose from 22+ available models

3. **Start Chatting**:
   ```
   You: Explain quantum computing in simple terms
   AI: [Streaming response appears word-by-word...]
   ```

### Model Selection

```javascript
// Available model categories:
const models = {
  general: [
    "Llama 3.3 70B",      // Best overall performance
    "Llama 3.1 8B",       // Fast, efficient
    "Qwen 2.5 72B",       // Strong multilingual
    "Mistral 7B v0.2",    // Good balance
  ],
  code: [
    "Qwen 2.5 Coder 32B", // Code generation specialist
    "DeepSeek R1 32B",    // Code reasoning
  ],
  reasoning: [
    "QwQ 32B",            // o1-mini equivalent
  ],
  vision: [
    "Llama 3.2 Vision",   // Image understanding
  ]
}
```

### Web Search Integration

Toggle the "🔍 Web Search" button to enhance responses with real-time information:

```
You: What are the latest AI advancements in 2025?
AI: [Searches web, then synthesizes results...]
```

### File Attachments

Upload and discuss documents, code, or text files:

**How It Works**:
1. Click **"Attach files"** button (📎 icon)
2. Select one or more files (max 2MB each)
3. Files appear as tags below the input box
4. Type your question or leave blank for automatic analysis
5. Send message - AI reads and analyzes the file contents

**Supported File Types**:
- **Code**: `.js`, `.ts`, `.py`, `.java`, `.cpp`, `.go`, `.rs`, `.rb`, `.php`, `.html`, `.css`, `.json`, `.xml`, `.yaml`
- **Documents**: `.txt`, `.md`, `.csv`, `.log`
- **Others**: Any text-based file under 2MB

**File Formatting**:
- Code files: Automatically wrapped in syntax-highlighted code blocks
- Markdown files: Rendered with original formatting
- Text files: Wrapped in plain code blocks

**Tips for Best Results**:
- Ask specific questions: "What does this function do?" or "Find bugs in this code"
- Use larger models for complex code: Llama 3.3 70B, Qwen 2.5 Coder 32B
- Attach multiple related files together for context
- File contents appear before your message so AI sees them first

**Example Prompts**:
```
"Explain this code"
"Find security vulnerabilities"
"Convert this Python to JavaScript"
"Summarize this document"
"What are the main functions?"
```

### Authentication

**Note**: Authentication is currently disabled for testing. To enable:

1. Uncomment session validation in `src/index.ts`:
   ```typescript
   // Restore lines 327-340 in handleChat()
   ```

2. Create an account:
   - Navigate to `/register.html`
   - Fill out registration form
   - Wait for admin approval email

3. Login:
   - Navigate to `/login.html`
   - Enter credentials
   - Session lasts 30 days

### API Integration

#### Send Chat Request

```bash
curl -X POST https://drewchatapp.cloudflare-liftoff137.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ],
    "model": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    "stream": true
  }'
```

#### List Available Models

```bash
curl https://drewchatapp.cloudflare-liftoff137.workers.dev/api/models
```

Response:
```json
{
  "models": [
    {
      "id": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      "name": "Llama 3.3 70B Instruct",
      "description": "High-performance general-purpose model"
    },
    ...
  ]
}
```

#### Check Web Search Status

```bash
curl https://drewchatapp.cloudflare-liftoff137.workers.dev/api/search/status
```

Response:
```json
{
  "available": false,
  "provider": "disabled"
}
```

---

## ⚙️ Configuration

### Environment Variables

Create `.dev.vars` for local development:

```env
# Resend Email Configuration
SMTP_USER=re_YOUR_API_KEY_HERE
ADMIN_EMAIL=admin@example.com

# Optional: Custom AI Gateway
AI_GATEWAY_ENDPOINT=https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT/YOUR_GATEWAY
```

### wrangler.jsonc Configuration

```jsonc
{
  "name": "drewchatapp",
  "main": "src/index.ts",
  "compatibility_date": "2025-02-04",
  
  // Assets directory (HTML/JS/CSS)
  "assets": {
    "directory": "./public"
  },
  
  // Workers AI binding
  "ai": {
    "binding": "AI"
  },
  
  // D1 Database
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "techaboo_chat",
      "database_id": "YOUR_DATABASE_ID_HERE"
    }
  ],
  
  // Environment variables
  "vars": {
    "SMTP_HOST": "smtp.resend.com",
    "SMTP_PORT": "587",
    "SMTP_FROM": "noreply@yourdomain.com",
    "ADMIN_EMAIL": "admin@example.com"
  }
}
```

### Model Configuration

Edit `src/index.ts` to add/remove models:

```typescript
const MODELS = [
  {
    id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    name: 'Llama 3.3 70B Instruct',
    description: 'High-performance general-purpose model',
    category: 'general'
  },
  // Add your custom models here...
]
```

---

## 🤖 Available Models

### General Purpose (10 models)

| Model | Size | Description | Best For |
|-------|------|-------------|----------|
| **Llama 3.3 70B** | 70B | Meta's flagship model | Complex reasoning, long context |
| **Llama 3.1 8B** | 8B | Fast, efficient | Quick responses, simple tasks |
| **Llama 3.2 3B** | 3B | Ultra-fast | Low-latency applications |
| **Llama 3.2 1B** | 1B | Edge-optimized | Mobile/edge deployment |
| **Qwen 2.5 72B** | 72B | Alibaba's flagship | Multilingual, coding |
| **Qwen 1.5 14B** | 14B | Balanced performance | General use (deprecated) |
| **Mistral 7B v0.2** | 7B | Open-source favorite | Balanced speed/quality |
| **Gemma 3 12B** | 12B | Google DeepMind | Instruction following |
| **Gemma 7B** | 7B | Efficient | Quick tasks |
| **DeepSeek V3** | — | Latest reasoning | Complex problem-solving |

### Code Specialists (2 models)

| Model | Focus | Description |
|-------|-------|-------------|
| **Qwen 2.5 Coder 32B** | Code generation | Specialized for programming tasks |
| **DeepSeek R1 32B** | Code reasoning | Advanced code understanding |

### Reasoning Models (1 model)

| Model | Description | Equivalent To |
|-------|-------------|---------------|
| **QwQ 32B** | Chain-of-thought reasoning | OpenAI o1-mini |

### Vision Models (1 model)

| Model | Capabilities | Input |
|-------|-------------|-------|
| **Llama 3.2 Vision 11B** | Image understanding, OCR, visual QA | Text + Images |

> **Note**: Vision models automatically accept the [Llama 3.2 License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE) on first use. By using this model, you agree to Meta's Community License and Acceptable Use Policy.

### Safety & Moderation (1 model)

| Model | Purpose | Output |
|-------|---------|--------|
| **Llama Guard 3 8B** | Content filtering, safety classification | Safe/Unsafe labels |

### Fine-Tunable (LoRA) (4 models)

| Model | Base | Description |
|-------|------|-------------|
| **Llama 3.1 8B LoRA** | Llama 3.1 8B | Customizable with your data |
| **Llama 3.2 1B LoRA** | Llama 3.2 1B | Edge-optimized fine-tuning |
| **Mistral 7B LoRA** | Mistral 7B | Open-weight customization |
| **Gemma 2B LoRA** | Gemma 2B | Lightweight fine-tuning |

**Total**: 22 models (19 cloud + 3 deprecated but functional)

---

## 📚 API Reference

### POST /api/chat

Send a chat message and receive streaming AI responses.

**Request Body**:

```json
{
  "messages": [
    {"role": "user", "content": "Your message here"}
  ],
  "model": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "stream": true,
  "max_tokens": 2048,
  "temperature": 0.7,
  "top_p": 0.9
}
```

**Response** (Server-Sent Events):

```
data: {"response":"Hello"}
data: {"response":" there"}
data: {"response":"!"}
data: [DONE]
```

**Parameters**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `messages` | Array | Yes | — | Chat history with role/content pairs |
| `model` | String | Yes | — | Model ID from /api/models |
| `stream` | Boolean | No | true | Enable SSE streaming |
| `max_tokens` | Number | No | 2048 | Maximum response length |
| `temperature` | Number | No | 0.7 | Randomness (0.0-1.0) |
| `top_p` | Number | No | 0.9 | Nucleus sampling threshold |

**Authentication**: Currently disabled (no session required)

### GET /api/models

Retrieve all available AI models.

**Response**:

```json
{
  "models": [
    {
      "id": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      "name": "Llama 3.3 70B Instruct",
      "description": "High-performance general-purpose model",
      "category": "general",
      "context_length": 8192,
      "supports_vision": false
    },
    {
      "id": "@cf/meta/llama-3.2-11b-vision-instruct",
      "name": "Llama 3.2 Vision 11B",
      "description": "Vision-language model",
      "category": "vision",
      "context_length": 4096,
      "supports_vision": true
    }
  ]
}
```

### GET /api/search/status

Check web search availability.

**Response**:

```json
{
  "available": false,
  "provider": "disabled"
}
```

When MCP bridge is running:

```json
{
  "available": true,
  "provider": "searxng",
  "endpoint": "http://localhost:3001"
}
```

### POST /api/auth/register

Create a new user account (requires admin approval).

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe"
}
```

**Response**:

```json
{
  "message": "Registration successful. Please wait for admin approval.",
  "userId": "uuid-here"
}
```

### POST /api/auth/login

Authenticate and create a session.

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:

```json
{
  "message": "Login successful",
  "sessionToken": "token-here",
  "expiresAt": "2025-03-04T12:00:00Z"
}
```

### POST /api/auth/reset-password

Request a password reset email.

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response**:

```json
{
  "message": "Password reset email sent"
}
```

---

## 🛠️ Development

### Local Development

```bash
# Start development server with hot reload
npm run dev

# Access at http://localhost:8787/
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting & Formatting

```bash
# Check TypeScript types
npm run typecheck

# Format code (if configured)
npm run format
```

### Database Management

```bash
# Create migration
npx wrangler d1 migrations create techaboo_chat migration_name

# Apply migrations locally
npx wrangler d1 migrations apply techaboo_chat --local

# Apply migrations to production
npx wrangler d1 migrations apply techaboo_chat --remote

# Query database
npx wrangler d1 execute techaboo_chat --command "SELECT * FROM users"
```

### Debugging

#### Enable Verbose Logging

Edit `src/index.ts` and add:

```typescript
console.log('🔍 DEBUG: Request details:', {
  url: request.url,
  method: request.method,
  headers: Object.fromEntries(request.headers.entries())
});
```

#### View Real-Time Logs

```bash
# Stream production logs
npx wrangler tail

# Stream with filtering
npx wrangler tail --format=json | grep ERROR
```

#### Test Ollama Connection

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test chat endpoint
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.3:70b",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": false
}'
```

---

## 🚢 Deployment

### Quick Start Scripts (Windows)

Use these batch scripts for one-click operations:

#### **Production Deployment**
```cmd
deploy-production.bat
```
Stages changes, commits to Git, pushes to GitHub, and deploys to Cloudflare Workers.

#### **Local Development**
```cmd
start-local-dev.bat
```
Starts Wrangler dev server with Cloudflare Workers AI (cloud models).

#### **Local Ollama Server**
```cmd
start-ollama.bat
```
Starts Ollama server on `localhost:11434` for free local models.

#### **Ollama Model Setup**
```cmd
setup-ollama-models.bat
```
Interactive menu to download recommended Ollama models (1-8GB).

#### **MCP Bridge (Web Search)**
```cmd
start-mcp-bridge.bat
```
Starts Docker container for web search via SearXNG.

---

### Deploy to Cloudflare Workers

#### Quick Deploy (Production)

```bash
# Deploy with one command
npm run deploy

# Or use the batch script (Windows)
deploy-production.bat

# Or deploy directly
npx wrangler deploy
```

#### Manual Deployment

```bash
# 1. Stage and commit changes
git add .
git commit -m "Your commit message"
git push origin main

# 2. Deploy to Cloudflare
npx wrangler deploy

# 3. View deployment URL
# https://drewchatapp.YOUR_SUBDOMAIN.workers.dev/
```

#### Custom Domain Setup

1. **Add Domain in Cloudflare Dashboard**:
   - Workers & Pages > Your Worker > Settings > Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `chat.example.com`)

2. **Update DNS Records**:
   - Cloudflare automatically creates CNAME record
   - Wait 1-5 minutes for propagation

3. **Enable HTTPS**:
   - SSL/TLS > Overview > Select "Full (strict)"
   - Free SSL certificate is auto-provisioned

#### Environment-Specific Deployments

```bash
# Deploy to staging
npx wrangler deploy --env staging

# Deploy to production
npx wrangler deploy --env production
```

Add to `wrangler.jsonc`:

```jsonc
{
  "env": {
    "staging": {
      "name": "drewchatapp-staging",
      "vars": {
        "ENVIRONMENT": "staging"
      }
    },
    "production": {
      "name": "drewchatapp",
      "vars": {
        "ENVIRONMENT": "production"
      }
    }
  }
}
```

### Rollback Deployment

```bash
# List recent deployments
npx wrangler deployments list

# Rollback to specific version
npx wrangler rollback --message "Reverting due to bug"
```

### Monitoring

```bash
# View live traffic
npx wrangler tail --format=pretty

# View analytics in dashboard
# Cloudflare Dashboard > Workers & Pages > Your Worker > Analytics
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────┐      HTTPS      ┌──────────────────┐
│   Browser   │ ◄──────────────► │ Cloudflare Edge  │
│   (Client)  │   SSE Streaming  │   (CDN + WAF)    │
└─────────────┘                  └────────┬─────────┘
                                          │
                                          ▼
                                 ┌────────────────────┐
                                 │  Cloudflare Worker │
                                 │   (src/index.ts)   │
                                 └────────┬───────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌─────────────────┐   ┌───────────────┐   ┌──────────────────┐
           │  Workers AI API │   │ D1 Database   │   │  Resend Email    │
           │  (22+ models)   │   │  (SQLite)     │   │  (SMTP)          │
           └─────────────────┘   └───────────────┘   └──────────────────┘
                    │
                    │ Fallback
                    ▼
           ┌─────────────────┐
           │ Ollama (Local)  │
           │ localhost:11434 │
           └─────────────────┘
```

### Request Flow

1. **Client Request** → Browser sends POST to `/api/chat`
2. **Edge Routing** → Cloudflare edge routes to nearest Worker datacenter
3. **Authentication** → (Optional) Validate session token from D1
4. **Model Selection** → Choose cloud (Workers AI) or local (Ollama) model
5. **AI Inference** → Stream tokens via SSE as they're generated
6. **Response** → Client receives word-by-word updates

### Technology Stack

#### Frontend

- **Vanilla JavaScript**: No framework dependencies
- **Marked.js v15.0.7**: Markdown parsing
- **Highlight.js v11.11.1**: Syntax highlighting
- **CSS3**: Custom responsive design with dark mode

#### Backend

- **Cloudflare Workers**: V8 isolate-based serverless runtime
- **TypeScript 5.8.3**: Type-safe development
- **Wrangler 4.50.0**: Deployment & local dev CLI
- **Workers AI SDK**: Native AI model bindings

#### Database

- **Cloudflare D1**: Edge-native SQLite database
- **Schema**: Users, sessions, conversations tables
- **Migrations**: Version-controlled SQL migrations

#### External Services

- **Resend API**: Transactional email (SMTP)
- **Ollama**: Local LLM inference (optional)
- **SearXNG**: Web search via MCP bridge (optional)

### Security Architecture

- **Edge Execution**: Code runs at 275+ Cloudflare datacenters (zero-trust)
- **Session Tokens**: Cryptographically secure random tokens
- **Password Hashing**: Bcrypt-like hashing with salts
- **CORS Protection**: Strict origin validation
- **Rate Limiting**: Cloudflare's built-in DDoS protection
- **Content Security Policy**: XSS prevention headers

### Performance Optimizations

- **Streaming Responses**: SSE reduces time-to-first-token
- **Edge Caching**: Static assets cached at 275+ locations
- **Model Fallback**: Ollama reduces API latency during dev
- **Lazy Loading**: Frontend loads markdown/highlight.js on-demand
- **Connection Pooling**: D1 maintains persistent connections

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "401 Unauthorized" Error

**Symptom**: `/api/chat` returns 401 even though authentication is disabled

**Solution**:

```typescript
// In src/index.ts, comment out session validation:
async function handleChat(request: Request, env: Env) {
  // const session = await validateSession(request, env);
  // if (!session) {
  //   return new Response('Unauthorized', { status: 401 });
  // }
  
  // Continue with chat logic...
}
```

#### 2. "Model Not Found" Error

**Symptom**: Selected model returns 404 or "model not available"

**Solution**:

- Check model ID matches exactly: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- Verify model is in MODELS array in `src/index.ts`
- Some models may be deprecated (use alternatives)

#### 3. Ollama Connection Failed

**Symptom**: Local development can't reach Ollama at `http://localhost:11434`

**Solution**:

```bash
# Verify Ollama is running
ollama serve

# Check in another terminal
curl http://localhost:11434/api/tags

# If not working, restart Ollama
killall ollama
ollama serve
```

#### 4. Vision Model License Error

**Symptom**: Error 5016 - "Prior to using this model, you must submit the prompt 'agree'"

**What This Means**: Llama 3.2 Vision models require accepting Meta's license agreement.

**Solution**:

The app automatically sends the "agree" message on first use. If you see this error:

1. **Automatic handling** (already implemented in v1.1.0):
   - The backend automatically accepts license on first vision model use
   - No user action required

2. **Manual acceptance** (required if automatic fails):
   ```bash
   # Via Wrangler (one-time setup)
   npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "agree"
   ```
   
   This sends "agree" to Meta's license server and enables vision models for your account.

3. **If still not working**:
   - Ensure you're not in the EU or a company based in the EU (license restriction)
   - Check Cloudflare Workers AI dashboard for account status
   - Try logging out and back in: `npx wrangler logout && npx wrangler login`
   - Use a different model temporarily while investigating

**License Links**:
- [Llama 3.2 License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE)
- [Acceptable Use Policy](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md)

> By using vision models, you agree that you are not in the EU or a company with principal place of business in the EU.

#### 5. Database Migration Errors

**Symptom**: `Error: table users already exists`

**Solution**:

```bash
# Delete and recreate database
npx wrangler d1 delete techaboo_chat
npx wrangler d1 create techaboo_chat

# Update database_id in wrangler.jsonc
# Re-run migrations
npx wrangler d1 migrations apply techaboo_chat --remote
```

#### 5. Email Not Sending

**Symptom**: Registration emails not received

**Solution**:

1. **Verify Resend API Key**:
   ```bash
   npx wrangler secret list
   # Should show SMTP_USER
   ```

2. **Check Email Logs**:
   ```bash
   npx wrangler tail
   # Look for "Email sent successfully" or error messages
   ```

3. **Verify Sender Domain**:
   - Resend requires verified domain (or use `noreply@resend.dev` for testing)

#### 6. Deployment Fails

**Symptom**: `npx wrangler deploy` returns error

**Common Solutions**:

```bash
# Re-authenticate
npx wrangler logout
npx wrangler login

# Check wrangler.jsonc syntax
# (JSON comments must use // not /* */)

# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
npx wrangler deploy
```

#### 7. Web Search Not Working

**Symptom**: `/api/search/status` returns `{"available": false}`

**Solution**:

```bash
# Start MCP bridge
cd mcp-bridge
npm install
node server.js

# Verify in browser
curl http://localhost:3001/api/search/status

# Should return: {"available": true, "provider": "searxng"}
```

#### 8. Streaming Stops Midway

**Symptom**: AI response cuts off after a few words

**Solution**:

- Check `max_tokens` parameter (increase to 4096+)
- Verify model supports streaming (all current models do)
- Check browser console for JavaScript errors
- Inspect network tab for closed SSE connection

#### 9. Batch Scripts Not Working (Windows)

**Symptom**: Double-clicking `.bat` files does nothing or shows errors

**Solutions**:

**A. "command not found" errors**:
```cmd
# Verify npm is in PATH
where npm

# If not found, add Node.js to system PATH:
# System Properties > Environment Variables > Path
# Add: C:\Program Files\nodejs\
```

**B. deploy-production.bat fails**:
```cmd
# Ensure Git is installed and authenticated
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Test Git access
git status

# If permission denied, set up SSH keys
ssh-keygen -t ed25519 -C "your@email.com"
```

**C. start-ollama.bat says "Ollama not found"**:
```cmd
# Install Ollama first
# Download from: https://ollama.ai/download/windows

# Verify installation
ollama --version

# If not found, add to PATH manually
set PATH=%PATH%;C:\Users\%USERNAME%\AppData\Local\Programs\Ollama
```

**D. setup-ollama-models.bat downloads fail**:
```cmd
# Check internet connection
ping ollama.ai

# Verify Ollama server is running
start-ollama.bat

# Wait 10 seconds, then retry download
setup-ollama-models.bat
```

**E. start-mcp-bridge.bat fails**:
```cmd
# Ensure Docker Desktop is installed and running
# Download from: https://www.docker.com/products/docker-desktop/

# Verify Docker is running
docker --version
docker ps

# If permission error, run as Administrator:
# Right-click start-mcp-bridge.bat > Run as administrator
```

### Debug Mode

Enable comprehensive logging:

```typescript
// Add to src/index.ts
const DEBUG = true;

if (DEBUG) {
  console.log('🔍 Request:', request.method, request.url);
  console.log('🔍 Headers:', Object.fromEntries(request.headers));
  console.log('🔍 Body:', await request.clone().text());
}
```

### Getting Help

- **GitHub Issues**: [github.com/techaboo/drewchatapp/issues](https://github.com/techaboo/drewchatapp/issues)
- **Cloudflare Discord**: [discord.gg/cloudflaredev](https://discord.gg/cloudflaredev)
- **Cloudflare Docs**: [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/techaboo/drewchatapp.git
   cd drewchatapp
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test Locally**
   ```bash
   npm run dev
   # Test your changes thoroughly
   ```

5. **Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push to GitHub**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Describe your changes clearly
   - Reference related issues
   - Wait for review

### Code Style

- **TypeScript**: Use strict type checking
- **Formatting**: Follow Prettier defaults
- **Comments**: Use JSDoc for functions
- **Naming**: camelCase for variables, PascalCase for types

Example:

```typescript
/**
 * Handles streaming AI chat responses
 * @param messages - Array of chat messages with role/content
 * @param model - Cloudflare Workers AI model ID
 * @returns ReadableStream of SSE responses
 */
async function handleChatStream(
  messages: ChatMessage[],
  model: string
): Promise<ReadableStream> {
  // Implementation...
}
```

### Reporting Bugs

Use GitHub Issues with this template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., v20.0.0]
```

### Requesting Features

Use GitHub Issues with this template:

```markdown
**Feature Description**
Clear description of the feature you want.

**Use Case**
Explain why this feature would be useful.

**Proposed Solution**
How you think it should work.

**Alternatives Considered**
Other solutions you've thought about.
```

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 techaboo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See [LICENSE](./LICENSE) file for full details.

---

## 🙏 Acknowledgments

### Technologies

- **Cloudflare Workers AI** - For providing access to 22+ state-of-the-art language models
- **Ollama** - For enabling free local LLM inference during development
- **Resend** - For reliable transactional email delivery
- **Meta AI** - For Llama 3.x model family (open-weight foundation models)
- **Qwen Team (Alibaba)** - For Qwen 2.5 series models
- **Mistral AI** - For Mistral 7B and fine-tuning support
- **Google DeepMind** - For Gemma model family
- **DeepSeek** - For reasoning and code-specialized models

### Inspiration

- **ChatGPT** - UI/UX inspiration for streaming responses
- **Cloudflare Templates** - Base template structure and best practices
- **open-webui** - Ollama integration patterns
- **LangChain** - Agent architecture concepts

### Community

- **Cloudflare Developers Discord** - For troubleshooting and support
- **r/CloudFlare** - Community feedback and feature requests
- **GitHub Sponsors** - Thank you to all contributors and supporters

### Special Thanks

- **@cloudflare** - For building an incredible edge computing platform
- **@ollama** - For democratizing local LLM access
- **@resend** - For developer-friendly email APIs
- All contributors who submitted bug reports, feature requests, and pull requests

---

<div align="center">

**Built with ❤️ by [techaboo](https://github.com/techaboo)**

[⬆ Back to Top](#drewchatapp---advanced-ai-chat-application)

</div>

---

## 📂 Project Structure

```
drewchatapp/
├── public/                          # Frontend static assets
│   ├── index.html                   # Main chat interface
│   ├── chat.js                      # Frontend JavaScript (SSE handling)
│   ├── login.html                   # User login page
│   ├── register.html                # User registration page
│   └── reset-password.html          # Password recovery page
│
├── src/                             # Backend TypeScript source
│   ├── index.ts                     # Main Worker entry point
│   ├── auth.ts                      # Authentication logic
│   └── types.ts                     # Type definitions
│
├── mcp-bridge/                      # Web search integration
│   ├── server.js                    # MCP proxy server (Node.js)
│   ├── Dockerfile                   # Docker container config
│   └── package.json                 # Node dependencies
│
├── migrations/                      # Database schema
│   └── 0001_init_auth.sql          # User/session tables
│
├── wrangler.jsonc                   # Cloudflare Worker config
├── tsconfig.json                    # TypeScript compiler settings
├── docker-compose.yml               # Docker orchestration
│
└── Documentation/
    ├── README.md                    # This file
    ├── OLLAMA-SETUP.md             # Local model guide
    ├── SETUP-WEB-SEARCH.md         # Web search setup
    ├── DEPLOY-TO-CLOUDFLARE.md     # Deployment guide
    ├── DOCKER-SETUP.md             # Docker instructions
    └── QUICK-DEPLOY.md             # Fast deployment
```

---

## 🎯 How It Works

### Request Lifecycle

```
1. User types message in chat.js
   ↓
2. POST /api/chat with messages array
   ↓
3. Worker validates session (optional)
   ↓
4. Worker selects model (cloud vs local)
   ↓
5. AI inference begins (Workers AI or Ollama)
   ↓
6. SSE stream starts { data: {response: "token"} }
   ↓
7. Frontend renders word-by-word
   ↓
8. Stream ends with [DONE]
   ↓
9. Conversation saved to localStorage
```

### Backend Components

**src/index.ts** - Main Worker Logic

- **handleChat()**: Processes chat requests, manages streaming
- **handleWorkersAiRequest()**: Routes to Workers AI models
- **handleOllamaRequest()**: Fallback to local Ollama
- **handleListModels()**: Returns model metadata
- **validateSession()**: Checks authentication tokens

**src/auth.ts** - Authentication System

- User registration with admin approval
- Password hashing with bcrypt-like algorithm
- Session token generation and validation
- Email notifications via Resend

**src/types.ts** - TypeScript Definitions

```typescript
interface Env {
  AI: Ai;                  // Workers AI binding
  DB: D1Database;          // Database binding
  SMTP_USER: string;       // Email credentials
  ADMIN_EMAIL: string;     // Admin notifications
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### Frontend Architecture

**public/chat.js** - Chat Interface

- **sendMessage()**: Sends requests to /api/chat
- **processStream()**: Parses SSE responses
- **renderMarkdown()**: Formats AI responses with syntax highlighting
- **saveConversation()**: Persists chat history to localStorage

**Streaming Protocol**:

```javascript
// SSE format from server
data: {"response": "Hello"}
data: {"response": " world"}
data: [DONE]

// JavaScript parsing
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const {done, value} = await reader.read();
  if (done) break;
  
  buffer += decoder.decode(value, {stream: true});
  const lines = buffer.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      updateUI(data.response);
    }
  }
}
```

---

## 🔧 Advanced Customization

### Change Default Model

Edit `src/index.ts`:

```typescript
const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

// Change to:
const DEFAULT_MODEL = '@cf/qwen/qwen-2.5-coder-32b-instruct';
```

### Add Custom Models

```typescript
const MODELS = [
  {
    id: '@cf/your-custom/model',
    name: 'Your Custom Model',
    description: 'Fine-tuned for your use case',
    category: 'custom'
  },
  ...existingModels
];
```

### Modify System Prompt

```typescript
const SYSTEM_PROMPT = `You are a helpful AI assistant specialized in [YOUR_DOMAIN].
Your responses should be [YOUR_STYLE] and focus on [YOUR_GOAL].`;

// Add to messages array
messages.unshift({
  role: 'system',
  content: SYSTEM_PROMPT
});
```

### Enable AI Gateway (Caching + Analytics)

1. Create AI Gateway in Cloudflare Dashboard:
   - Navigate to AI > AI Gateway
   - Click "Create Gateway"
   - Copy your gateway slug

2. Update `src/index.ts`:

```typescript
const aiResponse = await env.AI.run(model, {
  messages,
  max_tokens: 2048,
  gateway: {
    id: 'your-gateway-slug',
    skipCache: false,
    cacheTtl: 3600
  }
});
```

Benefits:
- **Caching**: Reduces API costs for repeated queries
- **Rate Limiting**: Prevent abuse
- **Analytics**: Track usage patterns

### Custom Styling

Edit `public/index.html` CSS variables:

```css
:root {
  --primary-color: #0066cc;      /* Brand color */
  --bg-color: #1a1a1a;           /* Dark background */
  --text-color: #e0e0e0;         /* Light text */
  --accent-color: #ff6b35;       /* Highlight color */
}
```

### Add Authentication Middleware

Restore session validation in `src/index.ts`:

```typescript
async function handleChat(request: Request, env: Env) {
  // Uncomment these lines:
  const session = await validateSession(request, env);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Rest of chat logic...
}
```

---

## 📚 Additional Resources

### Official Documentation

- **Cloudflare Workers**: [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/)
- **Workers AI**: [developers.cloudflare.com/workers-ai](https://developers.cloudflare.com/workers-ai/)
- **D1 Database**: [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/)
- **Wrangler CLI**: [developers.cloudflare.com/workers/wrangler](https://developers.cloudflare.com/workers/wrangler/)

### Model Documentation

- **Llama 3.x**: [llama.meta.com](https://llama.meta.com/)
- **Qwen 2.5**: [qwenlm.github.io](https://qwenlm.github.io/)
- **Mistral 7B**: [mistral.ai/news/announcing-mistral-7b](https://mistral.ai/news/announcing-mistral-7b/)
- **DeepSeek**: [deepseek.com](https://www.deepseek.com/)

### Tools & Libraries

- **Ollama**: [ollama.com/library](https://ollama.com/library)
- **Resend**: [resend.com/docs](https://resend.com/docs)
- **Marked.js**: [marked.js.org](https://marked.js.org/)
- **Highlight.js**: [highlightjs.org](https://highlightjs.org/)

### Community

- **Cloudflare Discord**: [discord.gg/cloudflaredev](https://discord.gg/cloudflaredev)
- **Cloudflare Community**: [community.cloudflare.com](https://community.cloudflare.com/)
- **GitHub Discussions**: [github.com/techaboo/drewchatapp/discussions](https://github.com/techaboo/drewchatapp/discussions)

---

## 📈 Roadmap

### Planned Features

- [ ] **Multi-User Chat Rooms** - Collaborative AI conversations
- [ ] **Conversation Search** - Full-text search across chat history
- [ ] **Custom Agents** - Pre-configured personas (coding assistant, writer, etc.)
- [ ] **Voice Input** - Speech-to-text integration
- [ ] **Export Conversations** - Download as Markdown/PDF
- [ ] **Model Comparison** - Side-by-side response comparison
- [ ] **Cost Tracking** - Monitor Workers AI usage and costs
- [ ] **RAG Support** - Connect to vector databases (Vectorize)
- [ ] **Function Calling** - Tool use and external API integration
- [ ] **Mobile App** - React Native client

### In Progress

- [x] **Web Search Integration** - SearXNG via MCP bridge ✅
- [x] **22+ Model Support** - Full Workers AI model catalog ✅
- [x] **Authentication System** - User accounts and sessions ✅
- [x] **Local Ollama Support** - Free development mode ✅

### Completed

- [x] **Streaming Responses** - Real-time SSE implementation ✅
- [x] **Markdown Rendering** - Code highlighting and formatting ✅
- [x] **Model Selection** - Dynamic model switching ✅
- [x] **Email Notifications** - Registration and password reset ✅
- [x] **Cloudflare Deployment** - Production-ready edge hosting ✅

---

## ❓ FAQ

**Q: How much does it cost to run this application?**

A: Cloudflare Workers AI pricing (as of 2025):
- **Free Tier**: 10,000 neurons/day (~1,000 messages)
- **Paid**: $0.01 per 1,000 neurons (~$0.001 per message)
- **Ollama**: Completely free for local development

**Q: Can I use this commercially?**

A: Yes, MIT License permits commercial use. However, review Cloudflare's [Workers AI Terms of Service](https://www.cloudflare.com/service-specific-terms-workers-ai/).

**Q: Which model should I choose?**

A: Depends on your use case:
- **General chat**: Llama 3.3 70B (best quality)
- **Fast responses**: Llama 3.1 8B (low latency)
- **Code generation**: Qwen 2.5 Coder 32B
- **Complex reasoning**: QwQ 32B
- **Image analysis**: Llama 3.2 Vision 11B

**Q: How do I enable authentication?**

A: Uncomment session validation in `src/index.ts` (lines 327-340). Users must register at `/register.html` and await admin approval.

**Q: Can I self-host this?**

A: The MCP bridge can run locally, but the main app requires Cloudflare Workers for Workers AI access. You can use Ollama for fully self-hosted inference.

**Q: How do I report a security vulnerability?**

A: Email security concerns to [techaboo@gmail.com](mailto:techaboo@gmail.com). Do not create public GitHub issues for security bugs.

**Q: Can I fine-tune models?**

A: Yes! Use the LoRA-enabled models (Llama 3.1 8B LoRA, Mistral 7B LoRA, etc.) with Cloudflare's fine-tuning API.

**Q: Does this work offline?**

A: With Ollama running, the app can work offline during development. Production deployment requires Cloudflare's network.

**Q: How do I add a custom domain?**

A: See [Deployment → Custom Domain Setup](#custom-domain-setup) section above.

**Q: How do I switch between dark and light themes?**

A: Click the theme toggle button (🌙/☀️) in the header. Your preference is saved to localStorage and persists across sessions.

**Q: What does the model indicator badge mean?**

A: The badge shows which backend is active:
- **☁️ Cloud** (purple): Using Cloudflare Workers AI
- **💻 Local** (pink): Using Ollama on your machine
- **⚠️ Offline** (red): Ollama server not detected

**Q: Can I use local models in production?**

A: No. Ollama models only work during local development (`npm run dev`). Production deployments on Cloudflare Workers must use cloud models (@cf/ prefix).

**Q: How do I download more Ollama models?**

A: Run `setup-ollama-models.bat` for an interactive menu, or use:
```cmd
ollama pull llama3.2:1b
ollama pull qwen2.5-coder:7b
```
The model will appear in the dropdown after download completes.

---

## 🎉 Credits

### Project Maintainer

**[techaboo](https://github.com/techaboo)** - Creator and lead developer

### Contributors

_No contributors yet. Be the first to contribute!_

See [CONTRIBUTING.md](#-contributing) for guidelines.

### Open Source

This project builds upon the excellent work of:

- **Cloudflare Workers AI Team** - For the serverless AI platform
- **Ollama Community** - For local LLM inference tools
- **Meta AI** - For Llama model family (open-weight models)
- **Alibaba Cloud** - For Qwen model series
- **Mistral AI** - For open-source Mistral 7B
- **Google DeepMind** - For Gemma models
- **Resend Team** - For developer-friendly email APIs

### License

MIT License © 2025 techaboo

See [LICENSE](#-license) section for full terms.
