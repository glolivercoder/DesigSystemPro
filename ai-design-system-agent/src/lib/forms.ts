import { db } from "@/db";
import { formSpecs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getAnalysis, defaultFields } from "./analyze";
import { getCategory, getDesignSystem } from "./catalog";
import { formFrameworkScores } from "./integrations-data";
import type { CategoryId, FormField, FormSpec } from "./types";

export interface FormBuildInput {
  analysisId?: string;
  categoryId?: CategoryId;
  designSystemId?: string;
  framework?: string;
  goal?: string;
  endpoint?: string;
  extraPrompt?: string;
}

const goals: Record<string, { id: string; title: string; description: string; button: string }> = {
  checkout: { id: "checkout", title: "Checkout expresso", description: "Dados de contato, entrega e pagamento em uma etapa.", button: "Finalizar compra" },
  lead: { id: "lead", title: "Captura de lead", description: "Formulário de contato com validação e persistência.", button: "Enviar mensagem" },
  newsletter: { id: "newsletter", title: "Newsletter", description: "Assinatura com consentimento LGPD e double opt-in.", button: "Assinar" },
  appointment: { id: "appointment", title: "Agendamento concierge", description: "Reserva de atendimento com data e peça de interesse.", button: "Agendar" },
  warranty: { id: "warranty", title: "Acionar garantia", description: "Abertura de ticket vinculada ao pedido.", button: "Abrir solicitação" },
  registry: { id: "registry", title: "Lista de presentes", description: "Cadastro de lista com idade da criança.", button: "Criar lista" },
  shade: { id: "shade", title: "Encontrar meu tom", description: "Quiz de subtom com resultado persistido.", button: "Ver meu tom" },
  waitlist: { id: "waitlist", title: "Lista de espera", description: "Captura para reposição de estoque.", button: "Entrar na lista" },
};

const goalByCategory: Record<string, string> = {
  ecommerce: "checkout",
  "tech-portfolio": "lead",
  jewelry: "appointment",
  "womens-accessories": "waitlist",
  watches: "appointment",
  "mens-accessories": "warranty",
  kids: "registry",
  beauty: "shade",
  "scroll-craft": "lead",
};

function camel(name: string) {
  return name.replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase());
}

function fieldDefaults(field: FormField, palette: { bg: string; surface: string; ink: string; accent: string; line: string }) {
  return { ...field, palette };
}

