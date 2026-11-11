"use client";

import { useEffect, useMemo, useState } from "react";
import { formFrameworkScores } from "@/lib/integrations-data";
import type { Category, DesignSystem, FormSpec, RepoAnalysis } from "@/lib/types";

interface FormRecord {
  id: string;
  name: string;
  framework: string;
  endpoint: string;
  spec: FormSpec;
  createdAt: string;
}

interface Props {
  categories: Category[];
  category: Category;
  designSystem: DesignSystem;
  analyses: { id: string; repo: string; mode: string; summary: RepoAnalysis; createdAt: string }[];
  initialForms: FormRecord[];
  pendingAnalysisId?: string;
  onFormsChange: (forms: FormRecord[]) => void;
  onNotify: (message: string) => void;
}

const GOALS = [
  { id: "checkout", label: "Checkout expresso" },
  { id: "lead", label: "Captura de lead" },
  { id: "appointment", label: "Agendamento concierge" },
  { id: "newsletter", label: "Newsletter" },
  { id: "warranty", label: "Acionar garantia" },
  { id: "registry", label: "Lista de presentes" },
  { id: "shade", label: "Encontrar meu tom" },
  { id: "waitlist", label: "Lista de espera" },
];

const FRAMEWORKS = ["react-hook-form + zod", "TanStack Form", "Conform + zod"];

