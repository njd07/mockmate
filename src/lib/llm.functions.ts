import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

const Input = z.object({
  messages: z.array(MessageSchema).min(1),
  jsonMode: z.boolean().optional(),
  temperature: z.number().optional(),
  // User-provided keys (from Settings)
  groqApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  // Ollama settings
  useOllama: z.boolean().optional(),
  ollamaUrl: z.string().optional(),
  ollamaModel: z.string().optional(),
});

export type LLMInput = z.infer<typeof Input>;
export { Input as LLMInputSchema };

// ─── Provider: Groq ────────────────────────────────────────────────
async function tryGroq(
  apiKey: string,
  messages: { role: string; content: string }[],
  temperature: number,
  jsonMode?: boolean,
): Promise<{ ok: true; text: string; modelUsed: string } | null> {
  const candidateModels = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "groq/compound",
  ];

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 10_000);

      const body: Record<string, unknown> = {
        model,
        messages,
        temperature,
        max_tokens: 1024,
      };
      if (jsonMode) body.response_format = { type: "json_object" };

      console.log(`[LLM:Groq] Calling ${model}...`);
      const start = Date.now();

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(t);
      console.log(`[LLM:Groq] response ${res.status} in ${Date.now() - start}ms`);

      if (res.status === 429 || res.status >= 500) {
        console.warn(`[LLM:Groq] Rate limited or server error: ${res.status}`);
        return null; // Don't keep hammering if rate limited
      }
      if (!res.ok) {
        const errBody = await res.text();
        console.warn(`[LLM:Groq] Model ${model} failed (${res.status}): ${errBody.slice(0, 150)}`);
        continue; // Try next candidate model
      }

      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content;
      if (typeof text !== "string" || !text.trim()) {
        continue;
      }
      return { ok: true, text, modelUsed: `groq/${model}` };
    } catch (e) {
      console.error(`[LLM:Groq] ${(e as Error).message}`);
    }
  }

  return null;
}

// ─── Provider: Ollama (local) ──────────────────────────────────────
async function tryOllama(
  ollamaUrl: string,
  ollamaModel: string,
  messages: { role: string; content: string }[],
  temperature: number,
  jsonMode?: boolean,
): Promise<{ ok: true; text: string; modelUsed: string } | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 90_000); // generous timeout for local model

    const body: Record<string, unknown> = {
      model: ollamaModel,
      messages,
      stream: false,
      options: {
        temperature,
        num_predict: 512,
        num_ctx: 4096,
      },
    };
    if (jsonMode) body.format = "json";

    console.log(`[LLM:Ollama] POST ${ollamaUrl}/api/chat model=${ollamaModel}`);
    const start = Date.now();

    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(t);
    console.log(`[LLM:Ollama] response ${res.status} in ${Date.now() - start}ms`);

    if (!res.ok) {
      console.error(`[LLM:Ollama] HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return null;
    }

    const json = await res.json();
    const text = json?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      console.error("[LLM:Ollama] empty response body");
      return null;
    }
    return { ok: true, text, modelUsed: `ollama/${ollamaModel}` };
  } catch (e) {
    console.error(`[LLM:Ollama] ${(e as Error).message}`);
    return null;
  }
}

// ─── Provider: Gemini ──────────────────────────────────────────────
async function tryGemini(
  apiKey: string,
  messages: { role: string; content: string }[],
  temperature: number,
  jsonMode?: boolean,
): Promise<{ ok: true; text: string; modelUsed: string } | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12_000);

    // Convert messages to Gemini format
    const systemParts = messages
      .filter((m) => m.role === "system")
      .map((m) => m.content)
      .join("\n\n");

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: 1024,
        ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    };

    if (systemParts) {
      body.systemInstruction = { parts: [{ text: systemParts }] };
    }

    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    for (const model of candidateModels) {
      try {
        console.log(`[LLM:Gemini] Calling ${model}...`);
        const start = Date.now();

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          }
        );
        console.log(`[LLM:Gemini] response ${res.status} in ${Date.now() - start}ms`);

        if (res.status === 429 || res.status >= 500) {
          console.warn(`[LLM:Gemini] Rate limited or server error: ${res.status}`);
          return null;
        }
        if (!res.ok) {
          const errBody = await res.text();
          console.warn(`[LLM:Gemini] Model ${model} failed (${res.status}): ${errBody.slice(0, 150)}`);
          continue;
        }

        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof text !== "string" || !text.trim()) {
          continue;
        }
        clearTimeout(t);
        return { ok: true, text, modelUsed: `gemini/${model}` };
      } catch (err) {
        console.error(`[LLM:Gemini] Model ${model} error:`, (err as Error).message);
      }
    }
    clearTimeout(t);
    return null;
  } catch (e) {
    console.error(`[LLM:Gemini] ${(e as Error).message}`);
    return null;
  }
}

// ─── Main Router: Groq → Ollama → Gemini, 30s retry loop ──────────
export async function callLLM({ data }: { data: z.infer<typeof Input> }) {
  const globalDeadline = Date.now() + 30_000;
  let lastErr = "";
  let attempt = 0;

  const groqKey = data.groqApiKey?.trim() || process.env.GROQ_API_KEY || "";
  const geminiKey = data.geminiApiKey?.trim() || process.env.GEMINI_API_KEY || "";
  const temperature = data.temperature ?? 0.6;

  while (Date.now() < globalDeadline) {
    attempt++;
    console.log(`[LLM] Attempt #${attempt}, ${Math.round((globalDeadline - Date.now()) / 1000)}s remaining`);

    // ── 1. Groq (primary) ──
    if (groqKey) {
      const result = await tryGroq(groqKey, data.messages, temperature, data.jsonMode);
      if (result) return result;
      lastErr = "Groq failed";
    }

    // Check deadline
    if (Date.now() >= globalDeadline) break;

    // ── 2. Ollama (local fallback) ──
    if (data.useOllama) {
      const url = (data.ollamaUrl || "http://localhost:11434").replace(/\/+$/, "");
      const model = data.ollamaModel || "mistral:7b-instruct-q3_K_M";
      const result = await tryOllama(url, model, data.messages, temperature, data.jsonMode);
      if (result) return result;
      lastErr = "Ollama failed";
    }

    // Check deadline
    if (Date.now() >= globalDeadline) break;

    // ── 3. Gemini (final fallback) ──
    if (geminiKey) {
      const result = await tryGemini(geminiKey, data.messages, temperature, data.jsonMode);
      if (result) return result;
      lastErr = "Gemini failed";
    }

    // If no providers have keys and Ollama is disabled, break immediately
    if (!groqKey && !geminiKey && !data.useOllama) {
      return {
        ok: false as const,
        error: "NO_KEY",
        message: "No API keys configured. Add a Groq or Gemini API key in Settings, or enable Ollama.",
      };
    }

    // Brief pause before retrying the chain
    if (Date.now() < globalDeadline) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return {
    ok: false as const,
    error: "CHAIN_EXHAUSTED",
    message: "All AI providers failed after 30 seconds. Please check your API keys in Settings or try again.",
    detail: lastErr,
  };
}
