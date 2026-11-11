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
  onSelectDesignSystem?: (id: string) => void;
}

export interface DomNode {
  path: string;
  tag: string;
  id: string;
  classes: string;
  text: string;
  children: DomNode[];
}

export interface ElementStyles {
  color: string;
  backgroundColor: string;
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: string;
  display: string;
  flexDirection: string;
  alignItems: string;
  justifyContent: string;
  gap: string;
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
  marginTop: string;
  marginRight: string;
  marginBottom: string;
  marginLeft: string;
  width: string;
  height: string;
  maxWidth: string;
  borderRadius: string;
  borderWidth: string;
  borderColor: string;
  borderStyle: string;
  boxShadow: string;
  opacity: string;
}

export interface SelectedElement {
  tag: string;
  id: string;
  classes: string;
  text: string;
  path: string;
  rect: { x: number; y: number; width: number; height: number };
  styles: ElementStyles;
}

// Injected Onlook visual inspection engine
const ONLOOK_ENGINE = `(function() {
  var selected = null;
  var hoverEl = null;

  // Style overlay for Onlook visual cues
  var style = document.createElement('style');
  style.setAttribute('data-onlook-engine', 'true');
  style.textContent = \`
    .__onlook_selected {
      outline: 2px solid #d7f76b !important;
      outline-offset: 1px !important;
      position: relative !important;
    }
    .__onlook_hover {
      outline: 1px dashed #8ab4ff !important;
      outline-offset: 1px !important;
    }
    .__onlook_badge {
      position: absolute;
      background: #17200a;
      color: #d7f76b;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #d7f76b;
      pointer-events: none;
      z-index: 99999;
      white-space: nowrap;
      top: -22px;
      left: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    body.__onlook_active * {
      cursor: default !important;
    }
  \`;
  document.head.appendChild(style);
  document.body.classList.add('__onlook_active');

  function getPath(el) {
    if (!el || el === document.body) return 'body';
    var path = [];
    var curr = el;
    while (curr && curr.nodeType === 1 && curr !== document.documentElement) {
      var tag = curr.tagName.toLowerCase();
      var id = curr.id ? '#' + curr.id : '';
      var idx = 0;
      var sib = curr.previousElementSibling;
      while (sib) {
        if (sib.tagName === curr.tagName) idx++;
        sib = sib.previousElementSibling;
      }
      path.unshift(tag + id + (idx > 0 ? ':nth-of-type(' + (idx + 1) + ')' : ''));
      curr = curr.parentElement;
    }
    return path.join(' > ');
  }

  function getComputed(el) {
    var cs = window.getComputedStyle(el);
    return {
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontFamily: cs.fontFamily,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      textAlign: cs.textAlign,
      display: cs.display,
      flexDirection: cs.flexDirection,
      alignItems: cs.alignItems,
      justifyContent: cs.justifyContent,
      gap: cs.gap,
      paddingTop: cs.paddingTop,
      paddingRight: cs.paddingRight,
      paddingBottom: cs.paddingBottom,
      paddingLeft: cs.paddingLeft,
      marginTop: cs.marginTop,
      marginRight: cs.marginRight,
      marginBottom: cs.marginBottom,
      marginLeft: cs.marginLeft,
      width: cs.width,
      height: cs.height,
      maxWidth: cs.maxWidth,
      borderRadius: cs.borderRadius,
      borderWidth: cs.borderWidth,
      borderColor: cs.borderColor,
      borderStyle: cs.borderStyle,
      boxShadow: cs.boxShadow,
      opacity: cs.opacity
    };
  }

  function serializeClean() {
    var clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('[data-onlook-engine]').forEach(function(n) { n.remove(); });
    clone.querySelectorAll('.__onlook_selected, .__onlook_hover').forEach(function(n) {
      n.classList.remove('__onlook_selected', '__onlook_hover');
    });
    clone.querySelectorAll('.__onlook_badge').forEach(function(n) { n.remove(); });
    var body = clone.querySelector('body');
    if (body) body.classList.remove('__onlook_active');
    return '<!doctype html>\\n' + clone.outerHTML;
  }

  function buildTree(node, depth) {
    if (!node || node.nodeType !== 1) return null;
    if (node.hasAttribute && node.hasAttribute('data-onlook-engine')) return null;
    var tag = node.tagName.toLowerCase();
    if (['script', 'style', 'link', 'meta'].indexOf(tag) !== -1) return null;

    var children = [];
    if (depth < 6) {
      for (var i = 0; i < node.children.length; i++) {
        var childTree = buildTree(node.children[i], depth + 1);
        if (childTree) children.push(childTree);
      }
    }

    var cleanClasses = (node.getAttribute('class') || '')
      .replace(/__onlook_[^\\s]+/g, '')
      .trim();

    var text = '';
    if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
      text = node.textContent.trim().slice(0, 40);
    }

    return {
      path: getPath(node),
      tag: tag,
      id: node.id || '',
      classes: cleanClasses,
      text: text,
      children: children
    };
  }

  function sendSelect(el) {
    if (!el || el.nodeType !== 1 || el === document.body || el === document.documentElement) return;
    if (selected) {
      selected.classList.remove('__onlook_selected');
      var oldBadge = selected.querySelector('.__onlook_badge');
      if (oldBadge) oldBadge.remove();
    }
    selected = el;
    selected.classList.add('__onlook_selected');

    var rect = el.getBoundingClientRect();
    var payload = {
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      classes: (el.getAttribute('class') || '').replace(/__onlook_[^\\s]+/g, '').trim(),
      text: (el.textContent || '').trim().slice(0, 300),
      path: getPath(el),
      rect: {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      styles: getComputed(el)
    };

    window.parent.postMessage({ type: 'onlook:selected', element: payload }, '*');
    window.parent.postMessage({ type: 'onlook:tree', tree: buildTree(document.body, 0) }, '*');
  }

  document.addEventListener('click', function(e) {
    var el = e.target;
    if (!el || el === document.body || el === document.documentElement) return;
    e.preventDefault();
    e.stopPropagation();
    sendSelect(el);
  }, true);

  document.addEventListener('mouseover', function(e) {
    var el = e.target;
    if (!el || el === selected || el === document.body || el === document.documentElement) return;
    if (hoverEl && hoverEl !== selected) hoverEl.classList.remove('__onlook_hover');
    hoverEl = el;
    hoverEl.classList.add('__onlook_hover');
  }, true);

  document.addEventListener('mouseout', function(e) {
    if (hoverEl && hoverEl !== selected) {
      hoverEl.classList.remove('__onlook_hover');
      hoverEl = null;
    }
  }, true);

  // Message router from Parent React Editor
  window.addEventListener('message', function(e) {
    var msg = e.data || {};
    var action = msg.type;

    if (action === 'onlook:setStyle' && selected) {
      selected.style[msg.prop] = msg.value;
      sendSelect(selected);
      window.parent.postMessage({ type: 'onlook:htmlChanged', html: serializeClean() }, '*');
    }

    if (action === 'onlook:setText' && selected) {
      selected.textContent = msg.text;
      sendSelect(selected);
      window.parent.postMessage({ type: 'onlook:htmlChanged', html: serializeClean() }, '*');
    }

    if (action === 'onlook:setClasses' && selected) {
      selected.className = msg.classes + ' __onlook_selected';
      sendSelect(selected);
      window.parent.postMessage({ type: 'onlook:htmlChanged', html: serializeClean() }, '*');
    }

    if (action === 'onlook:selectByPath') {
      try {
        var target = document.querySelector(msg.path);
        if (target) sendSelect(target);
      } catch(err) {}
    }

    if (action === 'onlook:delete' && selected) {
      var parent = selected.parentElement;
      selected.remove();
      selected = null;
      if (parent) sendSelect(parent);
      window.parent.postMessage({ type: 'onlook:htmlChanged', html: serializeClean() }, '*');
    }

    if (action === 'onlook:duplicate' && selected) {
      var clone = selected.cloneNode(true);
      clone.classList.remove('__onlook_selected', '__onlook_hover');
      selected.parentNode.insertBefore(clone, selected.nextSibling);
      sendSelect(clone);
      window.parent.postMessage({ type: 'onlook:htmlChanged', html: serializeClean() }, '*');
    }

    if (action === 'onlook:insertSnippet') {
      var container = selected || document.querySelector('main') || document.body;
      var temp = document.createElement('div');
      temp.innerHTML = msg.html;
      var newChild = temp.firstElementChild;
      if (newChild) {
        container.appendChild(newChild);
        sendSelect(newChild);
        window.parent.postMessage({ type: 'onlook:htmlChanged', html: serializeClean() }, '*');
      }
    }

    if (action === 'onlook:init') {
      window.parent.postMessage({ type: 'onlook:tree', tree: buildTree(document.body, 0) }, '*');
    }
  });

  // Ready signal
  window.parent.postMessage({ type: 'onlook:ready', tree: buildTree(document.body, 0) }, '*');
})();`;

