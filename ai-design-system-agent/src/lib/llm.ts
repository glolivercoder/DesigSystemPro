import { resolveProvider, type ResolvedProvider } from "./settings";
import type { ProviderId } from "./types";

export interface ChatResult {
  text: string;
  provider: string;
  model: string;
  offline: boolean;
  error?: string;
}

/**
 * LangChain bridge. Uses ChatOpenAI against any OpenAI-compatible endpoint
 * (OpenRouter, Gemini OpenAI-compat, OpenAI, 9Router, OmniRoute).
 * When no key is configured the caller falls back to the local skills engine.
 */
export async function chatComplete(input: {
  system: string;
  user: string;
  temperature?: number;
  providerId?: ProviderId;
  model?: string;
  maxTokens?: number;
}): Promise<ChatResult> {
  const provider: ResolvedProvider | null = await resolveProvider(input.providerId);
  if (!provider) {
    return {
      text: "",
      provider: "local-skills-engine",
      model: "rag-hash-v1",
      offline: true,
      error: "Nenhuma API key configurada. Usando o motor local de skills + RAG.",
    };
  }
  try {
    const { ChatOpenAI } = await import("@langchain/openai");
    const { HumanMessage, SystemMessage } = await import("@langchain/core/messages");
    const model = new ChatOpenAI({
      apiKey: provider.apiKey,
      model: input.model || provider.model,
      temperature: input.temperature ?? 0.4,
      maxTokens: input.maxTokens ?? 1400,
      timeout: 35000,
      maxRetries: 1,
      configuration: {
        baseURL: provider.baseUrl,
        defaultHeaders:
          provider.id === "openrouter"
            ? { "HTTP-Referer": "https://design-studio.local", "X-Title": "Design Studio Skills" }
            : undefined,
      },
    });
    const response = await model.invoke([new SystemMessage(input.system), new HumanMessage(input.user)]);
    const text =
      typeof response.content === "string"
        ? response.content
        : response.content
            .map((part) => (typeof part === "string" ? part : "text" in part && typeof part.text === "string" ? part.text : ""))
            .join("\n")
            .trim();
    return {
      text,
      provider: provider.label,
      model: input.model || provider.model,
      offline: false,
    };
  } catch (error) {
    return {
      text: "",
      provider: provider.label,
      model: input.model || provider.model,
      offline: true,
      error: error instanceof Error ? error.message : "Falha ao chamar o provedor",
    };
  }
}

export function extractJson<T>(raw: string): T | null {
  if (!raw) return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
