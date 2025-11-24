# Quick Deploy Commands

## Deploy Now

Copy and paste these commands into PowerShell or Command Prompt:

```bash
git add .
git commit -m "Enhanced model management with Ollama support"
git push origin main
wrangler deploy
```

## Or Use the Script

Double-click: **`deploy.bat`**

## What Happens

1. **`git add .`** - Stages all your changes
2. **`git commit -m "..."`** - Commits with message
3. **`git push origin main`** - Pushes to GitHub
4. **`wrangler deploy`** - Deploys to Cloudflare

## After Deployment

Check your deployment:
- **Dashboard:** https://dash.cloudflare.com
- **Logs:** Run `wrangler tail`
- **Status:** Run `wrangler deployments list`

## Your Production URL

After deploying, you'll get a URL like:
- `https://drewchatapp.workers.dev`
- Or your custom domain if configured

## Troubleshooting

If you get errors:

**"Not logged in":**
```bash
wrangler login
```

**"Database not found":**
```bash
wrangler d1 migrations apply techaboo_chat
```

**"Unauthorized":**
- Check your Cloudflare API token
- Make sure it has Workers permissions

## Local vs Production

| Feature | Local (npm run dev) | Production (Cloudflare) |
|---------|---------------------|-------------------------|
| URL | localhost:8787 | your-worker.workers.dev |
| Ollama Models | ✅ Yes | ❌ No (local only) |
| Workers AI | ✅ Yes | ✅ Yes |
| Database | Local D1 | Production D1 |
| Speed | Fast | Ultra-fast (global edge) |

## Environment Variables

**Production needs these set in Cloudflare Dashboard:**
- `CLOUDFLARE_API_TOKEN`
- `RESEND_API_KEY` (optional)

Go to: Workers & Pages → Your Worker → Settings → Variables

## Quick Tips

✅ **Always test locally first:** `npm run dev`
✅ **Commit often:** Small, frequent commits
✅ **Check logs after deploy:** `wrangler tail`
✅ **Use descriptive commit messages**

## Need Help?

Check the full guide: **`DEPLOY-TO-CLOUDFLARE.md`**
