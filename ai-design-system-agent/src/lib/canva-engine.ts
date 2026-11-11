/**
 * Canva Studio & Social Creatives Engine
 * Supports Instagram (Post, Carrossel Multi-Page, Story/Reels),
 * Facebook Post, YouTube Thumbnail (16:9), YouTube Shorts (9:16), TikTok (9:16).
 * Includes bidirectional converter for Figma Community & Penpot open formats (SVG / JSON).
 */

export type CanvasFormatId =
  | "ig-post"
  | "ig-carousel"
  | "ig-story"
  | "fb-post"
  | "yt-thumb"
  | "yt-shorts"
  | "tiktok";

export interface CanvasFormatConfig {
  id: CanvasFormatId;
  label: string;
  platform: "instagram" | "facebook" | "youtube" | "tiktok";
  width: number;
  height: number;
  aspectRatio: string;
  icon: string;
  badge: string;
  description: string;
}

export const CANVAS_FORMATS: Record<CanvasFormatId, CanvasFormatConfig> = {
  "ig-post": {
    id: "ig-post",
    label: "Instagram Post",
    platform: "instagram",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    icon: "📸",
    badge: "1080 × 1080",
    description: "Post quadrado para feed do Instagram e Facebook.",
  },
  "ig-carousel": {
    id: "ig-carousel",
    label: "Instagram Carrossel",
    platform: "instagram",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    icon: "📑",
    badge: "Multi-Páginas",
    description: "Carrossel contínuo de 2 a 10 slides sequenciais.",
  },
  "ig-story": {
    id: "ig-story",
    label: "Instagram Story & Reels",
    platform: "instagram",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    icon: "📱",
    badge: "1080 × 1920",
    description: "Formato vertical imersivo para Stories e Reels.",
  },
  "fb-post": {
    id: "fb-post",
    label: "Facebook Post",
    platform: "facebook",
    width: 1200,
    height: 630,
    aspectRatio: "1.91:1",
    icon: "📘",
    badge: "1200 × 630",
    description: "Anúncios de feed e links patrocinados no Facebook.",
  },
  "yt-thumb": {
    id: "yt-thumb",
    label: "YouTube Thumbnail",
    platform: "youtube",
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    icon: "🔴",
    badge: "1280 × 720",
    description: "Capa de vídeo em alta definição com alto contraste.",
  },
  "yt-shorts": {
    id: "yt-shorts",
    label: "YouTube Shorts",
    platform: "youtube",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    icon: "⚡",
    badge: "1080 × 1920",
    description: "Capa e enquadramento para Shorts do YouTube.",
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok Vídeo / Capa",
    platform: "tiktok",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    icon: "🎵",
    badge: "1080 × 1920",
    description: "Formato vertical dinâmico com foco em retenção.",
  },
};

export type CanvasElementType =
  | "text"
  | "heading"
  | "subheading"
  | "badge"
  | "shape"
  | "image"
  | "button"
  | "bullet-list"
  | "price-tag";

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  name: string;
  x: number; // in pixels on the base canvas (e.g. 0 to 1080)
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  zIndex?: number;

  // Text specific
  text?: string;
  fontSize?: number;
  fontWeight?: "normal" | "600" | "700" | "800" | "900";
  fontFamily?: string;
  color?: string;
  textAlign?: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;

  // Shape specific
  shapeType?: "rect" | "circle" | "pill" | "starburst" | "wave" | "card";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  shadow?: string;

  // Badge / Button specific
  badgeBg?: string;
  badgeColor?: string;

  // Bullet list specific
  listItems?: string[];
  bulletIcon?: string;

  // Image specific
  src?: string;
  objectFit?: "cover" | "contain";
}

export interface CanvasPage {
  id: string;
  title: string;
  bgType: "color" | "gradient" | "pattern";
  bgColor: string;
  bgGradient?: string;
  elements: CanvasElement[];
}

export interface CanvaProject {
  id: string;
  title: string;
  format: CanvasFormatId;
  width: number;
  height: number;
  pages: CanvasPage[];
  activePageIndex: number;
}

export interface CanvaTemplatePreset {
  id: string;
  name: string;
  format: CanvasFormatId;
  category: "pet" | "ecommerce" | "tech" | "beauty" | "viral" | "community-figma" | "community-penpot";
  source: "canva-clone" | "figma-community" | "penpot-community";
  thumbnailColor: string;
  description: string;
  tags: string[];
  pages: CanvasPage[];
}

/**
 * Preloaded Rich Templates matching the user request and Canva style
 */
