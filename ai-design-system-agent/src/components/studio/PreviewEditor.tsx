"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Category, DesignSystem } from "@/lib/types";

interface Props {
  designSystem: DesignSystem;
  category: Category;
  designSystems: DesignSystem[];
  code: string;
  setCode: (code: string) => void;
  onNotify: (message: string) => void;
  onOpenTab: (tab: string) => void;
  onSelectDesignSystem: (id: string) => void;
}

const INSPECTOR = `(function(){
  var edit=false, selected=null;
  var style=document.createElement('style');
  style.setAttribute('data-studio-inspector','true');
  style.textContent='.__studio_sel{outline:2px solid #d7f76b !important;outline-offset:2px;cursor:crosshair !important} body.__studio_edit *{cursor:crosshair !important}';
  document.head.appendChild(style);
  function clean(){
    var clone=document.documentElement.cloneNode(true);
    clone.querySelectorAll('[data-studio-inspector]').forEach(function(n){ n.remove(); });
    clone.querySelectorAll('.__studio_sel').forEach(function(n){ n.classList.remove('__studio_sel'); });
    var bodyClass=clone.querySelector('body');
    if (bodyClass) bodyClass.classList.remove('__studio_edit');
    return '<!doctype html>\\n'+clone.outerHTML;
  }
  function serialize(){ if(window.parent!==window){ window.parent.postMessage({type:'studio:html', html: clean()}, '*'); } }
  function select(el){
    if(selected) selected.classList.remove('__studio_sel');
    selected=el;
    el.classList.add('__studio_sel');
    var path=[]; var node=el;
    while(node && node.tagName && node.tagName!=='HTML'){ path.unshift(node.tagName.toLowerCase()+(node.id?'#'+node.id:'')); node=node.parentElement; }
    window.parent.postMessage({
      type:'studio:select',
      tag: el.tagName.toLowerCase(),
      classes: el.getAttribute('class')||'',
      text: (el.textContent||'').trim().slice(0,240),
      path: path.slice(-4).join(' > ')
    }, '*');
  }
  document.addEventListener('click', function(e){
    if(!edit) return;
    var el=e.target;
    if(!el || el.tagName==='HTML') return;
    e.preventDefault(); e.stopPropagation();
    select(el);
  }, true);
  document.addEventListener('mouseover', function(e){
    if(!edit || !e.target || e.target===selected) return;
    e.target.style.outline='1px dashed rgba(215,247,107,0.55)';
  }, true);
  document.addEventListener('mouseout', function(e){ if(e.target && e.target.style && e.target!==selected) e.target.style.outline=''; }, true);
  window.addEventListener('message', function(e){
    var d=e.data||{};
    if(d.type==='studio:mode'){ edit=!!d.edit; document.body.classList.toggle('__studio_edit', edit); if(!edit && selected){ selected.classList.remove('__studio_sel'); } }
    if(d.type==='studio:setText' && selected){ selected.textContent=d.text; serialize(); }
    if(d.type==='studio:setClass' && selected){ selected.setAttribute('class', d.value); serialize(); }
    if(d.type==='studio:requestHtml'){ serialize(); }
  });
  window.parent.postMessage({type:'studio:ready'}, '*');
})();`;

