"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Category, DesignSystem } from "@/lib/types";
import { humanizeText, humanizeCreativeCopy } from "@/lib/humanizer";
import { generateSeoMetadata } from "@/lib/seo-engine";
import { AUDIENCE_SCHEDULES, INITIAL_SCHEDULED_POSTS, type ScheduledPost } from "@/lib/social-schedule";
import {
  CANVAS_FORMATS,
  PRELOADED_CANVA_TEMPLATES,
  convertPenpotToCanvas,
  exportToPenpotSvg,
  exportToFigmaTokens,
  type CanvasFormatId,
  type CanvasElement,
  type CanvasPage,
  type CanvaTemplatePreset,
} from "@/lib/canva-engine";

interface Props {
  category: Category;
  designSystem: DesignSystem;
  onNotify: (message: string) => void;
  onOpenTab?: (tab: string) => void;
}

type DockTab =
  | "templates"
  | "elements"
  | "text"
  | "brand"
  | "uploads"
  | "carousel"
  | "formats"
  | "figma-penpot"
  | "social-tools";

export default function CreativesPanel({ category, designSystem, onNotify }: Props) {
  // Active Dock Navigation item
  const [activeDock, setActiveDock] = useState<DockTab>("templates");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Active Project & Canvas Format
  const [currentFormatId, setCurrentFormatId] = useState<CanvasFormatId>("ig-post");
  const activeFormat = CANVAS_FORMATS[currentFormatId];

  // Document Title (Canva Header)
  const [projectTitle, setProjectTitle] = useState("Somos pet friendly pousada moderno laranja e azul post");

  // Multi-Page / Slides state (Carrossel support)
  const [pages, setPages] = useState<CanvasPage[]>(() => {
    const petTemplate = PRELOADED_CANVA_TEMPLATES[0];
    return JSON.parse(JSON.stringify(petTemplate.pages));
  });
  const [activePageIndex, setActivePageIndex] = useState(0);
  const activePage = pages[activePageIndex] || pages[0];

  // Selection & Inspector State
  const [selectedElementId, setSelectedElementId] = useState<string | null>("el-pet-friendly-text");
  const selectedElement = activePage.elements.find((el) => el.id === selectedElementId) || null;

  // Zoom slider state
  const [zoomPercent, setZoomPercent] = useState(48); // 48% matches Canva screenshot

  // Filter chips & search in templates
  const [templateSearch, setTemplateSearch] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState("todos");

  // Penpot & Figma Import State
  const [importText, setImportText] = useState("");
  const [importFileName, setImportFileName] = useState("penpot_template.svg");

  // Dragging / Moving state on Canvas
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Social Tools state
  const [posts, setPosts] = useState<ScheduledPost[]>(INITIAL_SCHEDULED_POSTS);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostTime, setNewPostTime] = useState("");
  const [newPostPlatform, setNewPostPlatform] = useState<"instagram" | "facebook" | "youtube" | "tiktok">("instagram");

  // Canvas DOM container ref for zoom calculation & download
  const canvasRef = useRef<HTMLDivElement>(null);

  // Scale factor based on format base width vs stage
  const scale = zoomPercent / 100;

  // Best posting times for current category
  const scheduleData = AUDIENCE_SCHEDULES[category.id] ?? AUDIENCE_SCHEDULES.ecommerce;

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return PRELOADED_CANVA_TEMPLATES.filter((tpl) => {
      const matchSearch =
        templateSearch === "" ||
        tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tpl.tags.some((t) => t.toLowerCase().includes(templateSearch.toLowerCase()));
      const matchTag =
        activeTagFilter === "todos" ||
        tpl.tags.includes(activeTagFilter) ||
        (activeTagFilter === "carrossel" && tpl.format === "ig-carousel") ||
        (activeTagFilter === "youtube" && tpl.format === "yt-thumb") ||
        (activeTagFilter === "shorts" && (tpl.format === "yt-shorts" || tpl.format === "tiktok"));
      return matchSearch && matchTag;
    });
  }, [templateSearch, activeTagFilter]);

  // Load a template preset
  const handleLoadTemplate = (tpl: CanvaTemplatePreset) => {
    setCurrentFormatId(tpl.format);
    setPages(JSON.parse(JSON.stringify(tpl.pages)));
    setActivePageIndex(0);
    setSelectedElementId(tpl.pages[0].elements[0]?.id || null);
    setProjectTitle(tpl.name);
    onNotify(`Template '${tpl.name}' carregado no Canvas!`);
  };

  // Add a new slide / page
  const handleAddPage = () => {
    const newPageNum = pages.length + 1;
    const newPage: CanvasPage = {
      id: `page-${Date.now()}`,
      title: `Página ${newPageNum}`,
      bgType: "color",
      bgColor: activePage.bgColor || "#ffffff",
      elements: [
        {
          id: `title-${Date.now()}`,
          type: "heading",
          name: `Título Página ${newPageNum}`,
          x: 100,
          y: 200,
          width: 880,
          height: 120,
          text: `Slide ${newPageNum} · Insira seu título`,
          fontSize: 64,
          fontWeight: "900",
          color: "#0f172a",
          textAlign: "center",
        },
      ],
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
    setSelectedElementId(newPage.elements[0].id);
    onNotify(`Página ${newPageNum} adicionada ao Carrossel!`);
  };

  // Duplicate current page
  const handleDuplicatePage = () => {
    const cloned: CanvasPage = JSON.parse(JSON.stringify(activePage));
    cloned.id = `page-${Date.now()}`;
    cloned.title = `${activePage.title} (Cópia)`;
    const newPages = [...pages];
    newPages.splice(activePageIndex + 1, 0, cloned);
    setPages(newPages);
    setActivePageIndex(activePageIndex + 1);
    onNotify("Página duplicada!");
  };

  // Delete current page
  const handleDeletePage = () => {
    if (pages.length <= 1) {
      onNotify("O documento deve ter pelo menos uma página.");
      return;
    }
    const newPages = pages.filter((_, idx) => idx !== activePageIndex);
    setPages(newPages);
    setActivePageIndex(Math.max(0, activePageIndex - 1));
    onNotify("Página removida.");
  };

  // Update selected element property
  const updateSelectedElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    setPages((prevPages) =>
      prevPages.map((pg, pIdx) => {
        if (pIdx !== activePageIndex) return pg;
        return {
          ...pg,
          elements: pg.elements.map((el) => {
            if (el.id !== selectedElementId) return el;
            return { ...el, ...updates };
          }),
        };
      })
    );
  };

  // Add Element of type
  const handleAddElement = (type: CanvasElement["type"], defaults?: Partial<CanvasElement>) => {
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type,
      name: defaults?.name || `Novo ${type}`,
      x: 140,
      y: 240,
      width: defaults?.width || 360,
      height: defaults?.height || 100,
      text: defaults?.text || (type === "heading" ? "Novo Título" : type === "text" ? "Texto de exemplo" : undefined),
      fontSize: defaults?.fontSize || (type === "heading" ? 64 : 28),
      fontWeight: defaults?.fontWeight || (type === "heading" ? "900" : "600"),
      color: defaults?.color || "#ffffff",
      fill: defaults?.fill || "#3b82f6",
      shapeType: defaults?.shapeType || "rect",
      borderRadius: defaults?.borderRadius || 12,
      zIndex: activePage.elements.length + 1,
      ...defaults,
    };

    setPages((prevPages) =>
      prevPages.map((pg, pIdx) => {
        if (pIdx !== activePageIndex) return pg;
        return { ...pg, elements: [...pg.elements, newEl] };
      })
    );
    setSelectedElementId(newEl.id);
    onNotify(`Elemento '${newEl.name}' inserido no Canvas!`);
  };

  // Delete selected element
  const handleDeleteElement = () => {
    if (!selectedElementId) return;
    setPages((prevPages) =>
      prevPages.map((pg, pIdx) => {
        if (pIdx !== activePageIndex) return pg;
        return {
          ...pg,
          elements: pg.elements.filter((el) => el.id !== selectedElementId),
        };
      })
    );
    setSelectedElementId(null);
    onNotify("Elemento excluído.");
  };

  // Duplicate selected element
  const handleDuplicateElement = () => {
    if (!selectedElement) return;
    const cloned: CanvasElement = {
      ...JSON.parse(JSON.stringify(selectedElement)),
      id: `el-clone-${Date.now()}`,
      name: `${selectedElement.name} (Cópia)`,
      x: selectedElement.x + 30,
      y: selectedElement.y + 30,
    };
    setPages((prevPages) =>
      prevPages.map((pg, pIdx) => {
        if (pIdx !== activePageIndex) return pg;
        return { ...pg, elements: [...pg.elements, cloned] };
      })
    );
    setSelectedElementId(cloned.id);
    onNotify("Elemento duplicado!");
  };

  // Mouse Drag on Canvas
  const handleMouseDownOnElement = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    setSelectedElementId(el.id);
    if (el.locked) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStartPos({ x: el.x, y: el.y });
  };

  const handleMouseMoveStage = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || selectedElement.locked) return;
    const deltaX = (e.clientX - dragStart.x) / scale;
    const deltaY = (e.clientY - dragStart.y) / scale;
    const newX = Math.round(elementStartPos.x + deltaX);
    const newY = Math.round(elementStartPos.y + deltaY);
    updateSelectedElement({ x: newX, y: newY });
  };

  const handleMouseUpStage = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // One-Click Humanizer on Canvas texts
  const handleHumanizeAllTexts = () => {
    let changeCount = 0;
    setPages((prevPages) =>
      prevPages.map((pg, pIdx) => {
        if (pIdx !== activePageIndex) return pg;
        return {
          ...pg,
          elements: pg.elements.map((el) => {
            if (el.text && (el.type === "heading" || el.type === "subheading" || el.type === "text")) {
              const res = humanizeText(el.text, { tone: "conversational" });
              if (res.humanized !== el.text) {
                changeCount++;
                return { ...el, text: res.humanized };
              }
            }
            return el;
          }),
        };
      })
    );
    onNotify(`✨ Humanizer aplicado: ${changeCount} textos humanizados (clichês removidos)!`);
  };

  // 1-Click apply brand kit from current design system
  const handleApplyBrandKit = () => {
    const primary = designSystem.palette.accent;
    const dark = designSystem.palette.bg;
    const surface = designSystem.palette.surface;

    setPages((prevPages) =>
      prevPages.map((pg, pIdx) => {
        if (pIdx !== activePageIndex) return pg;
        return {
          ...pg,
          bgColor: dark,
          elements: pg.elements.map((el) => {
            if (el.type === "shape" && el.shapeType === "card") {
              return { ...el, fill: surface };
            }
            if (el.type === "button" || el.type === "badge" || el.type === "price-tag") {
              return { ...el, badgeBg: primary, fill: primary };
            }
            if (el.type === "heading") {
              return { ...el, color: "#ffffff", fontFamily: designSystem.fonts.heading || "Inter" };
            }
            return el;
          }),
        };
      })
    );
    onNotify(`Paleta de '${designSystem.name}' aplicada a todos os elementos!`);
  };

  // Export to Penpot SVG
  const handleDownloadPenpotSvg = () => {
    const svgContent = exportToPenpotSvg(activePage, activeFormat.width, activeFormat.height);
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectTitle.toLowerCase().replace(/\s+/g, "_")}_penpot.svg`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify("Prancha SVG compatível com Penpot baixada!");
  };

  // Export to Figma Tokens JSON
  const handleDownloadFigmaTokens = () => {
    const tokens = exportToFigmaTokens(activePage);
    const blob = new Blob([tokens], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectTitle.toLowerCase().replace(/\s+/g, "_")}_figma_tokens.json`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify("Tokens W3C para Figma baixados!");
  };

  // Export Canvas to PNG Image
  const handleExportPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = activeFormat.width;
    canvas.height = activeFormat.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = activePage.bgColor || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements in order of z-index
    const sorted = [...activePage.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sorted.forEach((el) => {
      ctx.save();
      if (el.rotation) {
        ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-(el.x + el.width / 2), -(el.y + el.height / 2));
      }

      if (el.type === "shape") {
        ctx.fillStyle = el.fill || "#3b82f6";
        if (el.shapeType === "circle") {
          ctx.beginPath();
          ctx.arc(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
        }
      } else if (el.type === "button" || el.type === "badge" || el.type === "price-tag") {
        ctx.fillStyle = el.badgeBg || el.fill || "#e05315";
        ctx.fillRect(el.x, el.y, el.width, el.height);
        if (el.text) {
          ctx.fillStyle = el.badgeColor || el.color || "#ffffff";
          ctx.font = `bold ${el.fontSize || 24}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(el.text, el.x + el.width / 2, el.y + el.height / 2 + 8);
        }
      } else if (el.text) {
        ctx.fillStyle = el.color || "#000000";
        ctx.font = `${el.fontWeight === "900" ? "900" : "bold"} ${el.fontSize || 32}px ${el.fontFamily || "sans-serif"}`;
        ctx.textAlign = (el.textAlign as CanvasTextAlign) || "left";
        const tx = el.textAlign === "center" ? el.x + el.width / 2 : el.x;
        const lines = el.text.split("\n");
        lines.forEach((line, lIdx) => {
          ctx.fillText(line, tx, el.y + (el.fontSize || 32) + lIdx * ((el.fontSize || 32) * 1.2));
        });
      }
      ctx.restore();
    });

    const link = document.createElement("a");
    link.download = `${projectTitle.toLowerCase().replace(/\s+/g, "_")}_${activeFormat.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    onNotify(`Arte exportada em alta definição (${activeFormat.width}×${activeFormat.height}px)!`);
  };

  // Convert and Import Penpot/Figma payload
  const handleConvertImport = () => {
    if (!importText.trim()) return;
    try {
      const convertedPage = convertPenpotToCanvas(importText, importFileName.replace(/\.[^/.]+$/, ""));
      setPages([...pages, convertedPage]);
      setActivePageIndex(pages.length);
      setSelectedElementId(convertedPage.elements[0]?.id || null);
      setImportText("");
      onNotify(`Template '${importFileName}' convertido com sucesso em ${convertedPage.elements.length} elementos nativos!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      onNotify(`Erro na conversão: ${msg}`);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 49px)",
        background: "#0e1117",
        color: "#f8fafc",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      onMouseMove={handleMouseMoveStage}
      onMouseUp={handleMouseUpStage}
    >
      {/* 1. TOP HEADER - Real Canva Style */}
      <header
        style={{
          height: 48,
          background: "linear-gradient(90deg, #181c24 0%, #22183c 50%, #1e1b4b 100%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          gap: 16,
          zIndex: 40,
        }}
      >
        {/* Left: Canva Logo & Quick Menus */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #00c4cc 0%, #7d2ae8 100%)",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 16,
              color: "#fff",
              cursor: "pointer",
            }}
            title="Criativo Studio (Clone Canva)"
          >
            C
          </div>

          <button
            onClick={() => setActiveDock("formats")}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{activeFormat.icon}</span>
            <span>{activeFormat.label}</span>
            <span style={{ opacity: 0.6, fontSize: 11 }}>({activeFormat.badge})</span>
            <span style={{ fontSize: 9 }}>▼</span>
          </button>

          <button
            onClick={() => setActiveDock("figma-penpot")}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Arquivo / Penpot
          </button>
        </div>

        {/* Center: Editable Document Title & Cloud status */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: 480 }}>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            style={{
              background: "transparent",
              border: "1px solid transparent",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: 6,
              width: "100%",
              outline: "none",
              textAlign: "center",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#7d2ae8")}
            onBlur={(e) => (e.target.style.borderColor = "transparent")}
          />
          <span style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            <span>☁️</span> Salvo
          </span>
        </div>

        {/* Right: Magic Humanizer & Download/Export Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleHumanizeAllTexts}
            title="Humanizar cópias e textos de IA em 1 clique"
            style={{
              background: "rgba(215, 247, 107, 0.15)",
              border: "1px solid rgba(215, 247, 107, 0.4)",
              color: "#d7f76b",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <span>✦</span>
            <span>Humanizar Cópias</span>
          </button>

          <button
            onClick={handleExportPng}
            style={{
              background: "linear-gradient(135deg, #7d2ae8 0%, #00c4cc 100%)",
              border: "none",
              color: "#ffffff",
              padding: "7px 18px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(125, 42, 232, 0.4)",
            }}
          >
            Compartilhar / Baixar
          </button>
        </div>
      </header>

      {/* 2. CONTEXTUAL ELEMENT TOOLBAR (When an element is selected) */}
      <div
        style={{
          height: 42,
          background: "#141720",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          fontSize: 12,
          zIndex: 35,
        }}
      >
        {selectedElement ? (
          <>
            <span style={{ color: "#94a3b8", fontWeight: 600 }}>Elemento:</span>
            <span style={{ color: "#38bdf8", fontWeight: 700, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedElement.name}
            </span>

            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />

            {/* If Text: Font, Size, Color, Alignment */}
            {selectedElement.text !== undefined && (
              <>
                <select
                  value={selectedElement.fontFamily || "Inter"}
                  onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                  style={{
                    background: "#1f2430",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "3px 6px",
                    fontSize: 11,
                  }}
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Impact, sans-serif">Impact (Viral)</option>
                  <option value="Georgia, serif">Georgia (Elegante)</option>
                  <option value="Courier, monospace">Courier (Code)</option>
                </select>

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    onClick={() => updateSelectedElement({ fontSize: Math.max(12, (selectedElement.fontSize || 32) - 4) })}
                    style={{ background: "#1f2430", border: "none", color: "#fff", padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}>{selectedElement.fontSize || 32}</span>
                  <button
                    onClick={() => updateSelectedElement({ fontSize: Math.min(140, (selectedElement.fontSize || 32) + 4) })}
                    style={{ background: "#1f2430", border: "none", color: "#fff", padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}
                  >
                    +
                  </button>
                </div>

                <input
                  type="color"
                  value={selectedElement.color || "#ffffff"}
                  onChange={(e) => updateSelectedElement({ color: e.target.value })}
                  title="Cor do Texto"
                  style={{ width: 24, height: 24, border: "none", borderRadius: 4, cursor: "pointer", background: "transparent" }}
                />

                <div style={{ display: "flex", gap: 2 }}>
                  <button
                    onClick={() => updateSelectedElement({ textAlign: "left" })}
                    style={{
                      background: selectedElement.textAlign === "left" ? "#3b82f6" : "#1f2430",
                      border: "none",
                      color: "#fff",
                      padding: "3px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    ⇤
                  </button>
                  <button
                    onClick={() => updateSelectedElement({ textAlign: "center" })}
                    style={{
                      background: selectedElement.textAlign === "center" ? "#3b82f6" : "#1f2430",
                      border: "none",
                      color: "#fff",
                      padding: "3px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    ≡
                  </button>
                  <button
                    onClick={() => updateSelectedElement({ textAlign: "right" })}
                    style={{
                      background: selectedElement.textAlign === "right" ? "#3b82f6" : "#1f2430",
                      border: "none",
                      color: "#fff",
                      padding: "3px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    ⇥
                  </button>
                </div>
              </>
            )}

            {/* Shape Fill */}
            {selectedElement.fill && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#94a3b8" }}>Cor:</span>
                <input
                  type="color"
                  value={selectedElement.fill}
                  onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                  style={{ width: 24, height: 24, border: "none", borderRadius: 4, cursor: "pointer", background: "transparent" }}
                />
              </div>
            )}

            {/* Position / Rotation */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#94a3b8" }}>Rot:</span>
              <input
                type="range"
                min="-45"
                max="45"
                value={selectedElement.rotation || 0}
                onChange={(e) => updateSelectedElement({ rotation: parseInt(e.target.value) })}
                style={{ width: 60 }}
              />
              <span style={{ fontSize: 11, minWidth: 24 }}>{selectedElement.rotation || 0}°</span>
            </div>

            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />

            {/* Duplicate & Delete */}
            <button
              onClick={handleDuplicateElement}
              title="Duplicar elemento"
              style={{ background: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 14 }}
            >
              📋
            </button>
            <button
              onClick={handleDeleteElement}
              title="Excluir elemento"
              style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }}
            >
              🗑️
            </button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#64748b" }}>Nenhum elemento selecionado · Clique em um elemento na tela para editar</span>
            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.15)" }} />
            <span style={{ color: "#94a3b8" }}>Cor de fundo:</span>
            <input
              type="color"
              value={activePage.bgColor}
              onChange={(e) => {
                const val = e.target.value;
                setPages((prev) =>
                  prev.map((p, idx) => (idx === activePageIndex ? { ...p, bgColor: val, bgGradient: undefined } : p))
                );
              }}
              style={{ width: 24, height: 24, border: "none", borderRadius: 4, cursor: "pointer", background: "transparent" }}
            />
          </div>
        )}
      </div>

      {/* 3. MAIN WORKSPACE: DOCK (72px) + DRAWER (340px) + CANVAS STAGE */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* A. CANVA DOCK (Narrow Icon Column) */}
        <aside
          style={{
            width: 72,
            background: "#10141d",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "8px 0",
            gap: 4,
            zIndex: 30,
          }}
        >
          {[
            { id: "templates", label: "Modelos", icon: "🎨" },
            { id: "elements", label: "Elementos", icon: "🧩" },
            { id: "text", label: "Texto", icon: "🔤" },
            { id: "brand", label: "Marca", icon: "💎" },
            { id: "uploads", label: "Uploads", icon: "📤" },
            { id: "carousel", label: "Carrossel", icon: "📑" },
            { id: "formats", label: "Formatos", icon: "📐" },
            { id: "figma-penpot", label: "Figma/Penpot", icon: "🌐" },
            { id: "social-tools", label: "IA Redes", icon: "⚡" },
          ].map((item) => {
            const isActive = activeDock === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (activeDock === item.id) {
                    setIsDrawerOpen(!isDrawerOpen);
                  } else {
                    setActiveDock(item.id as DockTab);
                    setIsDrawerOpen(true);
                  }
                }}
                style={{
                  width: 62,
                  height: 60,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  background: isActive ? "rgba(125, 42, 232, 0.2)" : "transparent",
                  border: "none",
                  borderLeft: isActive ? "3px solid #7d2ae8" : "3px solid transparent",
                  borderRadius: 6,
                  color: isActive ? "#ffffff" : "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 9.5, fontWeight: isActive ? 700 : 500, letterSpacing: -0.2 }}>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* B. SECONDARY DRAWER (Slide-out panel ~340px) */}
        {isDrawerOpen && (
          <aside
            style={{
              width: 350,
              background: "#161b26",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
              zIndex: 25,
              overflowY: "auto",
            }}
          >
            {/* 1. DRAWER: MODELOS (Templates) */}
            {activeDock === "templates" && (
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#fff" }}>Modelos & Criativos</h3>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{filteredTemplates.length} disponíveis</span>
                </div>

                {/* Search Bar */}
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Busque modelos de Post para Instagram..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "#0e1117",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 8,
                      padding: "8px 12px 8px 32px",
                      color: "#fff",
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                  <span style={{ position: "absolute", left: 10, top: 8, fontSize: 13, opacity: 0.6 }}>🔍</span>
                </div>

                {/* Filter Chips */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {[
                    { id: "todos", label: "Todos" },
                    { id: "pet friendly", label: "Pet Friendly" },
                    { id: "carrossel", label: "Carrossel" },
                    { id: "youtube", label: "YouTube 16:9" },
                    { id: "shorts", label: "Shorts/TikTok" },
                    { id: "figma", label: "Figma" },
                    { id: "penpot", label: "Penpot" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setActiveTagFilter(chip.id)}
                      style={{
                        background: activeTagFilter === chip.id ? "#7d2ae8" : "#212735",
                        border: "none",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: 16,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Templates Grid (Visual Cards) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {filteredTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleLoadTemplate(tpl)}
                      style={{
                        background: "#212736",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        padding: 12,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#7d2ae8")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                    >
                      <div
                        style={{
                          height: 120,
                          borderRadius: 8,
                          background: tpl.pages[0].bgGradient || tpl.pages[0].bgColor || "#1e293b",
                          border: "1px solid rgba(255,255,255,0.1)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 12,
                          textAlign: "center",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 800, color: tpl.thumbnailColor, textTransform: "uppercase" }}>
                          {tpl.source} · {CANVAS_FORMATS[tpl.format]?.badge}
                        </span>
                        <h4 style={{ fontSize: 14, fontWeight: 900, color: "#fff", margin: "6px 0 0", lineHeight: 1.2 }}>
                          {tpl.name}
                        </h4>
                      </div>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "8px 0 0", lineHeight: 1.4 }}>{tpl.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. DRAWER: ELEMENTOS (Shapes, Badges, Stickers) */}
            {activeDock === "elements" && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#fff" }}>Elementos & Selos</h3>

                {/* Pet Friendly / Retail Badges */}
                <h4 style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase" }}>
                  Selos & Faixas de Destaque
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  <button
                    onClick={() =>
                      handleAddElement("shape", {
                        name: "Faixa SOMOS Laranja",
                        width: 320,
                        height: 80,
                        fill: "#e05315",
                        rotation: -2,
                        borderRadius: 6,
                      })
                    }
                    style={{
                      background: "#212735",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    🏷️ Faixa Laranja Inclinada
                  </button>

                  <button
                    onClick={() =>
                      handleAddElement("price-tag", {
                        name: "Selo Estrela Preço R$ 129,90",
                        width: 220,
                        height: 140,
                        badgeBg: "#729b79",
                        text: "Diárias a partir de\nR$ 129,90",
                        fontSize: 22,
                        borderRadius: 14,
                        rotation: -6,
                      })
                    }
                    style={{
                      background: "#212735",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    ⭐ Selo Estrela Preço
                  </button>

                  <button
                    onClick={() =>
                      handleAddElement("badge", {
                        name: "Badge Lançamento",
                        width: 240,
                        height: 48,
                        badgeBg: "#d7f76b",
                        badgeColor: "#000000",
                        text: "✦ LANÇAMENTO 2026",
                        fontSize: 16,
                        fontWeight: "900",
                        borderRadius: 99,
                      })
                    }
                    style={{
                      background: "#212735",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    ⚡ Pill Neon Lançamento
                  </button>

                  <button
                    onClick={() =>
                      handleAddElement("badge", {
                        name: "Tag 50% OFF",
                        width: 180,
                        height: 50,
                        badgeBg: "#ef4444",
                        badgeColor: "#ffffff",
                        text: "🔥 50% OFF",
                        fontSize: 22,
                        fontWeight: "900",
                        borderRadius: 8,
                      })
                    }
                    style={{
                      background: "#212735",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    🔥 Tag 50% OFF
                  </button>
                </div>

                {/* Formas Geométricas */}
                <h4 style={{ fontSize: 12, color: "#94a3b8", margin: "16px 0 8px", textTransform: "uppercase" }}>
                  Formas & Cartões
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button
                    onClick={() =>
                      handleAddElement("shape", {
                        name: "Cartão Card Fundo",
                        width: 440,
                        height: 380,
                        fill: "#1e293b",
                        borderRadius: 20,
                      })
                    }
                    style={{
                      background: "#212735",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🔲 Card Arredondado
                  </button>

                  <button
                    onClick={() =>
                      handleAddElement("shape", {
                        name: "Círculo Destaque",
                        width: 300,
                        height: 300,
                        shapeType: "circle",
                        fill: "#3b82f6",
                      })
                    }
                    style={{
                      background: "#212735",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    ⭕ Círculo Destaque
                  </button>

                  <button
                    onClick={() =>
                      handleAddElement("bullet-list", {
                        name: "Lista de Comodidades",
                        width: 400,
                        height: 260,
                        bulletIcon: "🐾",
                        color: "#ffffff",
                        fontSize: 22,
                        listItems: ["Espaço pet amplo", "Quarto higienizado", "Café incluso", "Área verde"],
                      })
                    }
                    style={{
                      background: "#212735",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🐾 Lista com Ícones
                  </button>

                  <button
                    onClick={() =>
                      handleAddElement("button", {
                        name: "Botão CTA",
                        width: 380,
                        height: 70,
                        badgeBg: "#10b981",
                        badgeColor: "#022c22",
                        text: "Comprar Agora →",
                        fontSize: 24,
                        borderRadius: 14,
                      })
                    }
                    style={{
                      background: "#212735",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🔘 Botão CTA
                  </button>
                </div>
              </div>
            )}

            {/* 3. DRAWER: TEXTO */}
            {activeDock === "text" && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", color: "#fff" }}>Adicionar Texto</h3>

                <button
                  onClick={() =>
                    handleAddElement("heading", {
                      text: "Inserir um título",
                      fontSize: 72,
                      fontWeight: "900",
                      width: 700,
                      height: 100,
                    })
                  }
                  style={{
                    width: "100%",
                    background: "#212735",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    padding: "16px 12px",
                    borderRadius: 8,
                    fontSize: 20,
                    fontWeight: 900,
                    cursor: "pointer",
                    marginBottom: 10,
                    textAlign: "left",
                  }}
                >
                  Adicionar um título
                </button>

                <button
                  onClick={() =>
                    handleAddElement("subheading", {
                      text: "Inserir um subtítulo",
                      fontSize: 36,
                      fontWeight: "700",
                      width: 600,
                      height: 70,
                    })
                  }
                  style={{
                    width: "100%",
                    background: "#212735",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    padding: "12px 12px",
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    marginBottom: 10,
                    textAlign: "left",
                  }}
                >
                  Adicionar um subtítulo
                </button>

                <button
                  onClick={() =>
                    handleAddElement("text", {
                      text: "Inserir um pouco de texto no corpo do criativo.",
                      fontSize: 24,
                      fontWeight: "normal",
                      width: 500,
                      height: 60,
                    })
                  }
                  style={{
                    width: "100%",
                    background: "#212735",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  Adicionar um texto de apoio
                </button>
              </div>
            )}

            {/* 4. DRAWER: MARCA / DESIGN SYSTEM */}
            {activeDock === "brand" && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>Kit de Marca & Tokens</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 14px" }}>
                  Sincronizado diretamente com o Design System ativo: <strong>{designSystem.name}</strong>.
                </p>

                <div style={{ background: "#212735", padding: 12, borderRadius: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase" }}>
                    Paleta de Cores
                  </span>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {Object.entries(designSystem.palette).map(([key, val]) => (
                      <div key={key} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            background: val,
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        />
                        <span style={{ fontSize: 9, color: "#94a3b8", display: "block", marginTop: 2 }}>{key}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleApplyBrandKit}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #7d2ae8 0%, #3b82f6 100%)",
                    border: "none",
                    color: "#fff",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🎨 Aplicar Cores no Criativo Atual
                </button>
              </div>
            )}

            {/* 5. DRAWER: UPLOADS & IMAGENS */}
            {activeDock === "uploads" && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px", color: "#fff" }}>Uploads de Imagens</h3>

                <div
                  style={{
                    border: "2px dashed rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    padding: 24,
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontSize: 28 }}>📷</span>
                  <p style={{ fontSize: 12, color: "#cbd5e1", margin: "8px 0" }}>
                    Arraste sua imagem ou clique para selecionar
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const src = evt.target?.result as string;
                          handleAddElement("image", { name: file.name, src, width: 400, height: 400 });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ fontSize: 11 }}
                  />
                </div>

                <h4 style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase" }}>
                  Banco de Fotos Rápido
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { name: "Pet Cão e Gato", url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600" },
                    { name: "Tech Laptop", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600" },
                    { name: "Joia / Luxo", url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600" },
                    { name: "Moda / Beleza", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600" },
                  ].map((stock) => (
                    <div
                      key={stock.name}
                      onClick={() => handleAddElement("image", { name: stock.name, src: stock.url, width: 440, height: 440 })}
                      style={{
                        background: "#212735",
                        borderRadius: 6,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        style={{
                          height: 60,
                          background: `url(${stock.url}) center/cover no-repeat`,
                        }}
                      />
                      <span style={{ fontSize: 10, padding: "4px 6px", display: "block", color: "#fff" }}>{stock.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. DRAWER: CARROSSEL MULTI-PÁGINAS */}
            {activeDock === "carousel" && (
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#fff" }}>Carrossel de Slides</h3>
                  <button
                    onClick={handleAddPage}
                    style={{
                      background: "#7d2ae8",
                      border: "none",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    + Novo Slide
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {pages.map((pg, idx) => (
                    <div
                      key={pg.id}
                      onClick={() => setActivePageIndex(idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: activePageIndex === idx ? "rgba(125, 42, 232, 0.25)" : "#212735",
                        border: activePageIndex === idx ? "1px solid #7d2ae8" : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#7d2ae8" }}>#{idx + 1}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{pg.title}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{pg.elements.length} itens</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. DRAWER: FORMATOS PRÉ-CONFIGURADOS */}
            {activeDock === "formats" && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#fff" }}>Formatos Pré-Configurados</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Object.values(CANVAS_FORMATS).map((fmt) => {
                    const isSelected = currentFormatId === fmt.id;
                    return (
                      <div
                        key={fmt.id}
                        onClick={() => {
                          setCurrentFormatId(fmt.id);
                          onNotify(`Formato alterado para ${fmt.label} (${fmt.width}×${fmt.height}px)!`);
                        }}
                        style={{
                          background: isSelected ? "rgba(125, 42, 232, 0.25)" : "#212735",
                          border: isSelected ? "1px solid #7d2ae8" : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          padding: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 24 }}>{fmt.icon}</span>
                          <div>
                            <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#fff" }}>{fmt.label}</h4>
                            <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>{fmt.description}</p>
                          </div>
                        </div>
                        <span
                          style={{
                            background: isSelected ? "#7d2ae8" : "#141720",
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#fff",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmt.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. DRAWER: FIGMA & PENPOT (Importador e Conversor) */}
            {activeDock === "figma-penpot" && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>Figma & Penpot Community</h3>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 14px", lineHeight: 1.4 }}>
                  Baixe pranchas vetoriais ou converta arquivos SVG e JSON da comunidade Figma / Penpot para elementos editáveis.
                </p>

                {/* Export Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  <button
                    onClick={handleDownloadPenpotSvg}
                    style={{
                      background: "#17b890",
                      border: "none",
                      color: "#052018",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span>🌐</span> Baixar Prancha Penpot (.svg)
                  </button>

                  <button
                    onClick={handleDownloadFigmaTokens}
                    style={{
                      background: "#212735",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#58a6ff",
                      padding: 10,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span>📦</span> Baixar Tokens W3C para Figma (.json)
                  </button>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "16px 0" }} />

                {/* Converter & Importer */}
                <h4 style={{ fontSize: 12, color: "#fff", margin: "0 0 8px" }}>Conversor de Formatos</h4>
                <input
                  type="text"
                  placeholder="Nome do arquivo (ex: design_penpot.svg)"
                  value={importFileName}
                  onChange={(e) => setImportFileName(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#0e1117",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    color: "#fff",
                    fontSize: 11,
                    marginBottom: 8,
                  }}
                />
                <textarea
                  rows={6}
                  placeholder="Cole aqui o código SVG exportado do Penpot ou o JSON da comunidade Figma..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#0e1117",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6,
                    padding: 8,
                    color: "#f8fafc",
                    fontSize: 11,
                    fontFamily: "monospace",
                    marginBottom: 8,
                  }}
                />
                <button
                  onClick={handleConvertImport}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #17b890 100%)",
                    border: "none",
                    color: "#fff",
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ⚡ Converter e Importar para o Canvas
                </button>
              </div>
            )}

            {/* 9. DRAWER: IA SOCIAL (Agenda & SEO) */}
            {activeDock === "social-tools" && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>Automações & Redes Sociais</h3>

                {/* Best Times Heatmap for this category */}
                <div style={{ background: "#212735", padding: 12, borderRadius: 8, marginBottom: 14 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: "#d7f76b", margin: "0 0 6px" }}>
                    Melhores Horários: {scheduleData.label}
                  </h4>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 8px" }}>
                    Picos de engajamento baseados no público de {scheduleData.label}.
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {scheduleData.peakSlots.map((slot) => (
                      <span
                        key={`${slot.day}-${slot.time}`}
                        style={{
                          background: "#0e1117",
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#38bdf8",
                        }}
                      >
                        {slot.day} às {slot.time} ({slot.engagementScore}% engajamento)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schedule Quick Post */}
                <h4 style={{ fontSize: 12, color: "#fff", margin: "0 0 8px" }}>Agendar Publicação</h4>
                <input
                  type="text"
                  placeholder="Título ou chamada da publicação..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#0e1117",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    color: "#fff",
                    fontSize: 11,
                    marginBottom: 8,
                  }}
                />
                <button
                  onClick={() => {
                    if (!newPostTitle.trim()) return;
                    const newEntry: ScheduledPost = {
                      id: `post-${Date.now()}`,
                      title: newPostTitle,
                      platform: newPostPlatform === "youtube" ? "instagram" : (newPostPlatform as any),
                      format: "post",
                      scheduledFor: newPostTime || "Próximo pico de audiência",
                      status: "scheduled",
                      category: category.id,
                      caption: projectTitle,
                    };
                    setPosts([newEntry, ...posts]);
                    setNewPostTitle("");
                    onNotify("Publicação agendada com base no pico da audiência!");
                  }}
                  style={{
                    width: "100%",
                    background: "#7d2ae8",
                    border: "none",
                    color: "#fff",
                    padding: 8,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  📅 Agendar Postagem
                </button>
              </div>
            )}
          </aside>
        )}

        {/* C. CANVAS STAGE (Center Desk Area) */}
        <main
          ref={canvasRef}
          style={{
            flex: 1,
            background: "#181a20",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 20px 80px",
            position: "relative",
            userSelect: isDragging ? "none" : "auto",
          }}
          onClick={() => setSelectedElementId(null)}
        >
          {/* Canvas Floating Top Actions (Lock, Duplicate, Delete) */}
          <div
            style={{
              width: activeFormat.width * scale,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicatePage();
              }}
              title="Duplicar Página"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "none",
                color: "#cbd5e1",
                padding: "4px 8px",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              📑 Duplicar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePage();
              }}
              title="Excluir Página"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "none",
                color: "#ef4444",
                padding: "4px 8px",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              🗑️ Excluir
            </button>
          </div>

          {/* THE CANVAS BOARD */}
          <div
            style={{
              width: activeFormat.width * scale,
              height: activeFormat.height * scale,
              position: "relative",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              borderRadius: 4,
              overflow: "hidden",
              background: activePage.bgGradient || activePage.bgColor || "#ffffff",
              transformOrigin: "top center",
              transition: isDragging ? "none" : "box-shadow 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Render Elements scaled proportionally */}
            {activePage.elements.map((el) => {
              const isSelected = selectedElementId === el.id;
              const elX = el.x * scale;
              const elY = el.y * scale;
              const elW = el.width * scale;
              const elH = el.height * scale;

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDownOnElement(e, el)}
                  style={{
                    position: "absolute",
                    left: elX,
                    top: elY,
                    width: elW,
                    height: elH,
                    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                    cursor: el.locked ? "default" : isDragging && isSelected ? "grabbing" : "grab",
                    outline: isSelected ? "2px solid #38bdf8" : "none",
                    boxShadow: isSelected ? "0 0 0 1px rgba(0,0,0,0.2)" : undefined,
                    zIndex: el.zIndex || 2,
                    boxSizing: "border-box",
                  }}
                >
                  {/* Selection Handles when selected */}
                  {isSelected && (
                    <>
                      <div style={{ position: "absolute", left: -4, top: -4, width: 8, height: 8, background: "#38bdf8", borderRadius: 2 }} />
                      <div style={{ position: "absolute", right: -4, top: -4, width: 8, height: 8, background: "#38bdf8", borderRadius: 2 }} />
                      <div style={{ position: "absolute", left: -4, bottom: -4, width: 8, height: 8, background: "#38bdf8", borderRadius: 2 }} />
                      <div style={{ position: "absolute", right: -4, bottom: -4, width: 8, height: 8, background: "#38bdf8", borderRadius: 2 }} />
                    </>
                  )}

                  {/* Render based on Element Type */}
                  {el.type === "shape" ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: el.fill || "#3b82f6",
                        borderRadius: el.shapeType === "circle" ? "50%" : (el.borderRadius || 0) * scale,
                        border: el.stroke ? `${(el.strokeWidth || 1) * scale}px solid ${el.stroke}` : undefined,
                        opacity: el.opacity ?? 1,
                      }}
                    />
                  ) : el.type === "image" ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${el.src})`,
                        backgroundPosition: "center",
                        backgroundSize: el.objectFit || "cover",
                        backgroundRepeat: "no-repeat",
                        borderRadius: (el.borderRadius || 12) * scale,
                      }}
                    />
                  ) : el.type === "bullet-list" ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                        color: el.color || "#ffffff",
                        fontSize: (el.fontSize || 22) * scale,
                        fontWeight: el.fontWeight || "bold",
                        fontFamily: el.fontFamily || "Inter, sans-serif",
                      }}
                    >
                      {el.listItems?.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 * scale }}>
                          <span>{el.bulletIcon || "✓"}</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : el.type === "button" || el.type === "badge" || el.type === "price-tag" ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: el.badgeBg || el.fill || "#e05315",
                        color: el.badgeColor || el.color || "#ffffff",
                        borderRadius: (el.borderRadius || 12) * scale,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: el.fontWeight || "bold",
                        fontSize: (el.fontSize || 20) * scale,
                        textAlign: "center",
                        whiteSpace: "pre-line",
                        lineHeight: 1.2,
                        padding: 8 * scale,
                        boxSizing: "border-box",
                      }}
                    >
                      {el.text}
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        color: el.color || "#ffffff",
                        fontSize: (el.fontSize || 32) * scale,
                        fontWeight: el.fontWeight || "bold",
                        fontFamily: el.fontFamily || "Inter, sans-serif",
                        textAlign: el.textAlign || "left",
                        lineHeight: el.lineHeight || 1.15,
                        letterSpacing: el.letterSpacing ? el.letterSpacing * scale : undefined,
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                        userSelect: "none",
                      }}
                    >
                      {el.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* "+ Adicionar Página" Button directly below the Canvas (Identical to Canva screenshot) */}
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <button
              onClick={handleAddPage}
              style={{
                background: "#212735",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#ffffff",
                padding: "8px 24px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <span>+</span>
              <span>Adicionar página</span>
            </button>
          </div>
        </main>
      </div>

      {/* 4. BOTTOM BAR - ZOOM SLIDER & PAGE COUNTER (Canva Standard) */}
      <footer
        style={{
          height: 38,
          background: "#10141d",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          fontSize: 12,
          color: "#94a3b8",
          zIndex: 35,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ cursor: "pointer" }}>📝 Notas</span>
          <span style={{ cursor: "pointer" }}>⏱️ Temporizador</span>
        </div>

        {/* Center Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setZoomPercent(Math.max(20, zoomPercent - 5))}
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 14 }}
          >
            -
          </button>
          <input
            type="range"
            min="20"
            max="120"
            value={zoomPercent}
            onChange={(e) => setZoomPercent(parseInt(e.target.value))}
            style={{ width: 100 }}
          />
          <button
            onClick={() => setZoomPercent(Math.min(120, zoomPercent + 5))}
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 14 }}
          >
            +
          </button>
          <span style={{ minWidth: 38, textAlign: "right", color: "#fff", fontWeight: 600 }}>{zoomPercent}%</span>
          <button
            onClick={() => setZoomPercent(48)}
            style={{
              background: "#212735",
              border: "none",
              color: "#cbd5e1",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Ajustar
          </button>
        </div>

        {/* Right Page Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>
            Páginas {activePageIndex + 1}/{pages.length}
          </span>
          <span style={{ cursor: "pointer" }}>⊞ Grade</span>
          <span style={{ cursor: "pointer" }}>⛶ Tela cheia</span>
        </div>
      </footer>
    </div>
  );
}
