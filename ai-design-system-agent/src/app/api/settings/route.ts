import { getProviderStates, getStudioSettings, saveProvider, setStudioSetting } from "@/lib/settings";
import type { ProviderId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [providers, settings] = await Promise.all([getProviderStates(), getStudioSettings()]);
  return Response.json({ providers, settings });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      provider?: {
        id: ProviderId;
        apiKey?: string;
        baseUrl?: string;
        model?: string;
        imageModel?: string;
        enabled?: boolean;
        active?: boolean;
        freeOnly?: boolean;
      };
      settings?: Record<string, Record<string, unknown>>;
    };
    let providers = await getProviderStates();
    if (body.provider?.id) {
      providers = await saveProvider(body.provider);
    }
    if (body.settings) {
      for (const [key, value] of Object.entries(body.settings)) {
        await setStudioSetting(key, value);
      }
    }
    const settings = await getStudioSettings();
    return Response.json({ ok: true, providers, settings, savedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao salvar" }, { status: 500 });
  }
}
