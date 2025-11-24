# 🚀 Pre-Deployment Checklist

Complete this checklist before deploying to production.

---

## ✅ Configuration

### 1. Environment Variables
- [ ] `wrangler.jsonc` has correct `account_id`
- [ ] `wrangler.jsonc` has correct `database_id` for D1
- [ ] All secrets configured via `npx wrangler secret put`:
  - [ ] `RESEND_API_KEY` (for emails)
  - [ ] `ADMIN_EMAIL` (approval notifications)
  - [ ] `SMTP_USER` (Resend email sender)

**Verify secrets:**
```cmd
npx wrangler secret list
```

### 2. Database Setup
- [ ] D1 database created: `npx wrangler d1 create techaboo_chat`
- [ ] Migrations applied: `npx wrangler d1 migrations apply techaboo_chat --remote`
- [ ] Database ID updated in `wrangler.jsonc`

**Verify database:**
```cmd
npx wrangler d1 execute techaboo_chat --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### 3. Authentication Configuration
- [ ] Decide: Enable or disable authentication
- [ ] If **disabled**: Lines 327-340 in `src/index.ts` commented out (current state)
- [ ] If **enabled**: Uncomment session validation logic
- [ ] Admin approval workflow tested (if enabled)

---

## 🧪 Local Testing

### 4. Cloud Models (Workers AI)
- [ ] Start dev server: `start-local-dev.bat` or `npm run dev`
- [ ] Open: `http://localhost:8787`
- [ ] Test at least 3 different cloud models (@cf/ prefix)
- [ ] Verify streaming works (word-by-word responses)
- [ ] Check model indicator shows **☁️ Cloud**

### 5. Local Models (Ollama) - Optional
- [ ] Ollama installed: Download from https://ollama.ai/download
- [ ] Start Ollama: `start-ollama.bat` or `ollama serve`
- [ ] Download test model: `setup-ollama-models.bat` or `ollama pull llama3.2:1b`
- [ ] Select local model in UI
- [ ] Verify model indicator shows **💻 Local**
- [ ] Test local model responses work

### 6. UI/UX Features
- [ ] Theme toggle works (🌙 → ☀️)
- [ ] Theme persists after page reload
- [ ] Model indicator updates when switching models
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] No console errors in browser DevTools

### 7. Error Handling
- [ ] Test with invalid model (should show error)
- [ ] Test with Ollama stopped (should fall back or error)
- [ ] Test network timeout (disconnect WiFi mid-request)
- [ ] Verify error messages are user-friendly

---

## 📦 Git & Version Control

### 8. Code Quality
- [ ] All changes committed: `git status` shows clean
- [ ] No sensitive data in code (API keys, passwords)
- [ ] `.gitignore` includes `.env` and `node_modules`
- [ ] README.md updated with latest features
- [ ] CHANGELOG.md documents new version

### 9. Git Repository
- [ ] Local branch is up-to-date: `git pull origin main`
- [ ] All tests pass locally
- [ ] Create backup tag: `git tag v1.1.0-stable`
- [ ] Push tag: `git push origin v1.1.0-stable`

---

## 🚢 Deployment

### 10. Pre-Deploy Verification
- [ ] Node.js version: `node --version` (should be 18.x or 20.x)
- [ ] npm version: `npm --version` (should be 9.x or 10.x)
- [ ] Wrangler authenticated: `npx wrangler whoami`
- [ ] Dependencies installed: `npm install`

**Check Wrangler auth:**
```cmd
npx wrangler whoami
```

### 11. Deploy to Production
Choose deployment method:

**Option A: Automated (Recommended)**
```cmd
deploy-production.bat
```

**Option B: Manual**
```cmd
git add .
git commit -m "v1.1.0: Theme toggle, model indicator, Ollama fixes"
git push origin main
npx wrangler deploy
```

### 12. Post-Deployment Testing
- [ ] Visit production URL (e.g., `https://drewchatapp.YOUR-SUBDOMAIN.workers.dev/`)
- [ ] Test 3+ cloud models in production
- [ ] Verify theme toggle works
- [ ] Verify model indicator shows **☁️ Cloud**
- [ ] Test on mobile device (real device, not just emulator)
- [ ] Check Cloudflare Workers analytics (dashboard)

---

## 🔍 Monitoring

### 13. Post-Launch Monitoring
- [ ] Watch live traffic: `npx wrangler tail --format=pretty`
- [ ] Check Workers Analytics: Cloudflare Dashboard → Workers & Pages → Your Worker
- [ ] Monitor error rate (should be <1%)
- [ ] Verify response times (<200ms median)
- [ ] Set up alerts (optional): Cloudflare → Notifications

### 14. Email Notifications (If Enabled)
- [ ] Test registration flow
- [ ] Verify approval emails received
- [ ] Check password reset emails work
- [ ] Confirm sender domain verified in Resend

---

## 📊 Performance Benchmarks

### Expected Metrics
- **Cold Start**: <50ms (Workers AI)
- **Response Time**: 100-300ms (first token)
- **Streaming**: 20-50 tokens/second
- **Uptime**: 99.9%+

### Load Testing (Optional)
```cmd
# Install Apache Bench
choco install apachebench

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 https://drewchatapp.YOUR-SUBDOMAIN.workers.dev/
```

---

## 🛡️ Security Checklist

### 15. Security Best Practices
- [ ] HTTPS enabled (automatic with Cloudflare)
- [ ] CORS headers configured (if needed)
- [ ] Rate limiting considered (Cloudflare WAF)
- [ ] No API keys in client-side code
- [ ] D1 database uses parameterized queries (✅ already implemented)
- [ ] Session tokens use HttpOnly cookies (✅ already implemented)

---

## 📝 Documentation

### 16. Final Documentation
- [ ] README.md complete and up-to-date
- [ ] CHANGELOG.md includes v1.1.0 features
- [ ] All batch scripts documented
- [ ] API endpoints documented (if exposing API)
- [ ] Troubleshooting section covers common issues

---

## 🎉 Launch Checklist

### 17. Go-Live Readiness
- [ ] All above items completed
- [ ] Backup created (Git tag + database export)
- [ ] Team notified (if applicable)
- [ ] Monitoring enabled
- [ ] Rollback plan ready (see README → Deployment → Rollback)

---

## 🔄 Rollback Plan

If something goes wrong after deployment:

```cmd
# List recent deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback --message "Reverting to v1.0.0 due to [reason]"

# Or restore from Git tag
git checkout v1.0.0-stable
npx wrangler deploy
```

---

## 📞 Emergency Contacts

- **Cloudflare Support**: https://dash.cloudflare.com/support
- **Cloudflare Community**: https://community.cloudflare.com
- **GitHub Issues**: https://github.com/techaboo/drewchatapp/issues
- **Email**: techaboo@gmail.com

---

## ✅ Final Sign-Off

Once all checks pass:

```cmd
# Deploy to production
deploy-production.bat

# Monitor for 15 minutes
npx wrangler tail --format=pretty

# If all looks good, celebrate! 🎉
```

---

**Last Updated**: 2025-01-24  
**Version**: 1.1.0  
**Checklist Completed By**: _____________  
**Date**: _____________
