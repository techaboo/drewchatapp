# 👁️ Vision Model Setup Guide

## Llama 3.2 Vision 11B - License Acceptance

### Quick Setup (One Command)

```bash
npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "agree"
```

**What this does**: Accepts Meta's Llama 3.2 license on your Cloudflare account, enabling vision models.

---

## Understanding the License Requirement

### Why This Is Needed
Meta's Llama 3.2 Vision models require explicit agreement to:
- **Community License**: [View License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE)
- **Acceptable Use Policy**: [View Policy](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md)

### Geographic Restrictions
⚠️ **Important**: By accepting, you confirm:
- You are **NOT** an individual domiciled in the European Union
- You are **NOT** a company with principal place of business in the EU

If you're in the EU, you **cannot** use Llama 3.2 Vision models per Meta's license terms.

---

## Setup Steps

### Step 1: Accept License (One-Time)

**Option A: Via Wrangler (Recommended)**
```bash
# Ensure you're logged in
npx wrangler whoami

# Accept license
npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "agree"
```

**Option B: Via DrewChatApp UI** (Automatic)
1. Select model: `@cf/meta/llama-3.2-11b-vision-instruct`
2. Send any message
3. Backend automatically attempts license acceptance
4. If fails, follow manual steps above

### Step 2: Verify Setup

```bash
# Test vision model
npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "Hello"
```

Should return a response without error 5016.

### Step 3: Use in DrewChatApp

1. Open app: http://localhost:8787 (local) or your production URL
2. Select model: `👁️ Llama 3.2 Vision 11B`
3. Model indicator shows: `☁️ Cloud`
4. Send a message (text only or with images)
5. Get AI response

---

## Troubleshooting

### Error: 5016 - License Required

**Symptom**:
```json
{
  "error": "Vision Model License Required",
  "details": "...must manually accept the license..."
}
```

**Solution**:
1. Run manual acceptance command:
   ```bash
   npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "agree"
   ```

2. Wait 10-30 seconds for license to propagate

3. Retry your request

### Error: Authentication Failed

**Symptom**:
```
Error: Not authenticated
```

**Solution**:
```bash
# Re-authenticate with Wrangler
npx wrangler logout
npx wrangler login

# Retry license acceptance
npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "agree"
```

### Error: Model Not Found

**Symptom**:
```
Error: Model @cf/meta/llama-3.2-11b-vision-instruct not found
```

**Solution**:
- Model may be temporarily unavailable
- Check Cloudflare Workers AI status: https://www.cloudflarestatus.com/
- Try again in a few minutes
- Use alternative model temporarily

### License Already Accepted But Still Fails

**Possible Causes**:
1. **Account propagation delay**: Wait 5-10 minutes after accepting
2. **Different Cloudflare account**: Ensure same account used for acceptance and app
3. **Cached error**: Clear browser cache and retry
4. **Geographic restriction**: Verify you're not in EU

**Solution**:
```bash
# Verify current account
npx wrangler whoami

# Re-accept license (won't hurt if already accepted)
npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "agree"

# Wait 1 minute, then test
npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "Hello"
```

---

## Vision Model Capabilities

### What Llama 3.2 Vision 11B Can Do

1. **Image Understanding**
   - Describe images in detail
   - Identify objects, people, scenes
   - Explain visual concepts

2. **OCR (Text Extraction)**
   - Read text from images
   - Extract handwritten text
   - Parse documents and screenshots

3. **Visual Question Answering**
   - Answer questions about images
   - Explain relationships in images
   - Provide context about visual content

4. **Multimodal Reasoning**
   - Combine text and image analysis
   - Generate captions with context
   - Compare multiple images

### Example Use Cases

**Document Analysis**:
```
Image: Photo of a receipt
Prompt: "What is the total amount and list all items?"
```

**Image Description**:
```
Image: Landscape photo
Prompt: "Describe this scene in detail"
```

**Code Screenshot**:
```
Image: Screenshot of code
Prompt: "Explain what this code does"
```

---

## Alternative Models (No License Required)

If you can't use vision models, try these text-only alternatives:

### For General Chat
- `@cf/meta/llama-3.3-70b-instruct-fp8-fast` - Best quality
- `@cf/meta/llama-3.1-8b-instruct-fast` - Fast responses

### For Code Generation
- `@cf/qwen/qwen2.5-coder-32b-instruct` - Best for code
- `@cf/deepseek-ai/deepseek-coder-6.7b-instruct-awq` - Fast code gen

### For Reasoning
- `@cf/qwen/qwen2.5-coder-32b-instruct` - Complex reasoning
- `@cf/meta/llama-3.3-70b-instruct-fp8-fast` - Logic tasks

---

## License Summary

### Llama 3.2 Community License

**Key Points**:
- ✅ **Free for commercial use** (with some restrictions)
- ✅ **Open weights** (can fine-tune and modify)
- ❌ **EU restriction** (individuals and companies)
- ❌ **Cannot be used to improve competing models**

### Acceptable Use Policy

**Prohibited Uses**:
- Illegal activities
- Harm to minors
- Violence or terrorism
- Privacy violations
- Deception or fraud
- Discrimination or hate speech

**Full Policy**: [Read on GitHub](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md)

---

## FAQ

**Q: Do I need to accept the license for every deployment?**

A: No, license acceptance is **per Cloudflare account**, not per deployment. Accept once, use forever (on that account).

**Q: Can I use vision models in production?**

A: Yes, as long as you've accepted the license and comply with Meta's terms.

**Q: What if I'm in the EU?**

A: You cannot use Llama 3.2 Vision models per Meta's license. Use alternative models (DeepSeek, Mistral, Qwen).

**Q: Does automatic acceptance work?**

A: The app attempts automatic acceptance, but it may fail due to API limitations. Manual acceptance via wrangler is more reliable.

**Q: Can I automate license acceptance in CI/CD?**

A: No, license acceptance requires manual confirmation to acknowledge terms. Do it once manually.

**Q: How long does license acceptance take?**

A: Immediate (~1 second to run command), but may take 30-60 seconds to propagate across Cloudflare's network.

---

## Quick Reference

### Commands

```bash
# Check authentication
npx wrangler whoami

# Accept license (one-time)
npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "agree"

# Test vision model
npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "Hello"

# View license
curl https://raw.githubusercontent.com/meta-llama/llama-models/main/models/llama3_2/LICENSE
```

### Model Name

```
@cf/meta/llama-3.2-11b-vision-instruct
```

### License URLs

- **License**: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- **Use Policy**: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md

---

**Last Updated**: 2025-11-26  
**Version**: 1.1.1
