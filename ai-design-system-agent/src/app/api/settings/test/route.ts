import { testProvider } from "@/lib/settings";
import type { ProviderId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: ProviderId };
  if (!body.id) return Response.json({ ok: false, message: "Informe o provedor" }, { status: 400 });
  const result = await testProvider(body.id);
  return Response.json(result, { status: result.ok ? 200 : 200 });
}
