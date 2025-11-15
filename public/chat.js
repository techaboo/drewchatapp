// Techaboo AI Chat enhanced conversation management
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
const modelSelect = document.getElementById("model-select");
const manageModelsBtn = document.getElementById("manage-models-btn");
const modelModal = document.getElementById("model-modal");
const closeModalBtn = document.getElementById("close-modal");
const modelList = document.getElementById("model-list");
const fileInput = document.getElementById("file-input");
const fileNames = document.getElementById("file-names");
const conversationList = document.getElementById("conversation-list");
const newChatBtn = document.getElementById("new-chat-btn");
const copyThreadBtn = document.getElementById("copy-thread-btn");
const exportMarkdownBtn = document.getElementById("export-markdown-btn");
const exportPdfBtn = document.getElementById("export-pdf-btn");
const toggleArchivedInput = document.getElementById("toggle-archived");
const historyLabel = document.getElementById("history-label");
const clearArchivedBtn = document.getElementById("clear-archived-btn");

const STORAGE_KEY = "techaboo.chat.conversations";
const DEFAULT_TITLE = "New chat";
const WELCOME_TEXT = "Hello! I'm Techaboo AI Chat. How can I help you today?";
const WELCOME_MESSAGE = { role: "assistant", content: WELCOME_TEXT };

let conversations = [];
let currentConversationId = null;
let chatHistory = [];
let uploadedFiles = [];
let showArchived = false;

window.addEventListener("DOMContentLoaded", () => {
  initializeConversations();
  loadModels();
});

sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

if (newChatBtn) {
  newChatBtn.addEventListener("click", () => {
    const conversation = createConversation();
    conversations.push(conversation);
    saveConversations();
    showArchived = false;
    syncArchiveToggle();
    setCurrentConversation(conversation.id);
    userInput.focus();
  });
}

if (copyThreadBtn) {
  copyThreadBtn.addEventListener("click", copyActiveConversation);
}

if (exportMarkdownBtn) {
  exportMarkdownBtn.addEventListener("click", () => exportConversationMarkdown("markdown"));
}

if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", exportConversationPdf);
}

if (toggleArchivedInput) {
  toggleArchivedInput.addEventListener("change", () => {
    showArchived = toggleArchivedInput.checked;
    updateHistoryLabel();
    ensureVisibleConversation();
    renderConversationList();
  });
}

if (clearArchivedBtn) {
  clearArchivedBtn.addEventListener("click", clearArchivedConversations);
}

manageModelsBtn.addEventListener("click", () => {
  modelModal.style.display = "flex";
  loadAvailableModels();
});

closeModalBtn.addEventListener("click", () => {
  modelModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modelModal) {
    modelModal.style.display = "none";
  }
});

modelSelect.addEventListener("change", async (event) => {
  try {
    await fetch("/api/models/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: event.target.value })
    });
  } catch (error) {
    console.error("Failed to select model", error);
  }
});

fileInput.addEventListener("change", (event) => {
  uploadedFiles = [];
  fileNames.innerHTML = "";
  fileNames.style.display = "none";

  Array.from(event.target.files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      uploadedFiles.push({ name: file.name, content: loadEvent.target.result });
      const tag = document.createElement("span");
      tag.className = "file-tag";
      tag.textContent = file.name;
      fileNames.appendChild(tag);
      fileNames.style.display = "flex";
    };
    reader.readAsText(file);
  });
});

const templates = {
  "spell-check": "Check spelling and grammar:\n\n",
  "summarize": "Summarize the following:\n\n",
  "explain-code": "Explain this code:\n\n",
  "generate-code": "Generate code for:\n\n",
  "translate": "Translate this text:\n\n",
  "improve": "Improve this text:\n\n"
};

document.querySelectorAll(".prompt-btn").forEach((button) => {
  button.addEventListener("click", () => {
    userInput.value = templates[button.dataset.prompt] || "";
    userInput.focus();
  });
});

function initializeConversations() {
  conversations = loadStoredConversations();
  if (!conversations.length) {
    conversations.push(createConversation());
    saveConversations();
  }
  const defaultConversation = conversations.find((item) => !item.archived) || conversations[0];
  currentConversationId = defaultConversation.id;
  chatHistory = defaultConversation.messages;
  showArchived = Boolean(defaultConversation.archived);
  syncArchiveToggle();
  updateHistoryLabel();
  updateArchiveControlsState();
  renderConversationList();
  renderCurrentConversation();
}

function loadStoredConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((conversation) => {
        if (!conversation || !Array.isArray(conversation.messages)) return null;
        const messages = conversation.messages
          .map((message) => ({ role: message.role, content: message.content }))
          .filter((message) => message && typeof message.content === "string" && message.content.length >= 0);
        return {
          id: conversation.id || generateId(),
          title: conversation.title || DEFAULT_TITLE,
          messages: messages.length ? messages : [{ ...WELCOME_MESSAGE }],
          updatedAt: typeof conversation.updatedAt === "number" ? conversation.updatedAt : Date.now(),
          archived: Boolean(conversation.archived)
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to load conversations", error);
    return [];
  }
}

function saveConversations() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Failed to save conversations", error);
  }
}

function createConversation() {
  return {
    id: generateId(),
    title: DEFAULT_TITLE,
    messages: [{ ...WELCOME_MESSAGE }],
    updatedAt: Date.now(),
    archived: false
  };
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "conv-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getCurrentConversation() {
  return conversations.find((conversation) => conversation.id === currentConversationId) || null;
}

function setCurrentConversation(conversationId) {
  const conversation = conversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  currentConversationId = conversationId;
  chatHistory = conversation.messages;
  if (conversation.archived !== showArchived) {
    showArchived = conversation.archived;
    syncArchiveToggle();
    updateHistoryLabel();
  }
  renderConversationList();
  renderCurrentConversation();
  typingIndicator.style.display = "none";
  userInput.value = "";
  uploadedFiles = [];
  fileInput.value = "";
  fileNames.innerHTML = "";
  fileNames.style.display = "none";
}

function renderConversationList() {
  if (!conversationList) return;
  conversationList.innerHTML = "";

  const visible = getVisibleConversations();
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "conversation-meta";
    empty.textContent = showArchived ? "No archived conversations." : "No conversations yet.";
    conversationList.appendChild(empty);
    return;
  }

  const sorted = [...visible].sort((a, b) => b.updatedAt - a.updatedAt);
  let currentDayKey = "";

  sorted.forEach((conversation) => {
    const dayKey = getDayKey(conversation.updatedAt);
    if (dayKey !== currentDayKey) {
      currentDayKey = dayKey;
      const dayHeading = document.createElement("div");
      dayHeading.className = "conversation-day";
      dayHeading.textContent = describeDay(conversation.updatedAt);
      conversationList.appendChild(dayHeading);
    }

    const item = document.createElement("div");
    item.className = "conversation-item" + (conversation.id === currentConversationId ? " active" : "");
    item.dataset.id = conversation.id;

    const title = document.createElement("div");
    title.className = "conversation-title";
    title.textContent = conversation.title || DEFAULT_TITLE;

    const meta = document.createElement("div");
    meta.className = "conversation-meta";
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const previewContent = lastMessage ? lastMessage.content.replace(/\s+/g, " ") : "";
    const preview = previewContent ? truncateText(previewContent, 80) : "No messages yet";
    const timestamp = formatTimestamp(conversation.updatedAt);
    meta.textContent = timestamp ? timestamp + " | " + preview : preview;

    const actions = document.createElement("div");
    actions.className = "conversation-actions";
    const archiveBtn = createActionButton(showArchived ? "U" : "A", showArchived ? "Unarchive" : "Archive", (event) => {
      event.stopPropagation();
      if (showArchived) {
        unarchiveConversation(conversation.id);
      } else {
        archiveConversation(conversation.id);
      }
    });
    const deleteBtn = createActionButton("X", "Delete", (event) => {
      event.stopPropagation();
      deleteConversation(conversation.id);
    });
    actions.appendChild(archiveBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(title);
    item.appendChild(meta);
    item.appendChild(actions);
    item.addEventListener("click", () => setCurrentConversation(conversation.id));

    conversationList.appendChild(item);
  });
}

function createActionButton(label, title, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "conversation-action";
  button.title = title;
  button.textContent = label;
  button.addEventListener("click", handler);
  return button;
}

function renderCurrentConversation() {
  const conversation = getCurrentConversation();
  chatMessages.innerHTML = "";
  if (!conversation) return;
  conversation.messages.forEach((message) => {
    displayMessage(message.role, message.content);
  });
  addCopyButtons();
}

