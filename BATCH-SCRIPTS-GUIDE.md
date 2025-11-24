# 🎮 Batch Scripts Quick Reference

All Windows automation scripts for DrewChatApp.

---

## 📋 Available Scripts

| Script | Purpose | Duration | Prerequisites |
|--------|---------|----------|---------------|
| `deploy-production.bat` | Deploy to Cloudflare | 2-5 min | Git, Wrangler auth |
| `start-local-dev.bat` | Local dev server | Runs until stopped | npm install |
| `start-ollama.bat` | Local AI server | Runs until stopped | Ollama installed |
| `setup-ollama-models.bat` | Download AI models | 5-30 min | Ollama running |
| `start-mcp-bridge.bat` | Web search bridge | Runs until stopped | Docker Desktop |

---

## 🚀 deploy-production.bat

### What It Does
Automates the complete deployment process:
1. Stages all changes with `git add .`
2. Commits with timestamp
3. Pushes to GitHub
4. Deploys to Cloudflare Workers
5. Shows deployment URL

### When to Use
- Deploying new features to production
- Pushing bug fixes
- Updating configuration

### Requirements
- Git installed and authenticated
- Wrangler authenticated (`npx wrangler login`)
- Changes saved in local files

### Usage
```cmd
# Double-click the file, or:
deploy-production.bat
```

### What You'll See
```
================================================================================
                   DrewChatApp Production Deployment
================================================================================

[1/4] Staging changes...
✓ Changes staged

[2/4] Committing changes...
✓ Committed with timestamp

[3/4] Pushing to GitHub...
✓ Pushed to main branch

[4/4] Deploying to Cloudflare...
✓ Deployed successfully

URL: https://drewchatapp.YOUR-SUBDOMAIN.workers.dev/
```

### Troubleshooting
**"git: command not found"**
- Install Git: https://git-scm.com/download/win
- Add to PATH: `C:\Program Files\Git\cmd`

**"permission denied (publickey)"**
- Set up SSH keys: `ssh-keygen -t ed25519 -C "your@email.com"`
- Add to GitHub: Settings → SSH Keys

**"wrangler: command not found"**
- Run: `npm install -g wrangler`
- Or use: `npx wrangler deploy` instead

---

## 💻 start-local-dev.bat

### What It Does
Starts Wrangler development server with:
- Cloud AI models (Workers AI)
- Hot reload on file changes
- Local bindings (D1, env vars)

### When to Use
- Testing changes before deployment
- Developing new features
- Debugging issues

### Requirements
- `npm install` completed
- Wrangler authenticated

### Usage
```cmd
start-local-dev.bat
```

### What You'll See
```
================================================================================
                   Starting DrewChatApp Local Development
================================================================================

Server running at: http://localhost:8787

Features:
- Cloud AI models (22+ models)
- Hot reload enabled
- D1 database (local)

Press Ctrl+C to stop server
```

### Access Points
- **Chat Interface**: http://localhost:8787
- **API Endpoint**: http://localhost:8787/api/chat
- **Model List**: http://localhost:8787/api/models

### Troubleshooting
**"npm: command not found"**
- Install Node.js: https://nodejs.org/
- Restart terminal after installation

**"Error: No account_id"**
- Run: `npx wrangler login`
- Update `wrangler.jsonc` with your account ID

**Port 8787 already in use**
- Kill existing process: `netstat -ano | findstr :8787`
- Or change port in `wrangler.jsonc`

---

## 🤖 start-ollama.bat

### What It Does
Starts Ollama server for local AI model inference:
- Listens on `localhost:11434`
- Loads models from `~/.ollama/models`
- Provides API for model management

### When to Use
- Testing local models during development
- Avoiding cloud API costs
- Working offline

### Requirements
- Ollama installed: https://ollama.ai/download/windows
- At least 4GB RAM free

### Usage
```cmd
start-ollama.bat
```

