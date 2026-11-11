/**
 * Smart Campaign Scheduler & Commercial Calendar Engine
 * Manages Commercial Dates, Payday Liquidity Spikes (Days 3, 4, 5 & 20),
 * Client Birthdays (CRM), and Store Relationship Anniversaries (Loyalty).
 * Integrates peak-time optimization, Google Calendar (.ics) export, and Postiz API dispatch.
 */

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "youtube_shorts" | "all";

export type CampaignCategory =
  | "payday_spike"
  | "client_birthday"
  | "store_anniversary"
  | "commercial_holiday"
  | "custom";

export interface ClientBirthday {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string; // DD/MM
  relationshipType: "client" | "vip" | "partner";
  anniversaryWithStore: string; // YYYY-MM-DD
  yearsWithStore: number;
  customDiscountCode: string;
  suggestedGift: string;
}

export interface CommercialHoliday {
  id: string;
  title: string;
  dateStr: string;
  month: number;
  day: number;
  advanceNoticeDays: number;
  theme: string;
  suggestedOffer: string;
  targetAudience: string;
  badgeColor: string;
}

export interface PaydaySpikeTrigger {
  id: string;
  dayOfMonth: number;
  name: string;
  targetGroup: string;
  strategy: string;
  recommendedOffer: string;
  recommendedMedia: "video" | "gif" | "image";
  urgencyLevel: "alta" | "máxima" | "aquecimento";
}

export interface ScheduledPostItem {
  id: string;
  title: string;
  category: CampaignCategory;
  platform: SocialPlatform;
  mediaType: "image" | "video" | "gif";
  scheduledDate: string;
  scheduledTime: string;
  peakScore: number;
  caption: string;
  discountCode?: string;
  status: "scheduled" | "published" | "draft";
  googleCalendarSynced: boolean;
}

// 1. Preloaded Brazilian Commercial Dates
export const BRAZILIAN_COMMERCIAL_DATES: CommercialHoliday[] = [
  {
    id: "dia-das-maes",
    title: "Dia das Mães",
    dateStr: "2º Domingo de Maio",
    month: 5,
    day: 10,
    advanceNoticeDays: 14,
    theme: "Amor que transcende · Presentes inesquecíveis",
    suggestedOffer: "Frete Grátis + Caixa de Presente de Luxo",
    targetAudience: "Filhos e familiares buscando presentes afetivos",
    badgeColor: "#ec4899",
  },
  {
    id: "dia-dos-namorados",
    title: "Dia dos Namorados",
    dateStr: "12 de Junho",
    month: 6,
    day: 12,
    advanceNoticeDays: 10,
    theme: "Celebre o Amor · Peças e Combos para Casal",
    suggestedOffer: "Compre 1 e Ganhe 20% na 2ª Peça + Embalagem Especial",
    targetAudience: "Casais apaixonados e compras de última hora",
    badgeColor: "#e11d48",
  },
  {
    id: "dia-dos-avos",
    title: "Dia dos Avós",
    dateStr: "26 de Julho",
    month: 7,
    day: 26,
    advanceNoticeDays: 7,
    theme: "Sabedoria e Carinho · Conforto para quem sempre cuidou de você",
    suggestedOffer: "15% OFF em toda linha conforto e artesanato",
    targetAudience: "Netos presenteando avós",
    badgeColor: "#8b5cf6",
  },
  {
    id: "dia-dos-pais",
    title: "Dia dos Pais",
    dateStr: "2º Domingo de Agosto",
    month: 8,
    day: 9,
    advanceNoticeDays: 12,
    theme: "Herança e Companheirismo · Estilo que atravessa gerações",
    suggestedOffer: "Combo Relógio/Carteira + Cartão personalizado gratuito",
    targetAudience: "Filhos e esposas",
    badgeColor: "#2563eb",
  },
  {
    id: "semana-do-consumidor",
    title: "Semana do Consumidor",
    dateStr: "15 de Março",
    month: 3,
    day: 15,
    advanceNoticeDays: 5,
    theme: "Semana do Cliente · As maiores ofertas do primeiro semestre",
    suggestedOffer: "Até 50% OFF em itens selecionados",
    targetAudience: "Compradores atentos a descontos",
    badgeColor: "#059669",
  },
  {
    id: "dia-do-cliente",
    title: "Dia do Cliente",
    dateStr: "15 de Setembro",
    month: 9,
    day: 15,
    advanceNoticeDays: 3,
    theme: "Obrigado por Fazer Parte da Nossa História",
    suggestedOffer: "Cupom surpresa de R$ 50 para compras acima de R$ 200",
    targetAudience: "Base de clientes fidelizados",
    badgeColor: "#d97706",
  },
  {
    id: "black-friday",
    title: "Black Friday Brasil",
    dateStr: "Última Sexta de Novembro",
    month: 11,
    day: 27,
    advanceNoticeDays: 20,
    theme: "Queima Total de Estoque · A Maior Black Friday da História",
    suggestedOffer: "Até 60% OFF + Cashback em dobro no PIX",
    targetAudience: "Todo o público comercial",
    badgeColor: "#000000",
  },
  {
    id: "natal",
    title: "Natal & Fim de Ano",
    dateStr: "25 de Dezembro",
    month: 12,
    day: 25,
    advanceNoticeDays: 25,
    theme: "Presenteie quem Você Ama · Entrega Garantida",
    suggestedOffer: "Envio Expresso Grátis + Brinde Colecionável",
    targetAudience: "Presentes de família e amigos secretos",
    badgeColor: "#15803d",
  },
];

