import { listAnalyses, runAnalysis } from "@/lib/analyze";
import type { CategoryId } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function GET() {
  const rows = await listAnalyses(8);
  return Response.json({ analyses: rows });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      repoUrl?: string;
      code?: string;
      pathHint?: string;
      categoryId?: CategoryId;
    };
    const analysis = await runAnalysis({
      repoUrl: body.repoUrl,
      code: body.code,
      pathHint: body.pathHint,
      categoryId: body.categoryId,
    });
    return Response.json({ analysis });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha na análise" }, { status: 500 });
  }
}