export const PRELOADED_CANVA_TEMPLATES: CanvaTemplatePreset[] = [
  {
    id: "pet-friendly-modern",
    name: "Somos Pet Friendly (Moderno Laranja e Azul)",
    format: "ig-post",
    category: "pet",
    source: "canva-clone",
    thumbnailColor: "#f37021",
    description: "Template idêntico ao modelo Canva com selo 'SOMOS', título 'PET FRIENDLY', badge de preço e lista de comodidades.",
    tags: ["pet friendly", "hotel", "pousada", "serviços", "canva"],
    pages: [
      {
        id: "page-pet-1",
        title: "Página 1 - Somos Pet Friendly",
        bgType: "gradient",
        bgColor: "#ffffff",
        bgGradient: "linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%)",
        elements: [
          // Top curved deco wave (simulated with wave element)
          {
            id: "el-pet-wave",
            type: "shape",
            name: "Onda de Fundo Superior",
            x: 580,
            y: -100,
            width: 600,
            height: 380,
            shapeType: "circle",
            fill: "#e9ecef",
            opacity: 0.5,
            zIndex: 1,
          },
          // Ribbon Banner "SOMOS"
          {
            id: "el-pet-ribbon",
            type: "shape",
            name: "Faixa SOMOS Laranja",
            x: 290,
            y: 90,
            width: 320,
            height: 85,
            shapeType: "rect",
            fill: "#e05315",
            borderRadius: 6,
            rotation: -2,
            zIndex: 5,
          },
          {
            id: "el-pet-somos-text",
            type: "heading",
            name: "Texto SOMOS",
            x: 290,
            y: 95,
            width: 320,
            height: 80,
            text: "SOMOS",
            fontSize: 64,
            fontWeight: "900",
            fontFamily: "Impact, sans-serif",
            color: "#ffffff",
            textAlign: "center",
            rotation: -2,
            zIndex: 6,
          },
          // Main Headline "PET FRIENDLY"
          {
            id: "el-pet-friendly-text",
            type: "heading",
            name: "Título PET FRIENDLY Azul",
            x: 140,
            y: 195,
            width: 800,
            height: 110,
            text: "PET FRIENDLY",
            fontSize: 96,
            fontWeight: "900",
            fontFamily: "Impact, sans-serif",
            color: "#18458b",
            textAlign: "center",
            letterSpacing: 2,
            zIndex: 7,
          },
          // Subheadline
          {
            id: "el-pet-subhead",
            type: "subheading",
            name: "Subtítulo Hospedagem",
            x: 180,
            y: 330,
            width: 720,
            height: 70,
            text: "Hospedagem com amor para humanos e seus companheiros de quatro patas!",
            fontSize: 26,
            fontWeight: "700",
            fontFamily: "Inter, sans-serif",
            color: "#212529",
            textAlign: "center",
            lineHeight: 1.3,
            zIndex: 8,
          },
          // Starburst Price Badge (green circle / badge)
          {
            id: "el-pet-price-badge",
            type: "price-tag",
            name: "Selo de Preço Estrela",
            x: 720,
            y: 430,
            width: 220,
            height: 150,
            shapeType: "starburst",
            fill: "#729b79",
            borderRadius: 12,
            rotation: -6,
            zIndex: 10,
          },
          {
            id: "el-pet-price-text",
            type: "text",
            name: "Texto Preço R$ 129,90",
            x: 720,
            y: 450,
            width: 220,
            height: 110,
            text: "Diárias a partir de\nR$ 129,90",
            fontSize: 24,
            fontWeight: "900",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            rotation: -6,
            zIndex: 11,
          },
          // Amenities Box (Orange Card)
          {
            id: "el-pet-box",
            type: "shape",
            name: "Cartão de Comodidades",
            x: 80,
            y: 480,
            width: 440,
            height: 380,
            shapeType: "card",
            fill: "#e05315",
            borderRadius: 16,
            zIndex: 5,
          },
          // Amenities Bullet List
          {
            id: "el-pet-list",
            type: "bullet-list",
            name: "Lista de Comodidades",
            x: 110,
            y: 520,
            width: 380,
            height: 300,
            bulletIcon: "🐾",
            color: "#ffffff",
            fontSize: 22,
            fontWeight: "700",
            listItems: [
              "Quarto aconchegante",
              "Espaço pet livre",
              "Café da manhã incluso",
              "Ar condicionado",
              "Câmera de segurança para pets",
            ],
            zIndex: 6,
          },
          // Cute Dog & Cat Illustration / Photo Placeholder
          {
            id: "el-pet-photo",
            type: "image",
            name: "Foto Pet Cão e Gato",
            x: 520,
            y: 550,
            width: 480,
            height: 480,
            src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
            objectFit: "contain",
            borderRadius: 20,
            zIndex: 9,
          },
          // Footer Phone / Contact
          {
            id: "el-pet-footer",
            type: "text",
            name: "Rodapé Reserva e Telefone",
            x: 80,
            y: 950,
            width: 400,
            height: 60,
            text: "Faça sua reserva:\n📞 (11) 93456-7890",
            fontSize: 22,
            fontWeight: "800",
            fontFamily: "Inter, sans-serif",
            color: "#18458b",
            textAlign: "left",
            lineHeight: 1.3,
            zIndex: 10,
          },
        ],
      },
    ],
  },
  {
    id: "ig-carousel-viral-ux",
    name: "Carrossel Instagram: 4 Erros Críticos de UI/UX",
    format: "ig-carousel",
    category: "viral",
    source: "canva-clone",
    thumbnailColor: "#6366f1",
    description: "Carrossel sequencial de 4 slides de alta retenção para Instagram com capa, 2 dicas profundas e slide de fechamento/CTA.",
    tags: ["carrossel", "instagram", "retenção", "ui/ux", "frontend"],
    pages: [
      // Slide 1 - Cover
      {
        id: "slide-1",
        title: "Slide 1 - Capa Impactante",
        bgType: "gradient",
        bgColor: "#0f172a",
        bgGradient: "linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)",
        elements: [
          {
            id: "s1-tag",
            type: "badge",
            name: "Tag UI/UX Checklist",
            x: 80,
            y: 120,
            width: 320,
            height: 50,
            badgeBg: "#4f46e5",
            badgeColor: "#ffffff",
            text: "✦ FRONTEND MASTERY",
            fontSize: 16,
            fontWeight: "800",
            borderRadius: 99,
          },
          {
            id: "s1-title",
            type: "heading",
            name: "Título da Capa",
            x: 80,
            y: 260,
            width: 920,
            height: 380,
            text: "4 ERROS DE UI\nQUE DESTROEM\nSUA CONVERSÃO",
            fontSize: 82,
            fontWeight: "900",
            fontFamily: "Inter, sans-serif",
            color: "#f8fafc",
            lineHeight: 1.08,
            letterSpacing: -1,
          },
          {
            id: "s1-sub",
            type: "subheading",
            name: "Subtítulo da Capa",
            x: 80,
            y: 690,
            width: 820,
            height: 100,
            text: "Pequenos detalhes no layout fazem você perder até 40% das vendas sem perceber.",
            fontSize: 28,
            fontWeight: "600",
            color: "#94a3b8",
            lineHeight: 1.4,
          },
          {
            id: "s1-swipe",
            type: "button",
            name: "Indicador de Deslizar",
            x: 80,
            y: 890,
            width: 420,
            height: 70,
            text: "Arraste para o lado 👉",
            fontSize: 24,
            fontWeight: "800",
            badgeBg: "#22c55e",
            badgeColor: "#052e16",
            borderRadius: 14,
          },
        ],
      },
      // Slide 2 - Problem 1
      {
        id: "slide-2",
        title: "Slide 2 - Erro #1 Contraste",
        bgType: "color",
        bgColor: "#090d16",
        elements: [
          {
            id: "s2-number",
            type: "heading",
            name: "Número 01",
            x: 80,
            y: 100,
            width: 200,
            height: 100,
            text: "01",
            fontSize: 90,
            fontWeight: "900",
            color: "#6366f1",
          },
          {
            id: "s2-title",
            type: "heading",
            name: "Título Erro 1",
            x: 80,
            y: 220,
            width: 920,
            height: 120,
            text: "Texto Cinza Claro Sobre Fundo Branco",
            fontSize: 54,
            fontWeight: "800",
            color: "#ffffff",
          },
          {
            id: "s2-card",
            type: "shape",
            name: "Card Demonstrativo",
            x: 80,
            y: 390,
            width: 920,
            height: 380,
            shapeType: "card",
            fill: "#131b2e",
            borderRadius: 20,
            stroke: "rgba(255,255,255,0.1)",
            strokeWidth: 1,
          },
          {
            id: "s2-body",
            type: "text",
            name: "Explicação do Erro",
            x: 130,
            y: 440,
            width: 820,
            height: 280,
            text: "Se o seu usuário precisa forçar a vista sob o sol no celular, ele sai do seu site em 3 segundos.\n\nSempre valide a taxa WCAG 2.1 AA (mínimo 4.5:1 de taxa de contraste).",
            fontSize: 30,
            fontWeight: "600",
            color: "#cbd5e1",
            lineHeight: 1.5,
          },
          {
            id: "s2-footer",
            type: "text",
            name: "Footer Deslize",
            x: 80,
            y: 920,
            width: 920,
            height: 40,
            text: "Slide 2/4 · Continue deslizando →",
            fontSize: 20,
            fontWeight: "700",
            color: "#64748b",
            textAlign: "right",
          },
        ],
      },
      // Slide 3 - Problem 2
      {
        id: "slide-3",
        title: "Slide 3 - Erro #2 Formulários",
        bgType: "color",
        bgColor: "#090d16",
        elements: [
          {
            id: "s3-number",
            type: "heading",
            name: "Número 02",
            x: 80,
            y: 100,
            width: 200,
            height: 100,
            text: "02",
            fontSize: 90,
            fontWeight: "900",
            color: "#ec4899",
          },
          {
            id: "s3-title",
            type: "heading",
            name: "Título Erro 2",
            x: 80,
            y: 220,
            width: 920,
            height: 120,
            text: "Formulários Longos sem Auto-Complete",
            fontSize: 54,
            fontWeight: "800",
            color: "#ffffff",
          },
          {
            id: "s3-card",
            type: "shape",
            name: "Card Dica",
            x: 80,
            y: 390,
            width: 920,
            height: 380,
            shapeType: "card",
            fill: "#1e1327",
            borderRadius: 20,
            stroke: "rgba(236,72,153,0.3)",
            strokeWidth: 1,
          },
          {
            id: "s3-body",
            type: "text",
            name: "Texto da Dica",
            x: 130,
            y: 440,
            width: 820,
            height: 280,
            text: "Cada campo a mais no checkout reduz até 8% da taxa de finalização.\n\nUse máscaras automáticas de CEP, preenchimento de endereço via ViaCEP e autenticação social em 1 clique.",
            fontSize: 30,
            fontWeight: "600",
            color: "#fbcfe8",
            lineHeight: 1.5,
          },
          {
            id: "s3-footer",
            type: "text",
            name: "Footer Deslize",
            x: 80,
            y: 920,
            width: 920,
            height: 40,
            text: "Slide 3/4 · Conclusão a seguir →",
            fontSize: 20,
            fontWeight: "700",
            color: "#64748b",
            textAlign: "right",
          },
        ],
      },
      // Slide 4 - CTA
      {
        id: "slide-4",
        title: "Slide 4 - CTA Salve e Compartilhe",
        bgType: "gradient",
        bgColor: "#090d16",
        bgGradient: "linear-gradient(180deg, #090d16 0%, #1e1b4b 100%)",
        elements: [
          {
            id: "s4-title",
            type: "heading",
            name: "Título de Fechamento",
            x: 80,
            y: 180,
            width: 920,
            height: 180,
            text: "Gostou desse conteúdo?",
            fontSize: 72,
            fontWeight: "900",
            color: "#ffffff",
            textAlign: "center",
          },
          {
            id: "s4-sub",
            type: "subheading",
            name: "Instrução de Salvamento",
            x: 120,
            y: 350,
            width: 840,
            height: 100,
            text: "Salve este post para aplicar nas suas próximas páginas de produto e dobrar a retenção.",
            fontSize: 30,
            fontWeight: "600",
            color: "#cbd5e1",
            textAlign: "center",
            lineHeight: 1.4,
          },
          {
            id: "s4-save-btn",
            type: "button",
            name: "Botão Salvar",
            x: 290,
            y: 530,
            width: 500,
            height: 90,
            text: "📌 Salvar para Consultar",
            fontSize: 30,
            fontWeight: "800",
            badgeBg: "#6366f1",
            badgeColor: "#ffffff",
            borderRadius: 20,
          },
          {
            id: "s4-profile",
            type: "text",
            name: "Handle do Criador",
            x: 80,
            y: 840,
            width: 920,
            height: 60,
            text: "@seudesignsystem · Design & Code",
            fontSize: 26,
            fontWeight: "800",
            color: "#94a3b8",
            textAlign: "center",
          },
        ],
      },
    ],
  },
  {
    id: "yt-thumb-tech-viral",
    name: "YouTube Thumbnail: Design System em 10 Minutos",
    format: "yt-thumb",
    category: "tech",
    source: "canva-clone",
    thumbnailColor: "#ef4444",
    description: "Capa para YouTube 16:9 (1280x720) com tipografia de alto impacto, selo de tempo, cores quentes e alto CTR.",
    tags: ["youtube", "thumbnail", "16:9", "tecnologia", "programação"],
    pages: [
      {
        id: "yt-page-1",
        title: "Thumbnail 1280x720",
        bgType: "gradient",
        bgColor: "#090a0f",
        bgGradient: "linear-gradient(135deg, #090a0f 0%, #1e0915 50%, #290808 100%)",
        elements: [
          // Yellow Top Badge
          {
            id: "yt-badge-tag",
            type: "badge",
            name: "Selo Passo a Passo",
            x: 60,
            y: 60,
            width: 320,
            height: 50,
            badgeBg: "#eab308",
            badgeColor: "#000000",
            text: "⚡ PASSO A PASSO COMPLETO",
            fontSize: 18,
            fontWeight: "900",
            borderRadius: 8,
          },
          // Giant Punchy Text
          {
            id: "yt-main-title",
            type: "heading",
            name: "Título Impactante YouTube",
            x: 60,
            y: 130,
            width: 760,
            height: 320,
            text: "CRIE SEU\nDESIGN SYSTEM\nDO ZERO",
            fontSize: 78,
            fontWeight: "900",
            fontFamily: "Impact, sans-serif",
            color: "#ffffff",
            lineHeight: 1.05,
            letterSpacing: -1,
          },
          // Highlight Pill: "EM 10 MINUTOS!"
          {
            id: "yt-pill-time",
            type: "shape",
            name: "Faixa Vermelha Destaque",
            x: 60,
            y: 470,
            width: 480,
            height: 90,
            shapeType: "rect",
            fill: "#dc2626",
            borderRadius: 12,
            rotation: -1,
          },
          {
            id: "yt-pill-text",
            type: "text",
            name: "Texto 10 Minutos",
            x: 60,
            y: 480,
            width: 480,
            height: 70,
            text: "EM APENAS 10 MINUTOS!",
            fontSize: 38,
            fontWeight: "900",
            fontFamily: "Impact, sans-serif",
            color: "#ffffff",
            textAlign: "center",
            rotation: -1,
          },
          // Tech Badges
          {
            id: "yt-stack-badge",
            type: "text",
            name: "Tags da Stack",
            x: 60,
            y: 600,
            width: 600,
            height: 40,
            text: "NEXT.JS 16 · TAILWIND CSS · SHADCN/UI",
            fontSize: 20,
            fontWeight: "800",
            color: "#38bdf8",
          },
          // Right Mockup Graphic / Glow Card
          {
            id: "yt-preview-card",
            type: "shape",
            name: "Card Mockup Lateral",
            x: 850,
            y: 110,
            width: 370,
            height: 520,
            shapeType: "card",
            fill: "#181d29",
            borderRadius: 24,
            stroke: "#38bdf8",
            strokeWidth: 3,
            shadow: "0 25px 50px -12px rgba(56, 189, 248, 0.35)",
          },
          {
            id: "yt-preview-icon",
            type: "text",
            name: "Ícone Central Mockup",
            x: 850,
            y: 280,
            width: 370,
            height: 120,
            text: "▶ 100%",
            fontSize: 64,
            fontWeight: "900",
            color: "#22c55e",
            textAlign: "center",
          },
          {
            id: "yt-preview-sub",
            type: "text",
            name: "Legenda Mockup",
            x: 880,
            y: 400,
            width: 310,
            height: 80,
            text: "Código Pronto para Copiar e Colar",
            fontSize: 22,
            fontWeight: "700",
            color: "#94a3b8",
            textAlign: "center",
          },
        ],
      },
    ],
  },
  {
    id: "yt-shorts-viral-hook",
    name: "YouTube Shorts / Reels: Hack Secreto de Conversão",
    format: "yt-shorts",
    category: "viral",
    source: "canva-clone",
    thumbnailColor: "#10b981",
    description: "Formato vertical 9:16 (1080x1920) dinâmico com gancho forte, comparação Antes vs Depois e chamada de ação.",
    tags: ["shorts", "reels", "9:16", "tiktok", "viral"],
    pages: [
      {
        id: "shorts-page-1",
        title: "Shorts 1080x1920",
        bgType: "gradient",
        bgColor: "#09090b",
        bgGradient: "linear-gradient(180deg, #09090b 0%, #111827 50%, #064e3b 100%)",
        elements: [
          // Top Progress Bar
          {
            id: "sh-bar",
            type: "shape",
            name: "Barra de Progresso Superior",
            x: 40,
            y: 50,
            width: 1000,
            height: 10,
            shapeType: "pill",
            fill: "#10b981",
          },
          // Viral Hook Question
          {
            id: "sh-hook",
            type: "heading",
            name: "Gancho Viral Pergunta",
            x: 60,
            y: 180,
            width: 960,
            height: 240,
            text: "VOCÊ AINDA FAZ\nISSO NO SEU SITE? 😱",
            fontSize: 74,
            fontWeight: "900",
            fontFamily: "Impact, sans-serif",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
          },
          // Wrong Card
          {
            id: "sh-wrong-card",
            type: "shape",
            name: "Card Errado Vermelho",
            x: 80,
            y: 470,
            width: 920,
            height: 380,
            shapeType: "card",
            fill: "rgba(220, 38, 38, 0.15)",
            stroke: "#ef4444",
            strokeWidth: 2,
            borderRadius: 20,
          },
          {
            id: "sh-wrong-title",
            type: "text",
            name: "Título Errado",
            x: 120,
            y: 510,
            width: 840,
            height: 50,
            text: "❌ JEITO ANTIGO E LENTO",
            fontSize: 32,
            fontWeight: "900",
            color: "#ef4444",
          },
          {
            id: "sh-wrong-body",
            type: "text",
            name: "Texto Jeito Antigo",
            x: 120,
            y: 580,
            width: 840,
            height: 220,
            text: "Criar cada botão, modal e formulário do zero sem tokens e sem validação integrada.",
            fontSize: 30,
            fontWeight: "600",
            color: "#fecaca",
            lineHeight: 1.4,
          },
          // Correct Card
          {
            id: "sh-correct-card",
            type: "shape",
            name: "Card Certo Verde",
            x: 80,
            y: 910,
            width: 920,
            height: 420,
            shapeType: "card",
            fill: "rgba(16, 185, 129, 0.15)",
            stroke: "#10b981",
            strokeWidth: 2,
            borderRadius: 20,
          },
          {
            id: "sh-correct-title",
            type: "text",
            name: "Título Certo",
            x: 120,
            y: 950,
            width: 840,
            height: 50,
            text: "✅ JEITO DESIGN SYSTEM PRO",
            fontSize: 32,
            fontWeight: "900",
            color: "#10b981",
          },
          {
            id: "sh-correct-body",
            type: "text",
            name: "Texto Jeito Pro",
            x: 120,
            y: 1020,
            width: 840,
            height: 250,
            text: "Zod + AutoForm + Onlook Editor: gere o front completo sincronizado ao banco em 1 clique!",
            fontSize: 30,
            fontWeight: "600",
            color: "#a7f3d0",
            lineHeight: 1.4,
          },
          // Bottom CTA
          {
            id: "sh-bottom-cta",
            type: "button",
            name: "Botão CTA Shorts",
            x: 140,
            y: 1460,
            width: 800,
            height: 100,
            text: "Comente 'QUERO' para o link 🚀",
            fontSize: 34,
            fontWeight: "900",
            badgeBg: "#10b981",
            badgeColor: "#022c22",
            borderRadius: 24,
          },
        ],
      },
    ],
  },
  {
    id: "tiktok-viral-trends",
    name: "TikTok: Tendências de Frontend 2026",
    format: "tiktok",
    category: "viral",
    source: "canva-clone",
    thumbnailColor: "#00f2fe",
    description: "Visual neon ciberpunk com alto engajamento para TikTok (1080x1920) com estética de código moderno.",
    tags: ["tiktok", "viral", "neon", "code", "dev"],
    pages: [
      {
        id: "tt-page-1",
        title: "TikTok 1080x1920",
        bgType: "gradient",
        bgColor: "#05070e",
        bgGradient: "linear-gradient(180deg, #05070e 0%, #100b24 100%)",
        elements: [
          {
            id: "tt-badge",
            type: "badge",
            name: "Tag TikTok",
            x: 80,
            y: 160,
            width: 320,
            height: 50,
            badgeBg: "#00f2fe",
            badgeColor: "#000000",
            text: "⚡ TREND 2026",
            fontSize: 20,
            fontWeight: "900",
            borderRadius: 99,
          },
          {
            id: "tt-title",
            type: "heading",
            name: "Título TikTok",
            x: 80,
            y: 260,
            width: 920,
            height: 320,
            text: "PARE DE CRIAR\nBOTÕES FEIOS\nNO SEU PROJETO",
            fontSize: 78,
            fontWeight: "900",
            fontFamily: "Impact, sans-serif",
            color: "#ffffff",
            lineHeight: 1.05,
          },
          {
            id: "tt-code-box",
            type: "shape",
            name: "Caixa de Código",
            x: 80,
            y: 630,
            width: 920,
            height: 480,
            shapeType: "card",
            fill: "#0e111a",
            stroke: "rgba(0, 242, 254, 0.4)",
            strokeWidth: 2,
            borderRadius: 24,
          },
          {
            id: "tt-code-text",
            type: "text",
            name: "Linhas de Código",
            x: 130,
            y: 680,
            width: 820,
            height: 380,
            text: "// Design System Pro Snippet\nexport const buttonStyles = {\n  base: 'rounded-xl font-bold px-6 py-3',\n  glow: 'shadow-lg shadow-cyan-500/20',\n  hover: 'hover:scale-105 transition-all'\n};\n\n// Resultado: 100% responsivo!",
            fontSize: 26,
            fontWeight: "700",
            fontFamily: "Courier, monospace",
            color: "#38bdf8",
            lineHeight: 1.6,
          },
          {
            id: "tt-cta",
            type: "button",
            name: "Botão Salvar TikTok",
            x: 180,
            y: 1260,
            width: 720,
            height: 90,
            text: "Salva para não perder 📌",
            fontSize: 30,
            fontWeight: "900",
            badgeBg: "#ff007f",
            badgeColor: "#ffffff",
            borderRadius: 20,
          },
        ],
      },
    ],
  },
  {
    id: "penpot-community-tokens",
    name: "Penpot Community: Open Design Tokens Kit",
    format: "ig-post",
    category: "community-penpot",
    source: "penpot-community",
    thumbnailColor: "#17b890",
    description: "Template direto da comunidade Penpot (open-source) estruturado em pranchas SVG vetoriais com escala de tokens.",
    tags: ["penpot", "open-source", "svg", "tokens", "figma-alternative"],
    pages: [
      {
        id: "penpot-p1",
        title: "Penpot Board 1080x1080",
        bgType: "color",
        bgColor: "#0d1117",
        elements: [
          {
            id: "pp-badge",
            type: "badge",
            name: "Selo Penpot Open-Source",
            x: 80,
            y: 80,
            width: 320,
            height: 44,
            badgeBg: "#17b890",
            badgeColor: "#052018",
            text: "PENPOT COMMUNITY · SVG",
            fontSize: 16,
            fontWeight: "800",
            borderRadius: 8,
          },
          {
            id: "pp-title",
            type: "heading",
            name: "Título Penpot",
            x: 80,
            y: 160,
            width: 920,
            height: 160,
            text: "Design Tokens & Paletas Vivas",
            fontSize: 62,
            fontWeight: "800",
            color: "#f0f6fc",
          },
          {
            id: "pp-sub",
            type: "subheading",
            name: "Subtítulo Penpot",
            x: 80,
            y: 310,
            width: 860,
            height: 80,
            text: "Compatível com exportação SVG pura e renderização web sem dependência de nuvem proprietária.",
            fontSize: 26,
            fontWeight: "600",
            color: "#8b949e",
            lineHeight: 1.4,
          },
          // Palette swatch 1
          {
            id: "pp-swatch-1",
            type: "shape",
            name: "Swatch Verde Esmeralda",
            x: 80,
            y: 440,
            width: 200,
            height: 240,
            shapeType: "card",
            fill: "#17b890",
            borderRadius: 16,
          },
          // Palette swatch 2
          {
            id: "pp-swatch-2",
            type: "shape",
            name: "Swatch Azul Cobalto",
            x: 320,
            y: 440,
            width: 200,
            height: 240,
            shapeType: "card",
            fill: "#3b82f6",
            borderRadius: 16,
          },
          // Palette swatch 3
          {
            id: "pp-swatch-3",
            type: "shape",
            name: "Swatch Roxo Índigo",
            x: 560,
            y: 440,
            width: 200,
            height: 240,
            shapeType: "card",
            fill: "#8b5cf6",
            borderRadius: 16,
          },
          // Palette swatch 4
          {
            id: "pp-swatch-4",
            type: "shape",
            name: "Swatch Amarelo Ouro",
            x: 800,
            y: 440,
            width: 200,
            height: 240,
            shapeType: "card",
            fill: "#f59e0b",
            borderRadius: 16,
          },
          {
            id: "pp-footer",
            type: "button",
            name: "Download Penpot SVG",
            x: 80,
            y: 770,
            width: 480,
            height: 80,
            text: "Baixar Prancha Penpot (.svg)",
            fontSize: 22,
            fontWeight: "800",
            badgeBg: "#21262d",
            badgeColor: "#58a6ff",
            borderRadius: 12,
          },
        ],
      },
    ],
  },
  {
    id: "figma-community-luxury",
    name: "Figma Community: Joalheria & Alta Moda",
    format: "ig-post",
    category: "community-figma",
    source: "figma-community",
    thumbnailColor: "#d4af37",
    description: "Template clássico da comunidade Figma para marcas de luxo com tipografia serifada refinada e paleta ouro/noir.",
    tags: ["figma", "comunidade", "luxo", "joias", "editorial"],
    pages: [
      {
        id: "figma-p1",
        title: "Figma Luxury Frame 1080x1080",
        bgType: "gradient",
        bgColor: "#09090b",
        bgGradient: "radial-gradient(circle at center, #181614 0%, #09090b 100%)",
        elements: [
          {
            id: "fg-tag",
            type: "text",
            name: "Subtítulo Alta Joalheria",
            x: 80,
            y: 110,
            width: 920,
            height: 40,
            text: "MAISON & ATELIER · COLEÇÃO 2026",
            fontSize: 16,
            fontWeight: "700",
            fontFamily: "Georgia, serif",
            color: "#d4af37",
            textAlign: "center",
            letterSpacing: 4,
          },
          {
            id: "fg-title",
            type: "heading",
            name: "Título Poético Luxo",
            x: 80,
            y: 170,
            width: 920,
            height: 180,
            text: "O Tempo Moldado\nem Ouro e Diamante",
            fontSize: 66,
            fontWeight: "normal",
            fontFamily: "Georgia, 'Playfair Display', serif",
            color: "#f4f4f5",
            textAlign: "center",
            lineHeight: 1.15,
          },
          // Photo Placeholder or Gold Pendant graphic
          {
            id: "fg-photo",
            type: "shape",
            name: "Moldura Ouro Fotografia",
            x: 340,
            y: 380,
            width: 400,
            height: 400,
            shapeType: "circle",
            fill: "#1f1d19",
            stroke: "#d4af37",
            strokeWidth: 2,
            shadow: "0 20px 40px rgba(212, 175, 55, 0.2)",
          },
          {
            id: "fg-glyph",
            type: "text",
            name: "Símbolo Joia",
            x: 340,
            y: 500,
            width: 400,
            height: 100,
            text: "💎",
            fontSize: 72,
            color: "#d4af37",
            textAlign: "center",
          },
          {
            id: "fg-price",
            type: "text",
            name: "Preço Ouro",
            x: 80,
            y: 830,
            width: 920,
            height: 60,
            text: "R$ 4.890 · Edição Numerada 01/20",
            fontSize: 28,
            fontWeight: "700",
            fontFamily: "Georgia, serif",
            color: "#d4af37",
            textAlign: "center",
          },
          {
            id: "fg-btn",
            type: "button",
            name: "Agendar Concierge",
            x: 365,
            y: 910,
            width: 350,
            height: 65,
            text: "Agendar com Concierge",
            fontSize: 18,
            fontWeight: "700",
            badgeBg: "#d4af37",
            badgeColor: "#09090b",
            borderRadius: 4,
          },
        ],
      },
    ],
  },
];

