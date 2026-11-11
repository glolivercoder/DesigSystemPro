/**
 * HyperFrames & FFmpeg 8.0 Video Motion Engine
 * Generates deterministic HTML, CSS, and GSAP 3.12 timeline projects
 * that render cleanly in the browser or export to MP4 and GIFs via HyperFrames CLI and FFmpeg.
 */

import { CANVAS_FORMATS, type CanvasFormatId, type CanvasPage, type CanvasElement } from "./canva-engine";

export type MotionStylePreset = "viral-hook" | "editorial" | "ecommerce" | "minimal";

export interface HyperframesConfig {
  title: string;
  formatId: CanvasFormatId;
  durationSeconds: number;
  fps: number;
  stylePreset: MotionStylePreset;
  elements: CanvasElement[];
  bgColor: string;
  bgGradient?: string;
}

export interface HyperframesProjectOutput {
  html: string;
  css: string;
  jsTimeline: string;
  fullHtmlDoc: string;
  ffmpegMp4Command: string;
  ffmpegGifCommand: string;
  width: number;
  height: number;
  durationSeconds: number;
}

/**
 * Builds a deterministic HyperFrames project from canvas elements
 */
export function buildHyperframesProject(config: HyperframesConfig): HyperframesProjectOutput {
  const format = CANVAS_FORMATS[config.formatId] || CANVAS_FORMATS["ig-post"];
  const width = format.width;
  const height = format.height;
  const duration = config.durationSeconds || 8;

  let elementsHtml = "";
  let gsapCode = `  const tl = gsap.timeline({ repeat: 0 });\n`;

  // Background fade-in
  elementsHtml += `  <div class="hf-bg" style="position: absolute; inset: 0; background: ${config.bgGradient || config.bgColor || "#ffffff"}; z-index: 1;"></div>\n`;
  gsapCode += `  tl.from(".hf-bg", { opacity: 0, duration: 0.6, ease: "power2.out" });\n`;

  // Sort elements by zIndex
  const sorted = [...config.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  sorted.forEach((el, index) => {
    const elClass = `hf-node-${index}`;
    const rot = el.rotation ? `transform: rotate(${el.rotation}deg);` : "";

    if (el.type === "shape") {
      const isCircle = el.shapeType === "circle";
      elementsHtml += `  <div class="${elClass}" style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; background: ${el.fill || "#2563eb"}; border-radius: ${isCircle ? "50%" : `${el.borderRadius || 0}px`}; z-index: ${el.zIndex || 2}; ${rot}"></div>\n`;

      if (config.stylePreset === "viral-hook") {
        gsapCode += `  tl.from(".${elClass}", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.2");\n`;
      } else {
        gsapCode += `  tl.from(".${elClass}", { scale: 0.85, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");\n`;
      }
    } else if (el.type === "heading" || el.type === "subheading" || el.type === "text") {
      const isHeading = el.type === "heading";
      const formattedText = (el.text || "").replace(/\n/g, "<br>");
      elementsHtml += `  <div class="${elClass}" style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; color: ${el.color || "#ffffff"}; font-family: ${el.fontFamily || "Inter, sans-serif"}; font-size: ${el.fontSize || 32}px; font-weight: ${el.fontWeight || "bold"}; text-align: ${el.textAlign || "left"}; line-height: 1.15; z-index: ${el.zIndex || 5}; ${rot}">${formattedText}</div>\n`;

      if (config.stylePreset === "viral-hook") {
        // High impact drop
        gsapCode += `  tl.from(".${elClass}", { y: ${isHeading ? -70 : 40}, scale: ${isHeading ? 1.3 : 1}, opacity: 0, duration: 0.65, ease: "elastic.out(1, 0.75)" }, "-=0.2");\n`;
      } else if (config.stylePreset === "editorial") {
        // Smooth editorial rise
        gsapCode += `  tl.from(".${elClass}", { y: 35, opacity: 0, duration: 0.85, ease: "power3.out" }, "-=0.4");\n`;
      } else {
        gsapCode += `  tl.from(".${elClass}", { y: 40, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.3");\n`;
      }
    } else if (el.type === "image") {
      elementsHtml += `  <div class="${elClass}" style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; background-image: url('${el.src}'); background-size: cover; background-position: center; border-radius: ${el.borderRadius || 16}px; z-index: ${el.zIndex || 4}; ${rot}"></div>\n`;
      gsapCode += `  tl.from(".${elClass}", { scale: 0.8, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.4");\n`;
      // Ken burns subtle continuous zoom
      gsapCode += `  gsap.to(".${elClass}", { scale: 1.06, duration: ${duration}, ease: "none" });\n`;
    } else if (el.type === "button" || el.type === "badge" || el.type === "price-tag") {
      const formattedText = (el.text || "").replace(/\n/g, "<br>");
      elementsHtml += `  <div class="${elClass}" style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; background: ${el.badgeBg || el.fill || "#e05315"}; color: ${el.badgeColor || "#ffffff"}; border-radius: ${el.borderRadius || 12}px; display: grid; place-items: center; font-weight: bold; font-size: ${el.fontSize || 22}px; text-align: center; z-index: ${el.zIndex || 6}; ${rot}">${formattedText}</div>\n`;
      gsapCode += `  tl.from(".${elClass}", { scale: 0, rotation: ${el.rotation ? el.rotation - 15 : -10}, opacity: 0, duration: 0.6, ease: "back.out(2)" }, "-=0.25");\n`;
      if (el.type === "price-tag" || el.type === "button") {
        // Continuous subtle pulse to drive action
        gsapCode += `  gsap.to(".${elClass}", { scale: 1.04, repeat: -1, yoyo: true, duration: 1.2, ease: "power1.inOut", delay: 1.5 });\n`;
      }
    } else if (el.type === "bullet-list") {
      const items = (el.listItems || []).map((it) => `<li style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span>${el.bulletIcon || "🐾"}</span><span>${it}</span></li>`).join("");
      elementsHtml += `  <ul class="${elClass}" style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; color: ${el.color || "#ffffff"}; font-size: ${el.fontSize || 22}px; font-weight: bold; list-style: none; padding: 0; margin: 0; z-index: ${el.zIndex || 5};">${items}</ul>\n`;
      gsapCode += `  tl.from(".${elClass} li", { x: -50, opacity: 0, stagger: 0.18, duration: 0.55, ease: "power2.out" }, "-=0.2");\n`;
    }
  });

  const css = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .hf-scaler {
      width: ${width}px;
      height: ${height}px;
      position: absolute;
      transform-origin: center center;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      will-change: transform;
    }
    .hf-viewport {
      width: ${width}px;
      height: ${height}px;
      position: relative;
      overflow: hidden;
      background: ${config.bgGradient || config.bgColor || "#ffffff"};
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
    }
  `;

  const fullHtmlDoc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HyperFrames Video · ${config.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap">
  <style>
${css}
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
</head>
<body>
  <div class="hf-scaler" id="hfScaler">
    <div class="hf-viewport">
${elementsHtml}
    </div>
  </div>

  <script>
    function updateScale() {
      const scaler = document.getElementById("hfScaler");
      if (!scaler) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (!vw || !vh) return;
      const scale = Math.min(vw / ${width}, vh / ${height});
      scaler.style.transform = "scale(" + scale + ")";
    }

    window.addEventListener("resize", updateScale);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", updateScale);
    } else {
      updateScale();
    }

    window.addEventListener("DOMContentLoaded", () => {
      updateScale();
${gsapCode}
    });
  </script>
</body>
</html>`;

  // Native FFmpeg 8.0 command generation
  const safeTitle = config.title.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const ffmpegMp4Command = `ffmpeg -y -framerate ${config.fps || 30} -i frames/frame_%04d.png -c:v libx264 -pix_fmt yuv420p -b:v 4000k ${safeTitle}.mp4`;
  const ffmpegGifCommand = `ffmpeg -y -i ${safeTitle}.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ${safeTitle}.gif`;

  return {
    html: elementsHtml,
    css,
    jsTimeline: gsapCode,
    fullHtmlDoc,
    ffmpegMp4Command,
    ffmpegGifCommand,
    width,
    height,
    durationSeconds: duration,
  };
}

