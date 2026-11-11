import { db } from "@/db";
import { analyses } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCategory } from "./catalog";
import { retrieve } from "./rag";
import type { CategoryId, FormField, RepoAnalysis, RepoEndpoint } from "./types";

interface AnalyzeInput {
  repoUrl?: string;
  code?: string;
  pathHint?: string;
  categoryId?: CategoryId;
}

const interesting = (path: string) =>
  /(^|\/)(package\.json|README\.md|app\/api\/.*route\.(ts|js|tsx)|pages\/api\/.*\.(ts|js)|server\.(ts|js)|routes?\/.*\.(ts|js)|prisma\/schema\.prisma|schema\.(ts|prisma)|drizzle\/.*\.ts|tailwind\.config\.(ts|js)|globals\.css|openapi\.(yaml|json)|swagger\.(yaml|json)|migrations\/.*\.sql)$/i.test(
    path,
  );

function parseRepo(repoUrl: string): { owner: string; repo: string } | null {
  const cleaned = repoUrl.trim().replace(/\.git$/, "");
  const match = cleaned.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)/) ?? cleaned.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function nextRoutePath(file: string): string {
  if (file.startsWith("app/") || file.includes("/app/")) {
    const afterApp = file.slice(file.indexOf("app/") + 4);
    return `/${afterApp
      .replace(/\/route\.(ts|tsx|js)$/, "")
      .replace(/\/page\.(ts|tsx|js)$/, "")
      .replace(/\([^)]*\)\//g, "")
      .replace(/\[([^\]]+)\]/g, ":$1")}`.replace(/\/$/, "") || "/";
  }
  if (file.includes("pages/api/")) {
    return `/${file
      .slice(file.indexOf("pages/api/") + "pages/api/".length)
      .replace(/\.(ts|js)$/, "")
      .replace(/\/index$/, "")
      .replace(/\[([^\]]+)\]/g, ":$1")}`;
  }
  return file;
}

