"use client";

import { useState } from "react";
import type { Category, RepoAnalysis } from "@/lib/types";

interface AnalysisRecord {
  id: string;
  repo: string;
  mode: string;
  summary: RepoAnalysis;
  createdAt: string;
}

interface Props {
  categories: Category[];
  category: Category;
  analyses: AnalysisRecord[];
  onAnalysesChange: (analyses: AnalysisRecord[]) => void;
  onNotify: (message: string) => void;
  onCreateForm: (analysisId?: string) => void;
}

export default function AnalysisPanel({ categories, category, analyses, onAnalysesChange, onNotify, onCreateForm }: Props) {
  const [repoUrl, setRepoUrl] = useState("vercel/commerce");
  const [pathHint, setPathHint] = useState("app/api");
  const [mode, setMode] = useState<"repo" | "paste">("repo");
  const [code, setCode] = useState("");
  const [categoryId, setCategoryId] = useState(category.id);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<AnalysisRecord | null>(analyses[0] ?? null);
  const [gitnexus, setGitnexus] = useState(true);

  async function analyze() {
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: mode === "repo" ? repoUrl : undefined,
          code: mode === "paste" ? code : undefined,
          pathHint: pathHint || undefined,
          categoryId,
        }),
      });
      const json = (await response.json()) as { analysis?: RepoAnalysis; error?: string };
      if (!response.ok || !json.analysis) {
        onNotify(json.error ?? "Falha na análise");
        return;
      }
      const listing = await fetch("/api/analyze").then((res) => res.json() as Promise<{ analyses: AnalysisRecord[] }>);
      onAnalysesChange(listing.analyses);
      setCurrent(
        listing.analyses.find((item) => item.summary.repo === json.analysis?.repo && item.summary.mode === json.analysis?.mode) ??
          listing.analyses[0] ??
          null,
      );
      onNotify(json.analysis.mode === "github" ? "Repositório analisado via GitHub API" : "Blueprint gerado em modo demonstração");
    } catch {
      onNotify("Falha de rede durante a análise");
    } finally {
      setLoading(false);
    }
  }

  const summary = current?.summary;
  const recommendedCategory = categories.find((item) => item.id === categoryId);
  const recommendedSystem = recommendedCategory?.designSystems.find((system) => system.id === summary?.blueprint.designSystemId);

  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span className="label">GitNexus · contexto de código & contratos</span>
          <h1 className="display" style={{ fontSize: 32, margin: "6px 0 4px" }}>
            Entender o app antes de desenhar
          </h1>
          <p className="hint" style={{ maxWidth: 740 }}>
            O GitNexus lê a árvore do repositório, extrai endpoints, schemas de banco, tokens visuais e componentes, e devolve um blueprint de
            frontend conectado: design system recomendado, stack e formulários prontos para o backend analisado.
          </p>
        </div>
        <label className="panel" style={{ padding: "9px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="status-dot" style={{ background: gitnexus ? "var(--accent)" : "var(--faint)" }} />
          <span style={{ fontSize: 11.5 }}>GitNexus {gitnexus ? "ativado" : "em espera"}</span>
          <button type="button" className="switch" data-on={gitnexus} onClick={() => setGitnexus((value) => !value)} role="switch" aria-checked={gitnexus} aria-label="Ativar GitNexus" />
        </label>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 310px", gap: 16 }}>
        <div style={{ display: "grid", gap: 14, alignContent: "start", minWidth: 0 }}>
          <div className="panel" style={{ padding: 14, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className={`btn btn-sm ${mode === "repo" ? "btn-primary" : ""}`} onClick={() => setMode("repo")}>
                Repositório GitHub
              </button>
              <button type="button" className={`btn btn-sm ${mode === "paste" ? "btn-primary" : ""}`} onClick={() => setMode("paste")}>
                Colar código
              </button>
              <span className="badge badge-blue" style={{ marginLeft: "auto" }}>
                {process.env.NEXT_PUBLIC_HAS_GITHUB_TOKEN === "1" ? "token ativo" : "público ou GITHUB_TOKEN"}
              </span>
            </div>
            {mode === "repo" ? (
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,0.8fr) minmax(0,0.8fr)", gap: 8 }}>
                <label style={{ display: "grid", gap: 4 }}>
                  <span className="label">Repositório (owner/repo ou URL)</span>
                  <input className="input" value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="owner/repo" />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span className="label">Foco de pastas</span>
                  <input className="input" value={pathHint} onChange={(event) => setPathHint(event.target.value)} placeholder="app/api, src/routes" />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span className="label">Categoria alvo</span>
                  <select className="select" value={categoryId} onChange={(event) => setCategoryId(event.target.value as typeof categoryId)}>
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.short}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <label style={{ display: "grid", gap: 4 }}>
                <span className="label">Cole handlers, schema Prisma ou arquivos de rota</span>
                <textarea className="textarea" rows={6} value={code} onChange={(event) => setCode(event.target.value)} placeholder="export async function POST…" />
              </label>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="hint" style={{ fontSize: 10.5 }}>
                {summary ? `${summary.filesScanned} arquivos lidos · ${summary.endpoints.length} endpoints · ${summary.dbHints.length} entidades` : "Nenhuma análise nesta sessão."}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" className="btn btn-sm" onClick={() => onCreateForm(current?.id)}>
                  gerar formulário
                </button>
                <button type="button" className="btn btn-primary" onClick={analyze} disabled={loading}>
                  {loading ? "Analisando…" : "Analisar com GitNexus"}
                </button>
              </div>
            </div>
          </div>

          {summary ? (
            <>
              <div className="panel" style={{ padding: 14, display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className="badge badge-accent">{summary.mode}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{summary.repo}</span>
                  </div>
                  <span className="badge">{new Date(current?.createdAt ?? Date.now()).toLocaleString("pt-BR")}</span>
                </div>
                <p className="hint" style={{ fontSize: 10.5 }}>
                  {summary.notes}
                </p>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {summary.stack.map((item) => (
                    <span key={item} className="chip" style={{ fontSize: 9.5 }}>
                      {item}
                    </span>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
                  <div className="stat-card">
                    <span className="label">Endpoints</span>
                    <div className="kpi">{summary.endpoints.length}</div>
                  </div>
                  <div className="stat-card">
                    <span className="label">Entidades no banco</span>
                    <div className="kpi">{summary.dbHints.length}</div>
                  </div>
                  <div className="stat-card">
                    <span className="label">Formulários mapeados</span>
                    <div className="kpi">{summary.forms.length}</div>
                  </div>
                  <div className="stat-card">
                    <span className="label">Cores detectadas</span>
                    <div className="kpi">{summary.designTokens.colors.length}</div>
                  </div>
                </div>
              </div>

              <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
                <div className="toolstrip">
                  <span className="label">Contratos de API detectados</span>
                  <span className="badge badge-blue" style={{ marginLeft: "auto" }}>
                    {summary.endpoints.filter((endpoint) => endpoint.auth).length} com auth
                  </span>
                </div>
                <div style={{ maxHeight: 260, overflow: "auto" }} className="scroll-thin">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>método</th>
                        <th>rota</th>
                        <th>handler</th>
                        <th>auth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.endpoints.map((endpoint) => (
                        <tr key={`${endpoint.method}-${endpoint.path}-${endpoint.source}`}>
                          <td>
                            <span className="badge" style={{ fontSize: 8.5 }}>
                              {endpoint.method}
                            </span>
                          </td>
                          <td className="mono">{endpoint.path}</td>
                          <td style={{ color: "var(--muted)" }}>{endpoint.handler}</td>
                          <td>{endpoint.auth ? "✓" : "—"}</td>
                        </tr>
                      ))}
                      {summary.endpoints.length === 0 && (
                        <tr>
                          <td colSpan={4} className="hint">
                            Nenhum handler reconhecido. Cole um arquivo de rotas para análise heurística.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="panel" style={{ padding: 13 }}>
                  <span className="label">Schema / banco</span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                    {summary.dbHints.length ? (
                      summary.dbHints.map((hint) => (
                        <span key={hint} className="chip" style={{ fontSize: 9.5 }}>
                          {hint}
                        </span>
                      ))
                    ) : (
                      <span className="hint">Nenhuma entidade detectada.</span>
                    )}
                  </div>
                  <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
                    {summary.forms.slice(0, 4).map((form) => (
                      <div key={form.name} className="panel-soft" style={{ padding: "7px 9px" }}>
                        <div className="mono" style={{ fontSize: 10, color: "var(--accent)" }}>
                          {form.method} {form.path}
                        </div>
                        <div className="hint" style={{ fontSize: 9.5, marginTop: 2 }}>
                          {form.fields.map((field) => field.name).join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel" style={{ padding: 13 }}>
                  <span className="label">Tokens visuais detectados</span>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
                    {summary.designTokens.colors.map((color) => (
                      <span key={color} title={color} style={{ width: 26, height: 26, borderRadius: 6, background: color, border: "1px solid var(--line)" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                    {summary.designTokens.fonts.map((font) => (
                      <span key={font} className="chip" style={{ fontSize: 9 }}>
                        {font}
                      </span>
                    ))}
                    {summary.components.slice(0, 5).map((component) => (
                      <span key={component} className="chip" style={{ fontSize: 9 }}>
                        {component}
                      </span>
                    ))}
                  </div>
                  <span className="label" style={{ display: "block", marginTop: 12 }}>
                    Integração
                  </span>
                  <div style={{ display: "grid", gap: 4, marginTop: 6 }}>
                    {summary.blueprint.integration.map((item) => (
                      <span key={item} className="hint" style={{ fontSize: 10 }}>
                        · {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel" style={{ padding: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <span className="label">Blueprint de frontend</span>
                  <span className="badge badge-accent">{recommendedSystem?.name ?? summary.blueprint.designSystemId}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 9 }}>
                  <div>
                    <div className="hint" style={{ fontSize: 10.5 }}>
                      <strong style={{ color: "var(--ink)" }}>Stack:</strong> {summary.blueprint.stack.primary}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                      {[...summary.blueprint.stack.core, ...summary.blueprint.stack.ui].map((item) => (
                        <span key={item} className="chip" style={{ fontSize: 9 }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="label" style={{ fontSize: 9 }}>Riscos</span>
                    <div style={{ display: "grid", gap: 3, marginTop: 4 }}>
                      {summary.blueprint.risks.map((risk) => (
                        <span key={risk} className="hint" style={{ fontSize: 10 }}>
                          ⚠ {risk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="panel" style={{ padding: 28, textAlign: "center" }}>
              <h2 className="display" style={{ fontSize: 24, margin: 0 }}>
                Nenhuma análise carregada
              </h2>
              <p className="hint" style={{ marginTop: 6 }}>
                Rode o GitNexus em um repositório público ou cole handlers para gerar o blueprint. O modo demo analisa um storefront Next +
                Prisma com checkout e leads.
              </p>
            </div>
          )}
        </div>

        <aside style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <div className="panel" style={{ padding: 13 }}>
            <span className="label">Análises salvas</span>
            <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
              {analyses.length === 0 && <span className="hint">Nenhum repositório analisado ainda.</span>}
              {analyses.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="panel-soft"
                  style={{ textAlign: "left", padding: "7px 9px", cursor: "pointer" }}
                  onClick={() => {
                    setCurrent(item);
                    setRepoUrl(item.repo);
                  }}
                >
                  <div className="mono" style={{ fontSize: 10 }}>
                    {item.repo}
                  </div>
                  <div className="hint" style={{ fontSize: 9 }}>
                    {item.mode} · {item.summary.endpoints.length} endpoints · {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="panel" style={{ padding: 13 }}>
            <span className="label">Como conectamos</span>
            <div style={{ display: "grid", gap: 5, marginTop: 7, fontSize: 10.5, color: "var(--muted)" }}>
              <span>· GitHub API + raw files (token opcional)</span>
              <span>· Regex por framework: Next, Express, Nest, FastAPI</span>
              <span>· Prisma / Drizzle / SQL para entidades e campos</span>
              <span>· Cosseno no índice local para escolher o DS</span>
              <span>· Fast API / MCP / código: escolha o caminho de integração</span>
            </div>
            <div className="codeblock" style={{ marginTop: 9, fontSize: 9.5 }}>{`// exemplo de contrato devolvido
{
  "designSystemId": "${summary?.blueprint.designSystemId ?? "jw-cartier"}",
  "forms": [${summary?.forms.length ?? 1}],
  "endpoints": ${summary?.endpoints.length ?? 1}
}`}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
