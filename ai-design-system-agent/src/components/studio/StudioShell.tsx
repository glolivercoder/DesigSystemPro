"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StudioBootstrap } from "@/lib/server-data";
import type { CategoryId, GenerationPayload, ProviderState } from "@/lib/types";
import PreviewEditor from "./PreviewEditor";
import AgentPanel from "./AgentPanel";
import McpPanel from "./McpPanel";
import GenerationsPanel from "./GenerationsPanel";
import FormsPanel from "./FormsPanel";
import AnalysisPanel from "./AnalysisPanel";
import StackPanel from "./StackPanel";
import SettingsPanel from "./SettingsPanel";
import SmartEditor from "./SmartEditor";
import CreativesPanel from "./CreativesPanel";
import { buildPreviewHtml } from "@/lib/preview";

type TabId = "studio" | "smart-editor" | "creatives" | "agent" | "mcps" | "generations" | "forms" | "gitnexus" | "stack" | "settings";

const TABS: { id: TabId; label: string; glyph: string }[] = [
  { id: "studio", label: "Studio", glyph: "◈" },
  { id: "smart-editor", label: "Smart Editor", glyph: "✎" },
  { id: "creatives", label: "Criativos", glyph: "❖" },
  { id: "agent", label: "Agente UI/UX", glyph: "✦" },
  { id: "mcps", label: "MCPs", glyph: "⌗" },
  { id: "generations", label: "Gerações", glyph: "▷" },
  { id: "forms", label: "Formulários", glyph: "▤" },
  { id: "gitnexus", label: "GitNexus", glyph: "⑆" },
  { id: "stack", label: "Stack & Skills", glyph: "◫" },
  { id: "settings", label: "Configurações", glyph: "⚙" },
];

