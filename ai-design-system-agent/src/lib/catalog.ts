import { commerceCategories } from "./seed-commerce";
import { lifestyleCategories } from "./seed-lifestyle";
import { familyBeautyCategories } from "./seed-kids-beauty";
import { scrollCraftCategory } from "./scroll-craft-data";
import type { SeedCategory, SeedSystem } from "./seed-types";
import type {
  Category,
  CategoryId,
  DesignSystem,
  Palette,
  Skill,
  StackRecommendation,
} from "./types";

const seedCategories: SeedCategory[] = [
  ...commerceCategories,
  ...lifestyleCategories,
  ...familyBeautyCategories,
  scrollCraftCategory,
];

const stacks: Record<string, StackRecommendation> = {
  ecommerce: {
    primary: "Next.js (App Router) + Shopify Hydrogen ou Medusa",
    core: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "Vite (admin)"],
    ui: ["shadcn/ui", "Radix", "Polaris (admin)", "Recharts"],
    data: ["Shopify Storefront API / Medusa JS", "Drizzle ORM", "TanStack Query", "nuqs"],
    motion: ["Motion for React", "Lenis"],
    rationale:
      "Commerce exige SEO, streaming de catálogo e checkout confiável. RSC corta JS do PDP e o checkout externo reduz risco PCI.",
    alternatives: ["Astro + ilhas (catálogo grande e estático)", "Remix (checkout único)", "Saleor GraphQL (multi-canal)"],
  },
  "tech-portfolio": {
    primary: "Next.js + Tailwind + shadcn/ui (motion na camada de apresentação)",
    core: ["Next.js 16", "TypeScript", "Tailwind CSS v4", "React Three Fiber (opcional)"],
    ui: ["shadcn/ui", "Radix", "Geist", "cmdk"],
    data: ["MDX / Content Collections", "Drizzle (leads)", "Vercel Analytics", "Resend"],
    motion: ["GSAP + ScrollTrigger", "Lenis", "Motion for React", "View Transitions"],
    rationale:
      "Portfólio high-end vive de Core Web Vitals e craft. Server components entrega texto rápido; GSAP e Lenis ficam em ilhas client isoladas.",
    alternatives: ["Astro (conteúdo quase estático)", "SvelteKit (motion leve)", "Remix (rotas com dados)"],
  },
  jewelry: {
    primary: "Next.js + Tailwind com fotografia macro e catálogo headless",
    core: ["Next.js 16", "Tailwind CSS v4", "Shopify Hydrogen", "TypeScript"],
    ui: ["shadcn/ui", "Cormorant/Playfair", "Embla Carousel", "React Zoom"],
    data: ["Shopify Storefront API", "Drizzle (concierge)", "Algolia", "Klaviyo"],
    motion: ["Motion for React (fade)", "GSAP (macro zoom)", "Lenis"],
    rationale:
      "Alta joalheria precisa de imagem impecável, zoom e pouca interface. Headless permite ficha técnica rica e concierge sem brigar com o checkout.",
    alternatives: ["Saleor (multi-boutique)", "Webflow + Ecommerce (lançamento rápido)"],
  },
  "womens-accessories": {
    primary: "Next.js + Tailwind (lookbook e merchandising por cor)",
    core: ["Next.js 16", "Tailwind CSS v4", "Shopify Hydrogen", "TypeScript"],
    ui: ["shadcn/ui", "Embla", "Framer Motion", "Sanity Studio"],
    data: ["Shopify Storefront API", "Sanity CMS", "Drizzle (wishlist)", "Klaviyo"],
    motion: ["Motion for React", "Lenis"],
    rationale:
      "Acessório feminino vende por combinação visual: swatches, lookbook e wishlist são prioridade. CMS separado deixa o time de marca iterar sozinho.",
    alternatives: ["Astro + Shopify Buy Button", "Shopify Liquid (operação enxuta)"],
  },
  watches: {
    primary: "Next.js + Tailwind com comparador técnico e configurador",
    core: ["Next.js 16", "Tailwind CSS v4", "TypeScript", "Shopify / CommerceTools"],
    ui: ["shadcn (data)", "TanStack Table", "Radix", "Recharts"],
    data: ["Drizzle ORM", "Commerce API", "Meilisearch", "TanStack Query"],
    motion: ["Motion for React", "GSAP (macro)", "R3F (mostrador 3D opcional)"],
    rationale:
      "Relógio é compra de comparação: tabela de specs, filtros e configurador reduzem dúvida. Busca facetada (Meilisearch) é mais valiosa que hero animado.",
    alternatives: ["Astro + Meilisearch", "Hydrogen + Hydrogen React"],
  },
  "mens-accessories": {
    primary: "Next.js + Tailwind + DTC commerce",
    core: ["Next.js 16", "Tailwind CSS v4", "TypeScript", "Shopify Hydrogen"],
    ui: ["shadcn/ui", "Radix", "Recharts", "Lucide"],
    data: ["Shopify Storefront API", "Drizzle (garantia)", "Klaviyo", "Resend"],
    motion: ["Motion for React", "GSAP (macro)"],
    rationale:
      "Público masculino responde a função e prova: capacidade, garantia vitalícia e comparadores convertem mais que branding abstrato.",
    alternatives: ["Next.js + Stripe Checkout", "Medusa (customização de garantia)"],
  },
  kids: {
    primary: "Next.js + Tailwind (catálogo por idade e lista de presentes)",
    core: ["Next.js 16", "Tailwind CSS v4", "Shopify Hydrogen", "TypeScript"],
    ui: ["shadcn/ui", "Embla", "Framer Motion"],
    data: ["Shopify Storefront API", "Drizzle (registry)", "Klaviyo", "Algolia"],
    motion: ["Motion for React (springs)", "Lottie"],
    rationale:
      "O comprador é o adulto, o usuário é a criança: navegação por idade/habilidade + confiança de segurança e material. Acessibilidade e alvos grandes são obrigatórios.",
    alternatives: ["Astro (institucional + catálogo)", "Shopify Liquid (operação)"],
  },
  beauty: {
    primary: "Next.js + Tailwind com shade finder e prova virtual",
    core: ["Next.js 16", "Tailwind CSS v4", "Shopify Hydrogen", "TypeScript"],
    ui: ["shadcn/ui", "Embla", "React Color", "TanStack Table"],
    data: ["Shopify Storefront API", "Drizzle (tom de pele)", "Meilisearch", "Klaviyo"],
    motion: ["Motion for React", "GSAP (campanha)"],
    rationale:
      "Beleza é decisão de cor: swatches, comparação de tons e prova virtual reduzem devolução. Upload de imagem pede API route isolada e storage.",
    alternatives: ["Medusa + custom shade API", "Shopify + app de prova virtual"],
  },
  "scroll-craft": {
    primary: "Next.js 16 + Canvas/WebGL + Lenis + WebCodecs",
    core: ["Next.js 16", "Canvas 2D", "WebGL", "Lenis Scroll", "Tailwind CSS v4"],
    ui: ["shadcn/ui", "Radix Primitives", "Instrument Serif", "JetBrains Mono"],
    data: ["Drizzle ORM (leads/analytics)", "Remotion (motion assets)"],
    motion: ["Scroll-as-Timeline", "GSAP ScrollTrigger", "Motion for React", "Video Scrubbing"],
    rationale:
      "Demonstrativos de produto imersivos precisam de performance de 60-120fps sem scroll hijack. Canvas e Lenis garantem controle exato de timeline frame a frame.",
    alternatives: ["Three.js / React Three Fiber (3D puro)", "Astro (landing ultraleve)"],
  },
};

