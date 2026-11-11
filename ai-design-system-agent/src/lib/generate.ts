import { db } from "@/db";
import { generations } from "@/db/schema";
import { getCategory, getDesignSystem } from "./catalog";
import { chatComplete, extractJson } from "./llm";
import { resolveProvider } from "./settings";
import type { GenerateRequest, GenerationPayload, MotionScene, Palette, ProviderId } from "./types";

function wrapText(text: string, max: number, maxLines: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > max) {
      lines.push(current.trim());
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = `${current} ${word}`;
    }
  }
  if (lines.length < maxLines && current.trim()) lines.push(current.trim());
  return lines.slice(0, maxLines);
}

function escapeXml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Local keyframe generator: deterministic SVG poster, no API key needed. */
export function localPoster(prompt: string, palette: Palette, label: string, aspect: GenerateRequest["aspect"] = "1:1"): string {
  const [w, h] = aspect === "16:9" ? [1280, 720] : aspect === "9:16" ? [720, 1280] : aspect === "4:5" ? [1000, 1250] : [1080, 1080];
  const lines = wrapText(prompt, aspect === "16:9" ? 34 : 24, 3);
  const lineHeight = Math.round(h * 0.062);
  const startY = h / 2 + (lines.length - 1) * lineHeight * 0.4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(prompt)}">
  <defs>
    <radialGradient id="g1" cx="22%" cy="18%" r="70%"><stop offset="0" stop-color="${palette.accent}" stop-opacity="0.95"/><stop offset="1" stop-color="${palette.accent}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="82%" cy="78%" r="72%"><stop offset="0" stop-color="${palette.accent2}" stop-opacity="0.9"/><stop offset="1" stop-color="${palette.accent2}" stop-opacity="0"/></radialGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette.bg}"/><stop offset="1" stop-color="${palette.surface}"/></linearGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.08"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="over"/></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="${Math.round(w * 0.045)}"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g filter="url(#soft)"><circle cx="${w * 0.24}" cy="${h * 0.24}" r="${w * 0.3}" fill="url(#g1)"/><circle cx="${w * 0.82}" cy="${h * 0.76}" r="${w * 0.28}" fill="url(#g2)"/></g>
  <g opacity="0.22" stroke="${palette.ink}" stroke-width="1">${Array.from({ length: 9 })
    .map((_, i) => `<line x1="${(w / 9) * i}" y1="0" x2="${(w / 9) * i}" y2="${h}"/>`)
    .join("")}</g>
  <rect x="${w * 0.06}" y="${h * 0.06}" width="${w * 0.88}" height="${h * 0.88}" fill="none" stroke="${palette.ink}" stroke-opacity="0.25" rx="${w * 0.02}"/>
  <text x="${w * 0.09}" y="${h * 0.16}" fill="${palette.ink}" font-family="Inter, system-ui, sans-serif" font-size="${Math.round(w * 0.016)}" letter-spacing="${w * 0.003}" opacity="0.75">${escapeXml(label.toUpperCase())}</text>
  <text x="${w * 0.09}" y="${h * 0.2}" fill="${palette.ink}" font-family="Inter, system-ui, sans-serif" font-size="${Math.round(w * 0.014)}" opacity="0.45">KEYFRAME · GERADO LOCALMENTE · ${aspect ?? "1:1"}</text>
  ${lines
    .map(
      (line, index) =>
        `<text x="${w * 0.09}" y="${startY + index * lineHeight}" fill="${palette.ink}" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(w * 0.05)}" font-weight="500" letter-spacing="${-w * 0.0012}">${escapeXml(line)}</text>`,
    )
    .join("")}
  <g transform="translate(${w * 0.09}, ${h * 0.82})">
    <rect width="${w * 0.24}" height="${h * 0.06}" rx="${h * 0.03}" fill="${palette.ink}"/>
    <text x="${w * 0.12}" y="${h * 0.038}" text-anchor="middle" fill="${palette.bg}" font-family="Inter, system-ui, sans-serif" font-size="${Math.round(w * 0.016)}" letter-spacing="${w * 0.001}">EXPLORAR</text>
  </g>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.5"/>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function buildScenes(prompt: string, dsId: string): MotionScene[] {
  const ds = getDesignSystem(dsId);
  const category = getCategory(ds.categoryId);
  const words = prompt.replace(/\s+/g, " ").trim();
  const headline = wrapText(words || ds.preview.hero, 26, 1)[0] ?? ds.preview.hero;
  return [
    {
      id: "scene-1",
      label: "Abertura",
      title: headline.toUpperCase(),
      subtitle: ds.preview.badge,
      duration: 2.2,
      transition: "wipe",
      accent: ds.palette.accent,
      bg: ds.palette.bg,
    },
    {
      id: "scene-2",
      label: "Prova",
      title: ds.tagline,
      subtitle: `${category.short} · ${ds.name}`,
      duration: 2.6,
      transition: "scale",
      accent: ds.palette.accent2,
      bg: ds.palette.surface,
    },
    {
      id: "scene-3",
      label: "Detalhe",
      title: ds.skills[0]?.name ?? "Curadoria de detalhe",
      subtitle: ds.skills[0]?.summary.slice(0, 90) ?? ds.description,
      duration: 2.4,
      transition: "slide",
      accent: ds.palette.ink,
      bg: ds.palette.bg,
    },
    {
      id: "scene-4",
      label: "Assinatura",
      title: ds.preview.cta,
      subtitle: ds.name,
      duration: 2.0,
      transition: "fade",
      accent: ds.palette.accent,
      bg: ds.palette.ink,
    },
  ];
}

