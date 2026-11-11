import { NextResponse } from "next/server";
import { buildHyperframesProject, type HyperframesConfig } from "@/lib/hyperframes";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HyperframesConfig;
    if (!body || !body.elements) {
      return NextResponse.json({ ok: false, error: "Parâmetros inválidos para composição HyperFrames" }, { status: 400 });
    }

    const project = buildHyperframesProject({
      title: body.title || "Composição HyperFrames",
      formatId: body.formatId || "ig-post",
      durationSeconds: body.durationSeconds || 8,
      fps: body.fps || 30,
      stylePreset: body.stylePreset || "viral-hook",
      elements: body.elements,
      bgColor: body.bgColor || "#ffffff",
      bgGradient: body.bgGradient,
    });

    return NextResponse.json({
      ok: true,
      project,
      ffmpegVersion: "8.0",
      hyperframesVersion: "0.9.34",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    engine: "HyperFrames (heygen-com/hyperframes) + FFmpeg 8.0",
    status: "ready",
    supportedFormats: ["mp4", "webm", "gif", "html"],
    presets: ["viral-hook", "editorial", "ecommerce", "minimal"],
  });
}
