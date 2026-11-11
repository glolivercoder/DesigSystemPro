"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Category, DesignSystem, GenerationPayload, ProviderState } from "@/lib/types";

const RemotionScene = dynamic(() => import("./RemotionScene"), {
  ssr: false,
  loading: () => (
    <div className="panel-soft" style={{ padding: 24, fontSize: 12, color: "var(--muted)" }}>
      Carregando Remotion Player…
    </div>
  ),
});

type HistoryItem = {
  id: string;
  kind: string;
  prompt: string;
  provider: string;
  payload: GenerationPayload;
  createdAt: string;
};

interface Props {
  designSystem: DesignSystem;
  category: Category;
  history: HistoryItem[];
  providers: ProviderState[];
  seed?: { prompt: string; kind: GenerationPayload["kind"] };
  onNotify: (message: string) => void;
}

const KINDS: { id: GenerationPayload["kind"]; label: string; hint: string }[] = [
  { id: "image", label: "Imagem", hint: "Keyframe, mockup ou asset de campanha" },
  { id: "animation", label: "Animação", hint: "Composição Remotion com cenas" },
  { id: "loading", label: "Loading screen", hint: "Tela de carregamento animada" },
  { id: "video", label: "Vídeo", hint: "Storyboard com planos e exportável" },
  { id: "copy", label: "Copy", hint: "Headline, sub e bullets da marca" },
];

