"use client";

import { useState } from "react";
import { formFrameworkScores } from "@/lib/integrations-data";
import type { Category, DesignSystem, RagHit } from "@/lib/types";

interface Props {
  category: Category;
  designSystem: DesignSystem;
  onSelect: (id: string) => void;
  onOpenForms: () => void;
}

export default function StackPanel({ category, designSystem, onSelect, onOpenForms }: Props) {
  const [query, setQuery] = useState("skills de checkout com validação de formulário e integração de banco");
  const [hits, setHits] = useState<RagHit[]>([]);
  const [searching, setSearching] = useState(false);
  const stack = category.stack;

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&category=${category.id}&k=8`);
      const json = (await response.json()) as { hits: RagHit[] };
      setHits(json.hits ?? []);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div style={{ padding: 20, display: "grid", gap: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span className="label">Curadoria técnica · {category.name}</span>
          <h1 className="display" style={{ fontSize: 32, margin: "6px 0 4px" }}>
            Stack, skills e decisões
          </h1>
          <p className="hint" style={{ maxWidth: 760 }}>
            O agente escolhe a stack por categoria considerando SEO, data layer, motion e operação. Abaixo, o veredito completo e o inventário de
            skills dos design systems desta vertical.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onOpenForms}>
          gerar formulário integrado
        </button>
      </header>

      <div className="panel" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <span className="label">Stack recomendada</span>
            <h2 className="display" style={{ fontSize: 25, margin: "5px 0 3px" }}>
              {stack.primary}
            </h2>
          </div>
          <span className="badge badge-accent">veredito do agente</span>
        </div>
        <p className="hint" style={{ maxWidth: 880, marginTop: 4 }}>
          {stack.rationale}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginTop: 12 }}>
          {[
            ["Core", stack.core],
            ["UI", stack.ui],
            ["Dados", stack.data],
            ["Motion", stack.motion],
            ["Alternativas", stack.alternatives],
          ].map(([label, items]) => (
            <div key={label as string} className="panel-soft" style={{ padding: "10px 12px" }}>
              <span className="label">{label as string}</span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                {(items as string[]).map((item) => (
                  <span key={item} className="chip" style={{ fontSize: 9.5 }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.35fr) minmax(0,0.65fr)", gap: 16 }}>
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div className="toolstrip">
            <span className="label">Design systems da categoria ({category.designSystems.length})</span>
            <span className="badge" style={{ marginLeft: "auto" }}>
              {category.designSystems.reduce((acc, system) => acc + system.skills.length, 0)} skills
            </span>
          </div>
          <div style={{ maxHeight: 460, overflow: "auto" }} className="scroll-thin">
            <table className="table">
              <thead>
                <tr>
                  <th>design system</th>
                  <th>tipo</th>
                  <th>variante</th>
                  <th>fontes</th>
                  <th>skills</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {category.designSystems.map((system) => (
                  <tr key={system.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ display: "flex", gap: 2 }}>
                          {[system.palette.bg, system.palette.accent, system.palette.ink].map((color, index) => (
                            <span key={`${color}-${index}`} style={{ width: 9, height: 9, borderRadius: 3, background: color }} />
                          ))}
                        </span>
                        <span style={{ color: system.id === designSystem.id ? "var(--accent)" : "var(--ink)", fontSize: 11.5 }}>{system.name}</span>
                      </div>
                      <div className="hint" style={{ fontSize: 9.5, marginTop: 2 }}>
                        {system.source}
                      </div>
                    </td>
                    <td>{system.kind}</td>
                    <td className="mono" style={{ fontSize: 10 }}>
                      {system.variant}
                    </td>
                    <td style={{ fontSize: 10.5 }}>
                      {system.fonts.display}
                      <span style={{ color: "var(--faint)" }}> / {system.fonts.body}</span>
                    </td>
                    <td className="mono">{system.skills.length}</td>
                    <td>
                      <button type="button" className="btn btn-sm" onClick={() => onSelect(system.id)}>
                        abrir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel" style={{ padding: 14 }}>
          <span className="label">Skills do sistema ativo</span>
          <div style={{ marginTop: 4, fontSize: 13 }}>{designSystem.name}</div>
          <div className="skills-list" style={{ marginTop: 9 }}>
            {designSystem.skills.map((skill, index) => (
              <div key={skill.id} className="skill-row">
                <span className="skill-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500 }}>{skill.name}</div>
                  <div className="hint" style={{ fontSize: 10, marginTop: 2 }}>
                    {skill.summary}
                  </div>
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 4 }}>
                    <span className="badge" style={{ fontSize: 8 }}>
                      {skill.level}
                    </span>
                    {skill.outputs.map((output) => (
                      <span key={output} className="chip" style={{ fontSize: 8.5, padding: "1px 5px" }}>
                        {output}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10 }}>
            {designSystem.stack.map((item) => (
              <span key={item} className="chip" style={{ fontSize: 9.5 }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
        <div className="panel" style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span className="label">RAG local · busca semântica</span>
            <span className="badge badge-blue">cosine · 192d</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <input
              className="input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void search();
              }}
              placeholder="Buscar skills, design systems, MCPs…"
            />
            <button type="button" className="btn btn-primary" onClick={search} disabled={searching}>
              {searching ? "…" : "buscar"}
            </button>
          </div>
          <div style={{ display: "grid", gap: 5, marginTop: 10 }}>
            {hits.length === 0 && (
              <span className="hint">
                Consulta indexada no Postgres. Cada design system, skill, categoria e MCP é um chunk com embedding determinístico local.
              </span>
            )}
            {hits.map((hit) => (
              <div key={hit.id} className="panel-soft" style={{ padding: "7px 9px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 10.5 }}>{hit.title}</span>
                  <span className="mono" style={{ fontSize: 9, color: "var(--accent)" }}>
                    {hit.score.toFixed(3)}
                  </span>
                </div>
                <div className="hint" style={{ fontSize: 9.5, marginTop: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {hit.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ padding: 14 }}>
          <span className="label">Gerador de formulário · veredito</span>
          <div style={{ display: "grid", gap: 8, marginTop: 9 }}>
            {formFrameworkScores.map((item) => (
              <div key={item.name} style={{ display: "grid", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: item.name.startsWith("react-hook-form") ? "var(--accent)" : "var(--ink)" }}>{item.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
                    {item.score.toFixed(1)}/10
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
          <p className="hint" style={{ fontSize: 10, marginTop: 10 }}>
            Para gerar formulários já ligados ao banco do app analisado, o pipeline usa: GitNexus → schema zod → componente RHF → tabela Drizzle →
            route handler Next + cliente fetch tipado.
          </p>
        </div>
      </div>
    </div>
  );
}
