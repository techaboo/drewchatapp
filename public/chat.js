/* global marked, hljs, jspdf */

// Authentication disabled - direct access to chat
// Session management functions kept for compatibility but not enforced

document.addEventListener("DOMContentLoaded", () => {
  // Auth check disabled - user can access chat directly
  console.log("Authentication disabled - direct access enabled");
});

const STORAGE_KEY = "techaboo.chat.conversations";
const DRAFT_KEY = "techaboo.chat.draft";
const SYSTEM_PROMPTS = {
  "spell-check": "You are a meticulous copy editor. Review the text for spelling and grammar issues. Explain each correction succinctly.",
  summarize: "You are a concise assistant. Summarize the main ideas using bullet points and short sentences.",
  "explain-code": "You are a senior software engineer. Explain the provided code in plain language with clear structure.",
  "generate-code": "You are a pragmatic AI pair programmer. Generate clean, well-commented code that solves the task.",
  translate: "You are a professional translator. Translate the text while preserving tone and nuance.",
  improve: "You are a writing coach. Improve the clarity and impact of the text while keeping the original voice."
};

const availablePrompts = document.querySelectorAll(".prompt-btn");
const conversationList = document.getElementById("conversation-list");
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const newChatBtn = document.getElementById("new-chat-btn");
const copyThreadBtn = document.getElementById("copy-thread-btn");
const exportMarkdownBtn = document.getElementById("export-markdown-btn");
const exportPdfBtn = document.getElementById("export-pdf-btn");
const modelSelect = document.getElementById("model-select");
const manageModelsBtn = document.getElementById("manage-models-btn");
const modelModal = document.getElementById("model-modal");
const closeModalBtn = document.getElementById("close-modal");
const modelList = document.getElementById("model-list");
const toggleArchivedCheckbox = document.getElementById("toggle-archived");
const clearArchivedBtn = document.getElementById("clear-archived-btn");
const fileInput = document.getElementById("file-input");
const fileNames = document.getElementById("file-names");
const typingIndicator = document.getElementById("typing-indicator");

let isSending = false;
let selectedConversationId = null;
let conversations = [];
let availableModels = [];
let selectedModel = null;
let ollamaAvailable = true;
let abortController = null;
let streamReader = null;
const pendingFileAttachments = [];

function formatModelSize(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes) || bytes <= 0) {
    return null;
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : size < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

function saveConversations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function loadConversations() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaultConversation = createNewConversation();
    conversations = [defaultConversation];
    selectedConversationId = defaultConversation.id;
    saveConversations();
    return;
  }

  conversations = JSON.parse(stored);
  if (!Array.isArray(conversations) || conversations.length === 0) {
    const defaultConversation = createNewConversation();
    conversations = [defaultConversation];
    selectedConversationId = defaultConversation.id;
  } else if (!selectedConversationId) {
    selectedConversationId = conversations[0].id;
  }
}