function reactCode(fields: FormField[], spec: { formId: string; title: string; button: string; endpoint: string }, framework: string, palette: { surface: string; ink: string; accent: string; line: string }) {
  const schemaLines = fields.map((f) => `  ${f.name}: ${f.validation},`).join("\n");
  const defaults = fields
    .map((f) => `    ${f.name}: ${f.type === "checkbox" ? "false" : f.type === "number" ? "0" : '""'},`)
    .join("\n");
  const inputs = fields
    .map((field) => {
      const label = `        <label style={{ fontSize: 12, color: "${palette.ink}", opacity: 0.7 }} htmlFor="${field.name}">${field.label}${field.required ? " *" : ""}</label>`;
      if (field.type === "select") {
        return `      <div style={{ display: "grid", gap: 6 }}>
${label}
        <select id="${field.name}" {...register("${field.name}")} style={inputStyle}>
          <option value="">Selecione</option>
          ${(field.options ?? []).map((option) => `<option value="${option}">${option}</option>`).join("")}
        </select>
        {errors.${field.name} && <span style={errorStyle}>{errors.${field.name}?.message}</span>}
      </div>`;
      }
      if (field.type === "textarea") {
        return `      <div style={{ display: "grid", gap: 6 }}>
${label}
        <textarea id="${field.name}" rows={4} placeholder="${field.placeholder ?? ""}" {...register("${field.name}")} style={inputStyle} />
        {errors.${field.name} && <span style={errorStyle}>{errors.${field.name}?.message}</span>}
      </div>`;
      }
      if (field.type === "checkbox") {
        return `      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
        <input type="checkbox" {...register("${field.name}")} /> ${field.label}
      </label>`;
      }
      return `      <div style={{ display: "grid", gap: 6 }}>
${label}
        <input id="${field.name}" type="${field.type}" placeholder="${field.placeholder ?? ""}" {...register("${field.name}")} style={inputStyle} />
        {errors.${field.name} && <span style={errorStyle}>{errors.${field.name}?.message}</span>}
      </div>`;
    })
    .join("\n");

  const hookImport =
    framework === "TanStack Form"
      ? `import { useForm } from "@tanstack/react-form";`
      : framework === "Conform + zod"
        ? `import { useForm } from "@conform-to/react";\nimport { parseWithZod } from "@conform-to/zod";`
        : `import { useForm } from "react-hook-form";\nimport { zodResolver } from "@hookform/resolvers/zod";`;

  return `"use client";
${hookImport}
import { z } from "zod";
import { useState } from "react";
${framework === "react-hook-form + zod" ? `import { post${camel(spec.formId)} } from "@/lib/api";` : ""}

const schema = z.object({
${schemaLines}
});

type Values = z.infer<typeof schema>;

const inputStyle = {
  background: "${palette.surface}",
  border: "1px solid ${palette.line}",
  borderRadius: 10,
  padding: "11px 13px",
  fontSize: 14,
  color: "${palette.ink}",
  outlineColor: "${palette.accent}",
} as const;
const errorStyle = { color: "#c2410c", fontSize: 11 } as const;

export function ${camel(spec.formId).replace(/^./, (c) => c.toUpperCase())}() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: {
${defaults}
  } });

  async function onSubmit(values: Values) {
    setStatus("sending");
    try {
      const response = await fetch("${spec.endpoint}", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("request failed");
      setStatus("done");
      reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 16, maxWidth: 520, color: "${palette.ink}" }}>
      <header style={{ display: "grid", gap: 4 }}>
        <h2 style={{ fontSize: 24, margin: 0, letterSpacing: "-0.02em" }}>${spec.title}</h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.65 }}>Dados validados no cliente e no servidor com o mesmo schema zod.</p>
      </header>
${inputs}
      <button
        type="submit"
        disabled={status === "sending"}
        style={{ background: "${palette.accent}", color: "#fff", border: 0, padding: "13px 18px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}
      >
        \${status === "sending" ? "Enviando…" : "${spec.button}"}
      </button>
      {status === "done" && <span style={{ fontSize: 12 }}>Enviado com sucesso — registro criado no Postgres.</span>}
      {status === "error" && <span style={{ fontSize: 12, color: "#c2410c" }}>Falha ao enviar. Verifique o endpoint.</span>}
    </form>
  );
}
`;
}

function drizzleCode(table: string, fields: FormField[]) {
  const columns = fields
    .map((field) => {
      const colType =
        field.dbType === "integer"
          ? `integer("${field.dbColumn}")`
          : field.dbType === "boolean"
            ? `boolean("${field.dbColumn}")`
            : field.dbType === "date"
              ? `date("${field.dbColumn}")`
              : `text("${field.dbColumn}")`;
      return `  ${field.name}: ${colType}${field.required ? ".notNull()" : ""},`;
    })
    .join("\n");
  return `import { boolean, date, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const ${table} = pgTable("${table}", {
  id: uuid("id").defaultRandom().primaryKey(),
${columns}
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});`;
}

function apiRouteCode(table: string, schemaName: string, fields: FormField[], endpoint: string) {
  const schema = fields.map((field) => `  ${field.name}: ${field.validation},`).join("\n");
  const insert = fields.map((field) => `      ${field.name}: parsed.${field.name},`).join("\n");
  return `import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { ${table} } from "@/db/schema";

export const ${schemaName} = z.object({
${schema}
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ${schemaName}.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const [row] = await db
    .insert(${table})
    .values({
${insert}
    })
    .returning({ id: ${table}.id });
  return NextResponse.json({ ok: true, id: row?.id, endpoint: "${endpoint}" }, { status: 201 });
}`;
}

