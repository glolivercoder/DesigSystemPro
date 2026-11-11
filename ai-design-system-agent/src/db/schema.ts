import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  ChatMessage,
  DesignSystem,
  FormField,
  FormSpec,
  GenerationPayload,
  Palette,
  Principle,
  RepoAnalysis,
  SkillRecord,
  StackRecommendation,
} from "@/lib/types";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  short: text("short").notNull(),
  description: text("description").notNull(),
  accent: text("accent").notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
  stack: jsonb("stack").$type<StackRecommendation>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const designSystems = pgTable("design_systems", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  source: text("source").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  stack: jsonb("stack").$type<string[]>().notNull().default([]),
  palette: jsonb("palette").$type<Palette>().notNull(),
  fonts: jsonb("fonts").$type<DesignSystem["fonts"]>().notNull(),
  principles: jsonb("principles").$type<Principle[]>().notNull().default([]),
  preview: jsonb("preview").$type<DesignSystem["preview"]>().notNull(),
  variant: text("variant").notNull().default("editorial"),
  radius: integer("radius").notNull().default(18),
  rating: numeric("rating").notNull().default("4.7"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  designSystemId: text("design_system_id").notNull(),
  categoryId: text("category_id").notNull(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  summary: text("summary").notNull(),
  outputs: jsonb("outputs").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
});

export const mcpServers = pgTable("mcp_servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  vendor: text("vendor").notNull(),
  category: text("category").notNull(),
  transport: text("transport").notNull(),
  endpoint: text("endpoint").notNull(),
  install: text("install").notNull(),
  description: text("description").notNull(),
  envKeys: jsonb("env_keys").$type<string[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  docs: text("docs").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const llmProviders = pgTable("llm_providers", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  apiKey: text("api_key").notNull().default(""),
  baseUrl: text("base_url").notNull(),
  model: text("model").notNull(),
  imageModel: text("image_model").notNull().default(""),
  enabled: boolean("enabled").notNull().default(false),
  active: boolean("active").notNull().default(false),
  freeOnly: boolean("free_only").notNull().default(false),
  supportsImage: boolean("supports_image").notNull().default(true),
  lastTest: jsonb("last_test").$type<{ ok: boolean; message: string; at: string; latencyMs?: number } | null>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studioSettings = pgTable("studio_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ragChunks = pgTable("rag_chunks", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  refId: text("ref_id").notNull(),
  categoryId: text("category_id").notNull().default(""),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  embedding: jsonb("embedding").$type<number[]>().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  categoryId: text("category_id").notNull(),
  designSystemId: text("design_system_id").notNull(),
  html: text("html").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const generations = pgTable("generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  prompt: text("prompt").notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull().default(""),
  status: text("status").notNull().default("ready"),
  designSystemId: text("design_system_id").notNull().default(""),
  payload: jsonb("payload").$type<GenerationPayload>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(),
  repoUrl: text("repo_url").notNull().default(""),
  mode: text("mode").notNull().default("heuristic"),
  summary: jsonb("summary").$type<RepoAnalysis>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const formSpecs = pgTable("form_specs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  categoryId: text("category_id").notNull().default("ecommerce"),
  designSystemId: text("design_system_id").notNull().default(""),
  analysisId: uuid("analysis_id"),
  framework: text("framework").notNull(),
  endpoint: text("endpoint").notNull().default(""),
  fields: jsonb("fields").$type<FormField[]>().notNull(),
  spec: jsonb("spec").$type<FormSpec>().notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DesignSystemRow = typeof designSystems.$inferSelect;
export type SkillRow = typeof skills.$inferSelect;
export type McpRow = typeof mcpServers.$inferSelect;
export type ProviderRow = typeof llmProviders.$inferSelect;
export type GenerationRow = typeof generations.$inferSelect;
export type AnalysisRow = typeof analyses.$inferSelect;
export type FormSpecRow = typeof formSpecs.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type ChatRow = typeof chatMessages.$inferSelect;
export type SkillRecordAlias = SkillRecord;
export type ChatMessageAlias = ChatMessage;