export function remotionCode(scenes: MotionScene[], fps: number, title: string): string {
  return `// Gerado pelo Design Studio — Remotion 4.x
import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { CSSProperties } from "react";

const SCENES = ${JSON.stringify(scenes, null, 2)} as const;
const FPS = ${fps};

type Scene = (typeof SCENES)[number];

const SceneLayer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 24 });
  const exit = interpolate(frame, [scene.duration * fps - 18, scene.duration * fps], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(enter, exit);
  const translate = interpolate(enter, [0, 1], [scene.transition === "slide" ? 90 : 0, 0]);
  const scale = scene.transition === "scale" ? interpolate(enter, [0, 1], [1.12, 1]) : 1;
  const fill: CSSProperties = {
    background: scene.bg,
    color: scene.accent,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "8% 9%",
    gap: 24,
  };
  return (
    <AbsoluteFill style={{ ...fill, opacity, transform: \`translateY(\${translate}px) scale(\${scale})\` }}>
      <span style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.28em", fontSize: 18, opacity: 0.7 }}>{scene.label.toUpperCase()}</span>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 92, lineHeight: 0.98, margin: 0, maxWidth: "84%" }}>{scene.title}</h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 26, opacity: 0.72, maxWidth: "66%" }}>{scene.subtitle}</p>
      <div style={{ position: "absolute", right: "8%", bottom: "10%", width: 160, height: 160, borderRadius: 999, border: \`1px solid \${scene.accent}\`, opacity: 0.5 }} />
    </AbsoluteFill>
  );
};

export const ${title}: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SCENES.map((scene, index) => (
      <Sequence key={scene.id} from={SCENES.slice(0, index).reduce((acc, s) => acc + Math.round(s.duration * FPS), 0)} durationInFrames={Math.round(scene.duration * FPS)}>
        <SceneLayer scene={scene} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export default ${title};`;
}

async function generateImage(prompt: string, providerId: ProviderId | undefined, palette: Palette, dsName: string, aspect: GenerateRequest["aspect"]) {
  const provider = await resolveProvider(providerId);
  if (!provider) return null;
  const started = Date.now();
  try {
    if (provider.id === "gemini") {
      const base = provider.baseUrl.includes("generativelanguage")
        ? provider.baseUrl.replace(/\/v1beta\/openai\/?$/, "")
        : "https://generativelanguage.googleapis.com";
      const response = await fetch(
        `${base}/v1beta/models/${encodeURIComponent(provider.imageModel || "gemini-2.5-flash-image")}:generateContent?key=${encodeURIComponent(provider.apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${prompt}. Paleta: ${palette.bg}, ${palette.accent}, ${palette.accent2}. Estilo ${dsName}.` }] }],
            generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
          }),
          signal: AbortSignal.timeout(60000),
        },
      );
      if (!response.ok) return null;
      const json = (await response.json()) as {
        candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
      };
      const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (!part?.inlineData?.data) return null;
      return {
        imageUrl: `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}`,
        imageMime: part.inlineData.mimeType ?? "image/png",
        provider: provider.label,
        model: provider.imageModel,
        latencyMs: Date.now() - started,
      };
    }
    if (provider.id === "openai") {
      const response = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/images/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${provider.apiKey}` },
        body: JSON.stringify({ model: provider.imageModel || "gpt-image-1", prompt, size: aspect === "16:9" ? "1536x1024" : aspect === "9:16" ? "1024x1536" : "1024x1024" }),
        signal: AbortSignal.timeout(90000),
      });
      if (!response.ok) return null;
      const json = (await response.json()) as { data?: { b64_json?: string; url?: string }[] };
      const image = json.data?.[0];
      if (image?.b64_json) {
        return { imageUrl: `data:image/png;base64,${image.b64_json}`, imageMime: "image/png", provider: provider.label, model: provider.imageModel, latencyMs: Date.now() - started };
      }
      if (image?.url) {
        return { imageUrl: image.url, imageMime: "image/png", provider: provider.label, model: provider.imageModel, latencyMs: Date.now() - started };
      }
      return null;
    }
    const response = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${provider.apiKey}` },
      body: JSON.stringify({
        model: provider.imageModel || "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: `Generate one image: ${prompt}` }],
        modalities: ["image", "text"],
      }),
      signal: AbortSignal.timeout(90000),
    });
    if (!response.ok) return null;
    const json = (await response.json()) as {
      choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
    };
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) return null;
    return { imageUrl: url, imageMime: "image/png", provider: provider.label, model: provider.imageModel, latencyMs: Date.now() - started };
  } catch {
    return null;
  }
}

