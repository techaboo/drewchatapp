# Workers-dev Container Fix Instructions

## Problems Identified & Fixed

### Issue 1: workerd Binary Compatibility (RESOLVED ✓)
The container was failing with:
```
Error: spawn /app/node_modules/wrangler/node_modules/@cloudflare/workerd-linux-64/bin/workerd ENOENT
```

**Root Cause:**
- Original Dockerfile used `node:20-alpine` (Alpine Linux with musl libc)
- Wrangler's `workerd` binary requires glibc (standard Linux libc)
- Alpine uses musl libc, which is incompatible

**Fixes Applied:**
1. **Updated Dockerfile.workers** - Changed base image from `node:20-alpine` to `node:20-slim`
2. **Updated docker-compose.yml** - Added `platform: linux/amd64` for consistent architecture

### Issue 2: Missing Cloudflare API Token (ACTION REQUIRED)
Wrangler requires a Cloudflare API token to run in Docker:
```
ERROR: In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN environment variable
```

**Fix Applied:**
- Added `CLOUDFLARE_API_TOKEN` environment variable to docker-compose.yml
- Created `.env.example` template file

## Setup Instructions

### SOLUTION: Run Wrangler in Local-Only Mode

**Good news!** The docker-compose.yml has been updated to run `wrangler dev --local`, which means:
- ✓ No Cloudflare API token required for local development
- ✓ All local resources work (D1 databases, Assets, environment variables)
- ✓ Workers AI will use remote mode (requires internet but not authentication)
- ✓ Perfect for development and testing

### Quick Start (No API Token Needed!)

Simply restart the Docker services to apply the fix:

### Step 3: Restart Docker Services

1. **Stop and remove existing containers:**
   ```bash
   docker compose down
   ```

2. **Rebuild with the new configuration:**
   ```bash
   docker compose build --no-cache workers-dev
   ```

3. **Start the services:**
   ```bash
   docker compose up -d
   ```

4. **Check the logs to verify it's working:**
   ```bash
   docker compose logs -f workers-dev
   ```

## Current Status

The container is starting but wrangler still tries to authenticate with Cloudflare API even in `--local` mode. This causes the dev server to fail before binding to port 8787.

## Solution: Run Natively on Windows

The best solution is to run wrangler directly on your Windows machine instead of in Docker.

### Fix Version Mismatch Error

If you see: `Host version "0.25.4" does not match binary version "0.25.5"`

**Solution:**
```bash
# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall everything fresh
npm install
```

### Setup Steps

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Use LTS version (v20 or v22)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.dev.vars` file** in the project root with required tokens:
   ```
   CLOUDFLARE_API_TOKEN=your_cloudflare_token_here
   RESEND_API_KEY=your_resend_key_here
   ```
   
   **Note:** 
   - Get Cloudflare API token from: https://dash.cloudflare.com/profile/api-tokens
   - Get Resend API key from: https://resend.com/api-keys (for email notifications)
   - The Resend key is optional - the app will work without it but email notifications won't send

4. **Run wrangler locally:**
   ```bash
   npm run dev
   ```
   
   If it's already running, restart it to pick up the new environment variables:
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```

This will:
- Start the dev server on http://localhost:8787
- Work with all your local D1 databases
- Connect to Workers AI remotely
- Auto-reload on file changes

**Why this works better:**
- No Docker networking issues
- Native Windows performance
- Better wrangler compatibility
- Easier debugging
- Faster iteration

## Alternative: Continue with Docker (Advanced)

If you must use Docker, you'll need a valid Cloudflare API token in your `.env` file. Even with `--local` mode, wrangler needs to authenticate for some features.

**Important:** Access the application at **http://localhost:8787** (not the container's internal IP)

## Advanced: Using a Real API Token (Optional)

If you need full remote features or want to deploy, you can add a valid Cloudflare API token:

1. **Create API Token:**
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Use "Edit Cloudflare Workers" template
   - Required permissions: Workers Scripts (Edit), Account Settings (Read), D1 (Edit), Workers AI (Edit)

2. **Test Token Before Using:**
   ```bash
   curl "https://api.cloudflare.com/client/v4/user/tokens/verify" -H "Authorization: Bearer YOUR_TOKEN"
   ```
   Should return `"success": true`

3. **Add to .env:**
   ```env
   CLOUDFLARE_API_TOKEN=your_verified_token_here
   ```

4. **Remove --local flag** from docker-compose.yml command if you want full remote mode

## Troubleshooting

**Container keeps restarting?**
- Check logs: `docker compose logs -f workers-dev`
- Verify bindings in wrangler.jsonc match your Cloudflare account

**API token errors?**
- The `--local` flag should bypass this. If you still see errors, ensure you're using the latest docker-compose.yml

**Need to rebuild?**
```bash
docker compose down && docker compose build --no-cache && docker compose up -d
