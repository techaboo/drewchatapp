# Docker Compose Setup for Drew Chat App

Run the entire chat application stack with a single command using Docker Compose!

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git installed
- At least 4GB of RAM available for Docker

### 1. Clone the Repository
```bash
git clone https://github.com/techaboo/drewchatapp.git
cd drewchatapp
```

### 2. Start Everything with Docker Compose
```bash
docker-compose up -d
```

This single command will:
- ✅ Build and start the MCP Bridge Server (port 3001)
- ✅ Build and start the Cloudflare Workers Dev Server (port 8787)
- ✅ Automatically pull the DuckDuckGo MCP Docker image
- ✅ Set up networking between all services

### 3. Access Your Chat App
Open your browser to: **http://localhost:8787**

## Docker Compose Commands

### Start all services
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Just MCP bridge
docker-compose logs -f mcp-bridge

# Just Workers dev
docker-compose logs -f workers-dev
```

### Stop all services
```bash
docker-compose down
```

### Restart services
```bash
docker-compose restart
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Check service status
```bash
docker-compose ps
```

## Service Overview

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **workers-dev** | 8787 | http://localhost:8787 | Main chat interface |
| **mcp-bridge** | 3001 | http://localhost:3001 | Web search bridge server |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ Browser (localhost:8787)                            │
│   ↓                                                 │
│ Workers Dev Container (port 8787)                   │
│   ↓ HTTP                                            │
│ MCP Bridge Container (port 3001)                    │
│   ↓ Docker Socket                                   │
│ DuckDuckGo MCP Container (spawned automatically)    │
│   ↓                                                 │
│ DuckDuckGo Search API                               │
└─────────────────────────────────────────────────────┘
```

## Setting Up on Multiple Computers

### Computer 1 (Initial Setup)
```bash
git clone https://github.com/techaboo/drewchatapp.git
cd drewchatapp
docker-compose up -d
```

### Computer 2, 3, etc. (Same Steps)
```bash
git clone https://github.com/techaboo/drewchatapp.git
cd drewchatapp
docker-compose up -d
```

That's it! Docker Compose handles everything automatically.

## Troubleshooting

### "Port already in use"
If port 8787 or 3001 is already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "8788:8787"  # Change left side to any available port
```

### "Cannot connect to Docker daemon"
Make sure Docker Desktop is running:
- Windows: Check system tray for Docker icon
- Mac: Check menu bar for Docker icon
- Linux: `sudo systemctl start docker`

### Web search not working
1. Check MCP bridge logs: `docker-compose logs mcp-bridge`
2. Verify health: `curl http://localhost:3001/health`
3. Should return: `{"status":"ok","mcp_connected":true}`

### Changes not appearing
Rebuild the containers:
```bash
docker-compose down
docker-compose up -d --build
```

### View all running containers
```bash
docker ps
```

### Clean restart (removes volumes)
```bash
docker-compose down -v
docker-compose up -d
```

## Stopping the Services

### Temporary stop (keeps containers)
```bash
docker-compose stop
```

### Complete shutdown (removes containers)
```bash
docker-compose down
```

### Remove everything including images
```bash
docker-compose down --rmi all
```

## Development Workflow

### 1. Make code changes in your editor
Edit files in `src/`, `public/`, or `mcp-bridge/`

### 2. Rebuild and restart
```bash
docker-compose up -d --build
```

### 3. View logs to debug
```bash
docker-compose logs -f workers-dev
```

### 4. Test in browser
Visit http://localhost:8787

## Production Deployment

This Docker Compose setup is for **local development only**. For production:

1. Deploy Workers to Cloudflare: `npx wrangler deploy`
2. Host MCP bridge on a VPS or cloud server
3. Or use Tavily API instead: https://tavily.com

## Environment Variables

To add environment variables, create a `.env` file:

```env
# .env
SMTP_PASSWORD=your_password
RESEND_API_KEY=your_key
```

Then reference in `docker-compose.yml`:
```yaml
environment:
  - SMTP_PASSWORD=${SMTP_PASSWORD}
  - RESEND_API_KEY=${RESEND_API_KEY}
```

## Benefits of Docker Compose

✅ **One Command Setup** - No manual dependency installation  
✅ **Consistent Environment** - Works the same on all computers  
✅ **Isolated** - Doesn't interfere with other projects  
✅ **Easy Cleanup** - Remove everything with one command  
✅ **Version Controlled** - docker-compose.yml tracks your setup  
✅ **Portable** - Share with team or run on any machine  

## Next Steps

1. ✅ Start services: `docker-compose up -d`
2. ✅ Open browser: http://localhost:8787
3. ✅ Enable web search toggle in UI
4. ✅ Start chatting with AI + real-time web search!

For manual setup instructions, see `SETUP-WEB-SEARCH.md`
