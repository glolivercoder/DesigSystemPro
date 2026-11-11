/**
 * Social Media Publishing Scheduler & Peak Hours Engine
 * Computes optimal posting times based on target audience demographics,
 * niche behaviors (Instagram / Facebook), and manages scheduled publications.
 */

export interface TimeSlot {
  day: string;
  time: string;
  engagementScore: number; // 0 - 100
  rationale: string;
}

export interface ScheduledPost {
  id: string;
  title: string;
  platform: "instagram" | "facebook" | "both";
  format: "post" | "story" | "reel" | "ad";
  scheduledFor: string;
  status: "draft" | "scheduled" | "published";
  category: string;
  caption: string;
  imageUrl?: string;
}

export const AUDIENCE_SCHEDULES: Record<string, { label: string; peakSlots: TimeSlot[] }> = {
  ecommerce: {
    label: "E-commerce & DTC",
    peakSlots: [
      { day: "Terça-feira", time: "19:30", engagementScore: 95, rationale: "Pico de navegação pós-expediente e conversão imediata." },
      { day: "Quinta-feira", time: "20:00", engagementScore: 92, rationale: "Aquecimento para o fim de semana com carrinho aberto." },
      { day: "Domingo", time: "20:30", engagementScore: 98, rationale: "Maior pico de compras mobile da semana." },
      { day: "Sábado", time: "11:00", engagementScore: 84, rationale: "Compras em horário de lazer matinal." },
    ],
  },
  "tech-portfolio": {
    label: "Tecnologia & B2B",
    peakSlots: [
      { day: "Terça-feira", time: "09:00", engagementScore: 94, rationale: "Abertura do dia útil com foco em inovação e networking." },
      { day: "Quarta-feira", time: "14:00", engagementScore: 91, rationale: "Pausa após o almoço para consumo de cases e artigos." },
      { day: "Quinta-feira", time: "10:30", engagementScore: 88, rationale: "Momentum de decisões técnicas de contratação e parcerias." },
    ],
  },
  jewelry: {
    label: "Joias & Luxo",
    peakSlots: [
      { day: "Quarta-feira", time: "13:00", engagementScore: 90, rationale: "Visualização aspiracional no intervalo de almoço." },
      { day: "Sexta-feira", time: "19:00", engagementScore: 96, rationale: "Presentes de fim de semana e ocasiões comemorativas." },
      { day: "Sábado", time: "16:00", engagementScore: 93, rationale: "Planejamento de boutique e concierge." },
    ],
  },
  "womens-accessories": {
    label: "Acessórios Femininos",
    peakSlots: [
      { day: "Segunda-feira", time: "20:00", engagementScore: 90, rationale: "Inspiração de moda para o início de semana." },
      { day: "Quinta-feira", time: "18:30", engagementScore: 94, rationale: "Combinações de look para saídas e eventos." },
      { day: "Sábado", time: "14:00", engagementScore: 91, rationale: "Consumo de Reels de 'unboxing' e 'arrume-se comigo'." },
    ],
  },
  watches: {
    label: "Relógios & Alta Precisão",
    peakSlots: [
      { day: "Terça-feira", time: "21:00", engagementScore: 89, rationale: "Comunidade de colecionadores e fóruns ativos à noite." },
      { day: "Sexta-feira", time: "18:00", engagementScore: 93, rationale: "Comemoração de metas e aquisições de prestígio." },
      { day: "Domingo", time: "19:00", engagementScore: 95, rationale: "Leitura técnica aprofundada de calibres e história." },
    ],
  },
  "mens-accessories": {
    label: "Acessórios Masculinos",
    peakSlots: [
      { day: "Quarta-feira", time: "12:30", engagementScore: 88, rationale: "Pausa do almoço com rápida decisão de compra." },
      { day: "Sexta-feira", time: "17:30", engagementScore: 92, rationale: "Fechamento de semana e preparação para viagens (EDC)." },
    ],
  },
  kids: {
    label: "Artigos Infantis & Pais",
    peakSlots: [
      { day: "Segunda-feira", time: "14:30", engagementScore: 88, rationale: "Momento de descanso/soneca dos filhos." },
      { day: "Quarta-feira", time: "21:30", engagementScore: 96, rationale: "Pós-rotina de sono das crianças: foco total dos pais." },
      { day: "Sábado", time: "09:00", engagementScore: 87, rationale: "Planejamento de atividades infantis do fim de semana." },
    ],
  },
  beauty: {
    label: "Beleza & Maquiagem",
    peakSlots: [
      { day: "Quarta-feira", time: "18:00", engagementScore: 93, rationale: "Tutoriais em Reels e dicas de skincare noturno." },
      { day: "Sexta-feira", time: "16:00", engagementScore: 97, rationale: "Make para o final de semana e preparação de looks." },
      { day: "Sábado", time: "15:00", engagementScore: 92, rationale: "Inspirações para eventos noturnos." },
    ],
  },
  "scroll-craft": {
    label: "Demonstrativos de Produto (Scroll-Craft)",
    peakSlots: [
      { day: "Terça-feira", time: "11:00", engagementScore: 97, rationale: "Horário nobre global para lançamentos de produto estilo Apple/Keynote." },
      { day: "Quarta-feira", time: "15:30", engagementScore: 94, rationale: "Engajamento viral com vídeos de interação e scrollytelling." },
      { day: "Quinta-feira", time: "19:00", engagementScore: 92, rationale: "Apresentação de detalhes técnicos para early adopters." },
    ],
  },
};

export const INITIAL_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: "post-1",
    title: "Lançamento da Nova Coleção Minimalista",
    platform: "both",
    format: "post",
    scheduledFor: "Amanhã às 19:30 (Pico Recomendado)",
    status: "scheduled",
    category: "ecommerce",
    caption: "Feito para durar. Conheça as peças com acabamento em couro legítimo e proporções pensadas para o seu dia a dia.",
  },
  {
    id: "post-2",
    title: "Demonstração Interativa 360° (Scroll-Craft)",
    platform: "instagram",
    format: "reel",
    scheduledFor: "Quinta-feira às 15:30",
    status: "scheduled",
    category: "scroll-craft",
    caption: "Cada detalhe tem um propósito. Role pela página e veja como a precisão artesanal encontra a engenharia moderna.",
  },
  {
    id: "post-3",
    title: "Editorial de Estilo & Combinações",
    platform: "facebook",
    format: "post",
    scheduledFor: "Sábado às 14:00",
    status: "draft",
    category: "womens-accessories",
    caption: "Do casual ao jantar de negócios. Uma seleção pensada para valorizar qualquer composição.",
  },
];

