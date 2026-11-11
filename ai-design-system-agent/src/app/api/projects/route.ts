import { desc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import type { CategoryId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(12);
  return Response.json({ projects: rows });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      categoryId?: CategoryId;
      designSystemId?: string;
      html?: string;
      notes?: string;
    };
    if (!body.html) return Response.json({ error: "HTML obrigatório" }, { status: 400 });
    const [row] = await db
      .insert(projects)
      .values({
        name: body.name ?? "Projeto sem título",
        categoryId: body.categoryId ?? "ecommerce",
        designSystemId: body.designSystemId ?? "ec-shadcn-commerce",
        html: body.html,
        notes: body.notes ?? "",
      })
      .returning({ id: projects.id, updatedAt: projects.updatedAt });
    return Response.json({ ok: true, project: row });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao salvar" }, { status: 500 });
  }
}
