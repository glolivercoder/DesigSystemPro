import { desc } from "drizzle-orm";
import { db } from "@/db";
import { analyses as analysesTable, chatMessages } from "@/db/schema";
import { categories, detectCategory, getCategory, getDesignSystem } from "./catalog";
import { globalSkillLibrary, mcpServers } from "./integrations-data";
import { chatComplete, extractJson } from "./llm";
import { retrieve } from "./rag";
import { getStudioSettings } from "./settings";
import type { AgentAction, AgentResponse, CategoryId, ProviderId, RagHit, RepoAnalysis } from "./types";

interface AgentInput {
  message: string;
  sessionId?: string;
  categoryId?: CategoryId;
  designSystemId?: string;
  providerId?: ProviderId;
  history?: { role: "user" | "assistant"; content: string }[];
}

const stopwords = new Set([
  "de", "da", "do", "para", "com", "uma", "um", "o", "a", "e", "que", "em", "no", "na", "os", "as", "por", "meu", "minha",
]);

function pickMcp(message: string, categoryId: CategoryId): string[] {
  const lower = message.toLowerCase();
  const picks = new Set<string>(["shadcn-mcp", "context7", "21st-dev-magic"]);
  if (lower.includes("figma") || lower.includes("layout")) picks.add("figma-framelink");
  if (lower.includes("imagem") || lower.includes("animação") || lower.includes("video") || lower.includes("vídeo")) {
    picks.add("remotion-mcp");
    picks.add("playwright-mcp");
  }
  if (lower.includes("formul")) {
    picks.add("postgres-mcp");
    picks.add("supabase-mcp");
  }
  if (lower.includes("reposit") || lower.includes("código") || lower.includes("gitnexus")) picks.add("gitnexus");
  if (["ecommerce", "beauty", "watches"].includes(categoryId)) picks.add("playwright-mcp");
  if (["tech-portfolio"].includes(categoryId)) picks.add("magic-ui");
  return Array.from(picks)
    .map((id) => mcpServers.find((mcp) => mcp.id === id)?.name ?? id)
    .slice(0, 6);
}

