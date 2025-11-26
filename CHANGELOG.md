# Changelog

All notable changes to DrewChatApp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2025-11-26

### Fixed

#### Vision Model License Agreement
- **Improved License Handling**: Vision models (Llama 3.2 Vision 11B) now have better license acceptance flow
  - Backend attempts automatic license agreement with streaming support
  - If automatic fails, returns 403 with clear manual instructions
  - Error response includes license URLs and wrangler command
  - User-friendly error message: "Vision Model License Required"
  - Added "(requires license acceptance)" note to model description
  
- **Manual Acceptance Command**:
  ```bash
  npx wrangler ai run @cf/meta/llama-3.2-11b-vision-instruct --prompt "agree"
  ```

- **Documented Requirements**:
  - License: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
  - Acceptable Use Policy: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md
  - Geographic restriction: Not available to EU-based users/companies

**Files Changed**:
- `src/index.ts` - Improved license agreement with streaming, better error handling
- `README.md` - Added detailed troubleshooting with manual acceptance steps

---

## [1.1.0] - 2025-01-24

### Added

#### Theme System
- **Dark/Light Theme Toggle**: Manual theme switcher button (🌙/☀️) in header
  - Persists preference to localStorage (`techaboo-chat-theme`)
  - Detects system theme preference on first visit
  - Listens for OS theme changes and auto-switches (unless user set preference)
  - Smooth 0.3s transitions between themes
  - CSS variables for all colors (--bg-primary, --text, --border, etc.)

#### Model Backend Indicator
- **Visual Badge System**: Shows which backend is actively being used
  - ☁️ **Cloud**: Purple gradient for Cloudflare Workers AI models
  - 💻 **Local**: Pink gradient for Ollama models
  - ⚠️ **Offline**: Red badge when Ollama unavailable
  - Auto-updates when model selection changes
  - Hover tooltips explain backend type

#### Local Ollama Integration
- **Fixed Model Routing**: Local models now work correctly
  - Removed `global_fetch_strictly_public` flag blocking localhost
  - Backend properly receives model parameter from frontend
  - Models downloaded via UI appear immediately in dropdown
  - Automatic refresh of model list after downloads
  
#### Improved Error Handling
- **Detailed Error Messages**: Frontend now shows actual error details instead of generic "something went wrong"
  - Console logs include error message, stack trace, and selected model
  - Server errors display status codes and response text
  - Better debugging for stream parsing issues

#### Mobile Responsive Design
- **Enhanced Breakpoints**:
  - 375px (iPhone SE): Optimized for small phones
  - 768px (iPad): Tablet-friendly layout
  - 1024px (Desktop): Full desktop experience
- **Touch-Friendly UI**:
  - 44x44px minimum touch targets (iOS/Android standard)
  - Theme toggle scales appropriately on mobile
  - Model indicator shrinks to fit small screens
  - Textarea prevents iOS zoom with 16px font-size

#### Deployment Scripts (Windows)
- `deploy-production.bat` - Full production deployment (Git + Cloudflare)
- `start-local-dev.bat` - Start Wrangler dev server
- `start-ollama.bat` - Start Ollama server for local models
- `setup-ollama-models.bat` - Interactive model download menu
- `start-mcp-bridge.bat` - Start Docker container for web search

### Changed

#### Configuration
- **wrangler.jsonc**: Removed `global_fetch_strictly_public` compatibility flag
  - Allows Workers to access localhost during development
  - Enables local Ollama integration without network restrictions

#### Backend
- **handleOllamaRequest**: Now accepts `model` parameter
  - Properly receives user-selected model from frontend
  - Logs model name and type for debugging
  - Falls back to `OLLAMA_MODEL` constant if undefined

#### Frontend
- **ThemeManager Class**: New JavaScript class managing theme state
  - Encapsulates all theme logic (get, set, toggle, system detection)
  - Initializes on DOMContentLoaded
  - Updates UI icon based on active theme

- **ModelIndicatorManager Class**: New JavaScript class for backend badges
  - Detects if selected model is cloud (@cf/ prefix) or local
  - Checks Ollama availability status
  - Updates indicator styling and text automatically

### Fixed