export default function GenerationsPanel({ designSystem, category, history, providers, seed, onNotify }: Props) {
  const [kind, setKind] = useState<GenerationPayload["kind"]>("image");
  const [prompt, setPrompt] = useState(`Campanha de ${category.short.toLowerCase()} para ${designSystem.name}`);
  const [aspect, setAspect] = useState<"1:1" | "16:9" | "9:16" | "4:5">("1:1");
  const [providerId, setProviderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<GenerationPayload | null>(history[0]?.payload ?? null);
  const [runInfo, setRunInfo] = useState<{ provider: string; model: string; offline: boolean } | null>(
    history[0] ? { provider: history[0].provider, model: "", offline: true } : null,
  );
  const [items, setItems] = useState<HistoryItem[]>(history);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (!seed) return;
    setKind(seed.kind);
    setPrompt(seed.prompt.slice(0, 220));
  }, [seed]);

  const activeProvider = useMemo(
    () => providers.find((provider) => provider.id === providerId) ?? providers.find((provider) => provider.active && provider.hasKey),
    [providerId, providers],
  );

  async function generate() {
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          prompt,
          designSystemId: designSystem.id,
          categoryId: category.id,
          providerId: providerId || undefined,
          aspect,
        }),
      });
      const json = (await response.json()) as {
        payload?: GenerationPayload;
        provider?: string;
        model?: string;
        offline?: boolean;
        id?: string;
        error?: string;
      };
      if (!response.ok || !json.payload) {
        onNotify(json.error ?? "Falha ao gerar");
        return;
      }
      setPayload(json.payload);
      setRunInfo({ provider: json.provider ?? "local", model: json.model ?? "", offline: Boolean(json.offline) });
      if (json.id) {
        const item: HistoryItem = {
          id: json.id,
          kind,
          prompt,
          provider: json.provider ?? "local",
          payload: json.payload,
          createdAt: new Date().toISOString(),
        };
        setItems((current) => [item, ...current].slice(0, 12));
      }
      onNotify(json.offline ? "Gerado localmente (sem API key de imagem)" : `Gerado com ${json.provider}`);
    } catch {
      onNotify("Falha de rede ao gerar");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!payload?.remotionCode) return;
    try {
      await navigator.clipboard.writeText(payload.remotionCode);
      onNotify("Código Remotion copiado");
    } catch {
      onNotify("Não foi possível copiar");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 296px", minHeight: "calc(100vh - 49px)" }}>
      <div style={{ padding: 20, display: "grid", gap: 16, alignContent: "start", minWidth: 0 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
          <div>
            <span className="label">Geração · imagem · animação · vídeo</span>
            <h1 className="display" style={{ fontSize: 32, margin: "6px 0 4px" }}>
              Estúdio de mídia
            </h1>
            <p className="hint" style={{ maxWidth: 640 }}>
              Gera keyframes com Gemini Flash / GPT Image ou, sem chave, composições locais em SVG. Animações usam o Remotion Player e saem com
              código pronto para renderizar MP4.
            </p>
          </div>
          <span className="badge badge-accent">
            <span className="status-dot" /> {designSystem.name} · {category.short}
          </span>
        </header>

        <div className="panel" style={{ padding: 14, display: "grid", gap: 11 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {KINDS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`btn btn-sm ${kind === item.id ? "btn-primary" : ""}`}
                onClick={() => setKind(item.id)}
                title={item.hint}
              >
                {item.label}
              </button>
            ))}
          </div>
          <textarea
            className="textarea"
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Descreva o asset: hero de campanha, macro da joia, loading com logo…"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span className="label">Proporção</span>
              <select className="select" value={aspect} onChange={(event) => setAspect(event.target.value as typeof aspect)}>
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="4:5">4:5</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className="label">Provedor</span>
              <select className="select" value={providerId} onChange={(event) => setProviderId(event.target.value)}>
                <option value="">Automático ({activeProvider?.label ?? "local"})</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label} {provider.hasKey ? "· key" : "· local"}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span className="label">Modelo sugerido</span>
              <div className="panel-soft" style={{ padding: "9px 10px", fontSize: 11, color: "var(--muted)" }}>
                {kind === "image" ? activeProvider?.imageModel ?? "svg local" : "remotion-template"}
              </div>
            </label>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={generate} disabled={loading}>
                {loading ? "Gerando…" : "Gerar asset"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <span className="hint" style={{ fontSize: 10.5 }}>
              {activeProvider?.hasKey
                ? `Chave ativa: ${activeProvider.label} (${activeProvider.keyPreview}) · modelo de imagem ${activeProvider.imageModel}`
                : "Sem API key: renderização local determinística (SVG + Remotion). Ative um provedor em Configurações."}
            </span>
            {runInfo && (
              <span className="badge">
                {runInfo.provider} {runInfo.model ? `· ${runInfo.model}` : ""} {runInfo.offline ? "· local" : "· live"}
              </span>
            )}
          </div>
        </div>

        <div className="panel" style={{ padding: 14, display: "grid", gap: 12, minHeight: 320 }}>
          {!payload && (
            <div style={{ display: "grid", placeItems: "center", minHeight: 260, gap: 6 }}>
              <span className="display" style={{ fontSize: 26, color: "var(--muted)" }}>
                Nada gerado ainda
              </span>
              <span className="hint">Escolha um formato e clique em gerar asset.</span>
            </div>
          )}

          {payload?.kind === "image" && payload.imageUrl && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span className="label">{payload.title}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {payload.offline && <span className="badge badge-rose">gerado localmente</span>}
                  <a className="btn btn-sm" href={payload.imageUrl} download={`${designSystem.id}-keyframe`}>
                    ↓ baixar
                  </a>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payload.imageUrl}
                alt={payload.prompt}
                style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)", maxHeight: 460, objectFit: "cover" }}
              />
              <p className="hint" style={{ fontSize: 10.5 }}>
                {payload.summary}
              </p>
            </div>
          )}

          {(payload?.kind === "animation" || payload?.kind === "loading" || payload?.kind === "video") && payload.scenes && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <span className="label">{payload.title}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="btn btn-sm" onClick={() => setShowCode((value) => !value)}>
                    {showCode ? "ocultar código" : "ver código Remotion"}
                  </button>
                  <button type="button" className="btn btn-sm" onClick={copyCode}>
                    copiar
                  </button>
                </div>
              </div>
              <RemotionScene scenes={payload.scenes} fps={payload.fps ?? 30} />
              <p className="hint" style={{ fontSize: 10.5 }}>
                {payload.summary}
              </p>
              {payload.storyboard && (
                <div style={{ display: "grid", gap: 5 }}>
                  {payload.storyboard.map((shot, index) => (
                    <div key={index} className="panel-soft" style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontSize: 11 }}>{shot.shot}</span>
                      <span className="hint" style={{ fontSize: 10, flex: 1 }}>
                        {shot.action}
                      </span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--accent)" }}>
                        {shot.seconds.toFixed(1)}s
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {showCode && payload.remotionCode && (
                <pre className="codeblock" style={{ maxHeight: 320 }}>
                  {payload.remotionCode}
                </pre>
              )}
            </div>
          )}

          {payload?.kind === "copy" && payload.copy && (
            <div style={{ display: "grid", gap: 12 }}>
              <span className="label">{payload.title}</span>
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: 22,
                  background: `linear-gradient(135deg, ${designSystem.palette.bg}, ${designSystem.palette.surface})`,
                  color: designSystem.palette.ink,
                }}
              >
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: designSystem.palette.accent }}>
                  {designSystem.name}
                </div>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 34, lineHeight: 1.05, margin: "12px 0 10px" }}>{payload.copy.headline}</h2>
                <p style={{ fontSize: 13, opacity: 0.72, maxWidth: 540 }}>{payload.copy.sub}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                  {payload.copy.bullets.map((bullet) => (
                    <span key={bullet} style={{ fontSize: 11, border: `1px solid ${designSystem.palette.line}`, borderRadius: 99, padding: "4px 10px" }}>
                      {bullet}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    background: designSystem.palette.accent,
                    color: designSystem.palette.bg,
                    padding: "10px 18px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {payload.copy.cta}
                </div>
              </div>
              <pre className="codeblock">{JSON.stringify(payload.copy, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <aside className="scroll-thin" style={{ borderLeft: "1px solid var(--line)", padding: 15, overflowY: "auto", maxHeight: "calc(100vh - 49px)", background: "var(--panel)" }}>
        <span className="label">Histórico (Postgres)</span>
        <div style={{ display: "grid", gap: 7, marginTop: 9 }}>
          {items.length === 0 && <span className="hint">As gerações aparecem aqui depois do primeiro asset.</span>}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="panel-soft"
              style={{ textAlign: "left", padding: "8px 10px", cursor: "pointer", display: "grid", gap: 3 }}
              onClick={() => {
                setPayload(item.payload);
                setKind(item.payload.kind);
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span className="badge" style={{ fontSize: 8.5 }}>
                  {item.kind}
                </span>
                <span className="mono" style={{ fontSize: 8.5, color: "var(--faint)" }}>
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {item.prompt}
              </span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <span className="label">Modelos com imagem</span>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {providers.slice(0, 5).map((provider) => (
              <div key={provider.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 10.5 }}>
                <span style={{ color: provider.hasKey ? "var(--ink)" : "var(--faint)" }}>{provider.label}</span>
                <span className="mono" style={{ fontSize: 9.5, color: "var(--faint)", textAlign: "right" }}>
                  {provider.imageModel || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-soft" style={{ padding: "10px 11px", marginTop: 16 }}>
          <span className="label">Remotion</span>
          <p className="hint" style={{ fontSize: 10.5, marginTop: 5 }}>
            Instalamos `remotion` + `@remotion/player`. O preview roda no browser; para renderizar MP4 use `npx remotion render StudioComposition
            out/video.mp4` no projeto exportado.
          </p>
        </div>
      </aside>
    </div>
  );
}