function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function buildPalette(pal: SeedSystem["pal"]): Palette {
  const [bg, surface, ink, accent, accent2] = pal;
  const dark = luminance(bg) < 0.32;
  return {
    bg,
    surface,
    ink,
    accent,
    accent2,
    line: dark ? "rgba(255,255,255,0.16)" : "rgba(17,17,19,0.13)",
  };
}

function buildSystem(seed: SeedSystem, categoryId: CategoryId, index: number): DesignSystem {
  const skills: Skill[] = seed.sk.map(([name, level, summary, outputs], skillIndex) => ({
    id: `${seed.i}-s${skillIndex + 1}`,
    designSystemId: seed.i,
    categoryId,
    name,
    level,
    summary,
    outputs: outputs.split(",").map((o) => o.trim()),
    tags: [seed.tags[0] ?? "", ...seed.st.slice(0, 2)],
  }));
  const [firstName, ...rest] = seed.n.split(" ");
  return {
    id: seed.i,
    categoryId,
    name: seed.n,
    kind: seed.k,
    source: seed.s,
    tagline: seed.tg,
    description: seed.d,
    tags: seed.tags,
    stack: seed.st,
    palette: buildPalette(seed.pal),
    fonts: { display: seed.f[0], heading: seed.f[0], body: seed.f[1] },
    principles: seed.pr.map(([title, detail]) => ({ title, detail })),
    preview: {
      hero: seed.h,
      sub: seed.d,
      cta: categoryId === "tech-portfolio" ? "Ver projetos" : "Explorar seleção",
      badge: seed.b,
    },
    variant: seed.v,
    radius: seed.r,
    rating: Number((4.5 + ((index * 7) % 5) / 10).toFixed(1)),
    skills,
  };
}

