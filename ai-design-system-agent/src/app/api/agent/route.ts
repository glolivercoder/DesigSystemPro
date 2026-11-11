import { runAgent } from "@/lib/agent";
import type { CategoryId, ProviderId } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      sessionId?: string;
      categoryId?: CategoryId;
      designSystemId?: string;
      providerId?: ProviderId;
      history?: { role: "user" | "assistant"; content: string }[];
    };
    if (!body.message || body.message.trim().length < 2) {
      return Response.json({ error: "Mensagem vazia" }, { status: 400 });
    }
    const response = await runAgent({
      message: body.message,
      sessionId: body.sessionId,
      categoryId: body.categoryId,
      designSystemId: body.designSystemId,
      providerId: body.providerId,
      history: body.history,
    });
    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha no agente" }, { status: 500 });
  }
}