export function buildFormSpec(
  input: FormBuildInput,
  analysis?: Awaited<ReturnType<typeof getAnalysis>> | null,
) {
  const category = getCategory(input.categoryId ?? "ecommerce");
  const ds = getDesignSystem(input.designSystemId ?? analysis?.summary.blueprint.designSystemId ?? category.designSystems[0].id);
  const goalKey = input.goal ?? goalByCategory[category.id] ?? "lead";
  const goal = goals[goalKey] ?? goals.lead;
  const framework = input.framework ?? "react-hook-form + zod";
  const scorePath = (value: string) =>
    /lead|contact|checkout|order|form|newsletter|appointment|subscribe|wait|regist|quote|ticket|shade/i.test(value) ? 10 : 0;
  const candidates = analysis?.summary.forms ?? [];
  const detected =
    (input.endpoint ? candidates.find((form) => form.path === input.endpoint) : undefined) ??
    [...candidates].sort((a, b) => scorePath(b.path) - scorePath(a.path))[0];
  const extracted = (detected?.fields ?? []).filter((field) => !["id", "revalidate", "tag", "secret"].includes(field.name));
  const fields = (extracted.length >= 2 ? extracted : defaultFields(category.id)).slice(0, 9);
  const endpoint = input.endpoint ?? (detected && scorePath(detected.path) > 0 ? detected.path : `/api/${goal.id}`);
  const table = `${goal.id.replace(/-/g, "_")}_entries`;
  const formId = `${goal.id}-form`;
  const spec: FormSpec = {
    framework,
    recommendation:
      framework === "react-hook-form + zod"
        ? "Escolha recomendada: schema único zod compartilhado entre cliente e route handler, mínimo de re-renders e melhor integração com shadcn/ui."
        : framework === "TanStack Form"
          ? "Bom para formulários grandes e arrays dinâmicos; valide no servidor com o mesmo schema."
          : "Conform brilha com Server Actions e progressive enhancement.",
    formId,
    title: goal.title,
    description: goal.description,
    fields: fields.map((field) => fieldDefaults(field, ds.palette)),
    endpoint,
    apiClient: `export async function post${camel(formId)}<T extends Record<string, unknown>>(values: T) {\n  const response = await fetch("${endpoint}", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(values),\n  });\n  if (!response.ok) throw new Error(await response.text());\n  return response.json() as Promise<{ ok: boolean; id?: string }>;\n}`,
    drizzleTable: drizzleCode(table, fields),
    apiRoute: apiRouteCode(table, `${camel(formId)}Schema`, fields, endpoint),
    reactCode: reactCode(fields, { formId, title: goal.title, button: goal.button, endpoint }, framework, ds.palette),
    score: formFrameworkScores,
  };
  return spec;
}

export async function generateForm(input: FormBuildInput) {
  const analysis = input.analysisId ? await getAnalysis(input.analysisId) : null;
  const spec = buildFormSpec(input, analysis);
  const category = getCategory(input.categoryId ?? "ecommerce");
  let id: string | undefined;
  try {
    const [row] = await db
      .insert(formSpecs)
      .values({
        name: spec.title,
        categoryId: category.id,
        designSystemId: analysis?.summary.blueprint.designSystemId ?? input.designSystemId ?? category.designSystems[0].id,
        analysisId: analysis?.id ?? null,
        framework: spec.framework,
        endpoint: spec.endpoint,
        fields: spec.fields,
        spec,
        code: spec.reactCode,
      })
      .returning({ id: formSpecs.id });
    id = row?.id;
  } catch {
    // best effort
  }
  return { spec, id, analysisId: analysis?.id ?? null };
}

export async function listFormSpecs(limit = 10) {
  return db.select().from(formSpecs).orderBy(desc(formSpecs.createdAt)).limit(limit);
}

export const formGoals = Object.values(goals);