async function loadModels() {
  try {
    const response = await fetch("/api/models");
    const data = await response.json();
    modelSelect.innerHTML = "";

    if (Array.isArray(data.installedModels) && data.installedModels.length) {
      data.installedModels.forEach((model) => {
        const option = document.createElement("option");
        option.value = model.name;
        option.textContent = model.name + " (" + formatSize(model.size) + ")";
        modelSelect.appendChild(option);
      });
      if (data.currentModel) {
        modelSelect.value = data.currentModel;
      }
    } else {
      const option = document.createElement("option");
      option.textContent = "No local models found";
      modelSelect.appendChild(option);
    }
  } catch (error) {
    console.error("Failed to load models", error);
    modelSelect.innerHTML = '<option>Error loading models</option>';
  }
}

async function loadAvailableModels() {
  try {
    const response = await fetch("/api/models");
    const data = await response.json();
    modelList.innerHTML = "";

    if (Array.isArray(data.installedModels) && data.installedModels.length) {
      const heading = document.createElement("h3");
      heading.textContent = "Installed";
      modelList.appendChild(heading);
      data.installedModels.forEach((model) => {
        modelList.appendChild(createCard(model, true));
      });
    }

    if (Array.isArray(data.availableModels) && data.availableModels.length) {
      const heading = document.createElement("h3");
      heading.textContent = "Available";
      modelList.appendChild(heading);
      data.availableModels.forEach((model) => {
        const alreadyInstalled = data.installedModels && data.installedModels.some((item) => item.name === model.name);
        if (!alreadyInstalled) {
          modelList.appendChild(createCard(model, false));
        }
      });
    }
  } catch (error) {
    console.error("Failed to load available models", error);
  }
}

function createCard(model, installed) {
  const card = document.createElement("div");
  card.className = "model-card";

  const info = document.createElement("div");
  info.className = "model-info";

  const name = document.createElement("div");
  name.className = "model-name";
  name.textContent = model.name;

  const size = document.createElement("div");
  size.className = "model-size";
  size.textContent = model.size ? formatSize(model.size) : (model.description || "");

  info.appendChild(name);
  info.appendChild(size);

  const actions = document.createElement("div");
  actions.className = "model-actions";

  if (installed) {
    const badge = document.createElement("span");
    badge.className = "model-badge";
    badge.textContent = "Installed";
    actions.appendChild(badge);
  } else {
    const button = document.createElement("button");
    button.className = "download-btn";
    button.textContent = "Download";
    button.onclick = () => downloadModel(model.name, button);
    actions.appendChild(button);
  }

  card.appendChild(info);
  card.appendChild(actions);
  return card;
}

async function downloadModel(name, button) {
  button.disabled = true;
  button.textContent = "Downloading...";

  const container = document.createElement("div");
  container.className = "progress-container";
  const bar = document.createElement("div");
  bar.className = "progress-bar";
  container.appendChild(bar);
  button.parentElement.appendChild(container);

  try {
    const response = await fetch("/api/models/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: name })
    });

    const reader = response.body && response.body.getReader ? response.body.getReader() : null;
    if (!reader) {
      throw new Error("Unable to read download stream");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      lines.forEach((line) => {
        if (!line.trim()) return;
        try {
          const data = JSON.parse(line);
          if (data.status === "downloading" && data.completed && data.total) {
            bar.style.width = String((data.completed / data.total) * 100) + "%";
          }
          if (data.status === "success") {
            button.textContent = "Downloaded";
            container.remove();
            loadModels();
          }
        } catch (error) {
          /* ignore parse errors */
        }
      });
    }
  } catch (error) {
    console.error("Download failed", error);
    button.disabled = false;
    button.textContent = "Download";
    container.remove();
    alert("Download failed. Please try again.");
  }
}

function formatSize(bytes) {
  if (!bytes) return "Unknown";
  const gb = bytes / 1073741824;
  if (gb >= 1) return gb.toFixed(1) + " GB";
  return (bytes / 1048576).toFixed(0) + " MB";
}

