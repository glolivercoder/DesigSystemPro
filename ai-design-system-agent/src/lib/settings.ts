import { promises as fs } from "node:fs";
import path from "node:path";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { llmProviders, studioSettings } from "@/db/schema";
import { providerDefinitions } from "./integrations-data";
import type { ProviderId, ProviderState } from "./types";

export interface ResolvedProvider {
  id: ProviderId;
  label: string;
  baseUrl: string;
  model: string;
  imageModel: string;
  apiKey: string;
  envKey: string;
  freeOnly: boolean;
}

async function readEnvFile(): Promise<Record<string, string>> {
  try {
    const file = await fs.readFile(path.join(process.cwd(), ".env"), "utf8");
    const map: Record<string, string> = {};
    for (const line of file.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match) map[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
    }
    return map;
  } catch {
    return {};
  }
}

/** Persist secrets in the local .env (sandbox) and mirror them in Postgres. */
export async function writeEnv(updates: Record<string, string>): Promise<void> {
  const current = await readEnvFile();
  const merged = { ...current, ...updates };
  const body = Object.entries(merged)
    .map(([key, value]) => `${key}=${value.includes(" ") || value.length === 0 ? `"${value}"` : value}`)
    .join("\n");
  try {
    await fs.writeFile(path.join(process.cwd(), ".env"), `${body}\n`, "utf8");
  } catch {
    // Filesystem may be read-only in some runtimes; DB remains the source of truth.
  }
  for (const [key, value] of Object.entries(updates)) {
    process.env[key] = value;
  }
}

export async function getProviderStates(): Promise<ProviderState[]> {
  const rows = await db.select().from(llmProviders).orderBy(desc(llmProviders.active), llmProviders.id);
  const env = await readEnvFile();
  const byId = new Map(rows.map((row) => [row.id, row]));
  return providerDefinitions.map((definition) => {
    const row = byId.get(definition.id);
    const key = row?.apiKey || env[definition.envKey] || process.env[definition.envKey] || "";
    return {
      id: definition.id,
      label: row?.label ?? definition.label,
      baseUrl: row?.baseUrl ?? definition.baseUrl,
      model: row?.model ?? definition.textModels[0] ?? "",
      imageModel: row?.imageModel ?? definition.imageModels[0] ?? "",
      enabled: row?.enabled ?? false,
      active: row?.active ?? false,
      freeOnly: row?.freeOnly ?? false,
      supportsImage: row?.supportsImage ?? definition.supportsImage,
      hasKey: Boolean(key),
      keyPreview: key ? `${key.slice(0, 5)}…${key.slice(-4)}` : "",
      envKey: definition.envKey,
      freeModels: definition.freeModels,
      textModels: definition.textModels,
      imageModels: definition.imageModels,
      docs: definition.docs,
      lastTest: row?.lastTest ?? null,
    };
  });
}

export interface ProviderSaveInput {
  id: ProviderId;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  imageModel?: string;
  enabled?: boolean;
  active?: boolean;
  freeOnly?: boolean;
}

export async function saveProvider(input: ProviderSaveInput): Promise<ProviderState[]> {
  const definition = providerDefinitions.find((p) => p.id === input.id);
  if (!definition) throw new Error(`Provider desconhecido: ${input.id}`);

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  const envUpdates: Record<string, string> = {};
  if (typeof input.apiKey === "string" && input.apiKey.length > 0 && !input.apiKey.includes("…")) {
    patch.apiKey = input.apiKey.trim();
    envUpdates[definition.envKey] = input.apiKey.trim();
  }
  if (typeof input.baseUrl === "string" && input.baseUrl.length > 4) patch.baseUrl = input.baseUrl.trim();
  if (typeof input.model === "string" && input.model.length > 0) patch.model = input.model.trim();
  if (typeof input.imageModel === "string" && input.imageModel.length > 0) patch.imageModel = input.imageModel.trim();
  if (typeof input.enabled === "boolean") patch.enabled = input.enabled;
  if (typeof input.freeOnly === "boolean") patch.freeOnly = input.freeOnly;
  if (input.active) {
    patch.active = true;
    patch.enabled = true;
    await db.update(llmProviders).set({ active: false }).where(eq(llmProviders.active, true));
  } else if (input.active === false && typeof input.enabled !== "boolean") {
    patch.active = false;
  }

  await db.insert(llmProviders).values({
    id: input.id,
    label: definition.label,
    baseUrl: definition.baseUrl,
    model: definition.textModels[0] ?? "",
    imageModel: definition.imageModels[0] ?? "",
    enabled: Boolean(input.enabled),
    active: Boolean(input.active),
    freeOnly: Boolean(input.freeOnly),
    supportsImage: definition.supportsImage,
  }).onConflictDoNothing();

  await db.update(llmProviders).set(patch).where(eq(llmProviders.id, input.id));

  if (Object.keys(envUpdates).length) {
    const states = await getProviderStates();
    const active = states.find((state) => state.active) ?? states[0];
    envUpdates.ACTIVE_LLM_PROVIDER = active?.id ?? input.id;
    await writeEnv(envUpdates);
  }
  return getProviderStates();
}

