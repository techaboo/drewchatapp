/**
 * LLM Chat Application Template
 *
 * A simple chat application using Cloudflare Workers AI.
 * This template demonstrates how to implement an LLM-powered chat interface with
 * streaming responses using Server-Sent Events (SSE).
 *
 * @license MIT
 */
import { Env, ChatMessage } from "./types";

// ========= AUTH UTILITIES =========

interface SessionPayload {
  userId: string;
  expiresAt: number;
}

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function generateTempPassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = generateId();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `sha256:${salt}:${hashHex}`;
}

async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    if (!passwordHash.startsWith("sha256:")) {
      return false;
    }

    const parts = passwordHash.split(":");
    if (parts.length !== 3) {
      return false;
    }

    const salt = parts[1];
    const storedHash = parts[2];

    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return computedHash === storedHash;
  } catch {
    return false;
  }
}

function encodeSession(session: SessionPayload): string {
  return btoa(JSON.stringify(session));
}

function decodeSession(token: string): SessionPayload | null {
  try {
    const json = atob(token);
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

function isSessionValid(session: SessionPayload): boolean {
  return session.expiresAt > Date.now();
}

function createSession(userId: string): SessionPayload {
  return {
    userId,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

function validateSession(request: Request): { valid: boolean; userId?: string } {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return { valid: false };
  }

  const sessionMatch = cookieHeader.match(/session=([^;]+)/);
  if (!sessionMatch) {
    return { valid: false };
  }

  const token = sessionMatch[1];
  const session = decodeSession(token);

  if (!session || !isSessionValid(session)) {
    return { valid: false };
  }

  return { valid: true, userId: session.userId };
}

async function sendEmailNotification(
  type: "signup" | "reset",
  email: string,
  env: Env,
  approvalToken?: string
): Promise<void> {
  try {
    console.log(`📧 Sending ${type} email notification for ${email} to ${env.ADMIN_EMAIL}`);
    
    let subject: string;
    let text: string;
    let html: string;
    const baseUrl = "http://127.0.0.1:8787"; // Will use request URL in production

    if (type === "signup") {
      const approveUrl = `${baseUrl}/api/auth/approve?token=${approvalToken}`;
      subject = "New Registration Request";
      text = `New registration request from: ${email}\n\nTo approve and generate a temporary password, click this link:\n${approveUrl}\n\nOr copy and paste it into your browser.`;
      html = `<h2>New Registration Request</h2><p>Email: <strong>${email}</strong></p><p><a href="${approveUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Approve Registration</a></p><p>Or copy this link: ${approveUrl}</p>`;
    } else {
      const resetUrl = `${baseUrl}/api/auth/generate-temp-password?email=${encodeURIComponent(email)}`;
      subject = "Password Reset Request";
      text = `Password reset requested for: ${email}\n\nTo generate a temporary password, click this link:\n${resetUrl}\n\nOr copy and paste it into your browser.`;
      html = `<h2>Password Reset Request</h2><p>Email: <strong>${email}</strong></p><p><a href="${resetUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Generate Temp Password</a></p><p>Or copy this link: ${resetUrl}</p>`;
    }

    // Use Resend API (simpler than MailChannels, works immediately)
    const emailData = {
      from: env.SMTP_FROM,
      to: [env.ADMIN_EMAIL],
      subject,
      text,
      html,
    };

    console.log("📨 Calling Resend API...", { to: env.ADMIN_EMAIL, from: env.SMTP_FROM });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    }).catch((fetchError) => {
      console.error("❌ Fetch error:", fetchError);
      throw fetchError;
    });

    const responseText = await response.text().catch(() => "Could not read response");
    console.log("📬 Resend API response:", response.status, responseText);

    if (!response.ok) {
      console.error("❌ Failed to send email via Resend:", responseText);
      
      // Fallback: Log to console (don't throw error)
      console.log(`📋 Email notification (${type}):`, {
        to: env.ADMIN_EMAIL,
        from: env.SMTP_FROM,
        subject,
        text,
      });
    } else {
      console.log(`✅ Email sent successfully via Resend (${type}) to ${env.ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error("❌ Exception in sendEmailNotification:", error);
    // Log the notification as fallback (don't throw - prevents server crash)
    console.log(`📋 Email notification (${type}) for ${email} -> ${env.ADMIN_EMAIL}`);
  }
}

async function sendTempPasswordEmail(
  userEmail: string,
  tempPassword: string,
  env: Env
): Promise<void> {
  try {
    console.log(`🔑 Sending temp password for ${userEmail} to ${env.ADMIN_EMAIL}`);
    
    const subject = `Temporary Password for ${userEmail}`;
    const text = `A new user has been approved:\n\nEmail: ${userEmail}\nTemporary Password: ${tempPassword}\n\nPlease send this password to the user so they can log in.\nThey should change this password after their first login.`;
    const html = `<h2>User Approved</h2><p>Email: <strong>${userEmail}</strong></p><div style="background: #f8f9fa; border: 2px solid #0066cc; padding: 20px; border-radius: 5px; margin: 20px 0;"><h3>Temporary Password:</h3><p style="font-size: 24px; font-weight: bold; color: #0066cc; font-family: monospace;">${tempPassword}</p></div><p>Please send this password to the user. They should change it after logging in.</p>`;

    const emailData = {
      from: env.SMTP_FROM,
      to: [env.ADMIN_EMAIL],
      subject,
      text,
      html,
    };

    console.log("📨 Calling Resend API for temp password...");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    }).catch((fetchError) => {
      console.error("❌ Fetch error:", fetchError);
      throw fetchError;
    });

    const responseText = await response.text().catch(() => "Could not read response");
    console.log("📬 Resend API response:", response.status, responseText);

    if (!response.ok) {
      console.error("❌ Failed to send temp password email:", responseText);
      console.log(`📋 Temp Password for ${userEmail}:`, tempPassword);
    } else {
      console.log(`✅ Temp password sent to ${env.ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error("❌ Exception in sendTempPasswordEmail:", error);
    console.log(`📋 Temp Password for ${userEmail}:`, tempPassword);
  }
}

// ========= END AUTH UTILITIES =========

// Model ID for Workers AI model
// https://developers.cloudflare.com/workers-ai/models/
const MODEL_ID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

// Local Ollama configuration
const OLLAMA_BASE_URL = "http://localhost:11434";
const OLLAMA_MODEL = "llama3.2:1b";

// Default system prompt
const SYSTEM_PROMPT =
  "You are a helpful, friendly assistant. Provide concise and accurate responses.";

// In-memory user storage for testing (will be replaced by D1 in production)
const testUsers: Record<string, { id: string; email: string; passwordHash: string; approved?: boolean }> = {};

// Pending registration requests waiting for admin approval
const pendingRegistrations: Record<string, { email: string; tempPassword: string; timestamp: number }> = {};

// Global model selection (stored in-memory for this session)
let selectedModel = OLLAMA_MODEL;

/**
 * Detects if Ollama is running locally
 */
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(1000), // 1 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default {
  /**
   * Main request handler for the Worker
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Handle static assets (frontend)
    if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // API Routes
    if (url.pathname === "/api/chat") {
      // Handle POST requests for chat
      if (request.method === "POST") {
        // Require authentication
        const authResult = validateSession(request);
        if (!authResult.valid) {
          return new Response(
            JSON.stringify({ message: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
        return handleChatRequest(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // Model management routes
    if (url.pathname === "/api/models") {
      if (request.method === "GET") {
        // Require authentication
        const authResult = validateSession(request);
        if (!authResult.valid) {
          return new Response(
            JSON.stringify({ message: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
        return handleListModels();
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/models/download") {
      if (request.method === "POST") {
        return handleDownloadModel(request);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/models/select") {
      if (request.method === "POST") {
        return handleSelectModel(request);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // Auth routes
    if (url.pathname === "/api/auth/register") {
      if (request.method === "POST") {
        return handleRegister(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/auth/login") {
      if (request.method === "POST") {
        return handleLogin(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/auth/verify") {
      if (request.method === "GET") {
        return handleVerifySession(request);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/auth/reset-password") {
      if (request.method === "POST") {
        return handlePasswordReset(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/auth/approve") {
      if (request.method === "GET") {
        return handleApproveRegistration(url, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/auth/generate-temp-password") {
      if (request.method === "GET") {
        return handleGenerateTempPassword(url, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // Handle 404 for unmatched routes
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * Handles chat API requests
 */
async function handleChatRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    // Parse JSON request body
    const { messages = [] } = (await request.json()) as {
      messages: ChatMessage[];
    };

    // Add system prompt if not present
    if (!messages.some((msg) => msg.role === "system")) {
      messages.unshift({ role: "system", content: SYSTEM_PROMPT });
    }

    // Check if Ollama is available for local development
    const useOllama = await isOllamaAvailable();

    if (useOllama) {
      console.log("Using local Ollama model:", selectedModel ?? OLLAMA_MODEL);
      return await handleOllamaRequest(messages);
    }

    console.log("Using Cloudflare Workers AI model:", MODEL_ID);

    // Use Workers AI with streaming
    const aiResponse = await env.AI.run(
      MODEL_ID,
      {
        messages,
        max_tokens: 1024,
        stream: true,
      },
    );

    // Workers AI returns a ReadableStream, transform it to our format
    const stream = aiResponse as ReadableStream<Uint8Array>;
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim() || !line.startsWith("data: ")) continue;

            try {
              const jsonStr = line.slice(6); // Remove "data: " prefix
              const data = JSON.parse(jsonStr);
              
              // Extract response text from Workers AI format
              if (data.response) {
                fullText += data.response;
                const output = JSON.stringify({
                  text: fullText,
                  response: fullText,
                });
                await writer.write(encoder.encode(output + "\n"));
              }
            } catch (e) {
              console.error("Error parsing Workers AI response:", line.substring(0, 100), e);
            }
          }
        }

        // Process final buffer
        if (buffer.trim() && buffer.startsWith("data: ")) {
          try {
            const jsonStr = buffer.slice(6);
            const data = JSON.parse(jsonStr);
            if (data.response) {
              fullText += data.response;
              const output = JSON.stringify({
                text: fullText,
                response: fullText,
              });
              await writer.write(encoder.encode(output + "\n"));
            }
          } catch (e) {
            console.error("Error parsing final Workers AI buffer:", e);
          }
        }
      } catch (error) {
        console.error("Error streaming from Workers AI:", error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error processing chat request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}

/**
 * Handles requests to Ollama local server
 */
async function handleOllamaRequest(
  messages: ChatMessage[],
): Promise<Response> {
  const modelToUse = selectedModel ?? OLLAMA_MODEL;
  console.log("selectedModel value:", selectedModel);
  console.log("selectedModel type:", typeof selectedModel);

  const requestBody = {
    model: modelToUse,
    messages,
    stream: true,
  };
  console.log("Ollama request body:", JSON.stringify(requestBody, null, 2));
  
  const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  console.log("Ollama response status:", ollamaResponse.status, ollamaResponse.statusText);
  
  if (!ollamaResponse.ok) {
    const errorText = await ollamaResponse.text();
    console.error("Ollama error response:", errorText);
    throw new Error(`Ollama request failed: ${ollamaResponse.statusText}`);
  }

  // Transform Ollama's streaming format to match Workers AI format
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const reader = ollamaResponse.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });

        // Split by newlines to get complete JSON objects
        const lines = buffer.split("\n");

        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || "";

        // Process complete lines
        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              fullText += json.message.content;
              // Stream back in Workers AI format
              const transformed = JSON.stringify({
                text: fullText,
                response: fullText,
              });
              await writer.write(encoder.encode(transformed + "\n"));
            }
          } catch (e) {
            console.error("Error parsing Ollama response line:", line.substring(0, 100), e);
          }
        }
      }

      // Process any remaining buffered data
      if (buffer.trim()) {
        try {
          const json = JSON.parse(buffer);
          if (json.message?.content) {
            fullText += json.message.content;
            const transformed = JSON.stringify({
              text: fullText,
              response: fullText,
            });
            await writer.write(encoder.encode(transformed + "\n"));
          }
        } catch (e) {
          console.error("Error parsing final Ollama buffer:", e);
        }
      }
    } catch (error) {
      console.error("Error streaming from Ollama:", error);
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * List available and installed Ollama models, fallback to Workers AI
 */
async function handleListModels(): Promise<Response> {
  const useOllama = await isOllamaAvailable();

  if (useOllama) {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      const data = (await response.json()) as { models: Array<{ name: string; size: number }> };

      const availableModels = [
        { name: "llama3.2:1b", description: "Tiny & fast (1.3 GB)", size: 1321098329 },
        { name: "llama3.2:3b", description: "Small & balanced (2 GB)", size: 2000000000 },
        { name: "phi3:mini", description: "Microsoft Phi-3 Mini (2.3 GB)", size: 2300000000 },
        { name: "gemma2:2b", description: "Google Gemma 2B (1.6 GB)", size: 1600000000 },
        { name: "qwen2.5:1.5b", description: "Qwen 2.5 1.5B (1 GB)", size: 1000000000 },
      ];

      return new Response(
        JSON.stringify({
          available: true,
          installedModels: data.models,
          availableModels,
          currentModel: selectedModel,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Error listing Ollama models:", error);
    }
  }

  // Fallback to Workers AI models when Ollama is unavailable
  const workersAiModels = [
    {
      name: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      description: "Meta Llama 3.3 70B (Instruct)",
      size: null,
    },
    {
      name: "@cf/mistral/mistral-7b-instruct-v0.1",
      description: "Mistral 7B (Instruct v0.1)",
      size: null,
    },
    {
      name: "@cf/meta/llama-3.1-8b-instruct",
      description: "Meta Llama 3.1 8B (Instruct)",
      size: null,
    },
    {
      name: "@cf/openchat/openchat-3.5-0106",
      description: "OpenChat 3.5",
      size: null,
    },
  ];

  return new Response(
    JSON.stringify({
      available: false,
      installedModels: [],
      availableModels: workersAiModels,
      currentModel: MODEL_ID,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * Download an Ollama model with streaming progress
 */
async function handleDownloadModel(request: Request): Promise<Response> {
  try {
    const { model } = (await request.json()) as { model: string };

    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: model }),
    });

    if (!response.ok) {
      throw new Error("Failed to start model download");
    }

    // Stream the progress updates
    return new Response(response.body, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error downloading model:", error);
    return new Response(
      JSON.stringify({ error: "Failed to download model" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Select the active model (stored in-memory for this session)
 */
async function handleSelectModel(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { model?: string; modelName?: string };
    const newModel = body.model ?? body.modelName;
    console.log("handleSelectModel body:", body, "resolved model:", newModel);

    if (!newModel) {
      return new Response(
        JSON.stringify({ error: "Model name is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Update selectedModel based on whether it's Workers AI or Ollama
    if (newModel.startsWith("@cf/")) {
      // It's a Workers AI model
      console.log("Selected Workers AI model:", newModel);
    } else {
      // It's an Ollama model
      selectedModel = newModel;
      console.log("Selected Ollama model:", newModel);
    }

    return new Response(
      JSON.stringify({ success: true, currentModel: newModel }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error selecting model:", error);
    return new Response(
      JSON.stringify({ error: "Failed to select model" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Handle user registration
 */
async function handleRegister(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    // Validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          message: "Email and password are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          field: "password",
          message: "Password must be at least 8 characters",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = generateId();

    // Check if user already exists
    const existingUser = Object.values(testUsers).find(
      (u) => u.email === email
    );
    if (existingUser) {
      return new Response(
        JSON.stringify({
          field: "email",
          message: "Email already registered",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // All registrations require admin approval
    // Create pending registration
    const approvalToken = generateId();
    pendingRegistrations[approvalToken] = {
      email,
      tempPassword: "", // Will be generated upon approval
      timestamp: Date.now(),
    };
    
    // Send notification email with approval link
    await sendEmailNotification("signup", email, env, approvalToken);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration request submitted. Your account is pending approval. You will receive login credentials once approved.",
      }),
      {
        status: 202,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        message: "Registration failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Handle user login
 */
async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    // Validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          message: "Email and password are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Find user
    try {
      console.log("Finding user with email:", email);
      const user = Object.values(testUsers).find(
        (u) => u.email === email
      ) as { id: string; email: string; passwordHash: string } | undefined;
      console.log("User found:", !!user);

      if (!user) {
        return new Response(
          JSON.stringify({
            field: "email",
            message: "User not found",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Verify password
      const passwordValid = await verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        return new Response(
          JSON.stringify({
            field: "password",
            message: "Invalid password",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Create session
      const session = createSession(user.id);
      (session as unknown as Record<string, unknown>).email = email;
      const sessionToken = encodeSession(session);

      return new Response(
        JSON.stringify({
          success: true,
          sessionToken,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (dbError) {
      console.error("Error during login:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        message: "Login failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Verify session validity
 */
function handleVerifySession(request: Request): Response {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return new Response(
      JSON.stringify({ valid: false }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const sessionMatch = cookieHeader.match(/session=([^;]+)/);
  if (!sessionMatch) {
    return new Response(
      JSON.stringify({ valid: false }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const token = sessionMatch[1];
  const session = decodeSession(token);

  if (!session || !isSessionValid(session)) {
    return new Response(
      JSON.stringify({ valid: false }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      valid: true,
      userId: session.userId,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * Handle password reset requests
 */
async function handlePasswordReset(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    const { email } = (await request.json()) as {
      email?: string;
    };

    // Validation
    if (!email) {
      return new Response(
        JSON.stringify({
          message: "Email is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if user exists
    const user = Object.values(testUsers).find(
      (u) => u.email === email
    );

    // Always return success to prevent email enumeration
    // But only send email if it's the protected account
    if (email === "techaboo@gmail.com") {
      await sendEmailNotification("reset", email, env);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "If this email is registered, the account owner will be notified to generate a temporary password.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return new Response(
      JSON.stringify({
        message: "Password reset request failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Handle registration approval - generates temp password for approved user
 */
async function handleApproveRegistration(
  url: URL,
  env: Env,
): Promise<Response> {
  try {
    const token = url.searchParams.get("token");
    
    if (!token) {
      return new Response("Missing approval token", { status: 400 });
    }

    const pending = pendingRegistrations[token];
    if (!pending) {
      return new Response("Invalid or expired approval token", { status: 404 });
    }

    // Check if token is older than 24 hours
    if (Date.now() - pending.timestamp > 24 * 60 * 60 * 1000) {
      delete pendingRegistrations[token];
      return new Response("Approval token expired", { status: 410 });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    
    // Create user account
    const userId = generateId();
    testUsers[userId] = {
      id: userId,
      email: pending.email,
      passwordHash,
      approved: true,
    };

    // Clean up pending registration
    delete pendingRegistrations[token];

    console.log(`✅ User approved and created: ${pending.email}`);

    // Send temp password to admin email
    await sendTempPasswordEmail(pending.email, tempPassword, env);

    // Return success page
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Approved</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="success">
    <h2>✅ Registration Approved</h2>
    <p>User <strong>${pending.email}</strong> has been approved.</p>
  </div>
  
  <div class="info">
    <p>📧 A temporary password has been sent to your email at <strong>${env.ADMIN_EMAIL}</strong>.</p>
    <p>Please forward the password to the user so they can log in.</p>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("Approval error:", error);
    return new Response("Approval failed", { status: 500 });
  }
}

/**
 * Handle temp password generation for password resets
 */
async function handleGenerateTempPassword(
  url: URL,
  env: Env,
): Promise<Response> {
  try {
    const email = url.searchParams.get("email");
    
    if (!email) {
      return new Response("Missing email parameter", { status: 400 });
    }

    // Find user
    const user = Object.values(testUsers).find((u) => u.email === email);
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    
    // Update user's password
    user.passwordHash = passwordHash;

    console.log(`🔑 Temp password generated for: ${email}`);

    // Send temp password to admin email
    await sendTempPasswordEmail(email, tempPassword, env);

    // Return success page
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Temporary Password Generated</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="success">
    <h2>🔑 Temporary Password Generated</h2>
    <p>Password reset for <strong>${email}</strong></p>
  </div>
  
  <div class="info">
    <p>📧 The temporary password has been sent to your email at <strong>${env.ADMIN_EMAIL}</strong>.</p>
    <p>Please forward the password to the user.</p>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("Temp password generation error:", error);
    return new Response("Failed to generate temporary password", { status: 500 });
  }
}