/**
 * Format converter: Converts Penpot SVG or Penpot JSON into Canvas elements
 */
export function convertPenpotToCanvas(rawInput: string, name = "Penpot Import"): CanvasPage {
  const elements: CanvasElement[] = [];
  let bgColor = "#0e1117";
  let bgGradient: string | undefined;

  const isSvg = rawInput.trim().startsWith("<svg") || rawInput.includes("<svg");

  if (isSvg) {
    // Basic SVG parser for Penpot / Figma SVG exports
    const rectMatches = [...rawInput.matchAll(/<rect\s+([^>]+)>/g)];
    const textMatches = [...rawInput.matchAll(/<text\s+([^>]+)>([\s\S]*?)<\/text>/g)];
    const circleMatches = [...rawInput.matchAll(/<circle\s+([^>]+)>/g)];

    let elIndex = 1;

    // Detect background rect
    if (rectMatches.length > 0) {
      const firstRectAttrs = rectMatches[0][1];
      const fillMatch = firstRectAttrs.match(/fill="([^"]+)"/);
      if (fillMatch) {
        bgColor = fillMatch[1];
      }
    }

    // Process shapes
    for (const match of rectMatches.slice(1)) {
      const attrs = match[1];
      const x = parseFloat(attrs.match(/x="([^"]+)"/)?.[1] || "100");
      const y = parseFloat(attrs.match(/y="([^"]+)"/)?.[1] || "100");
      const width = parseFloat(attrs.match(/width="([^"]+)"/)?.[1] || "300");
      const height = parseFloat(attrs.match(/height="([^"]+)"/)?.[1] || "150");
      const fill = attrs.match(/fill="([^"]+)"/)?.[1] || "#21262d";
      const rx = parseFloat(attrs.match(/rx="([^"]+)"/)?.[1] || "8");

      elements.push({
        id: `pp-shape-${elIndex++}`,
        type: "shape",
        name: `Retângulo Penpot ${elIndex}`,
        x: Math.min(Math.max(x, 20), 800),
        y: Math.min(Math.max(y, 20), 800),
        width: Math.min(width, 1000),
        height: Math.min(height, 800),
        shapeType: "rect",
        fill,
        borderRadius: rx,
      });
    }

    // Process circles
    for (const match of circleMatches) {
      const attrs = match[1];
      const cx = parseFloat(attrs.match(/cx="([^"]+)"/)?.[1] || "200");
      const cy = parseFloat(attrs.match(/cy="([^"]+)"/)?.[1] || "200");
      const r = parseFloat(attrs.match(/r="([^"]+)"/)?.[1] || "80");
      const fill = attrs.match(/fill="([^"]+)"/)?.[1] || "#3b82f6";

      elements.push({
        id: `pp-circle-${elIndex++}`,
        type: "shape",
        name: `Círculo Penpot ${elIndex}`,
        x: Math.max(cx - r, 20),
        y: Math.max(cy - r, 20),
        width: r * 2,
        height: r * 2,
        shapeType: "circle",
        fill,
      });
    }

    // Process text
    for (const match of textMatches) {
      const attrs = match[1];
      const textContent = match[2].replace(/<[^>]+>/g, "").trim();
      const x = parseFloat(attrs.match(/x="([^"]+)"/)?.[1] || "80");
      const y = parseFloat(attrs.match(/y="([^"]+)"/)?.[1] || "200");
      const fontSize = parseFloat(attrs.match(/font-size="([^"]+)"/)?.[1] || "32");
      const fill = attrs.match(/fill="([^"]+)"/)?.[1] || "#ffffff";
      const fontFamily = attrs.match(/font-family="([^"]+)"/)?.[1] || "Inter, sans-serif";

      if (textContent) {
        elements.push({
          id: `pp-text-${elIndex++}`,
          type: fontSize > 40 ? "heading" : "text",
          name: `Texto Penpot: ${textContent.slice(0, 15)}...`,
          x: Math.min(Math.max(x, 40), 700),
          y: Math.min(Math.max(y, 40), 900),
          width: 800,
          height: fontSize * 1.5,
          text: textContent,
          fontSize: Math.min(Math.max(fontSize, 16), 84),
          fontWeight: fontSize > 36 ? "800" : "600",
          fontFamily,
          color: fill,
        });
      }
    }
  } else {
    // Try parsing as Penpot or Figma JSON
    try {
      const parsed = JSON.parse(rawInput);
      if (parsed.shapes || parsed.children) {
        const nodes = (parsed.shapes || parsed.children) as Record<string, any>[];
        nodes.forEach((node: Record<string, any>, idx: number) => {
          const type = String(node.type || "shape").toLowerCase();
          const bbox = node.absoluteBoundingBox || {};
          const x = Number(node.x ?? bbox.x ?? (idx * 60 + 80));
          const y = Number(node.y ?? bbox.y ?? (idx * 100 + 100));
          const width = Number(node.width ?? bbox.width ?? 300);
          const height = Number(node.height ?? bbox.height ?? 100);

          if (type.includes("text") || node.characters) {
            elements.push({
              id: `json-text-${idx}`,
              type: "heading",
              name: `Texto ${idx + 1}`,
              x: Math.min(Math.max(x, 40), 600),
              y: Math.min(Math.max(y, 40), 900),
              width: Math.min(width, 800),
              height,
              text: String(node.characters || node.text || "Texto Importado"),
              fontSize: 36,
              fontWeight: "700",
              color: "#ffffff",
            });
          } else {
            elements.push({
              id: `json-shape-${idx}`,
              type: "shape",
              name: `Forma ${idx + 1}`,
              x: Math.min(Math.max(x, 40), 600),
              y: Math.min(Math.max(y, 40), 900),
              width: Math.min(width, 600),
              height: Math.min(height, 400),
              shapeType: "rect",
              fill: "#2563eb",
              borderRadius: 12,
            });
          }
        });
      }
    } catch {
      // Fallback: create a single imported card
      elements.push({
        id: "fallback-card",
        type: "heading",
        name: "Título Importado",
        x: 80,
        y: 200,
        width: 800,
        height: 120,
        text: name,
        fontSize: 48,
        fontWeight: "800",
        color: "#ffffff",
      });
    }
  }

  // If no elements parsed, provide nice starter elements
  if (elements.length === 0) {
    elements.push({
      id: "init-text",
      type: "heading",
      name: "Título Principal",
      x: 80,
      y: 240,
      width: 920,
      height: 120,
      text: name || "Template Importado",
      fontSize: 56,
      fontWeight: "900",
      color: "#ffffff",
    });
  }

  return {
    id: `converted-${Date.now()}`,
    title: name,
    bgType: bgGradient ? "gradient" : "color",
    bgColor,
    bgGradient,
    elements,
  };
}