export async function resolveProvider(preferred?: string): Promise<ResolvedProvider | null> {
  const states = await getProviderStates();
  const wanted =
    states.find((state) => state.id === preferred && state.hasKey) ??
    states.find((state) => state.active && state.hasKey) ??
    states.find((state) => state.enabled && state.hasKey) ??
    states.find((state) => state.hasKey);
  if (!wanted) return null;
  const rows = await db.select().from(llmProviders).where(eq(llmProviders.id, wanted.id));
  const env = await readEnvFile();
  const apiKey = rows[0]?.apiKey || env[wanted.envKey] || process.env[wanted.envKey] || "";
  if (!apiKey) return null;
  const freeModels = wanted.freeModels;
  return {
    id: wanted.id,
    label: wanted.label,
    baseUrl: rows[0]?.baseUrl || wanted.baseUrl,
    model: wanted.freeOnly && freeModels.length ? freeModels[0] : rows[0]?.model || wanted.model,
    imageModel: rows[0]?.imageModel || wanted.imageModel,
    apiKey,
    envKey: wanted.envKey,
    freeOnly: wanted.freeOnly,
  };
}

export async function testProvider(id: ProviderId): Promise<{
  ok: boolean;
  message: string;
  latencyMs?: number;
  models?: number;
  freeOnly?: boolean;
}> {
  const definition = providerDefinitions.find((p) => p.id === id);
  if (!definition) return { ok: false, message: "Provedor desconhecido" };
  const states = await getProviderStates();
  const state = states.find((s) => s.id === id);
  const env = await readEnvFile();
  const key = env[definition.envKey] || process.env[definition.envKey] || "";
  const rows = await db.select().from(llmProviders).where(eq(llmProviders.id, id));
  const dbKey = rows[0]?.apiKey || "";
  const apiKey = dbKey || key;
  const started = Date.now();
  if (!apiKey) {
    const result = { ok: false, message: `Nenhuma API key salva para ${definition.envKey}. Adicione a chave para testar.` };
    await persistTest(id, result);
    return result;
  }
  const baseUrl = rows[0]?.baseUrl || definition.baseUrl;
  try {
    const isGeminiNative = id === "gemini" && baseUrl.includes("generativelanguage");
    const url = isGeminiNative
      ? `${baseUrl.replace(/\/v1beta\/openai\/?$/, "")}/v1beta/models?key=${encodeURIComponent(apiKey)}`
      : `${baseUrl.replace(/\/$/, "")}/models`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(12000),
    });
    const latencyMs = Date.now() - started;
    if (!response.ok) {
      const body = await response.text();
      const result = {
        ok: false,
        message: `HTTP ${response.status}: ${body.slice(0, 180)}`,
        latencyMs,
      };
      await persistTest(id, result);
      return result;
    }
    const json = (await response.json()) as { data?: unknown[]; models?: unknown[] };
    const models = json.data?.length ?? json.models?.length ?? 0;
    const result = {
      ok: true,
      message: `Conexão validada · ${models || "?"} modelos disponíveis${state?.freeOnly ? " · modo gratuito ativo" : ""}`,
      latencyMs,
      models,
    };
    await persistTest(id, result);
    return result;
  } catch (error) {
    const result = {
      ok: false,
      message: error instanceof Error ? error.message : "Falha desconhecida ao testar a API",
      latencyMs: Date.now() - started,
    };
    await persistTest(id, result);
    return result;
  }
}

async function persistTest(id: ProviderId, result: { ok: boolean; message: string; latencyMs?: number }) {
  await db
    .update(llmProviders)
    .set({ lastTest: { ...result, at: new Date().toISOString() } })
    .where(eq(llmProviders.id, id));
}

export async function getStudioSettings(): Promise<Record<string, unknown>> {
  const rows = await db.select().from(studioSettings);
  return rows.reduce<Record<string, unknown>>((acc, row) => ({ ...acc, [row.key]: row.value }), {});
}

export async function setStudioSetting(key: string, value: Record<string, unknown>): Promise<void> {
  await db
    .insert(studioSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: studioSettings.key, set: { value, updatedAt: new Date() } });
}

export function maskKey(key: string): string {
  if (!key) return "";
  return `${key.slice(0, 5)}…${key.slice(-4)}`;
}
