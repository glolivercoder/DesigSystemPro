import { NextResponse } from "next/server";
import {
  BRAZILIAN_COMMERCIAL_DATES,
  PAYDAY_SPIKE_TRIGGERS,
  INITIAL_CLIENTS_CRM,
  INITIAL_SCHEDULED_CAMPAIGNS,
  generateGoogleCalendarIcs,
  getPlatformPeakTime,
  type ScheduledPostItem,
  type SocialPlatform,
} from "@/lib/smart-scheduler";

export async function GET() {
  return NextResponse.json({
    ok: true,
    commercialDates: BRAZILIAN_COMMERCIAL_DATES,
    paydaySpikes: PAYDAY_SPIKE_TRIGGERS,
    clientsCRM: INITIAL_CLIENTS_CRM,
    scheduledCampaigns: INITIAL_SCHEDULED_CAMPAIGNS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action || "schedule_post";

    if (action === "export_ics") {
      const campaigns = body.campaigns || INITIAL_SCHEDULED_CAMPAIGNS;
      const icsData = generateGoogleCalendarIcs(campaigns);
      return new NextResponse(icsData, {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": "attachment; filename=campanhas_agendadas.ics",
        },
      });
    }

    if (action === "calculate_peak") {
      const platform = (body.platform as SocialPlatform) || "instagram";
      const peak = getPlatformPeakTime(platform);
      return NextResponse.json({ ok: true, peak });
    }

    if (action === "postiz_dispatch") {
      const { campaignId, platform } = body;
      // Simulating Postiz API Job creation
      return NextResponse.json({
        ok: true,
        postizJobId: `postiz-job-${Date.now()}`,
        status: "dispatched",
        platform: platform || "all",
        message: `Campanha '${campaignId}' enviada com sucesso para a fila de publicação do Postiz!`,
      });
    }

    if (action === "schedule_post") {
      const newPost: ScheduledPostItem = {
        id: `post-${Date.now()}`,
        title: body.title || "Nova Campanha",
        category: body.category || "custom",
        platform: body.platform || "instagram",
        mediaType: body.mediaType || "image",
        scheduledDate: body.scheduledDate || "12/11/2026",
        scheduledTime: body.scheduledTime || "12:00",
        peakScore: body.peakScore || 95,
        caption: body.caption || "",
        discountCode: body.discountCode,
        status: "scheduled",
        googleCalendarSynced: true,
      };

      return NextResponse.json({
        ok: true,
        post: newPost,
        message: "Publicação agendada no horário de pico com sucesso!",
      });
    }

    return NextResponse.json({ ok: false, error: "Ação não reconhecida" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