function extractEndpoints(files: { path: string; content: string }[]): RepoEndpoint[] {
  const endpoints: RepoEndpoint[] = [];
  for (const file of files) {
    const isNextRoute = /app\/.*route\.(ts|tsx|js)$/.test(file.path) || file.path.includes("pages/api/");
    if (isNextRoute) {
      const methods = Array.from(file.content.matchAll(/export\s+(?:async\s+)?(?:function\s+|const\s+)(GET|POST|PUT|PATCH|DELETE)/g)).map((m) => m[1]);
      const list = methods.length ? methods : ["ALL"];
      for (const method of list) {
        endpoints.push({
          method,
          path: nextRoutePath(file.path),
          handler: file.path.split("/").pop() ?? file.path,
          source: file.path,
          auth: /getServerSession|auth\(\)|requireAuth|currentUser|bearer/i.test(file.content),
        });
      }
      continue;
    }
    const express = Array.from(
      file.content.matchAll(/(?:app|router)\.(get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]/g),
    ).map((m) => ({ method: m[1].toUpperCase(), path: m[2] }));
    const fastapi = Array.from(
      file.content.matchAll(/@(?:app|router)\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g),
    ).map((m) => ({ method: m[1].toUpperCase(), path: m[2] }));
    for (const route of [...express, ...fastapi]) {
      endpoints.push({
        method: route.method,
        path: route.path,
        handler: file.path.split("/").pop() ?? file.path,
        source: file.path,
        auth: /auth|jwt|passport|Depends\(get_current_user/i.test(file.content),
      });
    }
  }
  const seen = new Set<string>();
  return endpoints.filter((endpoint) => {
    const key = `${endpoint.method} ${endpoint.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractFields(content: string): FormField[] {
  const fields: FormField[] = [];
  const zodMatches = Array.from(content.matchAll(/(\w+)\s*:\s*z\.(string|number|boolean|email|enum|array)\(/g));
  for (const match of zodMatches.slice(0, 10)) {
    const name = match[1];
    const type = match[2];
    fields.push({
      name,
      label: name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      type: type === "number" ? "number" : type === "boolean" ? "checkbox" : type === "email" ? "email" : "text",
      required: true,
      dbColumn: name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase(),
      dbType: type === "number" ? "integer" : type === "boolean" ? "boolean" : "text",
      validation: `z.${type}()`,
    });
  }
  const prismaMatches = Array.from(content.matchAll(/^\s{2}(\w+)\s+(String|Int|Float|Boolean|DateTime)/gm));
  for (const match of prismaMatches) {
    const name = match[1];
    if (["id", "createdAt", "updatedAt"].includes(name)) continue;
    if (fields.some((field) => field.name === name)) continue;
    fields.push({
      name,
      label: name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      type: match[2] === "Int" || match[2] === "Float" ? "number" : match[2] === "Boolean" ? "checkbox" : "text",
      required: true,
      dbColumn: name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase(),
      dbType: match[2] === "Int" ? "integer" : match[2] === "Boolean" ? "boolean" : match[2] === "DateTime" ? "timestamp" : "text",
      validation: match[2] === "Int" ? "z.number().int()" : "z.string().min(2)",
    });
  }
  return fields.slice(0, 10);
}

function demoAnalysis(code: string, note: string): { files: { path: string; content: string }[]; repo: string; mode: "paste" | "demo" } {
  if (code && code.trim().length > 20) {
    return { repo: "código colado", mode: "paste", files: [{ path: "app/api/leads/route.ts", content: code }] };
  }
  return {
    repo: "demo/storefront-next",
    mode: "demo",
    files: [
      {
        path: "package.json",
        content: JSON.stringify(
          {
            dependencies: {
              next: "^16",
              react: "^19",
              tailwindcss: "^4",
              "@prisma/client": "^6",
              zod: "^4",
              "react-hook-form": "^7",
              stripe: "^17",
            },
          },
          null,
          2,
        ),
      },
      {
        path: "prisma/schema.prisma",
        content: `model Order {\n  id String @id\n  email String\n  name String\n  total Int\n  status String\n  createdAt DateTime\n}\n\nmodel Lead {\n  id String @id\n  fullName String\n  email String\n  phone String\n  message String\n}`,
      },
      {
        path: "app/api/checkout/route.ts",
        content: `import { z } from "zod";
const schema = z.object({ email: z.string().email(), name: z.string(), address: z.string(), total: z.number() });
export async function POST(request: Request) {
  const body = await request.json();
  const data = schema.parse(body);
  return Response.json({ ok: true, data });
}`,
      },
      {
        path: "app/api/leads/route.ts",
        content: `import { z } from "zod";
const lead = z.object({ fullName: z.string(), email: z.string().email(), phone: z.string(), message: z.string() });
export async function POST(request: Request) {
  const data = lead.parse(await request.json());
  return Response.json({ ok: Boolean(data.email) });
}`,
      },
      {
        path: "app/api/products/route.ts",
        content: `export async function GET() { return Response.json({ products: [] }); }`,
      },
      {
        path: "tailwind.config.ts",
        content: `export default { theme: { extend: { colors: { ink: "#141414", sand: "#efe7db", coral: "#ff5a36", sage: "#7a8f7a" }, fontFamily: { display: ["Fraunces", "serif"], sans: ["Inter", "sans-serif"] } } } };`,
      },
    ],
  };
}

export async function runAnalysis(input: AnalyzeInput): Promise<RepoAnalysis> {
  const parsed = input.repoUrl ? parseRepo(input.repoUrl) : null;
  let files: { path: string; content: string }[] = [];
  let repo = parsed ? `${parsed.owner}/${parsed.repo}` : input.repoUrl ?? "código colado";
  let mode: RepoAnalysis["mode"] = "demo";
  let note = "";

  if (parsed) {
    try {
      const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "design-studio-gitnexus" };
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      const repoResponse = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
        headers,
        signal: AbortSignal.timeout(10000),
      });
      if (repoResponse.ok) {
        const repoJson = (await repoResponse.json()) as { default_branch?: string; description?: string };
        const branch = repoJson.default_branch ?? "main";
        const treeResponse = await fetch(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/trees/${branch}?recursive=1`,
          { headers, signal: AbortSignal.timeout(12000) },
        );
        if (treeResponse.ok) {
          const tree = (await treeResponse.json()) as { tree?: { path: string; type: string }[] };
          const candidates = (tree.tree ?? [])
            .filter((node) => node.type === "blob" && interesting(node.path))
            .map((node) => node.path)
            .slice(0, input.pathHint ? 60 : 28);
          for (const filePath of candidates) {
            const raw = await fetch(`https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/${filePath}`, {
              signal: AbortSignal.timeout(9000),
            });
            if (raw.ok) files.push({ path: filePath, content: (await raw.text()).slice(0, 24000) });
          }
          mode = "github";
          note = `Árvore lida em ${branch} · ${candidates.length} arquivos prioritários baixados de ${(tree.tree ?? []).length} nós.`;
        }
      }
      if (!files.length) {
        const fallback = demoAnalysis(input.code ?? "", "");
        files = fallback.files;
        mode = fallback.mode;
        note = "GitHub não respondeu (rate limit ou repo privado). Executando análise de demonstração com um storefront Next + Prisma.";
      }
    } catch {
      const fallback = demoAnalysis(input.code ?? "", "");
      files = fallback.files;
      mode = fallback.mode;
      note = "Sem acesso de rede ao GitHub. Análise de demonstração aplicada.";
    }
  } else {
    const fallback = demoAnalysis(input.code ?? "", "");
    files = fallback.files;
    repo = fallback.repo;
    mode = fallback.mode;
    note = input.code ? "Código colado analisado localmente por heurística." : "Repositório de demonstração (Next.js + Prisma + Stripe).";
  }

  const packageFile = files.find((file) => file.path.endsWith("package.json"));
  let deps: string[] = [];
  if (packageFile) {
    try {
      const json = JSON.parse(packageFile.content) as { dependencies?: Record<string, string> };
      deps = Object.keys(json.dependencies ?? {});
    } catch {
      deps = [];
    }
  }
  const stack = new Set<string>();
  for (const dep of deps) stack.add(dep);
  for (const file of files) {
    if (file.path.includes("route.ts")) stack.add("next-app-router");
    if (file.path.includes("tailwind")) stack.add("tailwindcss");
    if (file.content.includes("prisma")) stack.add("prisma");
    if (file.content.includes("drizzle")) stack.add("drizzle");
    if (file.content.includes("stripe")) stack.add("stripe");
    if (file.content.includes("fastapi") || file.path.endsWith(".py")) stack.add("fastapi");
    if (file.content.includes("@nestjs")) stack.add("nestjs");
  }

  const endpoints = extractEndpoints(files);
  const dbHints = Array.from(
    new Set(
      files.flatMap((file) => [
        ...Array.from(file.content.matchAll(/model\s+(\w+)\s*\{/g)).map((m) => `prisma model ${m[1]}`),
        ...Array.from(file.content.matchAll(/pgTable\(\s*["'](\w+)["']/g)).map((m) => `drizzle table ${m[1]}`),
        ...Array.from(file.content.matchAll(/create table\s+(?:if not exists\s+)?["']?(\w+)/gi)).map((m) => `sql table ${m[1]}`),
      ]),
    ),
  );

  const components = Array.from(
    new Set(
      files
        .filter((file) => /\.(tsx|jsx)$/.test(file.path))
        .map((file) => file.path.split("/").pop() ?? "")
        .filter(Boolean),
    ),
  ).slice(0, 12);

  const colors = Array.from(
    new Set(files.flatMap((file) => Array.from(file.content.matchAll(/#[0-9a-fA-F]{6}\b/g)).map((m) => m[0].toLowerCase()))),
  ).slice(0, 10);
  const fonts = Array.from(
    new Set(
      files.flatMap((file) =>
        Array.from(file.content.matchAll(/font-family:\s*([^;}\n]+)/g)).map((m) => m[1].trim().replace(/["']/g, "")),
      ),
    ),
  ).slice(0, 5);

  const formFiles = files.filter((file) => /form|schema\.prisma|checkout|lead/i.test(file.path) || /z\.object|model\s+\w+\s*\{/.test(file.content));
  const forms = (endpoints.filter((endpoint) => ["POST", "PUT", "PATCH"].includes(endpoint.method)).slice(0, 4)).map((endpoint) => {
    const relatedFile = formFiles.find((file) => file.path.includes(endpoint.path.split("/").filter(Boolean).pop() ?? "")) ?? formFiles[0];
    const fields = relatedFile ? extractFields(relatedFile.content) : [];
    return {
      name: `${endpoint.method} ${endpoint.path}`,
      method: endpoint.method,
      path: endpoint.path,
      fields: fields.length ? fields : defaultFields(input.categoryId),
    };
  });
  if (!forms.length) {
    forms.push({ name: "POST /api/leads", method: "POST", path: "/api/leads", fields: defaultFields(input.categoryId) });
  }

  const categoryId = input.categoryId ?? "ecommerce";
  const category = getCategory(categoryId);
  const hits = await retrieve(`${repo} ${[...stack].join(" ")} ${endpoints.map((e) => e.path).join(" ")} ${category.name}`, {
    k: 6,
    categoryId,
  });
  const designHit = hits.find((hit) => hit.kind === "design-system");

  const analysis: RepoAnalysis = {
    repo,
    mode,
    stack: Array.from(stack).slice(0, 16),
    endpoints: endpoints.slice(0, 24),
    dbHints: dbHints.slice(0, 12),
    components,
    designTokens: { colors, fonts },
    forms,
    blueprint: {
      designSystemId: designHit?.refId ?? category.designSystems[0]?.id ?? "ec-shadcn-commerce",
      stack: category.stack,
      integration: [
        `Cliente tipado para ${endpoints.length} endpoints detectados (${endpoints.filter((e) => e.auth).length} com auth).`,
        "Formulários gerados com react-hook-form + zod usando os schemas extraídos e as tabelas do banco.",
        "Mutations com TanStack Query e revalidação por tag no Next App Router.",
        "Contrato OpenAPI derivado dos handlers para validar o frontend contra o backend real.",
      ],
      risks: [
        endpoints.some((e) => e.auth)
          ? "Endpoints autenticados exigem sessão/CSRF no BFF — não chamar o backend direto do browser."
          : "Nenhum guard de auth detectado: valide autorização antes de expor mutations.",
        dbHints.length
          ? `Schema detectado (${dbHints.length} entidades): gere migrations antes de ligar os formulários.`
          : "Sem schema evidente: peça o arquivo de migrations para gerar campos fiéis.",
        "Rate limit do GitHub pode truncar a árvore; informe GITHUB_TOKEN para repositórios privados.",
      ],
    },
    filesScanned: files.length,
    notes: `${note} ${input.pathHint ? `Foco em ${input.pathHint}.` : ""}`.trim(),
  };

  try {
    await db.insert(analyses).values({
      source: mode,
      repoUrl: input.repoUrl ?? "",
      mode,
      summary: analysis,
    });
  } catch {
    // best effort
  }
  return analysis;
}

export function defaultFields(categoryId?: CategoryId): FormField[] {
  const base: FormField[] = [
    { name: "fullName", label: "Nome completo", type: "text", required: true, placeholder: "Ana Souza", dbColumn: "full_name", dbType: "text", validation: "z.string().min(2)" },
    { name: "email", label: "E-mail", type: "email", required: true, placeholder: "ana@email.com", dbColumn: "email", dbType: "text", validation: "z.string().email()" },
  ];
  const extras: Record<string, FormField[]> = {
    ecommerce: [
      { name: "phone", label: "Telefone", type: "tel", required: false, placeholder: "(11) 99999-0000", dbColumn: "phone", dbType: "text", validation: "z.string().min(10).optional()" },
      { name: "cep", label: "CEP", type: "text", required: true, placeholder: "01310-100", dbColumn: "postal_code", dbType: "text", validation: "z.string().regex(/^\\d{5}-?\\d{3}$/)" },
      { name: "cartId", label: "Carrinho", type: "hidden", required: true, dbColumn: "cart_id", dbType: "uuid", validation: "z.string().uuid()" },
    ],
    "tech-portfolio": [
      { name: "company", label: "Empresa", type: "text", required: false, placeholder: "Studio X", dbColumn: "company", dbType: "text", validation: "z.string().optional()" },
      { name: "budget", label: "Orçamento", type: "select", required: true, options: ["até 20k", "20k–50k", "50k+"], dbColumn: "budget", dbType: "text", validation: "z.enum(['até 20k','20k–50k','50k+'])" },
      { name: "message", label: "Projeto", type: "textarea", required: true, placeholder: "Conte o desafio", dbColumn: "message", dbType: "text", validation: "z.string().min(20)" },
    ],
    jewelry: [
      { name: "phone", label: "Telefone", type: "tel", required: true, placeholder: "(11) 99999-0000", dbColumn: "phone", dbType: "text", validation: "z.string().min(10)" },
      { name: "appointment", label: "Data preferida", type: "date", required: true, dbColumn: "appointment_at", dbType: "date", validation: "z.string().date()" },
      { name: "piece", label: "Peça de interesse", type: "select", required: false, options: ["Anéis", "Colares", "Brinco", "Alianças"], dbColumn: "piece", dbType: "text", validation: "z.string().optional()" },
    ],
    "womens-accessories": [
      { name: "phone", label: "Telefone", type: "tel", required: false, placeholder: "(11) 99999-0000", dbColumn: "phone", dbType: "text", validation: "z.string().min(10).optional()" },
      { name: "color", label: "Cor preferida", type: "select", required: false, options: ["Areia", "Preto", "Bordô", "Verde"], dbColumn: "color", dbType: "text", validation: "z.string().optional()" },
    ],
    watches: [
      { name: "reference", label: "Referência", type: "text", required: true, placeholder: "Meridian 38", dbColumn: "reference", dbType: "text", validation: "z.string().min(2)" },
      { name: "wristSize", label: "Pulso (mm)", type: "number", required: false, placeholder: "165", dbColumn: "wrist_size", dbType: "integer", validation: "z.number().int().optional()" },
    ],
    "mens-accessories": [
      { name: "orderId", label: "Pedido (garantia)", type: "text", required: true, placeholder: "#10293", dbColumn: "order_id", dbType: "text", validation: "z.string().min(4)" },
      { name: "issue", label: "Problema", type: "textarea", required: true, placeholder: "Descreva o defeito", dbColumn: "issue", dbType: "text", validation: "z.string().min(10)" },
    ],
    kids: [
      { name: "childAge", label: "Idade da criança", type: "select", required: true, options: ["0–12m", "1–2a", "3–5a", "6–8a"], dbColumn: "child_age", dbType: "text", validation: "z.enum(['0–12m','1–2a','3–5a','6–8a'])" },
      { name: "registryId", label: "Lista", type: "text", required: false, dbColumn: "registry_id", dbType: "text", validation: "z.string().optional()" },
    ],
    beauty: [
      { name: "shade", label: "Tom", type: "select", required: true, options: ["110", "220", "330", "440"], dbColumn: "shade", dbType: "text", validation: "z.enum(['110','220','330','440'])" },
      { name: "undertone", label: "Subtom", type: "select", required: false, options: ["quente", "frio", "neutro"], dbColumn: "undertone", dbType: "text", validation: "z.string().optional()" },
      { name: "consent", label: "Aceito política", type: "checkbox", required: true, dbColumn: "consent", dbType: "boolean", validation: "z.literal(true)" },
    ],
  };
  return [...base, ...(extras[categoryId ?? "ecommerce"] ?? extras.ecommerce)];
}

export async function listAnalyses(limit = 8) {
  const rows = await db.select().from(analyses).orderBy(desc(analyses.createdAt)).limit(limit);
  return rows;
}

export async function getAnalysis(id: string) {
  const rows = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1);
  return rows[0] ?? null;
}