export const categories: Category[] = seedCategories.map((seed, index) => ({
  id: seed.id as CategoryId,
  name: seed.name,
  short: seed.short,
  description: seed.description,
  accent: seed.accent,
  keywords: seed.keywords,
  stack: stacks[seed.id] ?? stacks.ecommerce,
  designSystems: seed.systems.map((system, systemIndex) =>
    buildSystem(system, seed.id as CategoryId, systemIndex + index),
  ),
}));

export const designSystems: DesignSystem[] = categories.flatMap((c) => c.designSystems);

export const allSkills: Skill[] = designSystems.flatMap((d) => d.skills);

export const previewCta: Record<CategoryId, string> = {
  ecommerce: "Comprar agora",
  "tech-portfolio": "Ver projetos",
  jewelry: "Descobrir a coleção",
  "womens-accessories": "Ver a coleção",
  watches: "Explorar relógios",
  "mens-accessories": "Comprar agora",
  kids: "Ver brinquedos",
  beauty: "Comprar agora",
  "scroll-craft": "Ver demonstração 360°",
};

export function getCategory(id: string): Category {
  return categories.find((c) => c.id === id) ?? categories[0];
}

export function getDesignSystem(id: string): DesignSystem {
  return designSystems.find((d) => d.id === id) ?? designSystems[0];
}

export function getStack(categoryId: string): StackRecommendation {
  return getCategory(categoryId).stack;
}

export function categorySkillCount(categoryId: string): number {
  return getCategory(categoryId).designSystems.reduce((acc, d) => acc + d.skills.length, 0);
}

export function detectCategory(text: string): CategoryId | undefined {
  const lower = text.toLowerCase();
  let best: { id: CategoryId; score: number } | undefined;
  for (const category of categories) {
    const haystack = [category.name, category.short, ...category.keywords].map((k) => k.toLowerCase());
    let score = 0;
    for (const word of haystack) {
      if (word.length > 2 && lower.includes(word)) score += word.length;
    }
    for (const system of category.designSystems) {
      if (lower.includes(system.name.toLowerCase())) score += 12;
      for (const tag of system.tags) if (lower.includes(tag.toLowerCase())) score += 2;
    }
    if (!best || score > best.score) best = { id: category.id, score };
  }
  return best && best.score >= 6 ? best.id : undefined;
}