### What You'll See
```
================================================================================
                   Starting Ollama Local AI Server
================================================================================

Server running at: http://localhost:11434

Download models with:
  setup-ollama-models.bat

Or manually:
  ollama pull llama3.2:1b

Press Ctrl+C to stop server
```

### Verify It's Running
```cmd
curl http://localhost:11434/api/tags
```

Should return JSON with installed models.

### Troubleshooting
**"ollama: command not found"**
- Install Ollama: https://ollama.ai/download/windows
- Add to PATH: `C:\Users\%USERNAME%\AppData\Local\Programs\Ollama`

**"Address already in use"**
- Check if Ollama already running: `tasklist | findstr ollama`
- Kill process: `taskkill /F /IM ollama.exe`

**Models not appearing**
- Restart Wrangler dev server: `start-local-dev.bat`
- Verify models: `ollama list`

---

## 📥 setup-ollama-models.bat

### What It Does
Interactive menu to download recommended Ollama models:
- Shows model sizes (1GB - 8GB)
- Downloads directly from Ollama registry
- Installs models for immediate use

### When to Use
- First-time Ollama setup
- Adding new models for testing
- Comparing model performance

### Requirements
- Ollama server running (`start-ollama.bat`)
- Internet connection
- 1-8GB free disk space per model

### Usage
```cmd
setup-ollama-models.bat
```

### What You'll See
```
================================================================================
                   Ollama Model Setup for DrewChatApp
================================================================================

Recommended Models:

1. llama3.2:1b           (1.0 GB)  - Fastest, great for testing
2. qwen2.5-coder:1.5b    (1.7 GB)  - Code generation specialist
3. llama3.2:3b           (3.2 GB)  - Balanced speed/quality
4. qwen2.5-coder:7b      (8.5 GB)  - Advanced code generation
5. llama3.1:8b           (8.0 GB)  - Best quality for local use

Enter your choice (1-5), or 'q' to quit: _
```

### Download Times (Typical)
- **1GB models**: 2-5 minutes
- **3GB models**: 5-10 minutes
- **7-8GB models**: 15-30 minutes

### Model Recommendations

**For Quick Testing**:
```
llama3.2:1b (1GB)
```

**For Code Generation**:
```
qwen2.5-coder:1.5b (1.7GB)  - Fast
qwen2.5-coder:7b (8.5GB)    - Best quality
```

**For General Chat**:
```
llama3.2:3b (3.2GB)    - Balanced
llama3.1:8b (8GB)      - Best local quality
```

### Manual Download
```cmd
ollama pull llama3.2:1b
ollama pull qwen2.5-coder:1.5b
ollama pull llama3.2:3b
```

### Troubleshooting
**"Failed to download"**
- Check internet connection
- Verify Ollama server running
- Try smaller model first

**"Not enough space"**
- Free up disk space
- Choose smaller models (1-3GB)
- Delete unused models: `ollama rm model-name`

**"Model not appearing in UI"**
- Refresh browser page
- Check `ollama list` shows model
- Restart Wrangler dev server

---

## 🔍 start-mcp-bridge.bat

### What It Does
Starts Docker container for web search via MCP Bridge:
- Connects to SearXNG search engine
- Provides `/api/search` endpoint
- Enables web-enhanced AI responses

### When to Use
- Testing web search integration
- Getting real-time information in responses
- Fact-checking AI answers

### Requirements
- Docker Desktop installed and running
- 2GB free RAM
- Internet connection

### Usage
```cmd
start-mcp-bridge.bat
```

### What You'll See
```
================================================================================
                   Starting MCP Bridge for Web Search
================================================================================

Starting Docker container...

✓ Bridge running at: http://localhost:3001

Status endpoint:
  curl http://localhost:3001/api/search/status

Press Ctrl+C to stop
```

### Verify It's Running
```cmd
curl http://localhost:3001/api/search/status
```

Should return:
```json
{"available": true, "provider": "searxng"}
```

### Test Web Search
```
In chat UI:
"Search the web for latest AI news" + enable web search checkbox
```