function localPlan(input: AgentInput, categoryId: CategoryId, hits: RagHit[], repo?: RepoAnalysis | null): AgentResponse {
  const category = getCategory(categoryId);
  const designHits = hits.filter((hit) => hit.kind === "design-system");
  const skillHits = hits.filter((hit) => hit.kind === "skill");
  const candidates = category.designSystems;
  const ranked = designHits
    .map((hit) => candidates.find((system) => system.id === hit.refId))
    .filter((system): system is NonNullable<typeof system> => Boolean(system));
  const selected = ranked.length ? ranked.slice(0, 3) : candidates.slice(0, 3);
  const complementary = selected.flatMap((system) =>
    system.skills.map((skill) => ({ title: skill.name, content: skill.summary, refId: skill.id })),
  );
  const mergedSkills = [...skillHits, ...complementary].filter(
    (skill, index, list) => list.findIndex((item) => item.title === skill.title) === index,
  );
  const skills = mergedSkills
    .slice(0, 6)
    .map((skill) => ({ name: skill.title.replace(/^.*· /, ""), summary: skill.content.slice(0, 180) }));

  const lower = input.message.toLowerCase();
  const stack = category.stack;
  const lines: string[] = [];
  lines.push(`**Plano de UI/UX — ${category.name}**`);
  lines.push("");
  lines.push(
    `Identifiquei a categoria **${category.name}** e recuperei ${hits.length} trechos do índice local (design systems, skills e MCPs). Abaixo, o plano com o que aplicar direto no preview.`,
  );
  lines.push("");
  lines.push("**Design systems recomendados**");
  selected.forEach((system, index) => {
    lines.push(`${index + 1}. **${system.name}** (${system.kind}, ${system.source}) — ${system.tagline}. ${system.description}`);
  });
  lines.push("");
  lines.push("**Skills para carregar**");
  skills.forEach((skill) => {
    lines.push(`- **${skill.name}** — ${skill.summary}`);
  });
  lines.push("");
  lines.push("**Stack recomendada**");
  lines.push(`- Base: ${stack.primary}`);
  lines.push(`- Core: ${stack.core.join(" · ")}`);
  lines.push(`- UI: ${stack.ui.join(" · ")}`);
  lines.push(`- Dados: ${stack.data.join(" · ")}`);
  lines.push(`- Motion: ${stack.motion.join(" · ")}`);
  lines.push(`- Por quê: ${stack.rationale}`);
  lines.push("");
  lines.push("**Estrutura de página sugerida**");
  const structure: Record<CategoryId, string[]> = {
    ecommerce: ["Hero com oferta e busca", "Coleção com filtros e quick add", "PDP com variantes e estoque", "Carrinho lateral + checkout"],
    "tech-portfolio": ["Hero cinético com prova social", "Grid de cases com hover de vídeo", "Estudo de caso com scroll storytelling", "Contato com formulário"],
    jewelry: ["Hero editorial com peça única", "Coleção com zoom macro", "Ficha técnica e certificado", "Concierge e agendamento"],
    "womens-accessories": ["Hero de campanha", "Coleção com swatches", "Lookbook com hotspots", "Wishlist e carrinho"],
    watches: ["Hero técnico", "Catálogo com facetas", "Comparador de até 4 modelos", "Configurador e boutique"],
    "mens-accessories": ["Hero de utilidade", "Grid com diagramas de capacidade", "Comparador e garantia", "Checkout e reparo"],
    kids: ["Hero afetivo com seletor de idade", "Curadoria por faixa etária", "Ficha de segurança do material", "Lista de presentes"],
    beauty: ["Hero de campanha com tom", "Shade finder e swatches", "Rotina em 3 passos", "Carrinho com amostras"],
    "scroll-craft": [
      "Hero filmic com scrub de vídeo ou canvas 3D",
      "Pinned stage com desdobramento de peças internas (Exploded View)",
      "Macro zoom em materiais, acabamento e tolerâncias mecânicas",
      "Ficha técnica lateral e call to action de pré-venda",
    ],
  };
  lines.push(structure[categoryId].map((item) => `- ${item}`).join("\n"));
  lines.push("");
  lines.push("**MCPs sugeridos**");
  lines.push(pickMcp(input.message, categoryId).map((mcp) => `- ${mcp}`).join("\n"));
  if (repo) {
    lines.push("");
    lines.push("**Contexto do app analisado (GitNexus)**");
    lines.push(
      `- Repo: \`${repo.repo}\` (${repo.mode}) · ${repo.endpoints.length} endpoints · ${repo.dbHints.length} entidades de banco`,
    );
    lines.push(`- Stack detectada: ${repo.stack.slice(0, 6).join(", ") || "não detectada"}`);
    if (repo.forms[0]) {
      lines.push(
        `- Formulário sugerido: POST ${repo.forms[0].path} com ${repo.forms[0].fields.map((field) => field.name).join(", ")}`,
      );
    }
  }
  if (lower.includes("formul")) {
    lines.push("");
    lines.push("**Formulários**");
    lines.push("- Gero o spec com react-hook-form + zod, tabela Drizzle e route handler usando os endpoints detectados na aba GitNexus.");
  }
  if (lower.includes("imagem") || lower.includes("animação") || lower.includes("video") || lower.includes("vídeo")) {
    lines.push("");
    lines.push("**Mídia**");
    lines.push("- Posso gerar keyframes de imagem, composições Remotion e storyboards de vídeo na aba Gerações com a paleta deste design system.");
  }
  lines.push("");
  lines.push(
    "_Motor local de skills ativo (LangIndex RAG). Configure uma API key em Configurações para respostas geradas por LLM com imagem._",
  );

  const actions: AgentAction[] = [
    ...selected.slice(0, 2).map((system) => ({
      type: "apply-design-system" as const,
      label: `Aplicar ${system.name}`,
      payload: { designSystemId: system.id, categoryId },
    })),
    ...(lower.includes("formul") ? [{ type: "create-form" as const, label: "Gerar formulário integrado", payload: { categoryId } }] : []),
    ...(lower.includes("imagem") || lower.includes("animação") || lower.includes("vídeo")
      ? [{ type: "generate" as const, label: "Abrir gerações", payload: { prompt: input.message } }]
      : []),
  ];

  return {
    message: lines.join("\n"),
    provider: "Local Skills Engine",
    model: "langindex-rag × skills",
    categoryId,
    designSystemIds: selected.map((s) => s.id),
    skills,
    stack,
    mcp: pickMcp(input.message, categoryId),
    actions,
    citations: hits.slice(0, 6),
    trace: [
      `detect_category → ${categoryId}`,
      `langindex.retrieve(k=8) → ${hits.length} chunks`,
      `skills.filter → ${skills.length} skills`,
      "stack_advisor.resolve → ok",
      "fallback.local_plan → rendered",
    ],
    offline: true,
  };
}

