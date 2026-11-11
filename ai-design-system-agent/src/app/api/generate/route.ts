import { desc } from "drizzle-orm";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { generateAsset } from "@/lib/generate";
import type { GenerateRequest } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function GET() {
  const rows = await db.select().from(generations).orderBy(desc(generations.createdAt)).limit(12);
  return Response.json({ generations: rows });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    if (!body.kind) return Response.json({ error: "kind obrigatório" }, { status: 400 });
    const result = await generateAsset({
      kind: body.kind,
      prompt: body.prompt ?? "",
      designSystemId: body.designSystemId,
      categoryId: body.categoryId,
      providerId: body.providerId,
      model: body.model,
      aspect: body.aspect ?? "1:1",
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao gerar" }, { status: 500 });
  }
}