### Troubleshooting
**"docker: command not found"**
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/
- Start Docker Desktop application

**"docker daemon not running"**
- Open Docker Desktop
- Wait for "Docker Desktop is running" message
- Retry script

**"port 3001 already in use"**
- Find process: `netstat -ano | findstr :3001`
- Kill process: `taskkill /F /PID <process_id>`
- Or change port in `mcp-bridge/server.js`

---

## 🎯 Common Workflows

### First-Time Setup
```cmd
# 1. Start Ollama server
start-ollama.bat

# 2. Download a model (wait in another terminal)
setup-ollama-models.bat
# Select option 1 (llama3.2:1b)

# 3. Start dev server (in third terminal)
start-local-dev.bat

# 4. Open http://localhost:8787
```

### Daily Development
```cmd
# Start dev server (cloud models only)
start-local-dev.bat

# Make changes, test, commit
git add .
git commit -m "Your changes"
```

### Testing Local Models
```cmd
# Terminal 1: Start Ollama
start-ollama.bat

# Terminal 2: Start dev server
start-local-dev.bat

# Browser: Select local model, test response
```

### Deploy to Production
```cmd
# Test locally first
start-local-dev.bat
# Verify everything works

# Stop dev server (Ctrl+C)

# Deploy
deploy-production.bat

# Monitor (optional)
npx wrangler tail --format=pretty
```

### Web Search Testing
```cmd
# Terminal 1: MCP Bridge
start-mcp-bridge.bat

# Terminal 2: Dev server
start-local-dev.bat

# Browser: Enable web search, ask question
```

---

## 🔄 Script Execution Order

### Development (Local Testing)
```
start-ollama.bat  (optional, for local models)
    ↓
start-local-dev.bat
    ↓
[Test in browser]
    ↓
[Make changes]
    ↓
[Hot reload automatically]
```

### Production Deployment
```
[Test locally first]
    ↓
deploy-production.bat
    ↓
[Monitor with wrangler tail]
    ↓
[Verify on production URL]
```

---

## 💡 Pro Tips

### Performance
- **Local models**: Faster on GPU, slower on CPU
- **Cloud models**: Always fast (Workers AI runs on GPU)
- **First request**: Always slower (cold start)
- **Subsequent requests**: Much faster (warm cache)

### Cost Optimization
- **Development**: Use local models (free)
- **Testing**: Use smallest models (llama3.2:1b)
- **Production**: Use cloud models (pay per use)

### Terminal Management
Use Windows Terminal with tabs:
- Tab 1: Ollama server
- Tab 2: Dev server
- Tab 3: Git commands
- Tab 4: Monitoring (`wrangler tail`)

### Keyboard Shortcuts
- **Stop server**: `Ctrl+C`
- **Clear terminal**: `cls`
- **Repeat last command**: ↑ then Enter

---

## 📞 Getting Help

### Check Status
```cmd
# Ollama running?
curl http://localhost:11434/api/tags

# Dev server running?
curl http://localhost:8787/api/models

# MCP bridge running?
curl http://localhost:3001/api/search/status

# Wrangler authenticated?
npx wrangler whoami
```

### View Logs
```cmd
# Local dev logs
# (shown automatically in terminal)

# Production logs
npx wrangler tail --format=pretty

# Docker logs
docker logs mcp-bridge
```

### Reset Everything
```cmd
# Stop all processes
taskkill /F /IM ollama.exe
taskkill /F /IM node.exe
docker stop mcp-bridge

# Restart
start-ollama.bat
start-local-dev.bat
```

---

## 📚 More Information

- **Full Documentation**: `README.md`
- **Deployment Guide**: `PRE-DEPLOYMENT-CHECKLIST.md`
- **What's New**: `CHANGELOG.md`
- **Release Notes**: `RELEASE-SUMMARY.md`

---

**Last Updated**: 2025-01-24  
**Version**: 1.1.0