// 2. Payday Spike Calendar (Days 3, 4, 5 and 20)
export const PAYDAY_SPIKE_TRIGGERS: PaydaySpikeTrigger[] = [
  {
    id: "payday-03",
    dayOfMonth: 3,
    name: "Dia 03 · Aquecimento Tático (Teaser)",
    targetGroup: "Consumidores antecipados",
    strategy: "Despertar desejo e criar carrinhos prévios antes do salário cair.",
    recommendedOffer: "Adicione à Wishlist hoje e garanta o preço especial amanhã",
    recommendedMedia: "video",
    urgencyLevel: "aquecimento",
  },
  {
    id: "payday-04",
    dayOfMonth: 4,
    name: "Dia 04 · Salário Servidores & Executivos",
    targetGroup: "Servidores Públicos, Forças Armadas e Multinacionais",
    strategy: "Capturar o primeiro impulso de compra pós-depósito bancário.",
    recommendedOffer: "15% OFF imediato no PIX para pedidos realizados hoje",
    recommendedMedia: "image",
    urgencyLevel: "alta",
  },
  {
    id: "payday-05",
    dayOfMonth: 5,
    name: "Dia 05 · Quinto Dia Útil Nacional (Pico de Liquidez)",
    targetGroup: "Trabalhadores CLT e Maioria Nacional",
    strategy: "Dia de maior volume financeiro e conversão do mês no e-commerce brasileiro.",
    recommendedOffer: "Frete Grátis Nacional + 20% OFF usando o cupom SALARIO05",
    recommendedMedia: "video",
    urgencyLevel: "máxima",
  },
  {
    id: "payday-20",
    dayOfMonth: 20,
    name: "Dia 20 · Adiantamento Salarial (Vale Quinzenal)",
    targetGroup: "Trabalhadores com adiantamento de 40%",
    strategy: "Ofertas relâmpago de 24 horas para aproveitar o fôlego financeiro da quinzena.",
    recommendedOffer: "Oferta Relâmpago: Na compra de 2 peças, a 3ª sai de graça",
    recommendedMedia: "gif",
    urgencyLevel: "alta",
  },
];

// 3. Preloaded CRM Client Birthdays & Store Relationship Anniversaries
export const INITIAL_CLIENTS_CRM: ClientBirthday[] = [
  {
    id: "crm-1",
    name: "Mariana Souza",
    phone: "(11) 98765-4321",
    email: "mariana.souza@gmail.com",
    birthDate: "12/11", // Aniversário Hoje/Amanhã
    relationshipType: "vip",
    anniversaryWithStore: "2024-11-10",
    yearsWithStore: 2,
    customDiscountCode: "NIVER-MARI25",
    suggestedGift: "Batom Hidratante Exclusivo",
  },
  {
    id: "crm-2",
    name: "Lucas Andrade",
    phone: "(21) 99887-1122",
    email: "lucas.andrade@outlook.com",
    birthDate: "14/11",
    relationshipType: "client",
    anniversaryWithStore: "2025-11-14",
    yearsWithStore: 1,
    customDiscountCode: "NIVER-LUCAS20",
    suggestedGift: "Porta-Cartões em Couro",
  },
  {
    id: "crm-3",
    name: "Camila Ribeiro",
    phone: "(31) 98455-7788",
    email: "camila.ribeiro@yahoo.com",
    birthDate: "15/11",
    relationshipType: "vip",
    anniversaryWithStore: "2023-11-15",
    yearsWithStore: 3,
    customDiscountCode: "VIP-CAMILA30",
    suggestedGift: "Pingente Trevo Folheado a Ouro",
  },
  {
    id: "crm-4",
    name: "Felipe Rocha",
    phone: "(41) 99123-5566",
    email: "felipe.rocha@techdev.io",
    birthDate: "18/11",
    relationshipType: "partner",
    anniversaryWithStore: "2024-11-18",
    yearsWithStore: 2,
    customDiscountCode: "FELIPE-ESPECIAL",
    suggestedGift: "Mousepad de Couro Legítimo",
  },
  {
    id: "crm-5",
    name: "Beatriz Lima",
    phone: "(71) 98833-2211",
    email: "beatriz.lima@gmail.com",
    birthDate: "20/11",
    relationshipType: "client",
    anniversaryWithStore: "2025-11-20",
    yearsWithStore: 1,
    customDiscountCode: "NIVER-BIA15",
    suggestedGift: "Necessaire Personalizada",
  },
];

