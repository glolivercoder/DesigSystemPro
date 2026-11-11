import { retrieve } from "@/lib/rag";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const categoryId = url.searchParams.get("category") ?? undefined;
  const kinds = url.searchParams.get("kinds")?.split(",").filter(Boolean);
  if (!query.trim()) return Response.json({ hits: [] });
  const hits = await retrieve(query, { k: Number(url.searchParams.get("k") ?? 8), categoryId, kinds });
  return Response.json({ hits, query });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { query?: string; categoryId?: string; k?: number };
  if (!body.query) return Response.json({ hits: [] });
  const hits = await retrieve(body.query, { k: body.k ?? 10, categoryId: body.categoryId });
  return Response.json({ hits });
}
