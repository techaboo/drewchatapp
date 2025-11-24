# Ollama Setup Guide for Local Development

## What is Ollama?

Ollama lets you run AI models locally on your Windows computer. This means:
- ✅ **Faster responses** (no network latency)
- ✅ **Works offline**
- ✅ **Free to use** (no API costs)
- ✅ **Privacy** (data stays on your machine)
- ✅ **Multiple model options** (from tiny 400MB to 4GB models)

## Installation Steps

### 1. Download and Install Ollama

Visit: **https://ollama.com/download/windows**

- Download the Windows installer
- Run the installer
- Ollama will start automatically in the background

### 2. Verify Installation

Open Command Prompt or PowerShell and run:
```bash
ollama --version
```

You should see a version number like `0.1.x`

### 3. Download Your First Model

Start with a small, fast model:

```bash
# Tiny & fastest (1.3 GB)
ollama pull llama3.2:1b

# Or for better quality (2 GB)
ollama pull llama3.2:3b
```

**For coding tasks**, try these:
```bash
# Ultra-fast coding assistant (398 MB)
ollama pull qwen2.5-coder:0.5b

# Best balance for coding (986 MB)
ollama pull qwen2.5-coder:1.5b
```

### 4. Test Ollama

```bash
ollama run llama3.2:1b
```

Type a message and press Enter. Type `/bye` to exit.

### 5. Restart Your Chat App

```bash
# Stop wrangler (Ctrl+C)
# Then restart:
npm run dev
```

Now when you open http://localhost:8787 and click "Manage Models", you'll see:
- Your installed Ollama models
- Option to download more models
- Ability to switch between local and cloud models

## How It Works in Your App

Your code automatically detects Ollama:

```typescript
// From src/index.ts
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:11434/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

When Ollama is running:
- ✅ App uses local Ollama models
- ✅ Much faster responses
- ✅ No API token needed
- ✅ Works offline

When Ollama is NOT running:
- Falls back to Workers AI (cloud)
- Needs CLOUDFLARE_API_TOKEN
- Requires internet connection

## Recommended Models for Your Machine

### General Chat
- `llama3.2:1b` - Tiny, very fast (1.3 GB)
- `llama3.2:3b` - Better quality (2 GB)
- `phi3:mini` - Microsoft's efficient model (2.3 GB)

### Coding
- `qwen2.5-coder:0.5b` - Ultra-fast (398 MB)
- `qwen2.5-coder:1.5b` - Best balance (986 MB)
- `deepseek-coder:1.3b` - Code specialist (776 MB)

### Download Multiple Models

```bash
ollama pull llama3.2:1b
ollama pull qwen2.5-coder:1.5b
```

Then switch between them in your app's "Manage Models" interface!

## Troubleshooting

### Ollama Not Found
```bash
# Check if Ollama is running:
ollama list
```

### Start Ollama Service
Ollama should start automatically on Windows. If not:
- Search for "Ollama" in Start Menu
- Click to start the service

### Check Running Models
```bash
ollama ps
```

### Remove a Model
```bash
ollama rm llama3.2:1b
```

## Performance Tips

1. **Start with small models** (1-2 GB) to test
2. **Use coding models** for code-related tasks
3. **Larger models** are slower but higher quality
4. **Keep Ollama running** in the background for instant responses

## What You Get

Once Ollama is installed and running:
1. Open http://localhost:8787
2. Click "Manage Models"
3. See all your installed Ollama models
4. Download more models directly from the UI
5. Switch between local and cloud models anytime

Your app will **automatically prefer Ollama** when it's available, giving you faster, offline-capable AI chat!
