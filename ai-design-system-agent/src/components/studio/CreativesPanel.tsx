"use client";

import { useState, useMemo } from "react";
import type { Category, DesignSystem } from "@/lib/types";
import { humanizeCreativeCopy, humanizeText } from "@/lib/humanizer";
import { generateSeoMetadata, formatHtmlHeadTags } from "@/lib/seo-engine";
import { AUDIENCE_SCHEDULES, INITIAL_SCHEDULED_POSTS, type ScheduledPost } from "@/lib/social-schedule";
import { PRELOADED_COMMUNITY_TEMPLATES, batchImportTemplates, type OpenDesignTemplate } from "@/lib/opendesign";

interface Props {
  category: Category;
  designSystem: DesignSystem;
  onNotify: (message: string) => void;
  onOpenTab?: (tab: string) => void;
}

type CreativeTab = "canvas" | "humanizer" | "schedule" | "seo" | "scrollcraft" | "opendesign";

export default function CreativesPanel({ category, designSystem, onNotify, onOpenTab }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<CreativeTab>("canvas");

  // Creative Canvas State
  const [canvasFormat, setCanvasFormat] = useState<"square" | "story" | "landscape">("square");
  const [headline, setHeadline] = useState("Design que Transforma o Seu Espaço");
  const [subheadline, setSubheadline] = useState("Peças exclusivas com atenção aos mínimos detalhes e envio imediato.");
  const [tagPrice, setTagPrice] = useState("R$ 489");
  const [badgeText, setBadgeText] = useState("LANÇAMENTO LIMITADO");
  const [ctaText, setCtaText] = useState("Comprar Agora");
  const [bgStyle, setBgStyle] = useState<"dark" | "accent" | "surface">("dark");

  // Humanizer State
  const [rawTextToHumanize, setRawTextToHumanize] = useState(
    "Não é apenas um produto, é um divisor de águas. Mergulhe de cabeça no design meticulosamente trabalhado que eleva sua experiência ao próximo nível. Esse é o verdadeiro diferencial."
  );
  const [humanizerTone, setHumanizerTone] = useState<"conversational" | "editorial" | "direct" | "technical">("conversational");
  const [humanizedResult, setHumanizedResult] = useState(() =>
    humanizeText(rawTextToHumanize, { tone: "conversational" })
  );

  // Scheduler State
  const [posts, setPosts] = useState<ScheduledPost[]>(INITIAL_SCHEDULED_POSTS);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostTime, setNewPostTime] = useState("");
  const [newPostPlatform, setNewPostPlatform] = useState<"instagram" | "facebook" | "both">("both");

  // SEO State
  const [seoTitle, setSeoTitle] = useState(`${designSystem.name} · Coleção Exclusiva`);
  const [seoDesc, setSeoDesc] = useState(designSystem.description);
  const [seoUrl, setSeoUrl] = useState("https://sua-loja.com.br");

  // OpenDesign Templates State
  const [communityTemplates, setCommunityTemplates] = useState<OpenDesignTemplate[]>(PRELOADED_COMMUNITY_TEMPLATES);
  const [batchInputText, setBatchInputText] = useState("");

  // Scroll-Craft Interactive Stage State
  const [scrollFrame, setScrollFrame] = useState(35); // 0 to 100 timeline
  const [selectedGrammar, setSelectedGrammar] = useState("Filmic One-Shot");

  // Dynamic SEO Output
  const seoData = useMemo(() => {
    return generateSeoMetadata({
      title: seoTitle,
      description: seoDesc,
      url: seoUrl,
      siteName: designSystem.name,
      categoryName: category.name,
      product: {
        name: "Edição Especial " + designSystem.name,
        price: 489,
        currency: "BRL",
        brand: designSystem.name,
        inStock: true,
        rating: 4.9,
      },
    });
  }, [seoTitle, seoDesc, seoUrl, designSystem, category]);

  // Audience peak hours for the current category
  const scheduleData = AUDIENCE_SCHEDULES[category.id] ?? AUDIENCE_SCHEDULES.ecommerce;

  // Run humanizer on Canvas texts
  const handleHumanizeCanvas = () => {
    const res = humanizeCreativeCopy({
      headline,
      subheadline,
      caption: subheadline,
      cta: ctaText,
    }, { tone: "editorial" });

    setHeadline(res.headline);
    setSubheadline(res.subheadline);
    setCtaText(res.cta);
    onNotify(`Copy humanizado! (${res.changesCount} alterações realizadas com a skill humanizer)`);
  };

  const handleAddPost = () => {
    if (!newPostTitle.trim()) return;
    const newEntry: ScheduledPost = {
      id: `post-${Date.now()}`,
      title: newPostTitle,
      platform: newPostPlatform,
      format: canvasFormat === "story" ? "story" : "post",
      scheduledFor: newPostTime || "Próximo horário de pico",
      status: "scheduled",
      category: category.id,
      caption: headline + " - " + subheadline,
    };
    setPosts([newEntry, ...posts]);
    setNewPostTitle("");
    onNotify("Publicação agendada com sucesso!");
  };

  const handleBatchImport = () => {
    if (!batchInputText.trim()) return;
    const result = batchImportTemplates([{ filename: "batch_import.json", content: batchInputText }]);
    if (result.templates.length > 0) {
      setCommunityTemplates([...result.templates, ...communityTemplates]);
      onNotify(`${result.importedCount} templates Figma / OpenDesign importados com sucesso!`);
      setBatchInputText("");
    } else {
      onNotify("Nenhum template válido encontrado no payload.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 49px)", background: "var(--bg)", overflow: "hidden" }}>
      {/* Sub-Header Navigation */}
      <div
        style={{
          height: 48,
          borderBottom: "1px solid var(--line)",
          background: "var(--panel)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>❖ CRIATIVOS STUDIO</span>
          <span style={{ color: "var(--line)" }}>|</span>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "canvas", label: "Canvas Visual (IG / FB)", icon: "🎨" },
              { id: "humanizer", label: "Humanizer Copy", icon: "✦" },
              { id: "schedule", label: "Agenda & Picos", icon: "📅" },
              { id: "seo", label: "SEO & Rich Snippets", icon: "🔍" },
              { id: "scrollcraft", label: "Scroll-Craft 3D", icon: "🎬" },
              { id: "opendesign", label: "OpenDesign / Figma", icon: "⌗" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="btn btn-sm"
                style={{
                  background: activeSubTab === tab.id ? "var(--panel-3)" : "transparent",
                  color: activeSubTab === tab.id ? "var(--accent)" : "var(--muted)",
                  border: activeSubTab === tab.id ? "1px solid rgba(215,247,107,0.3)" : "1px solid transparent",
                  fontSize: 11,
                }}
                onClick={() => setActiveSubTab(tab.id as CreativeTab)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge badge-accent" style={{ fontSize: 10 }}>
            {category.short} · {designSystem.name}
          </span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }} className="scroll-thin">
        {/* SUBTAB 1: CANVAS DESIGNER */}
        {activeSubTab === "canvas" && (
          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24, maxWidth: 1300, margin: "0 auto" }}>
            {/* Controls */}
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 18, display: "grid", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="label">Formato do Criativo</span>
                  <span className="badge" style={{ fontSize: 9 }}>Instagram & Facebook</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[
                    { id: "square", label: "Feed 1:1", size: "1080×1080" },
                    { id: "story", label: "Story 9:16", size: "1080×1920" },
                    { id: "landscape", label: "Anúncio 1.9:1", size: "1200×628" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      className="btn btn-sm"
                      style={{
                        flexDirection: "column",
                        padding: "8px 4px",
                        background: canvasFormat === fmt.id ? "var(--panel-3)" : "var(--panel-2)",
                        color: canvasFormat === fmt.id ? "var(--accent)" : "var(--ink)",
                        border: canvasFormat === fmt.id ? "1px solid var(--accent)" : "1px solid var(--line)",
                      }}
                      onClick={() => setCanvasFormat(fmt.id as any)}
                    >
                      <span style={{ fontWeight: 600, fontSize: 11 }}>{fmt.label}</span>
                      <span style={{ fontSize: 9, opacity: 0.6 }}>{fmt.size}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <span className="label" style={{ display: "block", marginBottom: 6 }}>Título de Impacto</span>
                  <input className="input" value={headline} onChange={(e) => setHeadline(e.target.value)} />
                </div>

                <div>
                  <span className="label" style={{ display: "block", marginBottom: 6 }}>Subtítulo / Descrição</span>
                  <textarea className="input" rows={2} value={subheadline} onChange={(e) => setSubheadline(e.target.value)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <span className="label" style={{ display: "block", marginBottom: 4 }}>Preço / Oferta</span>
                    <input className="input" value={tagPrice} onChange={(e) => setTagPrice(e.target.value)} />
                  </div>
                  <div>
                    <span className="label" style={{ display: "block", marginBottom: 4 }}>Badge Promocional</span>
                    <input className="input" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
                  </div>
                </div>

                <div>
                  <span className="label" style={{ display: "block", marginBottom: 4 }}>Texto do Botão (CTA)</span>
                  <input className="input" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ flex: 1, background: "rgba(215,247,107,0.15)", color: "var(--accent)", border: "1px solid rgba(215,247,107,0.3)" }}
                    onClick={handleHumanizeCanvas}
                  >
                    ✦ Humanizar Textos (Skill)
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Stage */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: canvasFormat === "story" ? 340 : canvasFormat === "landscape" ? 540 : 440,
                  height: canvasFormat === "story" ? 600 : canvasFormat === "landscape" ? 282 : 440,
                  background: bgStyle === "dark" ? designSystem.palette.bg : bgStyle === "accent" ? designSystem.palette.accent : designSystem.palette.surface,
                  color: bgStyle === "accent" ? "#101308" : designSystem.palette.ink,
                  borderRadius: 16,
                  border: "1px solid var(--line)",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: canvasFormat === "story" ? "40px 24px" : "32px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Header Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      background: "rgba(215,247,107,0.18)",
                      color: designSystem.palette.accent,
                      padding: "4px 10px",
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {badgeText}
                  </span>
                  <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 600 }}>{designSystem.name}</span>
                </div>

                {/* Center Content */}
                <div style={{ textAlign: "center", margin: "16px 0" }}>
                  <div
                    style={{
                      width: canvasFormat === "story" ? 140 : 110,
                      height: canvasFormat === "story" ? 140 : 110,
                      margin: "0 auto 16px",
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${designSystem.palette.accent}20 0%, transparent 70%)`,
                      border: `1px solid ${designSystem.palette.accent}40`,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 32,
                    }}
                  >
                    ✦
                  </div>
                  <h2
                    style={{
                      fontFamily: designSystem.fonts.display,
                      fontSize: canvasFormat === "story" ? 28 : 24,
                      fontWeight: 700,
                      margin: "0 0 10px",
                      lineHeight: 1.15,
                    }}
                  >
                    {headline}
                  </h2>
                  <p style={{ fontSize: 13, opacity: 0.8, maxWidth: 360, margin: "0 auto", lineHeight: 1.4 }}>
                    {subheadline}
                  </p>
                </div>

                {/* Bottom CTA / Price */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
                  <div>
                    <span style={{ fontSize: 10, opacity: 0.6, display: "block" }}>A partir de</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: designSystem.palette.accent }}>{tagPrice}</span>
                  </div>
                  <button
                    type="button"
                    style={{
                      background: designSystem.palette.accent,
                      color: "#101308",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: 99,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {ctaText} →
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onNotify("Criativo pronto para Instagram & Facebook!")}
                >
                  ⬇ Baixar Imagem (1080p)
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: "var(--accent)", color: "var(--accent-ink)", fontWeight: 600 }}
                  onClick={() => {
                    setActiveSubTab("schedule");
                    setNewPostTitle(headline);
                  }}
                >
                  📅 Agendar Publicação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: HUMANIZER COPY */}
        {activeSubTab === "humanizer" && (
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 20 }}>
            <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 20, display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Humanizer Engine (blader/humanizer v4.0.0)</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                    Elimina vícios sintéticos de IA, contrastes artificiais ("não é X, é Y"), travessões excessivos e termos vazios.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["conversational", "editorial", "direct", "technical"] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      className="btn btn-sm"
                      style={{
                        background: humanizerTone === tone ? "var(--accent)" : "var(--panel-2)",
                        color: humanizerTone === tone ? "var(--accent-ink)" : "var(--ink)",
                        textTransform: "capitalize",
                        fontSize: 11,
                      }}
                      onClick={() => {
                        setHumanizerTone(tone);
                        setHumanizedResult(humanizeText(rawTextToHumanize, { tone }));
                      }}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="label" style={{ display: "block", marginBottom: 6 }}>Texto com Linguagem Típica de IA:</span>
                <textarea
                  className="input"
                  rows={4}
                  value={rawTextToHumanize}
                  onChange={(e) => {
                    setRawTextToHumanize(e.target.value);
                    setHumanizedResult(humanizeText(e.target.value, { tone: humanizerTone }));
                  }}
                />
              </div>

              <div style={{ background: "var(--panel-2)", border: "1px solid rgba(215,247,107,0.2)", borderRadius: 10, padding: 16 }}>
                <span className="label" style={{ color: "var(--accent)", display: "block", marginBottom: 6 }}>
                  ✦ Resultado Humanizado (Sem Tells de IA):
                </span>
                <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
                  {humanizedResult.humanized}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {humanizedResult.flags.map((flag, idx) => (
                    <span key={idx} className="badge" style={{ fontSize: 10, background: "rgba(138,180,255,0.12)", color: "var(--blue)" }}>
                      ✓ {flag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm"
                style={{ background: "var(--accent)", color: "var(--accent-ink)", fontWeight: 600, justifySelf: "start" }}
                onClick={() => {
                  setHeadline(humanizedResult.humanized.slice(0, 50));
                  setSubheadline(humanizedResult.humanized);
                  onNotify("Texto aplicado ao Criativo e ao SEO!");
                }}
              >
                Aplicar ao Criativo e à Campanha
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 3: SOCIAL SCHEDULE & BEST HOURS */}
        {activeSubTab === "schedule" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Best Times Heatmap */}
            <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 20, display: "grid", gap: 16 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Melhores Horários de Publicação</h3>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                  Calculados com base no público de <strong>{scheduleData.label}</strong> (Instagram & Facebook).
                </p>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {scheduleData.peakSlots.map((slot, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--panel-2)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>{slot.day}</span>
                        <span className="badge badge-accent" style={{ fontSize: 10 }}>{slot.time}</span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted)" }}>{slot.rationale}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>{slot.engagementScore}%</span>
                      <span style={{ display: "block", fontSize: 9, opacity: 0.6 }}>Engajamento</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Scheduler Form */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, display: "grid", gap: 10 }}>
                <span className="label">Agendar Nova Publicação</span>
                <input
                  className="input"
                  placeholder="Título ou tema da publicação…"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    className="input"
                    placeholder="Horário (ex: Quinta às 20:00)"
                    value={newPostTime}
                    onChange={(e) => setNewPostTime(e.target.value)}
                  />
                  <select
                    className="select"
                    value={newPostPlatform}
                    onChange={(e) => setNewPostPlatform(e.target.value as any)}
                  >
                    <option value="both">Instagram & Facebook</option>
                    <option value="instagram">Apenas Instagram</option>
                    <option value="facebook">Apenas Facebook</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: "var(--accent)", color: "var(--accent-ink)", fontWeight: 600 }}
                  onClick={handleAddPost}
                >
                  + Agendar na Grade
                </button>
              </div>
            </div>

            {/* Scheduled Queue */}
            <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 20, display: "grid", gap: 14 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Fila de Publicações Programadas</h3>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                  Integração com Meta Graph API para postagem automática em canais conectados.
                </p>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {posts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      background: "var(--panel-2)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "14px",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{post.title}</span>
                      <span
                        className="badge"
                        style={{
                          background: post.status === "scheduled" ? "rgba(215,247,107,0.15)" : "var(--panel-3)",
                          color: post.status === "scheduled" ? "var(--accent)" : "var(--muted)",
                          fontSize: 9,
                        }}
                      >
                        {post.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{post.caption}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--faint)" }}>
                      <span>Canal: {post.platform} ({post.format})</span>
                      <span className="mono">{post.scheduledFor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: SEO & RICH SNIPPETS */}
        {activeSubTab === "seo" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Input & Form */}
            <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 20, display: "grid", gap: 14 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Otimização de SEO & Meta Tags</h3>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                  Gerador para Google, Instagram, Facebook e dados estruturados JSON-LD Schema.org.
                </p>
              </div>

              <div>
                <span className="label" style={{ display: "block", marginBottom: 4 }}>Título da Página (50-60 caracteres)</span>
                <input className="input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
                <span style={{ fontSize: 10, color: seoTitle.length > 60 ? "var(--danger)" : "var(--muted)", marginTop: 2, display: "block" }}>
                  {seoTitle.length} / 60 caracteres
                </span>
              </div>

              <div>
                <span className="label" style={{ display: "block", marginBottom: 4 }}>Meta Description (145-160 caracteres)</span>
                <textarea className="input" rows={3} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
                <span style={{ fontSize: 10, color: seoDesc.length > 160 ? "var(--danger)" : "var(--muted)", marginTop: 2, display: "block" }}>
                  {seoDesc.length} / 160 caracteres
                </span>
              </div>

              <div>
                <span className="label" style={{ display: "block", marginBottom: 4 }}>URL Canônica</span>
                <input className="input" value={seoUrl} onChange={(e) => setSeoUrl(e.target.value)} />
              </div>

              <button
                type="button"
                className="btn btn-sm"
                style={{ background: "var(--accent)", color: "var(--accent-ink)", fontWeight: 600, justifySelf: "start" }}
                onClick={() => {
                  navigator.clipboard.writeText(formatHtmlHeadTags(seoData));
                  onNotify("Tags HTML e JSON-LD copiadas!");
                }}
              >
                Copiar Tags HTML & JSON-LD
              </button>
            </div>

            {/* Live SERP Previews */}
            <div style={{ display: "grid", gap: 16 }}>
              {/* Google SERP Preview */}
              <div style={{ background: "#ffffff", color: "#1a0dab", borderRadius: 12, padding: 18, border: "1px solid var(--line)" }}>
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#70757a", fontWeight: 700, display: "block", marginBottom: 8 }}>
                  Preview: Google Search
                </span>
                <div style={{ fontSize: 11, color: "#202124", marginBottom: 4 }}>{seoData.serpSnippet.googleUrl}</div>
                <div style={{ fontSize: 18, color: "#1a0dab", fontWeight: 500, lineHeight: 1.25, marginBottom: 6 }}>
                  {seoData.serpSnippet.googleTitle}
                </div>
                <div style={{ fontSize: 13, color: "#4d5156", lineHeight: 1.4 }}>
                  {seoData.serpSnippet.googleSnippet}
                </div>
              </div>

              {/* Facebook / WhatsApp Link Card Preview */}
              <div style={{ background: "#111418", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
                <div style={{ height: 160, background: "#1b2028", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 13 }}>
                  [ Imagem OpenGraph 1200×630 ]
                </div>
                <div style={{ padding: 14 }}>
                  <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--faint)", fontWeight: 600, display: "block" }}>
                    {seoData.socialCard.domain}
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 700, margin: "4px 0", color: "#eceef1" }}>
                    {seoData.socialCard.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#8e949e", lineHeight: 1.3 }}>
                    {seoData.socialCard.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: SCROLL-CRAFT 3D */}
        {activeSubTab === "scrollcraft" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
            <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 20, display: "grid", gap: 16 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Scroll-Craft Engine (nateherkai)</h3>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                  Demonstração de produto orientada a rolagem (scrollytelling) em 8 gramáticas sem cortes.
                </p>
              </div>

              <div>
                <span className="label" style={{ display: "block", marginBottom: 6 }}>Gramática da Página</span>
                <select
                  className="select"
                  value={selectedGrammar}
                  onChange={(e) => setSelectedGrammar(e.target.value)}
                >
                  <option value="Filmic One-Shot">Filmic One-Shot (PERKFORM)</option>
                  <option value="Live Surface">Live Surface (Glaido 3D)</option>
                  <option value="Split Stage">Split Stage (Serein Macro)</option>
                  <option value="Typographic Poster">Typographic Poster (FORME)</option>
                  <option value="Continuous World">Continuous World (Pelagic)</option>
                  <option value="Chaptered Editorial">Chaptered Editorial (NOEMA)</option>
                  <option value="Rhythmic Cutlist">Rhythmic Cutlist (OFFGRID)</option>
                  <option value="Gallery Stage">Gallery Stage (Afterhours)</option>
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="label">Timeline de Rolagem (Scrub)</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>{scrollFrame}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scrollFrame}
                  onChange={(e) => setScrollFrame(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)" }}
                />
              </div>

              <div style={{ background: "var(--panel-2)", padding: 12, borderRadius: 10, fontSize: 11.5, color: "var(--muted)" }}>
                <strong>Regra de Ouro:</strong> Scroll é a timeline. O leitor controla o vídeo frame a frame e a rotação do produto conforme rola a página.
              </div>

              <button
                type="button"
                className="btn btn-sm"
                style={{ background: "var(--accent)", color: "var(--accent-ink)", fontWeight: 600 }}
                onClick={() => {
                  onNotify("Gramática Scroll-Craft ativada na categoria principal!");
                  if (onOpenTab) onOpenTab("studio");
                }}
              >
                Abrir Categoria Scroll-Craft no Studio
              </button>
            </div>

            {/* Interactive 3D Mockup Stage */}
            <div
              style={{
                background: "#07080a",
                borderRadius: 16,
                border: "1px solid var(--line)",
                padding: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                minHeight: 460,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at center, rgba(138,180,255,0.12) 0%, transparent 70%)",
                }}
              />

              {/* Rotating Simulated 3D Product */}
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 24,
                  background: "linear-gradient(145deg, #1c2331, #0c0e14)",
                  border: "2px solid rgba(138,180,255,0.4)",
                  boxShadow: "0 30px 70px rgba(0,0,0,0.9)",
                  display: "grid",
                  placeItems: "center",
                  transform: `rotateY(${scrollFrame * 3.6}deg) rotateX(${scrollFrame * 0.5}deg) scale(${1 + scrollFrame * 0.003})`,
                  transition: "transform 0.1s ease-out",
                  zIndex: 2,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 44, color: "var(--blue)" }}>✦</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", marginTop: 8 }}>
                    {scrollFrame > 60 ? "EXPLODED VIEW" : "MACRO FINISH"}
                  </div>
                  <div className="mono" style={{ fontSize: 9, opacity: 0.6 }}>{Math.round(scrollFrame * 3.6)}° ROTAÇÃO</div>
                </div>
              </div>

              {/* Pinned Telemetry Box */}
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 24,
                  background: "rgba(17,20,24,0.85)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 11,
                  zIndex: 3,
                }}
              >
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>PINNED STAGE</span>: {scrollFrame}% · Gramática: {selectedGrammar}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 6: OPENDESIGN / FIGMA IMPORTER */}
        {activeSubTab === "opendesign" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 20 }}>
            {/* Batch Importer Area */}
            <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 20, display: "grid", gap: 14 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Importador em Lote (OpenDesign & Comunidade Figma)</h3>
                <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                  Cole ou carregue múltiplos templates da comunidade Figma em JSON de Design Tokens ou vetores SVG para converter em seções editáveis.
                </p>
              </div>

              <textarea
                className="input scroll-thin"
                rows={4}
                placeholder="Cole JSON de Design Tokens Figma ou SVG em lote aqui…"
                value={batchInputText}
                onChange={(e) => setBatchInputText(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-sm"
                style={{ background: "var(--accent)", color: "var(--accent-ink)", fontWeight: 600, justifySelf: "start" }}
                onClick={handleBatchImport}
              >
                + Processar Importação em Lote
              </button>
            </div>

            {/* Template Gallery */}
            <div>
              <span className="label" style={{ display: "block", marginBottom: 12 }}>
                Templates da Comunidade Disponíveis ({communityTemplates.length})
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {communityTemplates.map((template) => (
                  <div
                    key={template.id}
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{template.name}</span>
                        <span className="badge" style={{ fontSize: 9 }}>{template.format}</span>
                      </div>
                      <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                        {template.dimensions.width}×{template.dimensions.height}px · Fonte: {template.source}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ flex: 1, background: "rgba(215,247,107,0.12)", color: "var(--accent)", border: "1px solid rgba(215,247,107,0.3)" }}
                        onClick={() => {
                          onNotify(`Template '${template.name}' carregado no canvas!`);
                          setHeadline(template.name);
                          setActiveSubTab("canvas");
                        }}
                      >
                        Usar no Canvas
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => {
                          onNotify(`Template enviado para o Smart Editor!`);
                          if (onOpenTab) onOpenTab("smart-editor");
                        }}
                      >
                        Abrir no Smart Editor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