export async function generateAsset(req: GenerateRequest): Promise<{
  payload: GenerationPayload;
  provider: string;
  model: string;
  offline: boolean;
  id?: string;
}> {
  const ds = getDesignSystem(req.designSystemId ?? "");
  const category = getCategory(req.categoryId ?? ds.categoryId);
  const prompt = req.prompt?.trim() || `${category.short}: ${ds.tagline}`;
  const fps = 30;
  let payload: GenerationPayload;
  let provider = "Local renderer";
  let model = "studio-svg + remotion-template";
  let offline = true;

  if (req.kind === "image") {
    const image = await generateImage(prompt, req.providerId, ds.palette, ds.name, req.aspect);
    payload = {
      kind: "image",
      title: `Keyframe · ${category.short}`,
      summary: `Composição de ${req.aspect ?? "1:1"} com a paleta de ${ds.name}.`,
      imageUrl: image?.imageUrl ?? localPoster(prompt, ds.palette, ds.name, req.aspect),
      imageMime: image?.imageMime ?? "image/svg+xml",
      prompt,
      offline: !image,
    };
    if (image) {
      provider = image.provider;
      model = image.model;
      offline = false;
    }
  } else if (req.kind === "copy") {
    const llm = await chatComplete({
      system:
        "Você é copywriter de e-commerce de luxo. Responda JSON: {\"headline\":\"\",\"sub\":\"\",\"cta\":\"\",\"bullets\":[\"\"]} em português, tom da marca, sem clichê.",
      user: `Categoria: ${category.name}. Design system: ${ds.name} (${ds.tagline}). Briefing: ${prompt}`,
      providerId: req.providerId,
      temperature: 0.7,
      maxTokens: 500,
    });
    const parsed = extractJson<{ headline?: string; sub?: string; cta?: string; bullets?: string[] }>(llm.text);
    payload = {
      kind: "copy",
      title: "Copy de campanha",
      summary: `Hero e bullets alinhados ao tom de ${ds.name}.`,
      copy: {
        headline: parsed?.headline ?? ds.preview.hero,
        sub: parsed?.sub ?? ds.description,
        cta: parsed?.cta ?? ds.preview.cta,
        bullets: parsed?.bullets ?? ds.skills.slice(0, 3).map((skill) => skill.name),
      },
      prompt,
      offline: llm.offline,
    };
    if (!llm.offline) {
      provider = llm.provider;
      model = llm.model;
      offline = false;
    }
  } else {
    const scenes = buildScenes(prompt, ds.id);
    const total = scenes.reduce((acc, scene) => acc + scene.duration, 0);
    payload = {
      kind: req.kind,
      title: req.kind === "animation" ? "Composição Remotion" : req.kind === "loading" ? "Tela de carregamento" : "Storyboard de vídeo",
      summary:
        req.kind === "video"
          ? `${scenes.length} planos · ${total.toFixed(1)}s · exportável para Remotion CLI (MP4).`
          : `Composição de ${total.toFixed(1)}s a ${fps}fps, preview no Remotion Player e código pronto para render.`,
      scenes,
      fps,
      remotionCode: remotionCode(scenes, fps, "StudioComposition"),
      storyboard: scenes.map((scene, index) => ({
        shot: `Plano ${index + 1} · ${scene.label}`,
        action: `${scene.transition} · ${scene.title}`,
        seconds: scene.duration,
      })),
      prompt,
      offline: true,
    };
  }

  let id: string | undefined;
  try {
    const [row] = await db
      .insert(generations)
      .values({
        kind: req.kind,
        prompt,
        provider,
        model,
        status: "ready",
        designSystemId: ds.id,
        payload,
      })
      .returning({ id: generations.id });
    id = row?.id;
  } catch {
    // history persistence is best-effort
  }

  return { payload, provider, model, offline, id };
}