export async function runAgent(input: AgentInput): Promise<AgentResponse> {
  const detected = detectCategory(input.message);
  const categoryId = detected ?? input.categoryId ?? "ecommerce";
  const category = getCategory(categoryId);
  const query = `${input.message} ${category.name} ${category.keywords.join(" ")}`;
  const [hits, settings] = await Promise.all([retrieve(query, { k: 10, categoryId }), getStudioSettings()]);
  let repoContext: RepoAnalysis | null = null;
  try {
    const recentAnalyses = await db.select().from(analysesTable).orderBy(desc(analysesTable.createdAt)).limit(1);
    repoContext = recentAnalyses[0]?.summary ?? null;
  } catch {
    repoContext = null;
  }

  const plan = localPlan(input, categoryId, hits, repoContext);
  const desiredDs = getDesignSystem(input.designSystemId ?? plan.designSystemIds[0] ?? "");
  const systemHint = input.designSystemId ? `O usuário está visualizando ${desiredDs.name}.` : "";

  const context = hits
    .slice(0, 8)
    .map((hit) => `### ${hit.title} [${hit.kind}]\n${hit.content}`)
    .join("\n\n");

  const mcpCatalog = mcpServers
    .map((mcp) => `${mcp.name} — ${mcp.category} — ${mcp.description}`)
    .join("\n");

  const system = [
    "Você é o Arquiteto UI/UX de um estúdio de design systems. Responde em português do Brasil, direto e técnico.",
    "Use exclusivamente o contexto recuperado para citar design systems e skills. Recomende stack (Vite/Next/Astro, Tailwind, shadcn) com justificativa curta.",
    "Considere integração com apps externos via API/MCP/GitNexus e geração de formulários ligados ao banco.",
    "Responda SEMPRE com JSON válido no formato:",
    '{"message":"markdown em pt-BR","categoryId":"ecommerce|tech-portfolio|jewelry|womens-accessories|watches|mens-accessories|kids|beauty","designSystemIds":["id"],"skills":[{"name":"","summary":""}],"mcp":["nome"],"reasoning":["passo"]}',
    "Escolha no máximo 3 designSystemIds existentes na categoria detectada.",
  ].join("\n");

  const user = [
    `Pedido: ${input.message}`,
    `Categoria sugerida pelo classificador: ${categoryId} (${category.name}).`,
    systemHint,
    `Design systems disponíveis nessa categoria: ${category.designSystems.map((s) => `${s.id} = ${s.name}`).join("; ")}`,
    `MCPs disponíveis:\n${mcpCatalog}`,
    repoContext
      ? `Contexto do repositório analisado pelo GitNexus (${repoContext.repo}): ${repoContext.endpoints.length} endpoints, schema ${repoContext.dbHints.join(", ")}, formulários ${repoContext.forms.map((form) => form.path).join(", ")}.`
      : "Nenhuma análise GitNexus disponível.",
    `Contexto RAG:\n${context}`,
    `Modo de LLM gratuitas: ${settings.freeOnly ? "ativado" : "desativado"}.`,
  ].join("\n\n");

  const result = await chatComplete({
    system,
    user,
    providerId: input.providerId,
    temperature: 0.35,
  });

  let response: AgentResponse = plan;
  if (!result.offline) {
    const parsed = extractJson<{
      message?: string;
      categoryId?: string;
      designSystemIds?: string[];
      skills?: { name: string; summary: string }[];
      mcp?: string[];
      reasoning?: string[];
    }>(result.text);
    const llmCategory = (parsed?.categoryId && categories.some((c) => c.id === parsed.categoryId)
      ? parsed.categoryId
      : categoryId) as CategoryId;
    const llmSystems = (parsed?.designSystemIds ?? [])
      .map((id) => getCategory(llmCategory).designSystems.find((system) => system.id === id)?.id)
      .filter((id): id is string => Boolean(id));
    response = {
      message: parsed?.message ?? result.text,
      provider: result.provider,
      model: result.model,
      categoryId: llmCategory,
      designSystemIds: llmSystems.length ? llmSystems : plan.designSystemIds,
      skills: parsed?.skills?.length ? parsed.skills : plan.skills,
      stack: getCategory(llmCategory).stack,
      mcp: parsed?.mcp?.length ? parsed.mcp : plan.mcp,
      actions: plan.actions.map((action) =>
        action.type === "apply-design-system"
          ? { ...action, payload: { ...action.payload, designSystemId: llmSystems[0] ?? action.payload.designSystemId, categoryId: llmCategory } }
          : action,
      ),
      citations: hits.slice(0, 6),
      trace: [
        `langchain.ChatOpenAI(${result.provider}/${result.model}) → ok`,
        `detect_category → ${llmCategory}`,
        `langindex.retrieve → ${hits.length} chunks`,
        "tool.plan → " + (parsed?.reasoning?.length ?? 0) + " passos",
      ],
      offline: false,
    };
  }

  try {
    const sessionId = input.sessionId ?? "default";
    await db.insert(chatMessages).values([
      { sessionId, role: "user", content: input.message, meta: { categoryId } },
      {
        sessionId,
        role: "assistant",
        content: response.message,
        meta: { provider: response.provider, designSystemIds: response.designSystemIds },
      },
    ]);
  } catch {
    // chat persistence is best-effort
  }

  if (result.error && result.offline) {
    response.trace.push(`llm.fallback → ${result.error}`);
  }
  return response;
}

export async function getAgentSkills(categoryId: CategoryId): Promise<string[]> {
  return globalSkillLibrary.map((skill) => skill.name);
}