async function sendMessage() {
  const conversation = getCurrentConversation();
  if (!conversation) return;

  if (conversation.archived) {
    conversation.archived = false;
    showArchived = false;
    syncArchiveToggle();
    updateHistoryLabel();
  }

  const rawMessage = userInput.value.trim();
  if (!rawMessage) return;

  let messageWithFiles = rawMessage;
  if (uploadedFiles.length) {
    messageWithFiles += "\n\nFiles:\n";
    uploadedFiles.forEach((file) => {
      messageWithFiles += file.name + ":\n\n```\n" + file.content + "\n```\n";
    });
  }

  displayMessage("user", rawMessage);
  chatHistory.push({ role: "user", content: messageWithFiles });
  updateConversationMetadata(conversation, rawMessage);
  saveConversations();
  renderConversationList();

  userInput.value = "";
  uploadedFiles = [];
  fileInput.value = "";
  fileNames.innerHTML = "";
  fileNames.style.display = "none";

  typingIndicator.style.display = "flex";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory })
    });

    const reader = response.body && response.body.getReader ? response.body.getReader() : null;
    if (!reader) {
      throw new Error("Unable to read response stream");
    }

    const decoder = new TextDecoder();
    const placeholder = createMessageElement("assistant");
    chatMessages.appendChild(placeholder);
    let reply = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      lines.forEach((line) => {
        if (!line.trim()) return;
        try {
          const data = JSON.parse(line);
          if (data.response) {
            reply += data.response;
            updateContent(placeholder, reply);
          }
        } catch (error) {
          /* ignore partial JSON */
        }
      });
    }

    if (buffer.trim()) {
      try {
        const finalData = JSON.parse(buffer);
        if (finalData.response) {
          reply += finalData.response;
          updateContent(placeholder, reply);
        }
      } catch (error) {
        console.error("Failed to parse final buffer", error);
      }
    }

    typingIndicator.style.display = "none";

    if (reply.trim()) {
      chatHistory.push({ role: "assistant", content: reply });
      updateConversationMetadata(conversation);
      saveConversations();
      renderConversationList();
      addCopyButtons();
    }
  } catch (error) {
    typingIndicator.style.display = "none";
    const errorMessage = "Error: " + error.message;
    displayMessage("assistant", errorMessage);
    chatHistory.push({ role: "assistant", content: errorMessage });
    updateConversationMetadata(conversation);
    saveConversations();
    renderConversationList();
  }
}

function updateConversationMetadata(conversation, userMessage) {
  const sanitized = userMessage ? userMessage.replace(/\s+/g, " ").trim() : "";
  if ((!conversation.title || conversation.title === DEFAULT_TITLE) && sanitized) {
    conversation.title = truncateText(sanitized, 48);
  }
  conversation.archived = false;
  conversation.updatedAt = Date.now();
  updateArchiveControlsState();
}

function displayMessage(role, content) {
  const element = createMessageElement(role);
  updateContent(element, content);
  chatMessages.appendChild(element);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createMessageElement(role) {
  const element = document.createElement("div");
  element.className = "message " + role + "-message";
  return element;
}

function updateContent(element, content) {
  element.innerHTML = window.marked ? window.marked.parse(content) : content;
  chatMessages.scrollTop = chatMessages.scrollHeight;
  if (window.hljs) {
    element.querySelectorAll("pre code").forEach((block) => {
      window.hljs.highlightElement(block);
    });
  }
}

function addCopyButtons() {
  document.querySelectorAll("pre code").forEach((block) => {
    const parent = block.parentElement;
    if (!parent) return;
    if (parent.querySelector(".copy-btn")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-btn";
    button.textContent = "Copy";
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(block.textContent || "");
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    });
    parent.style.position = "relative";
    parent.appendChild(button);
  });
}

function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength - 3) + "..." : text;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const timePart = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const datePart = date.toDateString();
  if (datePart === today.toDateString()) {
    return "Today " + timePart;
  }
  if (datePart === yesterday.toDateString()) {
    return "Yesterday " + timePart;
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + timePart;
}

