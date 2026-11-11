export type CategoryId =
  | "ecommerce"
  | "tech-portfolio"
  | "jewelry"
  | "womens-accessories"
  | "watches"
  | "mens-accessories"
  | "kids"
  | "beauty"
  | "scroll-craft";

export type ProviderId = "openrouter" | "gemini" | "openai" | "9router" | "omniroute";

export type PreviewVariant = "editorial" | "grid" | "split" | "brutalist" | "soft" | "kinetic";

export type SkillLevel = "core" | "advanced" | "signature";

export interface Palette {
  bg: string;
  surface: string;
  ink: string;
  accent: string;
  accent2: string;
  line: string;
}

export interface Principle {
  title: string;
  detail: string;
}

export interface Skill {
  id: string;
  designSystemId: string;
  categoryId: CategoryId;
  name: string;
  level: SkillLevel;
  summary: string;
  outputs: string[];
  tags: string[];
}

export type SkillRecord = Skill;

export interface DesignSystem {
  id: string;
  categoryId: CategoryId;
  name: string;
  kind: "library" | "benchmark" | "patterns";
  source: string;
  tagline: string;
  description: string;
  tags: string[];
  stack: string[];
  palette: Palette;
  fonts: { display: string; heading: string; body: string };
  principles: Principle[];
  preview: { hero: string; sub: string; cta: string; badge: string };
  variant: PreviewVariant;
  radius: number;
  rating: number;
  skills: Skill[];
}

export interface StackRecommendation {
  primary: string;
  core: string[];
  ui: string[];
  data: string[];
  motion: string[];
  rationale: string;
  alternatives: string[];
}

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  description: string;
  accent: string;
  keywords: string[];
  stack: StackRecommendation;
  designSystems: DesignSystem[];
}

export interface McpServer {
  id: string;
  name: string;
  vendor: string;
  category: string;
  transport: string;
  endpoint: string;
  install: string;
  description: string;
  envKeys: string[];
  featured: boolean;
  docs: string;
}

export interface LlmProviderDefinition {
  id: ProviderId;
  label: string;
  baseUrl: string;
  envKey: string;
  docs: string;
  freeTier: boolean;
  supportsImage: boolean;
  textModels: string[];
  imageModels: string[];
  freeModels: string[];
  notes: string;
}

export interface ProviderState {
  id: ProviderId;
  label: string;
  baseUrl: string;
  model: string;
  imageModel: string;
  enabled: boolean;
  active: boolean;
  freeOnly: boolean;
  supportsImage: boolean;
  hasKey: boolean;
  keyPreview: string;
  envKey: string;
  freeModels: string[];
  textModels: string[];
  imageModels: string[];
  docs: string;
  lastTest: { ok: boolean; message: string; at: string; latencyMs?: number } | null;
}

export interface RagHit {
  id: string;
  kind: string;
  refId: string;
  title: string;
  content: string;
  categoryId: string;
  score: number;
}

export interface AgentAction {
  type: "apply-design-system" | "open-panel" | "generate" | "create-form";
  label: string;
  payload: Record<string, unknown>;
}

export interface AgentResponse {
  message: string;
  provider: string;
  model: string;
  categoryId?: CategoryId;
  designSystemIds: string[];
  skills: { name: string; summary: string }[];
  stack?: StackRecommendation;
  mcp: string[];
  actions: AgentAction[];
  citations: RagHit[];
  trace: string[];
  offline: boolean;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  meta?: Partial<AgentResponse>;
  createdAt?: string;
}

export interface MotionScene {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  duration: number;
  transition: "fade" | "slide" | "scale" | "wipe";
  accent: string;
  bg: string;
}

export interface GenerationPayload {
  kind: "image" | "animation" | "video" | "copy" | "loading";
  title: string;
  summary: string;
  imageUrl?: string;
  imageMime?: string;
  scenes?: MotionScene[];
  fps?: number;
  remotionCode?: string;
  copy?: { headline: string; sub: string; cta: string; bullets: string[] };
  storyboard?: { shot: string; action: string; seconds: number }[];
  prompt: string;
  offline: boolean;
}

export interface RepoEndpoint {
  method: string;
  path: string;
  handler: string;
  source: string;
  auth: boolean;
}

export interface RepoForm {
  name: string;
  method: string;
  path: string;
  fields: FormField[];
}

export interface RepoAnalysis {
  repo: string;
  mode: "github" | "paste" | "demo";
  stack: string[];
  endpoints: RepoEndpoint[];
  dbHints: string[];
  components: string[];
  designTokens: { colors: string[]; fonts: string[] };
  forms: RepoForm[];
  blueprint: {
    designSystemId: string;
    stack: StackRecommendation;
    integration: string[];
    risks: string[];
  };
  filesScanned: number;
  notes: string;
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  dbColumn: string;
  dbType: string;
  validation: string;
}

export interface FormSpec {
  framework: string;
  recommendation: string;
  formId: string;
  title: string;
  description: string;
  fields: FormField[];
  endpoint: string;
  apiClient: string;
  drizzleTable: string;
  apiRoute: string;
  reactCode: string;
  score: { name: string; score: number; note: string }[];
}

export interface GenerateRequest {
  kind: GenerationPayload["kind"];
  prompt: string;
  designSystemId?: string;
  categoryId?: CategoryId;
  providerId?: ProviderId;
  model?: string;
  aspect?: "1:1" | "16:9" | "9:16" | "4:5";
}