export default function FormsPanel({ category, designSystem, analyses, initialForms, pendingAnalysisId, onFormsChange, onNotify }: Props) {
  const [goal, setGoal] = useState("checkout");
  const [framework, setFramework] = useState(FRAMEWORKS[0]);
  const [analysisId, setAnalysisId] = useState<string>(pendingAnalysisId ?? analyses[0]?.id ?? "");
  const [endpoint, setEndpoint] = useState("");
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState<FormRecord[]>(initialForms);
  const [spec, setSpec] = useState<FormSpec | null>(initialForms[0]?.spec ?? null);
  const [tab, setTab] = useState<"preview" | "react" | "drizzle" | "api" | "client">("preview");
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const analysis = useMemo(() => analyses.find((item) => item.id === analysisId), [analyses, analysisId]);
  const endpoints = analysis?.summary.forms ?? [];

  useEffect(() => {
    if (pendingAnalysisId) setAnalysisId(pendingAnalysisId);
  }, [pendingAnalysisId]);

  useEffect(() => {
    if (!spec) return;
    setValues(Object.fromEntries(spec.fields.map((field) => [field.name, field.type === "checkbox" ? false : ""])));
    setSubmitted(false);
  }, [spec]);

  async function generate() {
    setLoading(true);
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: analysisId || undefined,
          categoryId: category.id,
          designSystemId: designSystem.id,
          framework,
          goal,
          endpoint: endpoint || undefined,
        }),
      });
      const json = (await response.json()) as { spec?: FormSpec; id?: string; error?: string };
      if (!response.ok || !json.spec) {
        onNotify(json.error ?? "Falha ao gerar formulário");
        return;
      }
      setSpec(json.spec);
      setTab("preview");
      if (json.id) {
        const record: FormRecord = {
          id: json.id,
          name: json.spec.title,
          framework: json.spec.framework,
          endpoint: json.spec.endpoint,
          spec: json.spec,
          createdAt: new Date().toISOString(),
        };
        const next = [record, ...forms].slice(0, 10);
        setForms(next);
        onFormsChange(next);
      }
      onNotify("Formulário gerado com schema, tabela Drizzle e route handler");
    } catch {
      onNotify("Falha de rede ao gerar formulário");
    } finally {
      setLoading(false);
    }
  }

  const code = useMemo(() => {
    if (!spec) return "";
    if (tab === "react") return spec.reactCode;
    if (tab === "drizzle") return spec.drizzleTable;
    if (tab === "api") return spec.apiRoute;
    if (tab === "client") return spec.apiClient;
    return "";
  }, [spec, tab]);

  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span className="label">Formulários · schema único · banco integrado</span>
          <h1 className="display" style={{ fontSize: 32, margin: "6px 0 4px" }}>
            Gerador de formulários
          </h1>
          <p className="hint" style={{ maxWidth: 720 }}>
            Gera componente React, schema zod, tabela Drizzle e route handler a partir do mesmo modelo — já ligados aos endpoints detectados pelo
            GitNexus. Veredito: <strong style={{ color: "var(--ink)" }}>react-hook-form + zod</strong> é a melhor escolha para este tipo de app
            (menos re-renders, schema compartilhado cliente/servidor e integração nativa com shadcn/ui).
          </p>
        </div>
        <span className="badge badge-accent">{designSystem.name}</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 16 }}>
        <div style={{ display: "grid", gap: 14, alignContent: "start", minWidth: 0 }}>
          <div className="panel" style={{ padding: 14, display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span className="label">Objetivo</span>
                <select className="select" value={goal} onChange={(event) => setGoal(event.target.value)}>
                  {GOALS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span className="label">Gerador</span>
                <select className="select" value={framework} onChange={(event) => setFramework(event.target.value)}>
                  {FRAMEWORKS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span className="label">Análise do app</span>
                <select className="select" value={analysisId} onChange={(event) => setAnalysisId(event.target.value)}>
                  <option value="">Sem análise (campos padrão)</option>
                  {analyses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.repo} · {item.mode}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span className="label">Endpoint alvo</span>
                <select className="select" value={endpoint} onChange={(event) => setEndpoint(event.target.value)}>
                  <option value="">Detectar automaticamente</option>
                  {endpoints.map((item) => (
                    <option key={`${item.method}-${item.path}`} value={item.path}>
                      {item.method} {item.path}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="hint" style={{ fontSize: 10.5 }}>
                {analysis
                  ? `${analysis.summary.forms.length} formulários detectados em ${analysis.repo} · ${analysis.summary.dbHints.length} entidades de banco`
                  : "Sem análise: campos padrão por categoria e endpoint /api/<goal>."}
              </span>
              <button type="button" className="btn btn-primary" onClick={generate} disabled={loading}>
                {loading ? "Gerando…" : "Gerar formulário integrado"}
              </button>
            </div>
          </div>

          {spec && (
            <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
              <div className="toolstrip">
                {(["preview", "react", "drizzle", "api", "client"] as const).map((item) => (
                  <button key={item} type="button" className={`btn btn-sm ${tab === item ? "btn-primary" : ""}`} onClick={() => setTab(item)}>
                    {item === "preview" ? "preview" : item === "react" ? "componente" : item === "drizzle" ? "tabela" : item === "api" ? "route handler" : "api client"}
                  </button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="badge">{spec.framework}</span>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(tab === "preview" ? spec.reactCode : code);
                      onNotify("Código copiado");
                    }}
                  >
                    copiar
                  </button>
                </div>
              </div>

              {tab === "preview" ? (
                <div style={{ padding: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
                    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
                      <div style={{ padding: 18, background: designSystem.palette.surface, color: designSystem.palette.ink }}>
                        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, margin: 0 }}>{spec.title}</h2>
                        <p style={{ fontSize: 11.5, opacity: 0.65, margin: "6px 0 14px" }}>{spec.description}</p>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            setSubmitted(true);
                            onNotify(`Payload validado (${spec.framework}) e enviado para ${spec.endpoint}`);
                          }}
                          style={{ display: "grid", gap: 10 }}
                        >
                          {spec.fields.map((field) => (
                            <label key={field.name} style={{ display: "grid", gap: 4 }}>
                              <span style={{ fontSize: 10.5, opacity: 0.7 }}>
                                {field.label} {field.required ? "*" : ""}
                              </span>
                              {field.type === "select" ? (
                                <select
                                  value={String(values[field.name] ?? "")}
                                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                                  required={field.required}
                                  style={{
                                    border: `1px solid ${designSystem.palette.line}`,
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                    fontSize: 12,
                                    background: "#fff",
                                    color: designSystem.palette.ink,
                                  }}
                                >
                                  <option value="">Selecione</option>
                                  {(field.options ?? []).map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : field.type === "textarea" ? (
                                <textarea
                                  rows={2}
                                  placeholder={field.placeholder ?? ""}
                                  value={String(values[field.name] ?? "")}
                                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                                  required={field.required}
                                  style={{
                                    border: `1px solid ${designSystem.palette.line}`,
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                    fontSize: 12,
                                    background: "#fff",
                                    color: designSystem.palette.ink,
                                  }}
                                />
                              ) : field.type === "checkbox" ? (
                                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5 }}>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(values[field.name])}
                                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                                    required={field.required}
                                  />
                                  {field.label}
                                </span>
                              ) : (
                                <input
                                  type={field.type === "hidden" ? "text" : field.type}
                                  placeholder={field.placeholder ?? ""}
                                  value={String(values[field.name] ?? "")}
                                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                                  required={field.required}
                                  style={{
                                    border: `1px solid ${designSystem.palette.line}`,
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                    fontSize: 12,
                                    background: "#fff",
                                    color: designSystem.palette.ink,
                                  }}
                                />
                              )}
                              <span style={{ fontSize: 9, opacity: 0.45 }} className="mono">
                                {field.dbColumn} · {field.dbType} · {field.validation}
                              </span>
                            </label>
                          ))}
                          <button
                            type="submit"
                            style={{
                              background: designSystem.palette.accent,
                              color: designSystem.palette.bg,
                              border: 0,
                              borderRadius: 8,
                              padding: "10px 14px",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              marginTop: 4,
                            }}
                          >
                            {spec.title}
                          </button>
                          {submitted && (
                            <span style={{ fontSize: 10.5, color: "#2f6b3a" }}>✓ POST {spec.endpoint} → tabela Drizzle criada</span>
                          )}
                        </form>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
                      <div className="panel-soft" style={{ padding: 11 }}>
                        <span className="label">Mapeamento banco ↔ frontend</span>
                        <table className="table" style={{ marginTop: 6 }}>
                          <thead>
                            <tr>
                              <th>campo</th>
                              <th>coluna</th>
                              <th>tipo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {spec.fields.map((field) => (
                              <tr key={field.name}>
                                <td>{field.name}</td>
                                <td className="mono">{field.dbColumn}</td>
                                <td className="mono">{field.dbType}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="panel-soft" style={{ padding: 11 }}>
                        <span className="label">Endpoint</span>
                        <div className="mono" style={{ fontSize: 11, marginTop: 4, color: "var(--accent)" }}>
                          POST {spec.endpoint}
                        </div>
                        <p className="hint" style={{ fontSize: 10, marginTop: 5 }}>
                          {spec.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <pre className="codeblock" style={{ margin: 0, border: 0, borderRadius: 0, maxHeight: 520 }}>
                  {code}
                </pre>
              )}
            </div>
          )}
        </div>

        <aside style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <div className="panel" style={{ padding: 13 }}>
            <span className="label">Ranking de geradores</span>
            <div style={{ display: "grid", gap: 8, marginTop: 9 }}>
              {formFrameworkScores.map((item) => (
                <div key={item.name} style={{ display: "grid", gap: 3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: item.name.startsWith("react-hook-form") ? "var(--accent)" : "var(--ink)" }}>{item.name}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
                      {item.score.toFixed(1)}
                    </span>
                  </div>
                  <div style={{ height: 3, borderRadius: 99, background: "#1c2127" }}>
                    <div
                      style={{
                        width: `${item.score * 10}%`,
                        height: "100%",
                        borderRadius: 99,
                        background: item.name.startsWith("react-hook-form") ? "var(--accent)" : "#3b444f",
                      }}
                    />
                  </div>
                  <span className="hint" style={{ fontSize: 9.5 }}>
                    {item.note}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: 13 }}>
            <span className="label">Formulários salvos</span>
            <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
              {forms.length === 0 && <span className="hint">Gere o primeiro formulário para persistir o spec.</span>}
              {forms.map((form) => (
                <button
                  key={form.id}
                  type="button"
                  className="panel-soft"
                  style={{ textAlign: "left", padding: "8px 9px", cursor: "pointer" }}
                  onClick={() => {
                    setSpec(form.spec);
                    setTab("preview");
                  }}
                >
                  <div style={{ fontSize: 11 }}>{form.name}</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--faint)", marginTop: 2 }}>
                    {form.framework} · {form.endpoint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: 13 }}>
            <span className="label">Integração</span>
            <p className="hint" style={{ fontSize: 10.5, marginTop: 6 }}>
              Todo formulário nasce com: schema zod único, componente RHF, tabela Drizzle, route handler com validação e cliente fetch tipado.
              Aponte o endpoint para a API real do app analisado ou use o handler gerado neste banco.
            </p>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
              {["zod", "react-hook-form", "drizzle-orm", "next/app", "shadcn/ui"].map((item) => (
                <span key={item} className="chip" style={{ fontSize: 9.5 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
