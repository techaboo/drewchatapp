// Techaboo AI Chat conversation management and messaging
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

const STORAGE_KEY = "techaboo.chat.conversations";
const DEFAULT_TITLE = "New chat";
const WELCOME_TEXT = "Hello! I'm Techaboo AI Chat. How can I help you today?";
const WELCOME_MESSAGE = { role: "assistant", content: WELCOME_TEXT };

let conversations = [];
let currentConversationId = null;
let chatHistory = [];
let uploadedFiles = [];

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
    setCurrentConversation(conversation.id);
    userInput.focus();
  });
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
  "spell-check": "Check spelling/grammar:\n\n",
  "summarize": "Summarize:\n\n",
  "explain-code": "Explain this code:\n\n",
  "generate-code": "Generate code for:\n\n",
  "translate": "Translate to [language]:\n\n",
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
  currentConversationId = conversations[0].id;
  chatHistory = conversations[0].messages;
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
        return {
          id: conversation.id || generateId(),
          title: conversation.title || DEFAULT_TITLE,
          messages: conversation.messages.map((message) => ({
            role: message.role,
            content: message.content
          })).filter((message) => message && typeof message.content === "string" && message.content.length >= 0),
          updatedAt: typeof conversation.updatedAt === "number" ? conversation.updatedAt : Date.now()
        };
      })
      .filter(Boolean)
      .map((conversation) => {
        if (!conversation.messages.length) {
          conversation.messages = [{ ...WELCOME_MESSAGE }];
        }
        return conversation;
      });
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
    updatedAt: Date.now()
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

  if (!conversations.length) {
    const empty = document.createElement("p");
    empty.className = "conversation-meta";
    empty.textContent = "No conversations yet.";
    conversationList.appendChild(empty);
    return;
  }

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  sorted.forEach((conversation) => {
    const item = document.createElement("div");
    item.className = "conversation-item" + (conversation.id === currentConversationId ? " active" : "");
    item.dataset.id = conversation.id;

    const title = document.createElement("div");
    title.className = "conversation-title";
    title.textContent = conversation.title || DEFAULT_TITLE;

    const meta = document.createElement("div");
    meta.className = "conversation-meta";
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const preview = lastMessage ? truncateText(lastMessage.content.replace(/\s+/g, " "), 80) : "No messages yet";
    const timestamp = formatTimestamp(conversation.updatedAt);
    meta.textContent = timestamp ? `${timestamp} • ${preview}` : preview;

    item.appendChild(title);
    item.appendChild(meta);
    item.addEventListener("click", () => setCurrentConversation(conversation.id));

    conversationList.appendChild(item);
  });
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
        option.textContent = `${model.name} (${formatSize(model.size)})`;
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
    badge.textContent = "✓ Installed";
    badge.style.color = "var(--success)";
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
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n").filter((line) => line.trim());
      lines.forEach((line) => {
        try {
          const data = JSON.parse(line);
          if (data.status === "downloading" && data.completed && data.total) {
            bar.style.width = `${(data.completed / data.total) * 100}%`;
          }
          if (data.status === "success") {
            button.textContent = "✓ Downloaded";
            container.remove();
            loadModels();
          }
        } catch (error) {
          /* swallow parse errors */
        }
      });
    }
  } catch (error) {
    button.disabled = false;
    button.textContent = "Download";
    container.remove();
    alert("Download failed");
  }
}

function formatSize(bytes) {
  if (!bytes) return "Unknown";
  const gb = bytes / 1073741824;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  return `${(bytes / 1048576).toFixed(0)} MB`;
}

async function sendMessage() {
  const conversation = getCurrentConversation();
  if (!conversation) return;

  const rawMessage = userInput.value.trim();
  if (!rawMessage) return;

  let messageWithFiles = rawMessage;
  if (uploadedFiles.length) {
    messageWithFiles += "\n\nFiles:\n";
    uploadedFiles.forEach((file) => {
      messageWithFiles += `${file.name}:\n\n\`\`\`\n${file.content}\n\`\`\`\n`;
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value, { stream: true }).split("\n").filter((line) => line.trim());
      lines.forEach((line) => {
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
    const errorMessage = `Error: ${error.message}`;
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
  conversation.updatedAt = Date.now();
}

function displayMessage(role, content) {
  const element = createMessageElement(role);
  updateContent(element, content);
  chatMessages.appendChild(element);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createMessageElement(role) {
  const element = document.createElement("div");
  element.className = `message ${role}-message`;
  return element;
}

function updateContent(element, content) {
  element.innerHTML = marked.parse(content);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  element.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });
}

function addCopyButtons() {
  document.querySelectorAll("pre code").forEach((block) => {
    if (block.parentElement.querySelector(".copy-btn")) return;
    const button = document.createElement("button");
    button.className = "copy-btn";
    button.textContent = "Copy";
    button.onclick = () => {
      navigator.clipboard.writeText(block.textContent);
      button.textContent = "Copied!";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    };
    block.parentElement.style.position = "relative";
    block.parentElement.appendChild(button);
  });
}

function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const timePart = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return isToday ? timePart : `${date.toLocaleDateString()} ${timePart}`;
}