// Pre-packaged UI component snippets that can be inserted with 1 click
const COMPONENT_SNIPPETS = [
  {
    name: "Hero Banner",
    category: "Hero",
    html: `<section style="padding: 64px 24px; text-align: center; background: linear-gradient(180deg, rgba(215,247,107,0.08) 0%, transparent 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #d7f76b; font-weight: 600;">Lançamento Especial</span>
  <h1 style="font-size: 42px; font-weight: 700; margin: 12px 0; letter-spacing: -0.02em;">Design com Alma e Precisão</h1>
  <p style="font-size: 16px; opacity: 0.75; max-width: 580px; margin: 0 auto 24px;">Descubra a nova geração de interfaces criadas sob medida com o sistema de design.</p>
  <div style="display: flex; gap: 12px; justify-content: center;">
    <button style="background: #d7f76b; color: #101308; padding: 12px 24px; border-radius: 99px; font-weight: 600; border: none; cursor: pointer;">Explorar Coleção</button>
    <button style="background: transparent; color: #eceef1; padding: 12px 24px; border-radius: 99px; font-weight: 600; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;">Saber Mais</button>
  </div>
</section>`,
  },
  {
    name: "Card de Produto / Serviço",
    category: "Cards",
    html: `<div style="background: #111418; border: 1px solid #1f242b; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
  <div style="height: 160px; background: #161a1f; border-radius: 10px; display: grid; place-items: center; color: #626a75; font-size: 13px;">[ Imagem da Peça ]</div>
  <div style="display: flex; justify-content: space-between; align-items: baseline;">
    <h3 style="font-size: 18px; margin: 0; font-weight: 600;">Edição Exclusiva</h3>
    <span style="font-size: 16px; font-weight: 700; color: #d7f76b;">R$ 489</span>
  </div>
  <p style="font-size: 13px; opacity: 0.7; margin: 0;">Acabamento manual com materiais nobres e garantia vitalícia.</p>
  <button style="margin-top: 8px; background: #d7f76b; color: #101308; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;">Adicionar à Sacola</button>
</div>`,
  },
  {
    name: "Grade 3 Colunas",
    category: "Layout",
    html: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; padding: 32px 0;">
  <div style="background: #111418; border: 1px solid #1f242b; border-radius: 12px; padding: 20px;">
    <div style="font-size: 20px; margin-bottom: 8px;">✦</div>
    <h4 style="margin: 0 0 6px; font-size: 16px;">Alta Performance</h4>
    <p style="margin: 0; font-size: 13px; opacity: 0.7;">Arquitetura ultrarrápida otimizada para Core Web Vitals.</p>
  </div>
  <div style="background: #111418; border: 1px solid #1f242b; border-radius: 12px; padding: 20px;">
    <div style="font-size: 20px; margin-bottom: 8px;">⌗</div>
    <h4 style="margin: 0 0 6px; font-size: 16px;">Tokens Integrados</h4>
    <p style="margin: 0; font-size: 13px; opacity: 0.7;">Cores, tipografia e espaçamentos padronizados.</p>
  </div>
  <div style="background: #111418; border: 1px solid #1f242b; border-radius: 12px; padding: 20px;">
    <div style="font-size: 20px; margin-bottom: 8px;">▤</div>
    <h4 style="margin: 0 0 6px; font-size: 16px;">Auto Form</h4>
    <p style="margin: 0; font-size: 13px; opacity: 0.7;">Formulários validados no cliente e no servidor com Zod.</p>
  </div>
</div>`,
  },
  {
    name: "Call to Action (CTA)",
    category: "CTA",
    html: `<div style="background: linear-gradient(135deg, #17200a 0%, #111418 100%); border: 1px solid #d7f76b40; border-radius: 16px; padding: 36px; text-align: center; margin: 24px 0;">
  <h2 style="font-size: 28px; margin: 0 0 10px; font-weight: 700;">Pronto para transformar sua presença digital?</h2>
  <p style="font-size: 15px; opacity: 0.8; max-width: 500px; margin: 0 auto 20px;">Junte-se a mais de 10.000 marcas que utilizam o design system profissional.</p>
  <button style="background: #d7f76b; color: #101308; padding: 12px 28px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; font-size: 15px;">Começar Agora</button>
</div>`,
  },
];

export default function SmartEditor({
  designSystem,
  category,
  designSystems,
  code,
  setCode,
  onNotify,
  onOpenTab,
  onSelectDesignSystem,
}: Props) {
  // Canvas & layout state
  const [viewport, setViewport] = useState<"desktop" | "laptop" | "tablet" | "mobile" | "fluid">("desktop");
  const [zoom, setZoom] = useState<number>(100);
  const [leftTab, setLeftTab] = useState<"layers" | "blocks" | "palette">("layers");
  const [showCodeSplit, setShowCodeSplit] = useState(false);
  const [searchLayer, setSearchLayer] = useState("");

  // Inspection state
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [domTree, setDomTree] = useState<DomNode | null>(null);
  const [history, setHistory] = useState<string[]>([code]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Inspector form states
  const [activeClassInput, setActiveClassInput] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Assemble the iframe document with the Onlook engine injected
  const srcDoc = useMemo(() => {
    return `${code}\n<script data-onlook-engine="true">${ONLOOK_ENGINE}</script>`;
  }, [code]);

  // Handle postMessage communication from iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      const data = e.data || {};

      if (data.type === "onlook:ready") {
        if (data.tree) setDomTree(data.tree);
      }

      if (data.type === "onlook:selected") {
        setSelected(data.element);
      }

      if (data.type === "onlook:tree") {
        setDomTree(data.tree);
      }

      if (data.type === "onlook:htmlChanged" && typeof data.html === "string") {
        setCode(data.html);
        setHistory((prev) => [...prev.slice(0, historyIdx + 1), data.html]);
        setHistoryIdx((prev) => prev + 1);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setCode, historyIdx]);

  // Dispatch postMessage command to iframe
  const sendToIframe = useCallback((payload: Record<string, unknown>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, "*");
    }
  }, []);

  // Style change handler
  const setElementStyle = (prop: string, value: string) => {
    if (!selected) return;
    setSelected((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        styles: { ...prev.styles, [prop]: value },
      };
    });
    sendToIframe({ type: "onlook:setStyle", prop, value });
  };

  // Text content change
  const setElementText = (text: string) => {
    if (!selected) return;
    setSelected((prev) => (prev ? { ...prev, text } : null));
    sendToIframe({ type: "onlook:setText", text });
  };

  // Class changes
  const addClass = (className: string) => {
    if (!selected || !className.trim()) return;
    const currentList = selected.classes.split(" ").filter(Boolean);
    if (!currentList.includes(className.trim())) {
      const updated = [...currentList, className.trim()].join(" ");
      setSelected((prev) => (prev ? { ...prev, classes: updated } : null));
      sendToIframe({ type: "onlook:setClasses", classes: updated });
    }
    setActiveClassInput("");
  };

  const removeClass = (className: string) => {
    if (!selected) return;
    const updated = selected.classes
      .split(" ")
      .filter((c) => c !== className)
      .join(" ");
    setSelected((prev) => (prev ? { ...prev, classes: updated } : null));
    sendToIframe({ type: "onlook:setClasses", classes: updated });
  };

  // Actions
  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevCode = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      setCode(prevCode);
      onNotify("Desfeito (Undo)");
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextCode = history[historyIdx + 1];
      setHistoryIdx(historyIdx + 1);
      setCode(nextCode);
      onNotify("Refeito (Redo)");
    }
  };

  const handleDeleteElement = () => {
    if (!selected) return;
    sendToIframe({ type: "onlook:delete" });
    onNotify(`Elemento <${selected.tag}> removido`);
  };

  const handleDuplicateElement = () => {
    if (!selected) return;
    sendToIframe({ type: "onlook:duplicate" });
    onNotify(`Elemento <${selected.tag}> duplicado`);
  };

  const handleInsertSnippet = (snippetHtml: string) => {
    sendToIframe({ type: "onlook:insertSnippet", html: snippetHtml });
    onNotify("Bloco inserido com sucesso");
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `index-${designSystem.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify("index.html baixado com sucesso!");
  };

  const handleCopyClean = () => {
    navigator.clipboard.writeText(code);
    onNotify("HTML limpo copiado para a área de transferência!");
  };

  // Viewport width calculator
  const viewportWidth = useMemo(() => {
    switch (viewport) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "laptop":
        return "1024px";
      case "desktop":
        return "1440px";
      case "fluid":
      default:
        return "100%";
    }
  }, [viewport]);

  // Recursive Tree Node Renderer for Layers
  const renderTreeNode = (node: DomNode, depth = 0) => {
    const isSelected = selected?.path === node.path;
    const matchesSearch =
      !searchLayer ||
      node.tag.toLowerCase().includes(searchLayer.toLowerCase()) ||
      node.id.toLowerCase().includes(searchLayer.toLowerCase()) ||
      node.classes.toLowerCase().includes(searchLayer.toLowerCase());

    if (!matchesSearch && node.children.length === 0) return null;

    return (
      <div key={node.path} style={{ marginLeft: depth * 10 }}>
        <button
          type="button"
          onClick={() => sendToIframe({ type: "onlook:selectByPath", path: node.path })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            textAlign: "left",
            padding: "5px 8px",
            borderRadius: 6,
            background: isSelected ? "rgba(215, 247, 107, 0.15)" : "transparent",
            color: isSelected ? "var(--accent)" : "var(--ink)",
            border: isSelected ? "1px solid rgba(215, 247, 107, 0.35)" : "1px solid transparent",
            fontSize: 11.5,
            cursor: "pointer",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          <span style={{ opacity: 0.5, fontSize: 10 }}>
            {node.children.length > 0 ? "▾" : "•"}
          </span>
          <span style={{ fontWeight: 600 }}>{node.tag}</span>
          {node.id && <span style={{ color: "var(--blue)", fontSize: 10 }}>#{node.id}</span>}
          {node.classes && (
            <span style={{ color: "var(--muted)", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              .{node.classes.split(" ")[0]}
            </span>
          )}
          {node.text && (
            <span style={{ color: "var(--faint)", fontSize: 10, fontStyle: "italic", marginLeft: "auto" }}>
              "{node.text.slice(0, 15)}"
            </span>
          )}
        </button>
        {node.children.map((child) => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 49px)", background: "var(--bg)", overflow: "hidden" }}>
      {/* Top Application Bar */}
      <header
        style={{
          height: 48,
          borderBottom: "1px solid var(--line)",
          background: "var(--panel)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          gap: 12,
        }}
      >
        {/* Left: Branding & Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 260 }}>
          <div
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              background: "rgba(215,247,107,0.12)",
              color: "var(--accent)",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.05em",
            }}
          >
            SMART EDITOR
          </div>
          <span style={{ color: "var(--line)" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--muted)", overflow: "hidden" }}>
            <span>{category.name}</span>
            <span>›</span>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>{designSystem.name}</span>
            {selected && (
              <>
                <span>›</span>
                <span className="mono" style={{ color: "var(--accent)", fontWeight: 600 }}>
                  {selected.tag}
                  {selected.id ? `#${selected.id}` : ""}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center: Device Viewport Controls & Zoom */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--panel-2)", padding: "3px 6px", borderRadius: 8, border: "1px solid var(--line)" }}>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              padding: "4px 10px",
              fontSize: 11,
              background: viewport === "desktop" ? "var(--panel-3)" : "transparent",
              color: viewport === "desktop" ? "var(--accent)" : "var(--muted)",
            }}
            onClick={() => setViewport("desktop")}
            title="Desktop (1440px)"
          >
            🖥 Desktop
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              padding: "4px 10px",
              fontSize: 11,
              background: viewport === "laptop" ? "var(--panel-3)" : "transparent",
              color: viewport === "laptop" ? "var(--accent)" : "var(--muted)",
            }}
            onClick={() => setViewport("laptop")}
            title="Laptop (1024px)"
          >
            💻 Laptop
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              padding: "4px 10px",
              fontSize: 11,
              background: viewport === "tablet" ? "var(--panel-3)" : "transparent",
              color: viewport === "tablet" ? "var(--accent)" : "var(--muted)",
            }}
            onClick={() => setViewport("tablet")}
            title="Tablet (768px)"
          >
            📱 Tablet
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              padding: "4px 10px",
              fontSize: 11,
              background: viewport === "mobile" ? "var(--panel-3)" : "transparent",
              color: viewport === "mobile" ? "var(--accent)" : "var(--muted)",
            }}
            onClick={() => setViewport("mobile")}
            title="Mobile (375px)"
          >
            📲 Mobile
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              padding: "4px 10px",
              fontSize: 11,
              background: viewport === "fluid" ? "var(--panel-3)" : "transparent",
              color: viewport === "fluid" ? "var(--accent)" : "var(--muted)",
            }}
            onClick={() => setViewport("fluid")}
            title="100% Fluido"
          >
            ↔ Fluido
          </button>

          <span style={{ color: "var(--line)", margin: "0 4px" }}>|</span>

          {/* Zoom Selector */}
          <select
            className="select"
            style={{ padding: "2px 8px", fontSize: 11, width: "auto", border: 0, background: "transparent" }}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={100}>100%</option>
            <option value={125}>125%</option>
          </select>
        </div>

        {/* Right: Actions, History & Export */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            className="btn btn-sm"
            disabled={historyIdx === 0}
            onClick={handleUndo}
            title="Desfazer (Ctrl+Z)"
          >
            ↶ Desfazer
          </button>
          <button
            type="button"
            className="btn btn-sm"
            disabled={historyIdx >= history.length - 1}
            onClick={handleRedo}
            title="Refazer (Ctrl+Y)"
          >
            ↷ Refazer
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: showCodeSplit ? "var(--panel-3)" : "transparent", color: showCodeSplit ? "var(--accent)" : "var(--ink)" }}
            onClick={() => setShowCodeSplit(!showCodeSplit)}
            title="Alternar Código Dividido"
          >
            &lt;/&gt; Código
          </button>
          <button type="button" className="btn btn-sm" onClick={handleCopyClean} title="Copiar HTML Limpo">
            Copiar HTML
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: "var(--accent)", color: "var(--accent-ink)", fontWeight: 600 }}
            onClick={handleDownload}
            title="Baixar index.html Pronto"
          >
            ⬇ Baixar index.html
          </button>
        </div>
      </header>

      {/* Main 3-Column Studio Body */}
      <div style={{ display: "grid", gridTemplateColumns: "270px 1fr 340px", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* LEFT COLUMN: DOM Tree, Block Library & Quick Design System Palettes */}
        <aside style={{ background: "var(--panel)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* Sub-tabs for Left Panel */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--line)" }}>
            <button
              type="button"
              onClick={() => setLeftTab("layers")}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: 11,
                fontWeight: 600,
                textAlign: "center",
                background: leftTab === "layers" ? "var(--panel-2)" : "transparent",
                color: leftTab === "layers" ? "var(--accent)" : "var(--muted)",
                borderBottom: leftTab === "layers" ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: "pointer",
                border: "none",
              }}
            >
              Camadas (DOM)
            </button>
            <button
              type="button"
              onClick={() => setLeftTab("blocks")}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: 11,
                fontWeight: 600,
                textAlign: "center",
                background: leftTab === "blocks" ? "var(--panel-2)" : "transparent",
                color: leftTab === "blocks" ? "var(--accent)" : "var(--muted)",
                borderBottom: leftTab === "blocks" ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: "pointer",
                border: "none",
              }}
            >
              Inserir Blocos
            </button>
            <button
              type="button"
              onClick={() => setLeftTab("palette")}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: 11,
                fontWeight: 600,
                textAlign: "center",
                background: leftTab === "palette" ? "var(--panel-2)" : "transparent",
                color: leftTab === "palette" ? "var(--accent)" : "var(--muted)",
                borderBottom: leftTab === "palette" ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: "pointer",
                border: "none",
              }}
            >
              Tokens & DS
            </button>
          </div>

          {/* Left Panel Content */}
          <div className="scroll-thin" style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {leftTab === "layers" && (
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  className="input"
                  style={{ fontSize: 11, padding: "6px 8px" }}
                  placeholder="Filtrar tag, id ou classe…"
                  value={searchLayer}
                  onChange={(e) => setSearchLayer(e.target.value)}
                />
                <div style={{ display: "grid", gap: 2, marginTop: 4 }}>
                  {domTree ? renderTreeNode(domTree) : <p className="hint">Carregando árvore de elementos…</p>}
                </div>
              </div>
            )}

            {leftTab === "blocks" && (
              <div style={{ display: "grid", gap: 12 }}>
                <p className="hint" style={{ fontSize: 11, margin: 0 }}>
                  Clique para injetar no container ou elemento selecionado:
                </p>
                {COMPONENT_SNIPPETS.map((snippet) => (
                  <div
                    key={snippet.name}
                    style={{
                      background: "var(--panel-2)",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "12px",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{snippet.name}</span>
                      <span className="badge" style={{ fontSize: 9 }}>{snippet.category}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ background: "rgba(215,247,107,0.12)", color: "var(--accent)", border: "1px solid rgba(215,247,107,0.3)" }}
                      onClick={() => handleInsertSnippet(snippet.html)}
                    >
                      + Inserir no Template
                    </button>
                  </div>
                ))}
              </div>
            )}

            {leftTab === "palette" && (
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <span className="label" style={{ display: "block", marginBottom: 6 }}>Cores do Design System</span>
                  <div style={{ display: "grid", gap: 6 }}>
                    {Object.entries(designSystem.palette).map(([key, val]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          if (selected) setElementStyle("backgroundColor", val);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: 8,
                          background: "var(--panel-2)",
                          border: "1px solid var(--line)",
                          color: "var(--ink)",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 14, height: 14, borderRadius: 4, background: val, border: "1px solid rgba(255,255,255,0.2)" }} />
                          <span style={{ textTransform: "capitalize" }}>{key}</span>
                        </span>
                        <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>{val}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="label" style={{ display: "block", marginBottom: 6 }}>Fontes Configuradas</span>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ padding: "8px", background: "var(--panel-2)", borderRadius: 8, fontSize: 11 }}>
                      <span style={{ color: "var(--muted)", display: "block", fontSize: 9 }}>Display / Título</span>
                      <strong>{designSystem.fonts.display}</strong>
                    </div>
                    <div style={{ padding: "8px", background: "var(--panel-2)", borderRadius: 8, fontSize: 11 }}>
                      <span style={{ color: "var(--muted)", display: "block", fontSize: 9 }}>Corpo do Texto</span>
                      <strong>{designSystem.fonts.body}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER COLUMN: Canvas Viewport & Optional Code Split */}
        <main
          style={{
            background: "#050608",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Canvas Wrapper */}
          <div
            style={{
              flex: showCodeSplit ? "0 0 60%" : "1 1 100%",
              minHeight: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              overflow: "auto",
              padding: "24px 16px",
              background: "radial-gradient(#1f242b 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            <div
              style={{
                width: viewportWidth,
                maxWidth: "100%",
                height: "100%",
                minHeight: 700,
                background: "#ffffff",
                borderRadius: viewport === "fluid" ? 0 : 12,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.08)",
                overflow: "hidden",
                transition: "width 0.25s ease, transform 0.2s ease",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <iframe
                ref={iframeRef}
                title="Onlook Canvas"
                srcDoc={srcDoc}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>

          {/* Optional Code Split Editor Panel */}
          {showCodeSplit && (
            <div
              style={{
                flex: "0 0 40%",
                borderTop: "1px solid var(--line)",
                background: "var(--panel)",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <div
                style={{
                  height: 32,
                  background: "var(--panel-2)",
                  borderBottom: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 12px",
                  fontSize: 11,
                  color: "var(--muted)",
                }}
              >
                <span>index.html (Sincronizado bidirecionalmente)</span>
                <span className="mono">{code.length} caracteres</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="scroll-thin"
                style={{
                  flex: 1,
                  background: "#08090b",
                  color: "#eceef1",
                  border: "none",
                  padding: "12px",
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  fontSize: 12,
                  lineHeight: "1.5",
                  resize: "none",
                  outline: "none",
                }}
              />
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: Complete Onlook Style Inspector */}
        <aside style={{ background: "var(--panel)", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span className="label" style={{ display: "block" }}>Inspetor Visual</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>
                {selected ? `<${selected.tag}> ${selected.rect.width}×${selected.rect.height}px` : "Selecione um elemento no canvas"}
              </span>
            </div>
            {selected && (
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ padding: "3px 8px", fontSize: 10 }}
                  onClick={handleDuplicateElement}
                  title="Duplicar elemento"
                >
                  ❐
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ padding: "3px 8px", fontSize: 10, color: "var(--danger)" }}
                  onClick={handleDeleteElement}
                  title="Deletar elemento"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {selected ? (
            <div className="scroll-thin" style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "grid", gap: 16 }}>
              {/* Element Header & Live Text Content */}
              <div>
                <span className="label" style={{ display: "block", marginBottom: 6 }}>Conteúdo do Texto</span>
                <textarea
                  className="input"
                  rows={2}
                  style={{ fontSize: 12, lineHeight: 1.4 }}
                  value={selected.text}
                  onChange={(e) => setElementText(e.target.value)}
                  placeholder="Texto do elemento…"
                />
              </div>

              {/* Typography Section */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <span className="label" style={{ display: "block", marginBottom: 8 }}>Tipografia</span>
                <div style={{ display: "grid", gap: 8 }}>
                  {/* Font Size & Weight */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Tamanho</span>
                      <input
                        className="input"
                        style={{ fontSize: 11 }}
                        value={selected.styles.fontSize}
                        onChange={(e) => setElementStyle("fontSize", e.target.value)}
                        placeholder="16px"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Peso (Weight)</span>
                      <select
                        className="select"
                        style={{ fontSize: 11 }}
                        value={selected.styles.fontWeight}
                        onChange={(e) => setElementStyle("fontWeight", e.target.value)}
                      >
                        <option value="300">Light (300)</option>
                        <option value="400">Regular (400)</option>
                        <option value="500">Medium (500)</option>
                        <option value="600">Semibold (600)</option>
                        <option value="700">Bold (700)</option>
                        <option value="800">Black (800)</option>
                      </select>
                    </div>
                  </div>

                  {/* Text Color & Alignment */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Cor do Texto</span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                          type="color"
                          value={selected.styles.color.startsWith("#") ? selected.styles.color : "#eceef1"}
                          onChange={(e) => setElementStyle("color", e.target.value)}
                          style={{ width: 28, height: 28, border: "none", borderRadius: 4, cursor: "pointer", background: "transparent" }}
                        />
                        <input
                          className="input"
                          style={{ fontSize: 11, flex: 1 }}
                          value={selected.styles.color}
                          onChange={(e) => setElementStyle("color", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Alinhamento</span>
                      <div style={{ display: "flex", gap: 2 }}>
                        {["left", "center", "right"].map((align) => (
                          <button
                            key={align}
                            type="button"
                            className="btn btn-sm"
                            style={{
                              flex: 1,
                              padding: "4px",
                              fontSize: 10,
                              background: selected.styles.textAlign === align ? "var(--accent)" : "var(--panel-2)",
                              color: selected.styles.textAlign === align ? "var(--accent-ink)" : "var(--ink)",
                            }}
                            onClick={() => setElementStyle("textAlign", align)}
                          >
                            {align === "left" ? "⇤" : align === "center" ? "≡" : "⇥"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout & Flexbox Section */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <span className="label" style={{ display: "block", marginBottom: 8 }}>Layout & Flex</span>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Display</span>
                      <select
                        className="select"
                        style={{ fontSize: 11 }}
                        value={selected.styles.display}
                        onChange={(e) => setElementStyle("display", e.target.value)}
                      >
                        <option value="block">Block</option>
                        <option value="flex">Flex</option>
                        <option value="grid">Grid</option>
                        <option value="inline-block">Inline-block</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Direção</span>
                      <select
                        className="select"
                        style={{ fontSize: 11 }}
                        value={selected.styles.flexDirection}
                        onChange={(e) => setElementStyle("flexDirection", e.target.value)}
                        disabled={selected.styles.display !== "flex"}
                      >
                        <option value="row">Linha (Row)</option>
                        <option value="column">Coluna (Column)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Alinhar Itens</span>
                      <select
                        className="select"
                        style={{ fontSize: 11 }}
                        value={selected.styles.alignItems}
                        onChange={(e) => setElementStyle("alignItems", e.target.value)}
                        disabled={selected.styles.display !== "flex"}
                      >
                        <option value="stretch">Stretch</option>
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                      </select>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Gap (Espaço)</span>
                      <input
                        className="input"
                        style={{ fontSize: 11 }}
                        value={selected.styles.gap}
                        onChange={(e) => setElementStyle("gap", e.target.value)}
                        placeholder="16px"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Spacing: Box Model Diagram */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <span className="label" style={{ display: "block", marginBottom: 8 }}>Espaçamento (Box Model)</span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Padding</span>
                    <input
                      className="input"
                      style={{ fontSize: 11 }}
                      value={selected.styles.paddingTop}
                      onChange={(e) => {
                        setElementStyle("paddingTop", e.target.value);
                        setElementStyle("paddingBottom", e.target.value);
                        setElementStyle("paddingLeft", e.target.value);
                        setElementStyle("paddingRight", e.target.value);
                      }}
                      placeholder="Ex: 16px"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Margin</span>
                    <input
                      className="input"
                      style={{ fontSize: 11 }}
                      value={selected.styles.marginTop}
                      onChange={(e) => {
                        setElementStyle("marginTop", e.target.value);
                        setElementStyle("marginBottom", e.target.value);
                        setElementStyle("marginLeft", e.target.value);
                        setElementStyle("marginRight", e.target.value);
                      }}
                      placeholder="Ex: 8px"
                    />
                  </div>
                </div>
              </div>

              {/* Background & Borders */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <span className="label" style={{ display: "block", marginBottom: 8 }}>Fundo & Bordas</span>
                <div style={{ display: "grid", gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Cor de Fundo</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="color"
                        value={selected.styles.backgroundColor.startsWith("#") ? selected.styles.backgroundColor : "#111418"}
                        onChange={(e) => setElementStyle("backgroundColor", e.target.value)}
                        style={{ width: 28, height: 28, border: "none", borderRadius: 4, cursor: "pointer", background: "transparent" }}
                      />
                      <input
                        className="input"
                        style={{ fontSize: 11, flex: 1 }}
                        value={selected.styles.backgroundColor}
                        onChange={(e) => setElementStyle("backgroundColor", e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Borda (Radius)</span>
                      <input
                        className="input"
                        style={{ fontSize: 11 }}
                        value={selected.styles.borderRadius}
                        onChange={(e) => setElementStyle("borderRadius", e.target.value)}
                        placeholder="12px"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--muted)", display: "block", marginBottom: 4 }}>Opacidade</span>
                      <input
                        className="input"
                        style={{ fontSize: 11 }}
                        value={selected.styles.opacity}
                        onChange={(e) => setElementStyle("opacity", e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tailwind Classes Tag Manager */}
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <span className="label" style={{ display: "block", marginBottom: 6 }}>Classes Tailwind / CSS</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                  {selected.classes.split(" ").filter(Boolean).map((cls) => (
                    <span
                      key={cls}
                      style={{
                        background: "var(--panel-2)",
                        border: "1px solid var(--line)",
                        borderRadius: 6,
                        padding: "2px 6px",
                        fontSize: 10,
                        fontFamily: "var(--font-mono, monospace)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {cls}
                      <button
                        type="button"
                        onClick={() => removeClass(cls)}
                        style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {!selected.classes.trim() && (
                    <span style={{ fontSize: 11, color: "var(--faint)", fontStyle: "italic" }}>Nenhuma classe atribuída</span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="input"
                    style={{ fontSize: 11 }}
                    placeholder="Adicionar classe (ex: p-4, rounded-xl)…"
                    value={activeClassInput}
                    onChange={(e) => setActiveClassInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addClass(activeClassInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: "var(--panel-2)", fontSize: 11 }}
                    onClick={() => addClass(activeClassInput)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24, textAlign: "center", color: "var(--faint)" }}>
              <div>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>↖</div>
                <h4 style={{ margin: "0 0 6px", fontSize: 14, color: "var(--muted)" }}>Nenhum Elemento Selecionado</h4>
                <p style={{ margin: 0, fontSize: 12, maxWidth: 220 }}>
                  Passe o mouse e clique em qualquer título, botão, card ou seção no canvas para inspecionar e editar em tempo real.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