// 4. Initial Scheduled Campaign Posts
export const INITIAL_SCHEDULED_CAMPAIGNS: ScheduledPostItem[] = [
  {
    id: "camp-payday-05",
    title: "Campanha Dia 05 · Salário na Conta & Frete Grátis",
    category: "payday_spike",
    platform: "all",
    mediaType: "video",
    scheduledDate: "05/12/2026",
    scheduledTime: "12:30",
    peakScore: 98,
    caption: "Salário na conta pede recompensa! Aproveite 20% OFF + Frete Grátis em toda a loja hoje com o cupom SALARIO05. Não deixe para amanhã o que você merece hoje! 🚀🛒",
    discountCode: "SALARIO05",
    status: "scheduled",
    googleCalendarSynced: true,
  },
  {
    id: "camp-niver-mariana",
    title: "Aniversário VIP · Mariana Souza (Cupom 25% + Mimo)",
    category: "client_birthday",
    platform: "instagram",
    mediaType: "image",
    scheduledDate: "12/11/2026",
    scheduledTime: "11:30",
    peakScore: 95,
    caption: "Hoje é um dia mais que especial: aniversário da nossa cliente querida @mariana.souza! Preparamos um presente e 25% OFF para você celebrar com a gente. Parabéns! 🎂🎉",
    discountCode: "NIVER-MARI25",
    status: "scheduled",
    googleCalendarSynced: true,
  },
  {
    id: "camp-fidelidade-camila",
    title: "Aniversário de 3 Anos de Casa · Camila Ribeiro",
    category: "store_anniversary",
    platform: "facebook",
    mediaType: "gif",
    scheduledDate: "15/11/2026",
    scheduledTime: "18:00",
    peakScore: 92,
    caption: "Há exatos 3 anos você fez sua primeira compra com a gente, Camila! Gratidão imensa por sua confiança. Seu brinde exclusivo e 30% OFF já estão liberados! 💎✨",
    discountCode: "VIP-CAMILA30",
    status: "scheduled",
    googleCalendarSynced: false,
  },
  {
    id: "camp-black-friday",
    title: "Black Friday Antecipada · Lista VIP Exclusiva",
    category: "commercial_holiday",
    platform: "tiktok",
    mediaType: "video",
    scheduledDate: "27/11/2026",
    scheduledTime: "19:30",
    peakScore: 99,
    caption: "O momento mais aguardado do ano chegou! Até 60% de desconto real enquanto durarem os estoques. Toque no link da bio e garanta antes que esgote! 🔥⚡",
    discountCode: "BLACKFRIDAY60",
    status: "scheduled",
    googleCalendarSynced: true,
  },
];

/**
 * Calculates optimal peak posting time based on platform and day
 */
export function getPlatformPeakTime(platform: SocialPlatform): { time: string; engagementScore: number; rationale: string } {
  switch (platform) {
    case "instagram":
      return { time: "12:15", engagementScore: 96, rationale: "Pausa de almoço no celular (alta taxa de visualização de Stories e Reels)." };
    case "tiktok":
      return { time: "19:45", engagementScore: 98, rationale: "Horário nobre de consumo relaxado e navegação no feed Para Você." };
    case "youtube_shorts":
      return { time: "13:30", engagementScore: 92, rationale: "Pico de entrega de Shorts em intervalo de trabalho e estudo." };
    case "facebook":
      return { time: "18:30", engagementScore: 89, rationale: "Encerramento do expediente e navegação em grupos e feed." };
    default:
      return { time: "12:00", engagementScore: 95, rationale: "Horário universal de maior convergência de tráfego mobile." };
  }
}

/**
 * Generates an iCalendar (.ics) file string to sync directly with Google Calendar
 */
export function generateGoogleCalendarIcs(campaigns: ScheduledPostItem[]): string {
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//DesignSystemPro//Smart Campaign Scheduler//PT\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

  campaigns.forEach((camp) => {
    // Parse DD/MM/YYYY into YYYYMMDD
    const parts = camp.scheduledDate.split("/");
    const timeParts = camp.scheduledTime.split(":");
    if (parts.length === 3) {
      const year = parts[2];
      const month = parts[1].padStart(2, "0");
      const day = parts[0].padStart(2, "0");
      const hour = (timeParts[0] || "12").padStart(2, "0");
      const min = (timeParts[1] || "00").padStart(2, "0");

      const dtStart = `${year}${month}${day}T${hour}${min}00`;
      const dtEnd = `${year}${month}${day}T${String(parseInt(hour) + 1).padStart(2, "0")}${min}00`;

      ics += "BEGIN:VEVENT\n";
      ics += `UID:${camp.id}@designsystempro.local\n`;
      ics += `SUMMARY:[POST ${camp.platform.toUpperCase()}] ${camp.title}\n`;
      ics += `DESCRIPTION:${camp.caption.replace(/\n/g, "\\n")} (Cupom: ${camp.discountCode || "Nenhum"})\n`;
      ics += `DTSTART:${dtStart}\n`;
      ics += `DTEND:${dtEnd}\n`;
      ics += `STATUS:CONFIRMED\n`;
      ics += `CATEGORIES:${camp.category.toUpperCase()}\n`;
      ics += "END:VEVENT\n";
    }
  });

  ics += "END:VCALENDAR";
  return ics;
}
