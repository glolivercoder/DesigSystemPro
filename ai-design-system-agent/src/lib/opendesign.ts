/**
 * OpenDesign & Figma Community Template Importer
 * Compatible with Figma Design Tokens (W3C community standard),
 * open-source editable design systems, and batch JSON/SVG template imports.
 */

export interface OpenDesignTemplate {
  id: string;
  name: string;
  source: "figma-community" | "opendesign" | "tailwind-open";
  format: "post" | "story" | "banner" | "showcase";
  dimensions: { width: number; height: number };
  tokens: {
    colors: Record<string, string>;
    typography: Record<string, string>;
    radii: Record<string, string>;
  };
  html: string;
  tags: string[];
}

export const PRELOADED_COMMUNITY_TEMPLATES: OpenDesignTemplate[] = [
  {
    id: "figma-clean-minimal",
    name: "Minimalist Hero Card (Figma Community)",
    source: "figma-community",
    format: "post",
    dimensions: { width: 1080, height: 1080 },
    tokens: {
      colors: { primary: "#d7f76b", dark: "#0f1115", surface: "#181b20", text: "#f4f5f7" },
      typography: { title: "Inter", body: "Inter" },
      radii: { card: "24px", button: "99px" },
    },
    tags: ["editorial", "lançamento", "clean"],
    html: `<div style="width: 100%; height: 100%; background: #0f1115; color: #f4f5f7; display: flex; flex-direction: column; justify-content: space-between; padding: 60px; box-sizing: border-box; font-family: 'Inter', sans-serif;">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #d7f76b; font-weight: 700;">EDIÇÃO LIMITADA</span>
    <span style="font-size: 14px; opacity: 0.6;">01 / 50</span>
  </div>
  <div style="text-align: center; margin: 40px 0;">
    <div style="width: 220px; height: 220px; margin: 0 auto 30px; background: radial-gradient(circle, #252a33 0%, #121418 100%); border-radius: 50%; display: grid; place-items: center; border: 1px solid rgba(215,247,107,0.3); box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
      <span style="font-size: 48px;">✦</span>
    </div>
    <h2 style="font-size: 46px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 14px; line-height: 1.1;">Precisão que Transforma</h2>
    <p style="font-size: 18px; opacity: 0.75; max-width: 500px; margin: 0 auto;">Criado para quem valoriza a excelência no design e na função.</p>
  </div>
  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px;">
    <span style="font-size: 26px; font-weight: 700; color: #d7f76b;">R$ 890</span>
    <span style="background: #d7f76b; color: #0f1115; font-weight: 700; padding: 14px 28px; border-radius: 99px; font-size: 15px;">Disponível Agora</span>
  </div>
</div>`,
  },
  {
    id: "figma-story-launch",
    name: "Story Full-Screen Promo (Figma Community)",
    source: "figma-community",
    format: "story",
    dimensions: { width: 1080, height: 1920 },
    tokens: {
      colors: { primary: "#8ab4ff", dark: "#08090b", surface: "#12151c", text: "#ffffff" },
      typography: { title: "Instrument Serif", body: "Inter" },
      radii: { card: "20px", button: "12px" },
    },
    tags: ["stories", "reels", "full-bleed"],
    html: `<div style="width: 100%; height: 100%; background: linear-gradient(180deg, #10141d 0%, #08090b 100%); color: #ffffff; display: flex; flex-direction: column; justify-content: space-between; padding: 80px 48px; box-sizing: border-box; font-family: 'Inter', sans-serif;">
  <div style="text-align: center;">
    <span style="background: rgba(138,180,255,0.15); color: #8ab4ff; padding: 8px 16px; border-radius: 99px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em;">LANÇAMENTO EXCLUSIVO</span>
  </div>
  <div style="text-align: center;">
    <h1 style="font-family: 'Instrument Serif', Georgia, serif; font-size: 58px; font-weight: 400; line-height: 1.05; margin: 0 0 20px;">A Beleza do Essencial</h1>
    <p style="font-size: 18px; opacity: 0.8; line-height: 1.5; max-width: 440px; margin: 0 auto 30px;">Cada peça conta uma história de atenção aos mínimos detalhes e materiais selecionados.</p>
    <div style="height: 380px; background: #12151c; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); display: grid; place-items: center; color: #626a75; font-size: 15px;">
      [ Foto do Produto em Alta Resolução ]
    </div>
  </div>
  <div style="text-align: center;">
    <div style="background: #8ab4ff; color: #08090b; padding: 18px; border-radius: 14px; font-size: 18px; font-weight: 800; cursor: pointer;">
      Arraste para Cima / Comprar
    </div>
  </div>
</div>`,
  },
  {
    id: "figma-fb-ad-horizontal",
    name: "Facebook Feed / Sponsored Ad (Figma Community)",
    source: "opendesign",
    format: "banner",
    dimensions: { width: 1200, height: 628 },
    tokens: {
      colors: { primary: "#d7f76b", dark: "#090a0d", surface: "#15181e", text: "#ffffff" },
      typography: { title: "Inter", body: "Inter" },
      radii: { card: "14px", button: "8px" },
    },
    tags: ["ad", "facebook", "conversão"],
    html: `<div style="width: 100%; height: 100%; background: #090a0d; color: #ffffff; display: flex; align-items: center; justify-content: space-between; padding: 50px 60px; box-sizing: border-box; font-family: 'Inter', sans-serif;">
  <div style="max-width: 580px;">
    <span style="color: #d7f76b; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">Oportunidade da Semana</span>
    <h2 style="font-size: 40px; font-weight: 800; margin: 12px 0 16px; line-height: 1.15; letter-spacing: -0.02em;">Potencialize sua Marca com o Design Certo</h2>
    <p style="font-size: 16px; opacity: 0.75; margin: 0 0 24px; line-height: 1.4;">Mais de 400 componentes prontos, validação Zod e integrações em tempo real.</p>
    <div style="display: flex; gap: 14px; align-items: center;">
      <span style="background: #d7f76b; color: #090a0d; font-weight: 700; padding: 12px 24px; border-radius: 8px; font-size: 14px;">Experimente Grátis</span>
      <span style="font-size: 13px; opacity: 0.6;">Sem necessidade de cartão</span>
    </div>
  </div>
  <div style="width: 400px; height: 320px; background: #15181e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; display: grid; place-items: center; color: #8e949e;">
    <div style="text-align: center;">
      <div style="font-size: 36px; margin-bottom: 8px;">◈</div>
      <div style="font-size: 13px; font-weight: 600;">Interface Design System</div>
      <div style="font-size: 11px; opacity: 0.6; margin-top: 4px;">Figma + Next.js Ready</div>
    </div>
  </div>
</div>`,
  },
];