/**
 * Exports a CanvasPage to standards-compliant Penpot SVG format
 */
export function exportToPenpotSvg(page: CanvasPage, width = 1080, height = 1080): string {
  let svgInner = `  <!-- Penpot Board: ${page.title} -->\n`;
  svgInner += `  <rect width="${width}" height="${height}" fill="${page.bgColor}" />\n`;

  for (const el of page.elements) {
    const rot = el.rotation ? ` transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"` : "";

    if (el.type === "shape") {
      if (el.shapeType === "circle") {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const r = el.width / 2;
        svgInner += `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${el.fill || "#2563eb"}" opacity="${el.opacity ?? 1}"${rot} />\n`;
      } else {
        svgInner += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.borderRadius || 0}" fill="${el.fill || "#1e293b"}" opacity="${el.opacity ?? 1}"${rot} />\n`;
      }
    } else if (el.type === "heading" || el.type === "subheading" || el.type === "text") {
      const escapedText = (el.text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      svgInner += `  <text x="${el.x}" y="${el.y + (el.fontSize || 32)}" font-family="${el.fontFamily || "Inter, sans-serif"}" font-size="${el.fontSize || 32}" font-weight="${el.fontWeight || "bold"}" fill="${el.color || "#ffffff"}"${rot}>${escapedText}</text>\n`;
    } else if (el.type === "button" || el.type === "badge" || el.type === "price-tag") {
      svgInner += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.borderRadius || 12}" fill="${el.badgeBg || el.fill || "#4f46e5"}"${rot} />\n`;
      svgInner += `  <text x="${el.x + el.width / 2}" y="${el.y + el.height / 2 + 8}" text-anchor="middle" font-family="Inter, sans-serif" font-size="${el.fontSize || 20}" font-weight="bold" fill="${el.badgeColor || "#ffffff"}"${rot}>${(el.text || "").replace(/&/g, "&amp;")}</text>\n`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:penpot="https://penpot.app" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${svgInner}
</svg>`;
}

/**
 * Exports Canvas design tokens to W3C Community Design Tokens JSON (Figma compatible)
 */
export function exportToFigmaTokens(page: CanvasPage): string {
  const colors: Record<string, { $value: string; $type: "color" }> = {
    background: { $value: page.bgColor, $type: "color" },
  };

  page.elements.forEach((el, i) => {
    if (el.color) {
      colors[`text-${i + 1}`] = { $value: el.color, $type: "color" };
    }
    if (el.fill) {
      colors[`surface-${i + 1}`] = { $value: el.fill, $type: "color" };
    }
    if (el.badgeBg) {
      colors[`accent-${i + 1}`] = { $value: el.badgeBg, $type: "color" };
    }
  });

  return JSON.stringify(
    {
      $name: page.title,
      $version: "1.0.0",
      color: colors,
    },
    null,
    2
  );
}