function createNewConversation() {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}`,
    title: "New conversation",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    archived: false
  };
}

function getActiveConversation() {
  return conversations.find((c) => c.id === selectedConversationId) ?? null;
}

function formatDateHeading(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }

  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });
}

function renderConversationList() {
  const showArchived = toggleArchivedCheckbox.checked;
  const grouped = conversations
    .filter((conversation) => !conversation.archived || showArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .reduce((groups, conversation) => {
      const groupKey = formatDateHeading(conversation.updatedAt);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(conversation);
      return groups;
    }, {});

  conversationList.innerHTML = "";

  Object.entries(grouped).forEach(([heading, items]) => {
    const dayHeading = document.createElement("div");
    dayHeading.className = "conversation-day";
    dayHeading.textContent = heading;
    conversationList.appendChild(dayHeading);

    items.forEach((conversation) => {
      const item = document.createElement("div");
      item.className = "conversation-item";
      item.dataset.id = conversation.id;
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-pressed", conversation.id === selectedConversationId);

      if (conversation.id === selectedConversationId) {
        item.classList.add("active");
      }

      const title = document.createElement("div");
      title.className = "conversation-title";
      title.textContent = conversation.title;

      const meta = document.createElement("div");
      meta.className = "conversation-meta";
      meta.textContent = `${formatTime(conversation.updatedAt)} · ${conversation.messages.length} message${conversation.messages.length !== 1 ? "s" : ""}`;

      const actions = document.createElement("div");
      actions.className = "conversation-actions";

      const archiveBtn = createActionButton(conversation.archived ? "U" : "A", conversation.archived ? "Unarchive" : "Archive", () => toggleArchiveConversation(conversation.id));
      const renameBtn = createActionButton("✎", "Rename", () => promptRenameConversation(conversation.id));
      const duplicateBtn = createActionButton("⧉", "Duplicate", () => duplicateConversation(conversation.id));
      const deleteBtn = createActionButton("✕", "Delete", () => deleteConversation(conversation.id));

      if (conversation.archived) {
        archiveBtn.classList.add("archived");
        archiveBtn.title = "Unarchive conversation";
        archiveBtn.setAttribute("aria-label", "Unarchive conversation");
        archiveBtn.setAttribute("data-archived", "true");
      }

      actions.append(archiveBtn, renameBtn, duplicateBtn, deleteBtn);

      item.append(title, meta, actions);
      item.addEventListener("click", () => renderConversation(conversation.id));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          renderConversation(conversation.id);
        }
      });

      conversationList.appendChild(item);
    });
  });

  clearArchivedBtn.disabled = !conversations.some((c) => c.archived);
}

function createActionButton(label, title, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "conversation-action";
  button.title = `${title} conversation`;
  button.setAttribute("aria-label", `${title} conversation`);
  button.innerHTML = `<span aria-hidden="true">${label}</span>`;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    handler();
  });
  button.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  });
  return button;
}

function promptRenameConversation(conversationId) {
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) return;

  const trimmedTitle = (window.prompt("Rename conversation", conversation.title) ?? "").trim();
  if (!trimmedTitle) return;

  conversation.title = trimmedTitle;
  conversation.updatedAt = Date.now();
  saveConversations();
  renderConversationList();
  renderConversation(conversationId);
}

function duplicateConversation(conversationId) {
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) return;

  const clone = {
    ...structuredClone(conversation),
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: `${conversation.title} (copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    archived: false
  };

  conversations.unshift(clone);
  selectedConversationId = clone.id;
  saveConversations();
  renderConversationList();
  renderConversation(clone.id);
}

function deleteConversation(conversationId) {
  const index = conversations.findIndex((conversation) => conversation.id === conversationId);
  if (index === -1) return;

  const [removed] = conversations.splice(index, 1);
  if (!conversations.length) {
    const freshConversation = createNewConversation();
    conversations.push(freshConversation);
    selectedConversationId = freshConversation.id;
  } else if (removed.id === selectedConversationId) {
    selectedConversationId = conversations[Math.min(index, conversations.length - 1)].id;
  }

  saveConversations();
  renderConversationList();
  renderConversation(selectedConversationId);
}

function toggleArchiveConversation(conversationId) {
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) return;
  conversation.archived = !conversation.archived;
  conversation.updatedAt = Date.now();
  saveConversations();
  if (conversation.archived && conversationId === selectedConversationId) {
    const firstActive = conversations.find((c) => !c.archived);
    if (firstActive) {
      selectedConversationId = firstActive.id;
    }
  }
  renderConversationList();
  renderConversation(selectedConversationId);
}