/**
 * Batch imports templates from a list of JSON / SVG / Figma tokens string inputs
 */
export function batchImportTemplates(payloads: { filename: string; content: string }[]): {
  importedCount: number;
  templates: OpenDesignTemplate[];
  errors: string[];
} {
  const templates: OpenDesignTemplate[] = [];
  const errors: string[] = [];

  for (const item of payloads) {
    try {
      if (item.filename.endsWith(".json")) {
        const parsed = JSON.parse(item.content);
        if (Array.isArray(parsed)) {
          // Batch array of templates
          for (const t of parsed) {
            templates.push(normalizeTemplate(t, item.filename));
          }
        } else {
          templates.push(normalizeTemplate(parsed, item.filename));
        }
      } else if (item.filename.endsWith(".svg")) {
        // SVG Vector Template
        templates.push({
          id: `svg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: item.filename.replace(/\.svg$/i, ""),
          source: "opendesign",
          format: "post",
          dimensions: { width: 1080, height: 1080 },
          tokens: {
            colors: { primary: "#d7f76b", dark: "#0f1115", surface: "#181b20", text: "#f4f5f7" },
            typography: { title: "Inter", body: "Inter" },
            radii: { card: "16px", button: "8px" },
          },
          html: `<div style="width: 100%; height: 100%; display: grid; place-items: center; background: #0f1115; padding: 40px;">${item.content}</div>`,
          tags: ["vector", "svg", "figma-export"],
        });
      } else {
        errors.push(`Arquivo '${item.filename}' com formato não reconhecido (use .json ou .svg).`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Erro ao importar '${item.filename}': ${msg}`);
    }
  }

  return {
    importedCount: templates.length,
    templates,
    errors,
  };
}

function normalizeTemplate(raw: Record<string, unknown>, origin: string): OpenDesignTemplate {
  return {
    id: (raw.id as string) || `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: (raw.name as string) || origin.replace(/\.[^/.]+$/, ""),
    source: "figma-community",
    format: (raw.format as OpenDesignTemplate["format"]) || "post",
    dimensions: (raw.dimensions as OpenDesignTemplate["dimensions"]) || { width: 1080, height: 1080 },
    tokens: (raw.tokens as OpenDesignTemplate["tokens"]) || {
      colors: { primary: "#d7f76b", dark: "#090a0d", surface: "#15181e", text: "#ffffff" },
      typography: { title: "Inter", body: "Inter" },
      radii: { card: "16px", button: "8px" },
    },
    html: (raw.html as string) || `<div style="padding: 40px; background: #0f1115; color: #fff;">${raw.name || "Template Importado"}</div>`,
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : ["importado", "figma"],
  };
}