export default function StudioShell({ data }: { data: StudioBootstrap }) {
  const [categoryId, setCategoryId] = useState<CategoryId>(data.categories[0]?.id ?? "ecommerce");
  const [dsId, setDsId] = useState(data.categories[0]?.designSystems[0]?.id ?? "");
  const [tab, setTab] = useState<TabId>("studio");
  const [query, setQuery] = useState("");
  const [code, setCode] = useState(() => {
    const firstCategory = data.categories[0];
    const firstSystem = firstCategory?.designSystems[0];
    return firstCategory && firstSystem ? buildPreviewHtml(firstSystem, firstCategory) : "";
  });
  const [toast, setToast] = useState("");
  const [providers, setProviders] = useState<ProviderState[]>(data.providers);
  const [analyses, setAnalyses] = useState(data.analyses);
  const [forms, setForms] = useState(data.forms);
  const [pendingFormAnalysis, setPendingFormAnalysis] = useState<string | undefined>();
  const [generationSeed, setGenerationSeed] = useState<{ prompt: string; kind: GenerationPayload["kind"] } | undefined>();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const category = useMemo(
    () => data.categories.find((item) => item.id === categoryId) ?? data.categories[0],
    [categoryId, data.categories],
  );
  const designSystem = useMemo(
    () => category?.designSystems.find((item) => item.id === dsId) ?? category?.designSystems[0] ?? data.designSystems[0],
    [category, dsId, data.designSystems],
  );

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }, []);

  useEffect(() => {
    if (!designSystem || !category) return;
    setCode(buildPreviewHtml(designSystem, category));
  }, [designSystem, category]);

  const filteredSystems = useMemo(() => {
    if (!category) return [];
    const q = query.trim().toLowerCase();
    if (!q) return category.designSystems;
    return category.designSystems.filter((system) =>
      [system.name, system.tagline, ...system.tags, ...system.stack].join(" ").toLowerCase().includes(q),
    );
  }, [category, query]);

  const applyDesignSystem = useCallback(
    (nextDsId: string, nextCategoryId?: string) => {
      const targetCategory = data.categories.find((item) => item.id === (nextCategoryId ?? categoryId));
      if (targetCategory && nextCategoryId && nextCategoryId !== categoryId) {
        setCategoryId(targetCategory.id);
        const targetSystem = targetCategory.designSystems.find((item) => item.id === nextDsId) ?? targetCategory.designSystems[0];
        setDsId(targetSystem.id);
        setTab("studio");
        notify(`${targetCategory.short} · ${targetSystem.name} aplicado`);
        return;
      }
      const target = category?.designSystems.find((item) => item.id === nextDsId);
      if (target) {
        setDsId(nextDsId);
        setTab("studio");
        notify(`${target.name} aplicado ao preview`);
      }
    },
    [category, categoryId, data.categories, notify, tab],
  );

  const activeProvider = providers.find((provider) => provider.active && provider.hasKey) ?? providers.find((p) => p.hasKey);
  const stats = data.stats;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="side-pad" style={{ paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(145deg,#d7f76b,#8ab4ff)",
                color: "#101308",
                display: "grid",
                placeItems: "center",
                fontFamily: "Instrument Serif, Georgia, serif",
                fontSize: 20,
                boxShadow: "0 10px 30px -14px rgba(215,247,107,0.6)",
              }}
            >
              A
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span className="display" style={{ fontSize: 19, lineHeight: 1 }}>
                  Atelier
                </span>
                <span className="badge badge-accent" style={{ fontSize: 8.5 }}>
                  studio
                </span>
              </div>
              <div className="hint" style={{ fontSize: 10.5, marginTop: 3 }}>
                design systems · skills · RAG
              </div>
            </div>
          </div>
        </div>

        <div className="side-pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="label">Categoria de uso</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
              {data.categories.length} verticais
            </span>
          </div>
          <select
            className="select"
            value={categoryId}
            onChange={(event) => {
              const nextCategory = data.categories.find((item) => item.id === event.target.value);
              if (!nextCategory) return;
              setCategoryId(nextCategory.id);
              setDsId(nextCategory.designSystems[0]?.id ?? "");
              notify(`Categoria: ${nextCategory.name}`);
            }}
          >
            {data.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.designSystems.length} DS
              </option>
            ))}
          </select>
          <p className="hint" style={{ marginTop: 8, fontSize: 11 }}>
            {category?.description}
          </p>
          <input
            className="input"
            style={{ marginTop: 10 }}
            placeholder="Filtrar por nome, tag ou stack…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div style={{ padding: "4px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="label">Design systems ({filteredSystems.length})</span>
          <span className="badge badge-blue" style={{ fontSize: 8.5 }}>
            1–10 por categoria
          </span>
        </div>

        <div className="ds-list scroll-thin">
          {filteredSystems.map((system, index) => {
            const active = system.id === designSystem?.id;
            const initials = system.name
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("");
            return (
              <button
                key={system.id}
                type="button"
                className="ds-item"
                data-active={active}
                onClick={() => {
                  setDsId(system.id);
                  notify(`${system.name} carregado`);
                }}
                title={`${system.name} — ${system.tagline}`}
              >
                <span
                  className="ds-thumb"
                  style={{
                    background: `linear-gradient(140deg, ${system.palette.bg} 0%, ${system.palette.surface} 45%, ${system.palette.accent} 100%)`,
                    color: system.palette.ink,
                  }}
                >
                  <span>{initials}</span>
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {system.name}
                    </span>
                    <span className="mono" style={{ fontSize: 9, color: "var(--faint)" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {system.kind} · {system.skills.length} skills · {system.variant}
                  </span>
                  <span style={{ display: "flex", gap: 3, marginTop: 4 }}>
                    {[system.palette.bg, system.palette.ink, system.palette.accent, system.palette.accent2].map((color, i) => (
                      <span key={`${color}-${i}`} className="swatch" style={{ width: 11, height: 11, background: color }} />
                    ))}
                  </span>
                </span>
                <span style={{ textAlign: "right" }}>
                  <span className="mono" style={{ fontSize: 9.5, color: "var(--faint)", display: "block" }}>
                    {system.rating.toFixed(1)}
                  </span>
                  {active ? <span className="status-dot" style={{ display: "inline-block", marginTop: 6 }} /> : null}
                </span>
              </button>
            );
          })}
          {!filteredSystems.length && (
            <p className="hint" style={{ padding: "10px 8px" }}>
              Nenhum design system com esse filtro nesta categoria.
            </p>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--line)", padding: "11px 16px 13px", display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--muted)" }}>
            <span>{stats.designSystems} design systems</span>
            <span>{stats.skills} skills</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--faint)" }}>
            <span>{stats.mcps} MCPs</span>
            <span>RAG · {stats.ragDocs} docs</span>
          </div>
          <button className="btn btn-sm" type="button" onClick={() => setTab("settings")} style={{ justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="status-dot" style={{ background: activeProvider ? "var(--accent)" : "var(--faint)" }} />
              {activeProvider ? `${activeProvider.label} · ${activeProvider.model}` : "Motor local (sem API key)"}
            </span>
            <span style={{ color: "var(--faint)" }}>→</span>
          </button>
        </div>
      </aside>

      <div className="main-col">
        <div className="tabbar">
          {TABS.map((item) => (
            <button key={item.id} type="button" className="tab" data-active={tab === item.id} onClick={() => setTab(item.id)}>
              <span style={{ opacity: 0.65, fontSize: 11 }}>{item.glyph}</span>
              {item.label}
              {item.id === "agent" && <span className="dot" />}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 12 }}>
            <span className="badge" title="Chunks indexados no Postgres com embedding local">
              LangIndex · {stats.ragDocs}
            </span>
            <span className={`badge ${activeProvider ? "badge-accent" : ""}`}>
              <span className="status-dot" style={{ background: activeProvider ? "var(--accent)" : "var(--faint)" }} />
              {activeProvider ? "LLM conectada" : "offline-first"}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {tab === "studio" && designSystem && category && (
            <PreviewEditor
              designSystem={designSystem}
              category={category}
              code={code}
              setCode={setCode}
              onNotify={notify}
              onOpenTab={(next) => setTab(next as TabId)}
              designSystems={category.designSystems}
              onSelectDesignSystem={(id) => setDsId(id)}
            />
          )}
          {tab === "smart-editor" && designSystem && category && (
            <SmartEditor
              designSystem={designSystem}
              category={category}
              code={code}
              setCode={setCode}
              onNotify={notify}
              onOpenTab={(next) => setTab(next as TabId)}
              designSystems={category.designSystems}
              onSelectDesignSystem={(id) => setDsId(id)}
            />
          )}
          {tab === "creatives" && category && designSystem && (
            <CreativesPanel
              category={category}
              designSystem={designSystem}
              onNotify={notify}
              onOpenTab={(next) => setTab(next as TabId)}
            />
          )}
          {tab === "agent" && category && designSystem && (
            <AgentPanel
              categories={data.categories}
              category={category}
              designSystem={designSystem}
              providers={providers}
              onApply={applyDesignSystem}
              onOpenTab={(next) => setTab(next as TabId)}
              onSeedGeneration={(prompt, kind) => {
                setGenerationSeed({ prompt, kind });
                setTab("generations");
              }}
              onNotify={notify}
            />
          )}
          {tab === "mcps" && <McpPanel mcp={data.mcp} onNotify={notify} />}
          {tab === "generations" && designSystem && category && (
            <GenerationsPanel
              designSystem={designSystem}
              category={category}
              history={data.history}
              providers={providers}
              seed={generationSeed}
              onNotify={notify}
            />
          )}
          {tab === "forms" && category && designSystem && (
            <FormsPanel
              categories={data.categories}
              category={category}
              designSystem={designSystem}
              analyses={analyses}
              initialForms={forms}
              pendingAnalysisId={pendingFormAnalysis}
              onFormsChange={setForms}
              onNotify={notify}
            />
          )}
          {tab === "gitnexus" && category && (
            <AnalysisPanel
              categories={data.categories}
              category={category}
              analyses={analyses}
              onAnalysesChange={setAnalyses}
              onNotify={notify}
              onCreateForm={(analysisId) => {
                setPendingFormAnalysis(analysisId);
                setTab("forms");
              }}
            />
          )}
          {tab === "stack" && category && designSystem && (
            <StackPanel
              category={category}
              designSystem={designSystem}
              onSelect={(id) => {
                setDsId(id);
                setTab("studio");
              }}
              onOpenForms={() => setTab("forms")}
            />
          )}
          {tab === "settings" && (
            <SettingsPanel
              providers={providers}
              onProvidersChange={setProviders}
              onNotify={notify}
              freeMode={Boolean((data.settings.freeMode as { enabled?: boolean } | undefined)?.enabled)}
            />
          )}
        </div>
      </div>

      <div className="toast" data-show={Boolean(toast)}>
        {toast}
      </div>
    </div>
  );
}
