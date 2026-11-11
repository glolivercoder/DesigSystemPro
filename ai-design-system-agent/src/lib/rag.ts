import { sql } from "drizzle-orm";
import { db } from "@/db";
import { categories as categoriesTable, designSystems, llmProviders, mcpServers, ragChunks, skills } from "@/db/schema";
import { categories, designSystems as catalogSystems, allSkills } from "./catalog";
import { globalSkillLibrary, mcpServers as mcpData, providerDefinitions } from "./integrations-data";
import type { RagHit } from "./types";

const DIM = 192;
const globalCache = globalThis as typeof globalThis & {
  __studioRag?: { chunks: { id: string; kind: string; refId: string; categoryId: string; title: string; content: string; embedding: number[] }[] } | null;
  __studioSeed?: Promise<void> | null;
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hash(token: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < token.length; i += 1) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % DIM;
}

/** Deterministic bag-of-ngrams embedding — no external model, no docker, runs in-process. */
export function embed(text: string): number[] {
  const vector = new Array<number>(DIM).fill(0);
  const tokens = normalize(text)
    .replace(/[^a-z0-9\s+/.-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
  for (const token of tokens) {
    vector[hash(token, 17)] += 1;
    if (token.length > 4) {
      for (let i = 0; i < token.length - 2; i += 1) {
        vector[hash(token.slice(i, i + 3), 31)] += 0.5;
      }
    }
  }
  let norm = 0;
  for (const value of vector) norm += value * value;
  norm = Math.sqrt(norm) || 1;
  return vector.map((v) => Number((v / norm).toFixed(5)));
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

interface Doc {
  id: string;
  kind: string;
  refId: string;
  categoryId: string;
  title: string;
  content: string;
  tags: string[];
}

function buildDocs(): Doc[] {
  const docs: Doc[] = [];
  for (const category of categories) {
    docs.push({
      id: `cat-${category.id}`,
      kind: "category",
      refId: category.id,
      categoryId: category.id,
      title: `Categoria: ${category.name}`,
      content: `${category.name} (${category.short}). ${category.description} Stack recomendada: ${category.stack.primary}. Core: ${category.stack.core.join(", ")}. UI: ${category.stack.ui.join(", ")}. Dados: ${category.stack.data.join(", ")}. Motion: ${category.stack.motion.join(", ")}. Justificativa: ${category.stack.rationale}`,
      tags: category.keywords,
    });
    for (const system of category.designSystems) {
      docs.push({
        id: `ds-${system.id}`,
        kind: "design-system",
        refId: system.id,
        categoryId: category.id,
        title: `${system.name} · ${system.kind}`,
        content: `${system.name} (${system.source}) na categoria ${category.name}. ${system.tagline}. ${system.description} Tipo: ${system.kind}. Tags: ${system.tags.join(", ")}. Stack: ${system.stack.join(", ")}. Fontes: ${system.fonts.display} + ${system.fonts.body}. Cores: fundo ${system.palette.bg}, superfície ${system.palette.surface}, tinta ${system.palette.ink}, acento ${system.palette.accent}, secundário ${system.palette.accent2}. Princípios: ${system.principles.map((p) => `${p.title}: ${p.detail}`).join(" ")} Skills: ${system.skills.map((s) => s.name).join(", ")}.`,
        tags: [...system.tags, system.kind, ...system.stack],
      });
      for (const skill of system.skills) {
        docs.push({
          id: `skill-${skill.id}`,
          kind: "skill",
          refId: skill.id,
          categoryId: category.id,
          title: `${system.name} · ${skill.name}`,
          content: `Skill ${skill.name} (nível ${skill.level}) do design system ${system.name} para ${category.name}. ${skill.summary} Entregáveis: ${skill.outputs.join(", ")}. Tags: ${skill.tags.join(", ")}.`,
          tags: skill.tags,
        });
      }
    }
  }
  for (const mcp of mcpData) {
    docs.push({
      id: `mcp-${mcp.id}`,
      kind: "mcp",
      refId: mcp.id,
      categoryId: "",
      title: `MCP: ${mcp.name}`,
      content: `Servidor MCP ${mcp.name} da ${mcp.vendor}, categoria ${mcp.category}, transporte ${mcp.transport}. ${mcp.description} Instalação: ${mcp.install}. Endpoint: ${mcp.endpoint}. Variáveis: ${mcp.envKeys.join(", ") || "nenhuma"}.`,
      tags: [mcp.category, mcp.vendor, ...mcp.envKeys],
    });
  }
  for (const skill of globalSkillLibrary) {
    docs.push({
      id: `gskill-${skill.name}`,
      kind: "global-skill",
      refId: skill.name,
      categoryId: "",
      title: `Skill transversal: ${skill.name}`,
      content: `${skill.name}. ${skill.summary} Entregáveis: ${skill.outputs.join(", ")}.`,
      tags: skill.outputs,
    });
  }
  return docs;
}

export async function ensureSeed(): Promise<void> {
  if (!globalCache.__studioSeed) {
    globalCache.__studioSeed = (async () => {
      const existing = await db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable);
      const count = existing[0]?.count ?? 0;
      if (count === 0) {
        await db
          .insert(categoriesTable)
          .values(
            categories.map((category, index) => ({
              id: category.id,
              name: category.name,
              short: category.short,
              description: category.description,
              accent: category.accent,
              keywords: category.keywords,
              stack: category.stack,
              sortOrder: index,
            })),
          )
          .onConflictDoNothing();

        await db
          .insert(designSystems)
          .values(
            catalogSystems.map((system, index) => ({
              id: system.id,
              categoryId: system.categoryId,
              name: system.name,
              kind: system.kind,
              source: system.source,
              tagline: system.tagline,
              description: system.description,
              tags: system.tags,
              stack: system.stack,
              palette: system.palette,
              fonts: system.fonts,
              principles: system.principles,
              preview: system.preview,
              variant: system.variant,
              radius: system.radius,
              rating: String(system.rating),
              sortOrder: index,
            })),
          )
          .onConflictDoNothing();

        await db
          .insert(skills)
          .values(
            allSkills.map((skill) => ({
              id: skill.id,
              designSystemId: skill.designSystemId,
              categoryId: skill.categoryId,
              name: skill.name,
              level: skill.level,
              summary: skill.summary,
              outputs: skill.outputs,
              tags: skill.tags,
            })),
          )
          .onConflictDoNothing();

        await db
          .insert(mcpServers)
          .values(
            mcpData.map((mcp, index) => ({
              id: mcp.id,
              name: mcp.name,
              vendor: mcp.vendor,
              category: mcp.category,
              transport: mcp.transport,
              endpoint: mcp.endpoint,
              install: mcp.install,
              description: mcp.description,
              envKeys: mcp.envKeys,
              featured: mcp.featured,
              docs: mcp.docs,
              sortOrder: index,
            })),
          )
          .onConflictDoNothing();

        await db
          .insert(llmProviders)
          .values(
            providerDefinitions.map((provider, index) => ({
              id: provider.id,
              label: provider.label,
              baseUrl: provider.baseUrl,
              model: provider.textModels[0] ?? "",
              imageModel: provider.imageModels[0] ?? "",
              enabled: index === 0,
              active: index === 0,
              freeOnly: index === 0,
              supportsImage: provider.supportsImage,
            })),
          )
          .onConflictDoNothing();
      }

      const chunkCount = await db.select({ count: sql<number>`count(*)::int` }).from(ragChunks);
      if ((chunkCount[0]?.count ?? 0) === 0) {
        const docs = buildDocs();
        const values = docs.map((doc) => ({
          id: doc.id,
          kind: doc.kind,
          refId: doc.refId,
          categoryId: doc.categoryId,
          title: doc.title,
          content: doc.content,
          tags: doc.tags,
          embedding: embed(`${doc.title} ${doc.content} ${doc.tags.join(" ")}`),
        }));
        for (let i = 0; i < values.length; i += 120) {
          await db.insert(ragChunks).values(values.slice(i, i + 120)).onConflictDoNothing();
        }
      }
    })().catch((error) => {
      globalCache.__studioSeed = null;
      throw error;
    });
  }
  await globalCache.__studioSeed;
}

async function loadChunks() {
  if (globalCache.__studioRag?.chunks?.length) return globalCache.__studioRag.chunks;
  await ensureSeed();
  const rows = await db
    .select({
      id: ragChunks.id,
      kind: ragChunks.kind,
      refId: ragChunks.refId,
      categoryId: ragChunks.categoryId,
      title: ragChunks.title,
      content: ragChunks.content,
      embedding: ragChunks.embedding,
    })
    .from(ragChunks);
  const chunks = rows.map((row) => ({ ...row, embedding: row.embedding ?? [] }));
  globalCache.__studioRag = { chunks };
  return chunks;
}

export async function retrieve(
  query: string,
  options: { k?: number; categoryId?: string; kinds?: string[] } = {},
): Promise<RagHit[]> {
  const chunks = await loadChunks();
  const queryVector = embed(query);
  const categoriesInQuery = new Set(stringsToCategories(query));
  const scored = chunks
    .filter((chunk) => !options.kinds || options.kinds.includes(chunk.kind))
    .map((chunk) => {
      let score = cosine(queryVector, chunk.embedding);
      if (options.categoryId && chunk.categoryId === options.categoryId) score += 0.16;
      if (chunk.kind === "design-system") score += 0.05;
      if (chunk.kind === "mcp") score += 0.02;
      if (categoriesInQuery.has(chunk.categoryId)) score += 0.1;
      return {
        id: chunk.id,
        kind: chunk.kind,
        refId: chunk.refId,
        title: chunk.title,
        content: chunk.content,
        categoryId: chunk.categoryId,
        score: Number(score.toFixed(4)),
      };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, options.k ?? 8);
}

function stringsToCategories(query: string): string[] {
  const normalized = normalize(query);
  return categories
    .filter((category) => category.keywords.some((keyword) => normalized.includes(normalize(keyword))))
    .map((category) => category.id);
}

export function indexStats() {
  return { dimensions: DIM, algorithm: "hashed n-gram TF + cosine", docs: buildDocs().length };
}