function getDayKey(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function describeDay(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);
  const compare = new Date(timestamp);
  compare.setHours(0, 0, 0, 0);
  if (compare.getTime() === today.getTime()) return "Today";
  if (compare.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

function getVisibleConversations() {
  return conversations.filter((conversation) => (showArchived ? conversation.archived : !conversation.archived));
}

function ensureVisibleConversation() {
  const visible = getVisibleConversations();
  if (visible.some((item) => item.id === currentConversationId)) {
    return;
  }
  if (!visible.length) {
    if (showArchived) {
      showArchived = false;
      syncArchiveToggle();
      updateHistoryLabel();
      ensureVisibleConversation();
      return;
    }
    const nextConversation = conversations.find((item) => !item.archived);
    if (nextConversation) {
      setCurrentConversation(nextConversation.id);
      return;
    }
    const fallback = createConversation();
    conversations.push(fallback);
    saveConversations();
    setCurrentConversation(fallback.id);
    return;
  }
  setCurrentConversation(visible[0].id);
}

function archiveConversation(conversationId) {
  const conversation = conversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  conversation.archived = true;
  conversation.updatedAt = Date.now();
  saveConversations();
  updateArchiveControlsState();
  ensureVisibleConversation();
  renderConversationList();
}

function unarchiveConversation(conversationId) {
  const conversation = conversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  conversation.archived = false;
  conversation.updatedAt = Date.now();
  showArchived = false;
  syncArchiveToggle();
  saveConversations();
  updateArchiveControlsState();
  setCurrentConversation(conversation.id);
}

function deleteConversation(conversationId) {
  const conversation = conversations.find((item) => item.id === conversationId);
  if (!conversation) return;
  const confirmed = window.confirm("Delete this conversation? This cannot be undone.");
  if (!confirmed) return;
  conversations = conversations.filter((item) => item.id !== conversationId);
  saveConversations();
  updateArchiveControlsState();
  if (conversationId === currentConversationId) {
    ensureVisibleConversation();
  } else {
    renderConversationList();
  }
}

function clearArchivedConversations() {
  const archivedCount = conversations.filter((conversation) => conversation.archived).length;
  if (!archivedCount) return;
  const confirmed = window.confirm("Delete all archived conversations?");
  if (!confirmed) return;
  conversations = conversations.filter((conversation) => !conversation.archived);
  saveConversations();
  showArchived = false;
  syncArchiveToggle();
  updateArchiveControlsState();
  ensureVisibleConversation();
  renderConversationList();
}

function updateArchiveControlsState() {
  const archivedCount = conversations.filter((conversation) => conversation.archived).length;
  if (clearArchivedBtn) {
    clearArchivedBtn.disabled = archivedCount === 0;
    clearArchivedBtn.textContent = archivedCount ? "Clear archived (" + archivedCount + ")" : "Clear archived";
  }
}

function syncArchiveToggle() {
  if (toggleArchivedInput) {
    toggleArchivedInput.checked = showArchived;
  }
}

function updateHistoryLabel() {
  if (historyLabel) {
    historyLabel.textContent = showArchived ? "Archived threads" : "Active threads";
  }
}

async function copyActiveConversation() {
  const conversation = getCurrentConversation();
  if (!conversation) return;
  const text = buildConversationTranscript(conversation, false);
  try {
    await navigator.clipboard.writeText(text);
    copyThreadBtn.textContent = "Copied";
    setTimeout(() => {
      copyThreadBtn.textContent = "Copy thread";
    }, 2000);
  } catch (error) {
    console.error("Failed to copy conversation", error);
    alert("Copy to clipboard failed. Please copy manually.");
  }
}

function exportConversationMarkdown(format) {
  const conversation = getCurrentConversation();
  if (!conversation) return;
  const markdown = buildConversationTranscript(conversation, true);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  downloadText(markdown, "techaboo-conversation-" + timestamp + ".md", "text/markdown");
}

function exportConversationPdf() {
  const conversation = getCurrentConversation();
  if (!conversation) return;
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF export requires jsPDF, which failed to load.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth() - 72;
  const lines = buildConversationTranscript(conversation, false).split("\n");
  let cursorY = 60;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);
  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, pageWidth);
    wrapped.forEach((segment) => {
      if (cursorY > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        cursorY = 60;
      }
      doc.text(segment, 36, cursorY);
      cursorY += 18;
    });
  });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  doc.save("techaboo-conversation-" + timestamp + ".pdf");
}

function buildConversationTranscript(conversation, asMarkdown) {
  const lines = [];
  conversation.messages.forEach((message) => {
    const role = message.role === "assistant" ? "Assistant" : message.role === "system" ? "System" : "User";
    if (asMarkdown) {
      lines.push("### " + role);
      lines.push("");
      lines.push(message.content.trim());
      lines.push("");
    } else {
      lines.push(role.toUpperCase() + ":");
      lines.push(message.content.trim());
      lines.push("");
    }
  });
  return lines.join("\n");
}

function downloadText(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