- **Local Ollama Models Not Working**: Fixed model parameter not being passed to backend
- **Models Not Appearing After Download**: Added auto-refresh of model list
- **Theme Not Persisting**: Implemented localStorage with proper initialization
- **Network Errors with Localhost**: Removed strict public fetch restriction
- **Generic Error Messages**: Added detailed error logging and user feedback

### Technical Details

#### Files Modified
- `public/index.html` - Added theme toggle button, model indicator, CSS variables
- `public/chat.js` - Added ThemeManager and ModelIndicatorManager classes
- `src/index.ts` - Fixed handleOllamaRequest to accept model parameter
- `wrangler.jsonc` - Removed `global_fetch_strictly_public` flag
- `README.md` - Updated with new features and deployment scripts

#### CSS Enhancements
- Light theme (default): White backgrounds, dark text
- Dark theme: Dark backgrounds, light text
- All colors use CSS variables for consistency
- Smooth transitions on theme change (0.3s ease)

#### Breaking Changes
- None - All changes are backward compatible

---

## [1.0.0] - 2025-01-20

### Initial Release

#### Features
- **22+ Cloud AI Models**: Cloudflare Workers AI integration
- **Local Ollama Support**: 19+ local models for development
- **Real-Time Streaming**: Server-Sent Events (SSE) for word-by-word responses
- **Authentication System**: Admin approval workflow with D1 database
- **Email Notifications**: Resend API integration for registration/password reset
- **Web Search Integration**: MCP bridge with SearXNG for web-enhanced responses
- **Conversation Management**: Create, rename, archive, and delete chat threads
- **File Attachments**: Upload and discuss documents or code
- **Export Options**: Export conversations to Markdown or PDF
- **Syntax Highlighting**: Code blocks with language detection
- **Responsive Design**: Works on desktop, tablet, and mobile

#### Available Models (v1.0)
- Llama 3.3 70B, Llama 3.1 8B, Llama 3.2 Vision 11B
- Qwen 2.5 32B/14B/7B/3B/1.5B, Qwen 2.5 Coder variants
- Mistral 7B, Gemma 2 9B, DeepSeek Coder/R1
- QwQ 32B (reasoning), Llama Guard 3 (safety)
- LoRA fine-tuned SQL/RP variants

#### Tech Stack
- Cloudflare Workers + Workers AI
- TypeScript 5.8.3
- D1 Database (SQLite)
- Wrangler 4.50.0
- Vanilla JavaScript (no framework)
- Marked.js, Highlight.js, jsPDF

---

## Release Notes

### Upgrade Instructions (1.0.0 → 1.1.0)

1. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

2. **Update dependencies** (if needed):
   ```bash
   npm install
   ```

3. **Update wrangler.jsonc**:
   - Remove `global_fetch_strictly_public` from `compatibility_flags` array
   - This is automatic if you merged the changes

4. **Deploy**:
   ```bash
   npm run deploy
   # or
   deploy-production.bat
   ```

5. **Test new features**:
   - Toggle theme with button in header
   - Select local model and verify indicator shows "💻 Local"
   - Select cloud model and verify indicator shows "☁️ Cloud"
   - Download a new Ollama model and verify it appears in dropdown

### Known Issues

- Theme toggle button may not appear immediately on first load (refresh page)
- Model indicator shows "Offline" for 1-2 seconds before detecting Ollama status
- Ollama models require manual server start (`start-ollama.bat`)

### Future Roadmap

#### v1.2.0 (Planned)
- Voice input/output support
- Image generation with FLUX models
- Multi-language UI (i18n)
- Advanced conversation search
- Model comparison mode (side-by-side)

#### v1.3.0 (Planned)
- Custom system prompts per model
- Conversation templates
- API key management UI
- Usage analytics dashboard
- Rate limiting configuration

#### v2.0.0 (Future)
- Multi-user support without admin approval
- Team collaboration features
- Conversation sharing with public URLs
- Plugin system for extensions
- Desktop app (Electron)

---

## Links

- **Repository**: https://github.com/techaboo/drewchatapp
- **Live Demo**: https://drewchatapp.cloudflare-liftoff137.workers.dev/
- **Issues**: https://github.com/techaboo/drewchatapp/issues
- **Discussions**: https://github.com/techaboo/drewchatapp/discussions
