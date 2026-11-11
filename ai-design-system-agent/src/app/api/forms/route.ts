import { formGoals, generateForm, listFormSpecs } from "@/lib/forms";
import type { CategoryId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await listFormSpecs(10);
  return Response.json({ forms: rows, goals: formGoals });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      analysisId?: string;
      categoryId?: CategoryId;
      designSystemId?: string;
      framework?: string;
      goal?: string;
      endpoint?: string;
    };
    const result = await generateForm(body);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao gerar formulário" }, { status: 500 });
  }
}
