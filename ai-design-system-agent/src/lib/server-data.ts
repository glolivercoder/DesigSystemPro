import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { analyses, categories as categoriesTable, designSystems as designSystemsTable, formSpecs, generations, mcpServers as mcpTable, skills } from "@/db/schema";
import { categories, designSystems as catalogSystems } from "./catalog";
import { mcpServers as catalogMcp } from "./integrations-data";
import { ensureSeed } from "./rag";
import { getProviderStates, getStudioSettings } from "./settings";
import type { Category, DesignSystem, FormSpec, GenerationPayload, McpServer, ProviderState, RepoAnalysis } from "./types";

export interface StudioBootstrap {
  categories: Category[];
  designSystems: DesignSystem[];
  skillsCount: number;
  mcp: McpServer[];
  providers: ProviderState[];
  settings: Record<string, unknown>;
  history: { id: string; kind: string; prompt: string; provider: string; payload: GenerationPayload; createdAt: string }[];
  analyses: { id: string; repo: string; mode: string; summary: RepoAnalysis; createdAt: string }[];
  forms: { id: string; name: string; framework: string; endpoint: string; spec: FormSpec; createdAt: string }[];
  stats: { designSystems: number; skills: number; mcps: number; categories: number; ragDocs: number };
}

export async function loadStudio(): Promise<StudioBootstrap> {
  let dbAvailable = true;
  try {
    await ensureSeed();
  } catch {
    dbAvailable = false;
  }

  if (dbAvailable) {
    try {
      const [categoryRows, systemRows, skillRows, mcpRows] = await Promise.all([
        db.select().from(categoriesTable).orderBy(asc(categoriesTable.sortOrder)),
        db.select().from(designSystemsTable).orderBy(asc(designSystemsTable.sortOrder)),
        db.select({ id: skills.id }).from(skills),
        db.select().from(mcpTable).orderBy(asc(mcpTable.sortOrder)),
      ]);
      if (categoryRows.length && systemRows.length) {
        const systemMap = new Map<string, DesignSystem>();
        for (const row of systemRows) {
          const base = catalogSystems.find((system) => system.id === row.id);
          if (!base) continue;
          systemMap.set(row.id, {
            ...base,
            name: row.name,
            kind: (row.kind as DesignSystem["kind"]) ?? base.kind,
            source: row.source,
            tagline: row.tagline,
            description: row.description,
            tags: row.tags.length ? row.tags : base.tags,
            stack: row.stack.length ? row.stack : base.stack,
            rating: Number(row.rating),
          });
        }
        const cats: Category[] = categoryRows.map((row) => {
          const fallback = categories.find((category) => category.id === row.id);
          return {
            id: row.id as Category["id"],
            name: row.name,
            short: row.short,
            description: row.description,
            accent: row.accent,
            keywords: row.keywords ?? [],
            stack: row.stack ?? fallback?.stack,
            designSystems: (fallback?.designSystems ?? [])
              .map((system) => systemMap.get(system.id))
              .filter((system): system is DesignSystem => Boolean(system)),
          } as Category;
        });

        const [providers, settings, generationRows, analysisRows, formRows] = await Promise.all([
          getProviderStates(),
          getStudioSettings(),
          db.select().from(generations).orderBy(desc(generations.createdAt)).limit(10),
          db.select().from(analyses).orderBy(desc(analyses.createdAt)).limit(6),
          db.select().from(formSpecs).orderBy(desc(formSpecs.createdAt)).limit(6),
        ]);

        return {
          categories: cats,
          designSystems: cats.flatMap((category) => category.designSystems),
          skillsCount: skillRows.length,
          mcp: mcpRows.length
            ? mcpRows.map((row) => ({
                id: row.id,
                name: row.name,
                vendor: row.vendor,
                category: row.category,
                transport: row.transport,
                endpoint: row.endpoint,
                install: row.install,
                description: row.description,
                envKeys: row.envKeys,
                featured: row.featured,
                docs: row.docs,
              }))
            : catalogMcp,
          providers,
          settings,
          history: generationRows.map((row) => ({
            id: row.id,
            kind: row.kind,
            prompt: row.prompt,
            provider: row.provider,
            payload: row.payload,
            createdAt: row.createdAt.toISOString(),
          })),
          analyses: analysisRows.map((row) => ({
            id: row.id,
            repo: row.summary.repo,
            mode: row.mode,
            summary: row.summary,
            createdAt: row.createdAt.toISOString(),
          })),
          forms: formRows.map((row) => ({
            id: row.id,
            name: row.name,
            framework: row.framework,
            endpoint: row.endpoint,
            spec: row.spec,
            createdAt: row.createdAt.toISOString(),
          })),
          stats: {
            designSystems: cats.flatMap((category) => category.designSystems).length,
            skills: skillRows.length,
            mcps: mcpRows.length,
            categories: cats.length,
            ragDocs: skillRows.length + cats.length + mcpRows.length,
          },
        };
      }
    } catch {
      dbAvailable = false;
    }
  }

  return {
    categories,
    designSystems: catalogSystems,
    skillsCount: categories.flatMap((category) => category.designSystems).reduce((acc, system) => acc + system.skills.length, 0),
    mcp: catalogMcp,
    providers: [],
    settings: {},
    history: [],
    analyses: [],
    forms: [],
    stats: {
      designSystems: catalogSystems.length,
      skills: categories.flatMap((category) => category.designSystems).reduce((acc, system) => acc + system.skills.length, 0),
      mcps: catalogMcp.length,
      categories: categories.length,
      ragDocs: catalogSystems.length * 2 + catalogMcp.length,
    },
  };
}