export default function PreviewEditor({
  designSystem,
  category,
  designSystems,
  code,
  setCode,
  onNotify,
  onOpenTab,
  onSelectDesignSystem,
}: Props) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showCode, setShowCode] = useState(true);
  const [investigate, setInvestigate] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [previewHtml, setPreviewHtml] = useState(code);
  const [selected, setSelected] = useState<{ tag: string; classes: string; text: string; path: string } | null>(null);
  const [overrideText, setOverrideText] = useState("");
  const [overrideClass, setOverrideClass] = useState("");
  const [sheet, setSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const srcDoc = useMemo(() => `${previewHtml}\n<script data-studio-inspector="true">${INSPECTOR}</script>`, [previewHtml]);

  useEffect(() => {
    setPreviewHtml(code);
    setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designSystem.id]);

  useEffect(() => {
    if (!autoRun) return;
    const timer = setTimeout(() => setPreviewHtml(code), 900);
    return () => clearTimeout(timer);
  }, [code, autoRun]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string; html?: string; tag?: string; classes?: string; text?: string; path?: string };
      if (!data || typeof data.type !== "string") return;
      if (data.type === "studio:select") {
        setSelected({
          tag: data.tag ?? "div",
          classes: data.classes ?? "",
          text: data.text ?? "",
          path: data.path ?? "",
        });
        setOverrideText(data.text ?? "");
        setOverrideClass(data.classes ?? "");
      }
      if (data.type === "studio:html" && typeof data.html === "string") {
        setCode(data.html);
        onNotify("Alteração aplicada no DOM e sincronizada no código");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onNotify, setCode]);

  useEffect(() => {
    const win = frameRef.current?.contentWindow;
    win?.postMessage({ type: "studio:mode", edit: investigate }, "*");
  }, [investigate, srcDoc]);

  const post = useCallback((payload: Record<string, unknown>) => {
    frameRef.current?.contentWindow?.postMessage(payload, "*");
  }, []);

  const saveProject = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${designSystem.name} · ${category.short}`,
          categoryId: category.id,
          designSystemId: designSystem.id,
          html: code,
          notes: "Preview editável do studio",
        }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string };
      onNotify(json.ok ? "Projeto salvo no Postgres" : json.error ?? "Falha ao salvar");
    } catch {
      onNotify("Falha de rede ao salvar o projeto");
    } finally {
      setSaving(false);
    }
  }, [category.id, category.short, code, designSystem.id, designSystem.name, onNotify]);

  const download = useCallback(() => {
    const blob = new Blob([code], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${designSystem.id}-index.html`;
    anchor.click();
    URL.revokeObjectURL(url);
    onNotify("index.html exportado");
  }, [code, designSystem.id, onNotify]);

  const lineCount = useMemo(() => code.split("\n").length, [code]);

  return (
    <div className="workspace" data-inspector={sheet}>
      <div style={{ minWidth: 0 }}>
        <div className="toolstrip">
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ display: "flex", gap: 3 }}>
              {[designSystem.palette.bg, designSystem.palette.surface, designSystem.palette.ink, designSystem.palette.accent, designSystem.palette.accent2].map(
                (color, index) => (
                  <span key={`${color}-${index}`} className="swatch" style={{ background: color, width: 15, height: 15 }} />
                ),
              )}
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" }}>{designSystem.name}</span>
            <span className="badge">{designSystem.kind}</span>
            <span className="badge badge-accent">{designSystem.variant}</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 2, padding: 2, border: "1px solid var(--line)", borderRadius: 8 }}>
              {(["desktop", "tablet", "mobile"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  className="iconbtn"
                  style={{ border: 0, width: 26, height: 24 }}
                  data-active={viewport === size}
                  onClick={() => setViewport(size)}
                  title={size}
                >
                  {size === "desktop" ? "▭" : size === "tablet" ? "▯" : "▮"}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-sm" data-active={investigate} onClick={() => setInvestigate((value) => !value)} title="Selecionar elementos no preview">
              <span style={{ color: investigate ? "var(--accent)" : "inherit" }}>◉</span> Editar DOM
            </button>
            <button type="button" className="btn btn-sm" onClick={() => setShowCode((value) => !value)}>
              {showCode ? "Ocultar código" : "Ver código"}
            </button>
            <button type="button" className="btn btn-sm" onClick={() => setPreviewHtml(code)}>
              ⟳ Rodar
            </button>
            <label className="badge" style={{ cursor: "pointer", gap: 5 }}>
              <span className="switch" data-on={autoRun} onClick={() => setAutoRun((value) => !value)} role="switch" aria-checked={autoRun} aria-label="Auto run" />
              auto
            </label>
            <button type="button" className="btn btn-sm" onClick={download}>
              ↓ html
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={saveProject} disabled={saving}>
              {saving ? "Salvando…" : "Salvar projeto"}
            </button>
            <button type="button" className="iconbtn" onClick={() => setSheet((value) => !value)} title="Ficha do design system">
              {sheet ? "→" : "←"}
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderBottom: "1px solid var(--line)",
            background: "var(--panel-2)",
            flexWrap: "wrap",
          }}
        >
          <span className="badge" style={{ background: category.accent + "22", borderColor: category.accent + "55", color: category.accent }}>
            {category.short}
          </span>
          <span className="hint" style={{ fontSize: 11.5 }}>
            {designSystem.tagline} — {designSystem.fonts.display} + {designSystem.fonts.body}
          </span>
          <div style={{ display: "flex", gap: 5, marginLeft: "auto", flexWrap: "wrap" }}>
            {designSystem.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="chip" style={{ padding: "2px 7px", fontSize: 10 }}>
                {tag}
              </span>
            ))}
            <button type="button" className="chip chip-key" onClick={() => onOpenTab("agent")} style={{ cursor: "pointer" }}>
              ✦ pedir ao agente
            </button>
          </div>
        </div>

        <div className="split" data-code={showCode}>
          {showCode && (
            <div className="code-pane">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderBottom: "1px solid var(--line)" }}>
                <span className="label">index.html · {lineCount} linhas</span>
                <span className="badge badge-blue">editável</span>
              </div>
              <div className="editor-wrap">
                <div className="gutter" ref={gutterRef}>
                  {Array.from({ length: lineCount }, (_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>
                <textarea
                  className="codearea"
                  value={code}
                  spellCheck={false}
                  onChange={(event) => setCode(event.target.value)}
                  onScroll={(event) => {
                    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
                  }}
                />
              </div>
            </div>
          )}
          <div className="preview-pane">
            <div className="toolstrip" style={{ background: "var(--panel-2)" }}>
              <span className="badge">
                <span className="status-dot" /> live preview
              </span>
              <span className="hint" style={{ fontSize: 11 }}>
                {viewport === "desktop" ? "1280" : viewport === "tablet" ? "820" : "390"}px · sandbox
              </span>
              {selected && (
                <span className="badge badge-accent">
                  {selected.tag} selecionado
                </span>
              )}
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => post({ type: "studio:requestHtml" })}
                  title="Sincronizar alterações do DOM no código"
                >
                  ⇅ sincronizar DOM
                </button>
              </div>
            </div>
            {selected && (
              <div style={{ display: "grid", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--line)", background: "var(--panel)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span className="badge badge-accent">{selected.tag}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
                    {selected.path}
                  </span>
                  <button type="button" className="btn btn-sm" style={{ marginLeft: "auto" }} onClick={() => setSelected(null)}>
                    fechar
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span className="label">Texto</span>
                    <input className="input" value={overrideText} onChange={(event) => setOverrideText(event.target.value)} />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span className="label">Classes</span>
                    <input className="input" value={overrideClass} onChange={(event) => setOverrideClass(event.target.value)} />
                  </label>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        post({ type: "studio:setText", text: overrideText });
                        setTimeout(() => post({ type: "studio:setClass", value: overrideClass }), 120);
                      }}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
                <p className="hint" style={{ fontSize: 10.5 }}>
                  Clique em qualquer elemento com “Editar DOM” ativo, altere texto ou classes e o HTML do editor é sincronizado — o mesmo padrão do editor visual do Onlook.
                </p>
              </div>
            )}
            <div className="frame-wrap scroll-thin">
              <iframe
                ref={frameRef}
                className="frame"
                data-vp={viewport}
                title={`Preview de ${designSystem.name}`}
                sandbox="allow-scripts allow-forms allow-popups"
                srcDoc={srcDoc}
                onLoad={() => post({ type: "studio:mode", edit: investigate })}
              />
            </div>
          </div>
        </div>
      </div>

      {sheet && (
        <aside className="scroll-thin" style={{ borderLeft: "1px solid var(--line)", padding: 16, overflowY: "auto", maxHeight: "calc(100vh - 49px)", background: "var(--panel)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="label">Ficha do design system</span>
            <span className="badge badge-accent">{designSystem.rating.toFixed(1)} ★</span>
          </div>
          <h3 className="display" style={{ fontSize: 22, margin: "10px 0 2px" }}>
            {designSystem.name}
          </h3>
          <p className="hint" style={{ fontSize: 11 }}>
            {designSystem.source} · {designSystem.kind}
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.65, marginTop: 10 }}>{designSystem.description}</p>

          <div style={{ display: "grid", gap: 6, marginTop: 14 }}>
            <span className="label">Tokens</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 }}>
              {Object.entries(designSystem.palette).map(([name, color]) => (
                <div key={name} title={`${name} ${color}`} style={{ display: "grid", gap: 3 }}>
                  <span className="swatch" style={{ width: "100%", height: 24, background: color }} />
                  <span className="mono" style={{ fontSize: 7.5, color: "var(--faint)", overflow: "hidden" }}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
              <span className="chip" style={{ fontSize: 10 }}>
                {designSystem.fonts.display} · display
              </span>
              <span className="chip" style={{ fontSize: 10 }}>
                {designSystem.fonts.body} · body
              </span>
              <span className="chip" style={{ fontSize: 10 }}>
                radius {designSystem.radius}px
              </span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <span className="label">Princípios</span>
            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              {designSystem.principles.map((principle, index) => (
                <div key={principle.title} className="panel-soft" style={{ padding: "9px 10px" }}>
                  <div className="mono" style={{ fontSize: 9, color: "var(--accent)" }}>
                    0{index + 1}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2 }}>{principle.title}</div>
                  <div className="hint" style={{ fontSize: 10.5, marginTop: 3 }}>
                    {principle.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="label">Skills ({designSystem.skills.length})</span>
              <span className="badge" style={{ fontSize: 8.5 }}>
                carregáveis
              </span>
            </div>
            <div className="skills-list" style={{ marginTop: 8 }}>
              {designSystem.skills.map((skill, index) => (
                <div key={skill.id} className="skill-row">
                  <span className="skill-index">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 500 }}>{skill.name}</div>
                    <div className="hint" style={{ fontSize: 10, marginTop: 2 }}>
                      {skill.summary}
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                      <span className="badge" style={{ fontSize: 8 }}>
                        {skill.level}
                      </span>
                      {skill.outputs.slice(0, 2).map((output) => (
                        <span key={output} className="chip" style={{ fontSize: 8.5, padding: "1px 5px" }}>
                          {output}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <span className="label">Stack do sistema</span>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
              {designSystem.stack.map((item) => (
                <span key={item} className="chip" style={{ fontSize: 10 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <span className="label">Alternar design system</span>
            <select className="select" style={{ marginTop: 7 }} value={designSystem.id} onChange={(event) => onSelectDesignSystem(event.target.value)}>
              {designSystems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gap: 6, marginTop: 16 }}>
            <button type="button" className="btn btn-sm" onClick={() => onOpenTab("mcps")} style={{ justifyContent: "space-between" }}>
              MCPs compatíveis <span>→</span>
            </button>
            <button type="button" className="btn btn-sm" onClick={() => onOpenTab("generations")} style={{ justifyContent: "space-between" }}>
              Gerar imagem / animação <span>→</span>
            </button>
            <button type="button" className="btn btn-sm" onClick={() => onOpenTab("forms")} style={{ justifyContent: "space-between" }}>
              Gerar formulário integrado <span>→</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
