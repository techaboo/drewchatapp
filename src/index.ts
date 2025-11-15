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

// Model ID for Workers AI model
// https://developers.cloudflare.com/workers-ai/models/
const MODEL_ID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

// Local Ollama configuration
const OLLAMA_BASE_URL = "http://localhost:11434";
const OLLAMA_MODEL = "llama3.2:1b";

// Default system prompt
const SYSTEM_PROMPT =
  "You are a helpful, friendly assistant. Provide concise and accurate responses.";

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
        return handleChatRequest(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // Model management routes
    if (url.pathname === "/api/models") {
      if (request.method === "GET") {
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

    const response = await env.AI.run(
      MODEL_ID,
      {
        messages,
        max_tokens: 1024,
      },
      {
        returnRawResponse: true,
        // Uncomment to use AI Gateway
        // gateway: {
        //   id: "YOUR_GATEWAY_ID", // Replace with your AI Gateway ID
        //   skipCache: false,      // Set to true to bypass cache
        //   cacheTtl: 3600,        // Cache time-to-live in seconds
        // },
      },
    );

    // Return streaming response
    return response;
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
              // Transform to Workers AI format
              const transformed = JSON.stringify({
                response: json.message.content,
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
            const transformed = JSON.stringify({
              response: json.message.content,
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
 * List available and installed Ollama models
 */
async function handleListModels(): Promise<Response> {
  const useOllama = await isOllamaAvailable();

  if (!useOllama) {
    return new Response(
      JSON.stringify({
        available: false,
        installedModels: [],
        availableModels: [],
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

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
    console.error("Error listing models:", error);
    return new Response(
      JSON.stringify({ error: "Failed to list models" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
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
let selectedModel = OLLAMA_MODEL;

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

    selectedModel = newModel;

    return new Response(
      JSON.stringify({ success: true, currentModel: selectedModel }),
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