function renderConversation(conversationId) {
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) return;

  selectedConversationId = conversation.id;
  conversationList.querySelectorAll(".conversation-item").forEach((item) => {
    const isActive = item.dataset.id === conversation.id;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  chatMessages.innerHTML = "";

  conversation.messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${message.role === "user" ? "user-message" : "assistant-message"}`;

    if (message.role === "assistant") {
      const parsed = marked.parse(message.content);
      messageElement.innerHTML = parsed;
      enhanceCodeBlocks(messageElement);
    } else {
      messageElement.textContent = message.content;
    }

    chatMessages.appendChild(messageElement);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
  updateThreadButtonsState();
}

function updateThreadButtonsState() {
  const conversation = getActiveConversation();
  const hasMessages = Boolean(conversation && conversation.messages.length);
  if (copyThreadBtn) copyThreadBtn.disabled = !hasMessages;
  if (exportMarkdownBtn) exportMarkdownBtn.disabled = !hasMessages;
  if (exportPdfBtn) exportPdfBtn.disabled = !hasMessages;
}

function enhanceCodeBlocks(container) {
  if (!window.hljs) return;
  container.querySelectorAll("pre code").forEach((block) => {
    window.hljs.highlightElement(block);
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", "Copy code block");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(block.textContent ?? "");
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1500);
      } catch (error) {
        console.error("Failed to copy code block", error);
      }
    });
    block.parentElement.appendChild(copyBtn);
  });
}

function initializeConversations() {
  loadConversations();
  renderConversationList();
  renderConversation(selectedConversationId);
  updateThreadButtonsState();
}

function createMessageElement(role, content) {
  const messageElement = document.createElement("div");
  messageElement.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;

  if (role === "assistant") {
    const parsed = marked.parse(content);
    messageElement.innerHTML = parsed;
    enhanceCodeBlocks(messageElement);
  } else {
    messageElement.textContent = content;
  }

  return messageElement;
}

function appendMessageToConversation(role, content) {
  const conversation = getActiveConversation();
  if (!conversation) return;
  conversation.messages.push({ role, content });
  conversation.updatedAt = Date.now();
  saveConversations();
  updateThreadButtonsState();
}

function updateConversationTitle(conversation, content) {
  const firstLine = content.split("\n")[0];
  conversation.title = firstLine.length > 48 ? `${firstLine.slice(0, 45)}...` : firstLine;
}

function resetComposer() {
  userInput.value = "";
  localStorage.removeItem(DRAFT_KEY);
  pendingFileAttachments.length = 0;
  fileNames.innerHTML = "";
  fileNames.style.display = "none";
}

async function copyActiveConversation() {
  const conversation = getActiveConversation();
  if (!conversation || !conversation.messages.length) return;

  const transcript = conversation.messages
    .map((message) => `${message.role.toUpperCase()}:\n${message.content}`)
    .join("\n\n");

  await navigator.clipboard.writeText(transcript);
  if (copyThreadBtn) {
    const previous = copyThreadBtn.textContent;
    copyThreadBtn.textContent = "Copied";
    setTimeout(() => {
      if (copyThreadBtn) {
        copyThreadBtn.textContent = previous;
      }
    }, 1600);
  }
}

function exportConversationMarkdown() {
  const conversation = getActiveConversation();
  if (!conversation || !conversation.messages.length) return;

  const transcript = conversation.messages
    .map((message) => `### ${message.role.toUpperCase()}\n\n${message.content}`)
    .join("\n\n");

  const blob = new Blob([`# ${conversation.title}\n\n${transcript}`], {
    type: "text/markdown"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${conversation.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-techaboo.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportConversationPdf() {
  const conversation = getActiveConversation();
  if (!conversation || !conversation.messages.length) return;

  const doc = new jspdf.jsPDF({ unit: "pt", format: "letter" });
  const margin = 40;
  const maxWidth = 552;
  let y = margin;

  doc.setFontSize(18);
  doc.text(conversation.title, margin, y);
  y += 24;

  doc.setFontSize(12);
  conversation.messages.forEach((message) => {
    doc.setFont(undefined, "bold");
    doc.text(`${message.role.toUpperCase()}:`, margin, y);
    y += 18;

    doc.setFont(undefined, "normal");
    const lines = doc.splitTextToSize(message.content, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 16;

    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  });

  doc.save(`${conversation.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-techaboo.pdf`);
}

function clearArchivedConversations() {
  conversations = conversations.filter((conversation) => !conversation.archived);
  if (!conversations.some((conversation) => conversation.id === selectedConversationId)) {
    const freshConversation = createNewConversation();
    conversations.unshift(freshConversation);
    selectedConversationId = freshConversation.id;
  }
  saveConversations();
  renderConversationList();
  renderConversation(selectedConversationId);
}

function addMessageToDOM(role, content) {
  const element = createMessageElement(role, content);
  chatMessages.appendChild(element);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateLastAssistantMessage(content) {
  const nodes = [...chatMessages.querySelectorAll(".assistant-message")];
  const lastMessage = nodes.at(-1);
  if (!lastMessage) return;
  const parsed = marked.parse(content);
  lastMessage.innerHTML = parsed;
  enhanceCodeBlocks(lastMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function persistDraft() {
  localStorage.setItem(DRAFT_KEY, userInput.value);
}

function restoreDraft() {
  const storedDraft = localStorage.getItem(DRAFT_KEY);
  if (storedDraft) {
    userInput.value = storedDraft;
  }
}

function applyPromptTemplate(key) {
  const prompt = SYSTEM_PROMPTS[key];
  if (!prompt) return;

  userInput.value = `${prompt}\n\n${userInput.value}`.trim();
  userInput.focus();
  persistDraft();
}

function renderFileAttachments() {
  if (!pendingFileAttachments.length) {
    fileNames.innerHTML = "";
    fileNames.style.display = "none";
    return;
  }

  fileNames.innerHTML = "";
  pendingFileAttachments.forEach((file) => {
    const tag = document.createElement("span");
    tag.className = "file-tag";
    tag.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
    fileNames.appendChild(tag);
  });

  fileNames.style.display = "flex";
}

async function handleFileSelection(event) {
  if (!event.target.files) return;

  pendingFileAttachments.length = 0;
  for (const file of event.target.files) {
    if (file.size > 2 * 1024 * 1024) {
      window.alert(`Skipping ${file.name} — max file size is 2MB.`);
      continue;
    }

    const text = await file.text();
    pendingFileAttachments.push({ name: file.name, content: text, size: file.size });
  }

  renderFileAttachments();
}

async function sendMessage() {
  if (isSending) return;

  const trimmed = userInput.value.trim();
  if (!trimmed && !pendingFileAttachments.length) {
    return;
  }

  const conversation = getActiveConversation();
  if (!conversation) return;

  const userContent = [trimmed, ...pendingFileAttachments.map((file) => `\n\n\n---\nFile: ${file.name}\n\n\n${file.content}`)]
    .join("\n").trim();

  if (!userContent) return;

  isSending = true;
  sendButton.disabled = true;
  typingIndicator.classList.add("visible");

  appendMessageToConversation("user", userContent);
  addMessageToDOM("user", userContent);
  updateConversationTitle(conversation, userContent);

  const assistantPlaceholder = "";
  appendMessageToConversation("assistant", assistantPlaceholder);
  addMessageToDOM("assistant", assistantPlaceholder);

  abortController = new AbortController();
  const { signal } = abortController;

  // Check if web search is enabled
  const webSearchToggle = document.getElementById("web-search-toggle");
  const webSearchEnabled = webSearchToggle ? webSearchToggle.checked : false;
  
  console.log("💡 Web search toggle:", webSearchEnabled);

  const payload = {
    messages: conversation.messages.map((message) => ({
      role: message.role,
      content: message.content
    })),
    model: selectedModel,
    webSearch: webSearchEnabled
  };

  try {
    console.log("📤 Sending chat request:", {
      model: selectedModel,
      messageCount: payload.messages.length,
      webSearch: webSearchEnabled
    });

    streamReader = await fetch(`/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal
    });

    console.log("📥 Response status:", streamReader.status, streamReader.statusText);

    if (!streamReader.ok) {
      const errorText = await streamReader.text();
      console.error("❌ Server error:", errorText);
      throw new Error(`Request failed: ${streamReader.status} - ${errorText}`);
    }
    
    if (!streamReader.body) {
      console.error("❌ No response body");
      throw new Error("No response body received");
    }

    const reader = streamReader.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let chunkCount = 0;

    console.log("📖 Starting to read stream...");

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        console.log("✅ Stream reading complete. Total chunks:", chunkCount);
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const chunk = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (!chunk) continue;

        chunkCount++;
        console.log(`📦 Chunk ${chunkCount}:`, chunk.substring(0, 100));

        try {
          const data = JSON.parse(chunk);
          console.log("🔍 Parsed data keys:", Object.keys(data));
          
          if (data.event === "completion" || data.response || data.text) {
            const text = data.text ?? data.response ?? "";
            console.log("📝 Updating message with text length:", text.length);
            updateLastAssistantMessage(text);
            const assistantMessage = getActiveConversation()?.messages.at(-1);
            if (assistantMessage) {
              assistantMessage.content = text;
              assistantMessage.streaming = true;
              saveConversations();
            }
          } else {
            console.warn("⚠️ Chunk has no recognized text field:", data);
          }
        } catch (parseError) {
          console.error("❌ Error parsing chunk:", parseError, "Chunk:", chunk.substring(0, 100));
        }
      }
    }

    const finalAssistantMessage = getActiveConversation()?.messages.at(-1);
    if (finalAssistantMessage) {
      finalAssistantMessage.streaming = false;
      saveConversations();
    }
  } catch (error) {
    console.error("Error sending message", error);
    const assistantMessage = getActiveConversation()?.messages.at(-1);
    if (assistantMessage) {
      assistantMessage.content = "Sorry, something went wrong. Please try again.";
      updateLastAssistantMessage(assistantMessage.content);
      saveConversations();
    }
  } finally {
    isSending = false;
    sendButton.disabled = false;
    typingIndicator.classList.remove("visible");
    resetComposer();
    renderConversationList();
    renderConversation(selectedConversationId);
  }
}

function handleConversationItemClick(event) {
  const target = event.target.closest(".conversation-item");
  if (!target) return;
  const conversationId = target.dataset.id;
  renderConversation(conversationId);
}

function handleConversationItemKeydown(event) {
  const target = event.target.closest(".conversation-item");
  if (!target) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const conversationId = target.dataset.id;
    renderConversation(conversationId);
  }
}

function createFreshConversation() {
  const newConversation = createNewConversation();
  conversations.unshift(newConversation);
  selectedConversationId = newConversation.id;
  saveConversations();
  renderConversationList();
  renderConversation(selectedConversationId);
  resetComposer();
  userInput.focus();
}

function updateThreadButtonsStateOnListChange() {
  updateThreadButtonsState();
}

async function fetchModels() {
  try {
    const response = await fetch(`/api/models`);
    if (!response.ok) {
      throw new Error(`Models request failed: ${response.status}`);
    }
    const data = await response.json();
    ollamaAvailable = Boolean(data.available);

    // Build available models list
    const installed = Array.isArray(data.installedModels) ? data.installedModels : [];
    const downloadable = Array.isArray(data.availableModels) ? data.availableModels : [];
    const inventory = new Map();

    // Add installed models (Ollama only)
    installed.forEach((model) => {
      const formattedSize = formatModelSize(model.size);
      inventory.set(model.name, {
        id: model.name,
        label: model.name,
        availableLocally: true,
        formattedSize,
        rawSize: typeof model.size === "number" ? model.size : undefined,
        description: model.description ?? ""
      });
    });

    // Add downloadable/available models (Ollama or Workers AI)
    downloadable.forEach((model) => {
      const existing = inventory.get(model.name) ?? {
        id: model.name,
        label: model.name,
        availableLocally: false,
        formattedSize: null,
        rawSize: undefined,
        description: ""
      };
      if (typeof model.size === "number") {
        existing.rawSize = model.size;
        existing.formattedSize = formatModelSize(model.size);
      }
      if (model.description) {
        existing.description = model.description;
      }
      inventory.set(model.name, existing);
    });

    availableModels = Array.from(inventory.values()).sort((a, b) => a.label.localeCompare(b.label));
    const active = typeof data.currentModel === "string" ? data.currentModel : installed[0]?.name ?? downloadable[0]?.name ?? null;
    selectedModel = active;

    renderModelOptions();
    renderModelList();
  } catch (error) {
    console.error("Failed to fetch models", error);
    ollamaAvailable = false;
    availableModels = [];
    selectedModel = null;
    renderModelOptions();
    renderModelList();
  }
}

function renderModelOptions() {
  modelSelect.innerHTML = "";

  const localModels = availableModels.filter((model) => model.availableLocally);
  const cloudModels = availableModels.filter((model) => model.id.startsWith("@cf/"));

  // Add local models section
  if (localModels.length > 0) {
    const localGroup = document.createElement("optgroup");
    localGroup.label = "🖥️ Local Models (Ollama)";
    localModels.forEach((model) => {
      const option = document.createElement("option");
      option.value = model.id;
      option.textContent = model.formattedSize ? `${model.label} (${model.formattedSize})` : model.label;
      if (model.id === selectedModel) {
        option.selected = true;
      }
      localGroup.appendChild(option);
    });
    modelSelect.appendChild(localGroup);
  }

  // Add cloud models section
  if (cloudModels.length > 0) {
    const cloudGroup = document.createElement("optgroup");
    cloudGroup.label = "☁️ Cloud Models (Workers AI)";
    cloudModels.forEach((model) => {
      const option = document.createElement("option");
      option.value = model.id;
      option.textContent = model.description || model.label || model.id;
      if (model.id === selectedModel) {
        option.selected = true;
      }
      cloudGroup.appendChild(option);
    });
    modelSelect.appendChild(cloudGroup);
  }

  // Fallback if no models available
  if (localModels.length === 0 && cloudModels.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No models available";
    modelSelect.appendChild(option);
    modelSelect.disabled = true;
    return;
  }

  // Auto-select first available model if current selection is invalid
  const allModels = [...localModels, ...cloudModels];
  if (!allModels.some((model) => model.id === selectedModel)) {
    selectedModel = allModels[0]?.id ?? null;
    if (selectedModel) {
      modelSelect.value = selectedModel;
    }
  }

  modelSelect.disabled = false;
}

async function selectModel(modelId) {
  try {
    const response = await fetch(`/api/models/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelId })
    });
    if (!response.ok) {
      throw new Error(`Model selection failed: ${response.status}`);
    }
    selectedModel = modelId;
    renderModelOptions();
    renderModelList();
  } catch (error) {
    console.error("Failed to select model", error);
  }
}

function openModelModal() {
  renderModelList();
  modelModal.classList.add("show");
  modelModal.focus();
}

function closeModelModal() {
  modelModal.classList.remove("show");
}

async function downloadModel(modelId) {
  const response = await fetch(`/api/models/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: modelId })
  });

  if (!response.body) {
    throw new Error("Download stream missing");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const chunk = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!chunk) continue;

      const data = JSON.parse(chunk);
      if (typeof data.progress === "number") {
        updateModelProgress(modelId, data.progress);
      } else if (typeof data.completed === "number" && typeof data.total === "number" && data.total > 0) {
        updateModelProgress(modelId, data.completed / data.total);
      }
      if (data.status === "success") {
        updateModelProgress(modelId, 1);
      }
      if (data.status === "error") {
        throw new Error(data.error ?? "Download failed");
      }
    }
  }

  await fetchModels();
}

function updateModelProgress(modelId, progress) {
  const card = modelList.querySelector(`[data-model-id="${CSS.escape(modelId)}"]`);
  const progressBar = card?.querySelector(".progress-bar");
  if (!progressBar) return;
  const clamped = Math.min(Math.max(progress, 0), 1);
  progressBar.style.width = `${Math.floor(clamped * 100)}%`;
}

function renderModelList() {
  modelList.innerHTML = "";

  if (!availableModels.length) {
    const empty = document.createElement("p");
    empty.textContent = "No models available.";
    modelList.appendChild(empty);
    return;
  }

  if (!ollamaAvailable) {
    // Show Workers AI models when Ollama is offline
    const workersAiModels = availableModels.filter((model) => !model.availableLocally);
    if (!workersAiModels.length) {
      const message = document.createElement("p");
      message.textContent = "Ollama is offline. Start Ollama locally to manage models.";
      modelList.appendChild(message);
      return;
    }

    const heading = document.createElement("h3");
    heading.textContent = "Available (Cloud)";
    modelList.appendChild(heading);
    workersAiModels.forEach((model) => {
      modelList.appendChild(createModelCard(model, false, true));
    });
    return;
  }

  // Ollama is available - show both installed and downloadable
  const installed = availableModels.filter((model) => model.availableLocally);
  const downloadable = availableModels.filter((model) => !model.availableLocally && !model.id.startsWith("@cf/"));

  if (installed.length) {
    const heading = document.createElement("h3");
    heading.textContent = "Installed (Local)";
    modelList.appendChild(heading);
    installed.forEach((model) => {
      modelList.appendChild(createModelCard(model, true, false));
    });
  }

  if (downloadable.length) {
    const heading = document.createElement("h3");
    heading.textContent = "Available for Download";
    modelList.appendChild(heading);
    downloadable.forEach((model) => {
      modelList.appendChild(createModelCard(model, false, false));
    });
  }
}

function createModelCard(model, installed, isWorkersAi = false) {
  const card = document.createElement("div");
  card.className = "model-card";
  card.setAttribute("data-model-id", model.id);

  const info = document.createElement("div");
  info.className = "model-info";

  const name = document.createElement("div");
  name.className = "model-name";
  name.textContent = model.label;

  const size = document.createElement("div");
  size.className = "model-size";
  size.textContent = model.formattedSize ?? model.description ?? "Size not available";

  info.append(name, size);

  const actions = document.createElement("div");
  actions.className = "model-actions";

  // Workers AI models (cloud): show select button only
  if (isWorkersAi) {
    if (model.id === selectedModel) {
      const badge = document.createElement("span");
      badge.className = "model-badge";
      badge.textContent = "Active";
      actions.appendChild(badge);
    } else {
      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "btn-secondary";
      selectBtn.textContent = "Select";
      selectBtn.addEventListener("click", () => selectModel(model.id));
      actions.appendChild(selectBtn);
    }
  } else if (installed) {
    // Ollama: installed models
    if (model.id === selectedModel) {
      const badge = document.createElement("span");
      badge.className = "model-badge";
      badge.textContent = "Active";
      actions.appendChild(badge);
    } else {
      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "btn-secondary";
      selectBtn.textContent = "Select";
      selectBtn.addEventListener("click", () => selectModel(model.id));
      actions.appendChild(selectBtn);
    }
  } else {
    // Ollama: available for download
    const downloadBtn = document.createElement("button");
    downloadBtn.type = "button";
    downloadBtn.className = "btn";
    downloadBtn.textContent = "Download";
    downloadBtn.setAttribute("aria-label", `Download ${model.label}`);
    downloadBtn.addEventListener("click", async () => {
      downloadBtn.disabled = true;
      downloadBtn.textContent = "Downloading...";
      let errored = false;
      const progressContainer = document.createElement("div");
      progressContainer.className = "progress-container";
      const progressBar = document.createElement("div");
      progressBar.className = "progress-bar";
      progressContainer.appendChild(progressBar);
      actions.append(progressContainer);
      try {
        await downloadModel(model.id);
        downloadBtn.textContent = "Downloaded";
      } catch (error) {
        console.error("Download failed", error);
        errored = true;
        downloadBtn.disabled = false;
        downloadBtn.textContent = "Download";
        progressContainer.remove();
        window.alert("Download failed. Please try again.");
      }
      if (!errored) {
        progressBar.style.width = "100%";
      }
    });
    actions.appendChild(downloadBtn);
  }

  card.append(info, actions);
  return card;
}

function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function handlePromptClick(event) {
  const button = event.target.closest(".prompt-btn");
  if (!button) return;
  const promptKey = button.dataset.prompt;
  applyPromptTemplate(promptKey);
}

function handleToggleArchived() {
  renderConversationList();
}

function handleNewChat() {
  createFreshConversation();
}

function handleCopyThread() {
  copyActiveConversation();
}

function handleExportMarkdown() {
  exportConversationMarkdown();
}

function handleExportPdf() {
  exportConversationPdf();
}

function handleClearArchived() {
  clearArchivedConversations();
}

function handleSendButtonClick() {
  sendMessage();
}

function handleModelSelectChange(event) {
  const modelId = event.target.value;
  selectModel(modelId);
}

function handleManageModelsClick() {
  openModelModal();
}

function handleModalClose() {
  closeModelModal();
}

function initPromptButtons() {
  availablePrompts.forEach((button) => {
    button.addEventListener("click", handlePromptClick);
  });
}

function initConversationListHandlers() {
  conversationList.addEventListener("click", handleConversationItemClick);
  conversationList.addEventListener("keydown", handleConversationItemKeydown);
}

function initComposer() {
  userInput.addEventListener("keydown", handleKeyDown);
  userInput.addEventListener("input", persistDraft);
  sendButton.addEventListener("click", handleSendButtonClick);
}

function initThreadControls() {
  newChatBtn.addEventListener("click", handleNewChat);
  copyThreadBtn.addEventListener("click", handleCopyThread);
  exportMarkdownBtn.addEventListener("click", handleExportMarkdown);
  exportPdfBtn.addEventListener("click", handleExportPdf);
  toggleArchivedCheckbox.addEventListener("change", handleToggleArchived);
  clearArchivedBtn.addEventListener("click", handleClearArchived);
}

function initModelManagement() {
  modelSelect.addEventListener("change", handleModelSelectChange);
  manageModelsBtn.addEventListener("click", handleManageModelsClick);
  closeModalBtn.addEventListener("click", handleModalClose);
  modelModal.addEventListener("click", (event) => {
    if (event.target === modelModal) {
      closeModelModal();
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModelModal();
    }
  });
}

function initFileUploads() {
  fileInput.addEventListener("change", (event) => {
    handleFileSelection(event).catch((error) => {
      console.error("Failed to process files", error);
    });
  });
}

function restoreState() {
  restoreDraft();
  fetchModels();
  checkWebSearchAvailability();
}

async function checkWebSearchAvailability() {
  try {
    const response = await fetch("/api/search/status");
    if (!response.ok) return;
    
    const data = await response.json();
    const webSearchToggle = document.getElementById("web-search-toggle");
    const webSearchLabel = webSearchToggle?.parentElement;
    
    if (webSearchLabel) {
      if (data.available) {
        webSearchLabel.style.display = "flex";
        webSearchLabel.title = `Real-time web search powered by ${data.provider}`;
      } else {
        webSearchLabel.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Failed to check web search availability:", error);
  }
}

function initialize() {
  initPromptButtons();
  initConversationListHandlers();
  initComposer();
  initThreadControls();
  initModelManagement();
  initFileUploads();
  initializeConversations();
  restoreState();
}

window.addEventListener("DOMContentLoaded", initialize);
