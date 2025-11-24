# Deploy to Cloudflare via GitHub

## Quick Deployment Steps

### 1. Commit and Push Your Changes

Open PowerShell or Command Prompt in your project folder and run:

```bash
# Check what files have changed
git status

# Add all changed files
git add .

# Commit with a descriptive message
git commit -m "Add Ollama support and improve model management UI"

# Push to GitHub
git push origin main
```

### 2. Automatic Deployment

Once pushed to GitHub, Cloudflare Pages will **automatically deploy** your changes if you have it connected!

## Cloudflare Setup (If Not Already Connected)

### Option A: Deploy via Wrangler (Recommended for Workers)

```bash
# Make sure you're logged in
wrangler login

# Deploy to Cloudflare
wrangler deploy
```

This will:
- ✅ Deploy your Worker to Cloudflare
- ✅ Set up your D1 database
- ✅ Configure Workers AI binding
- ✅ Give you a production URL

### Option B: Deploy via GitHub + Cloudflare Pages

1. **Connect GitHub to Cloudflare:**
   - Go to https://dash.cloudflare.com
   - Click "Workers & Pages"
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"
   - Choose your repository: `techaboo/drewchatapp`

2. **Configure Build Settings:**
   ```
   Build command: npm run build
   Build output directory: /
   Root directory: /
   ```

3. **Add Environment Variables:**
   In Cloudflare Pages settings, add:
   - `CLOUDFLARE_API_TOKEN` (your token)
   - `RESEND_API_KEY` (if you have one)

4. **Enable Functions:**
   - Your `src/index.ts` will be deployed as a Cloudflare Function
   - D1 bindings and Workers AI will work automatically

### Option C: Manual Deployment via Wrangler

If you want full control:

```bash
# Install wrangler globally (if not already)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy

# View logs
wrangler tail
```

## What Gets Deployed

When you push to GitHub/deploy, these files go live:

### Frontend (Public Assets):
- `public/index.html` - Main chat interface
- `public/chat.js` - Updated model management
- `public/*.html` - Login/register pages

### Backend (Worker):
- `src/index.ts` - API endpoints, AI chat handler
- `src/auth.ts` - Authentication logic
- `wrangler.jsonc` - Configuration

### Database:
- `migrations/0001_init_auth.sql` - Database schema

## Important Notes

### 1. Local vs Cloud Development

**Local Development (What you're doing now):**
```bash
npm run dev
# Runs at http://localhost:8787
# Uses local D1 database
# Can use Ollama models
```

**Production (Cloudflare):**
```bash
wrangler deploy
# Gets a URL like: https://drewchatapp.your-subdomain.workers.dev
# Uses production D1 database
# Only Workers AI models (no Ollama)
```

### 2. Environment Variables

**Local (`.dev.vars` - NOT committed to git):**
```env
CLOUDFLARE_API_TOKEN=your_token
RESEND_API_KEY=your_key
```

**Production (Set in Cloudflare Dashboard):**
- Go to your Worker/Pages settings
- Add the same environment variables
- These are encrypted and secure

### 3. Database Migrations

**First deployment:**
```bash
# Create production D1 database
wrangler d1 create techaboo_chat

# Run migrations
wrangler d1 migrations apply techaboo_chat
```

**Update database ID in wrangler.jsonc:**
Replace the `database_id` with your production database ID.

## Verify Deployment

After deploying:

1. **Check deployment status:**
   ```bash
   wrangler deployments list
   ```

2. **View live logs:**
   ```bash
   wrangler tail
   ```

3. **Test your production URL:**
   Visit your assigned URL (e.g., `https://drewchatapp.workers.dev`)

## Troubleshooting

### "Unauthorized" errors
- Run `wrangler login` again
- Check your CLOUDFLARE_API_TOKEN in Cloudflare dashboard

### "Database not found"
- Create D1 database: `wrangler d1 create techaboo_chat`
- Run migrations: `wrangler d1 migrations apply techaboo_chat`

### "Build failed"
- Check that all dependencies are in `package.json`
- Run `npm install` locally first
- Make sure TypeScript compiles: `npm run check`

## What Happens When You Deploy

1. **GitHub Push:**
   - You commit and push changes
   - GitHub receives your code

2. **Cloudflare Detects Changes:**
   - If connected to Pages, auto-deploys
   - Builds your Worker
   - Runs TypeScript compilation

3. **Deployment:**
   - Code goes live on Cloudflare's edge network
   - Available globally in <1 second
   - Your URL becomes active

4. **Workers AI:**
   - Cloud models work automatically
   - Ollama models won't work (they're local only)
   - Users see cloud models in dropdown

## Quick Deploy Now

Run these commands to deploy immediately:

```bash
# Stage all changes
git add .

# Commit
git commit -m "Enhanced model management with Ollama support and improved UI"

# Push to GitHub
git push origin main

# Deploy to Cloudflare (optional, if auto-deploy is off)
wrangler deploy
```

## Your Current Setup

Based on your workspace:
- ✅ Git repository connected to: `https://github.com/techaboo/drewchatapp.git`
- ✅ Latest commit: `21873e4d9656d8066bc7551ee715cc600e656fd7`
- ⚠️ Uncommitted changes in your working directory

**Next step:** Commit and push your changes!
