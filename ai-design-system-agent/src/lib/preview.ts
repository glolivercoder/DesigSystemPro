import type { CategoryId, Category, DesignSystem } from "./types";

type Item = { name: string; meta: string; price: string };

interface CategoryContent {
  nav: string[];
  eyebrow: string;
  filters: string[];
  items: Item[];
  stats: [string, string][];
  story: { kicker: string; title: string; text: string };
  footer: string[];
  note: string;
}

const content: Record<CategoryId, CategoryContent> = {
  ecommerce: {
    nav: ["Novidades", "Coleção", "Presentes", "Editorial"],
    eyebrow: "Frete grátis acima de R$ 299",
    filters: ["Todos", "Lançamentos", "Best sellers", "Últimas unidades"],
    items: [
      { name: "Sérum de inverno", meta: "30ml · vegano", price: "R$ 189" },
      { name: "Bolsa Estruturada", meta: "Couro · 3 cores", price: "R$ 749" },
      { name: "Copo térmico", meta: "Aço · 500ml", price: "R$ 129" },
      { name: "Capa de linho", meta: "Queen · areia", price: "R$ 429" },
    ],
    stats: [
      ["Entrega", "24h capitais"],
      ["Trocas", "30 dias grátis"],
      ["Pagamento", "Pix · 5% off"],
    ],
    story: {
      kicker: "Como funciona",
      title: "Do carrinho ao pós-compra, sem atrito",
      text: "Checkout em uma página, rastreio em tempo real e política de troca clara. O design system cuida de estados vazios, erro de pagamento e retomada de carrinho.",
    },
    footer: ["Fale conosco", "Entregas", "Trocas", "Privacidade"],
    note: "E-commerce · checkout integrado",
  },
  "tech-portfolio": {
    nav: ["Trabalhos", "Laboratório", "Sobre", "Contato"],
    eyebrow: "Disponível para novos projetos",
    filters: ["Seleção", "Produto", "WebGL", "Motion"],
    items: [
      { name: "Nebula OS", meta: "Design system · 2025", price: "Case 01" },
      { name: "Orbital", meta: "WebGL · 2024", price: "Case 02" },
      { name: "Craft Docs", meta: "Docs · 2024", price: "Case 03" },
      { name: "Kinetic", meta: "Motion · 2023", price: "Case 04" },
    ],
    stats: [
      ["Anos", "9+ de craft"],
      ["Projetos", "64 entregues"],
      ["Prêmios", "3× SOTD"],
    ],
    story: {
      kicker: "Abordagem",
      title: "Interfaces com engenharia e intenção",
      text: "Cada projeto começa em tokens e termina em motion medido. Nada de scroll sequestrado: animação é consequência da hierarquia, nunca substituto dela.",
    },
    footer: ["GitHub", "Dribbble", "LinkedIn", "Email"],
    note: "Portfólio · motion em JS",
  },
  jewelry: {
    nav: ["Alta joalheria", "Anéis", "Colares", "Maison"],
    eyebrow: "Certificado de autenticidade incluso",
    filters: ["Todas as peças", "Ouro 18k", "Diamantes", "Novidades"],
    items: [
      { name: "Solitário Élan", meta: "Ouro 18k · 0,50ct", price: "R$ 12.400" },
      { name: "Aliança Orbite", meta: "Ouro branco · par", price: "R$ 7.890" },
      { name: "Colar Lumière", meta: "Diamantes · 42cm", price: "R$ 6.250" },
      { name: "Brinco Goutte", meta: "Água-marinha", price: "R$ 4.980" },
    ],
    stats: [
      ["Ateliê", "Desde 1974"],
      ["Garantia", "Vitalícia"],
      ["Concierge", "Boutique privada"],
    ],
    story: {
      kicker: "Savoir-faire",
      title: "Da pedra bruta ao engaste perfeito",
      text: "Seleção de pedras, certificação e engaste artesanal. Cada peça é acompanhada de ficha técnica, certificado digital e histórico de origem.",
    },
    footer: ["Boutiques", "Concierge", "Cuidados", "Maison"],
    note: "Alta joalheria · concierge",
  },
  "womens-accessories": {
    nav: ["Lançamentos", "Bolsas", "Óculos", "Lookbook"],
    eyebrow: "Nova coleção: pele e areia",
    filters: ["Tudo", "Bolsas", "Óculos", "Cintos"],
    items: [
      { name: "Bolsa Néo Mini", meta: "Nappa · 4 cores", price: "R$ 1.490" },
      { name: "Óculos Solaire", meta: "Acetato tartaruga", price: "R$ 690" },
      { name: "Cinto Lune", meta: "Couro · dourado", price: "R$ 429" },
      { name: "Clutch Ora", meta: "Seda · noite", price: "R$ 980" },
    ],
    stats: [
      ["Envio", "Grátis › R$ 900"],
      ["Estilo", "Consciente"],
      ["Trocas", "Primeira grátis"],
    ],
    story: {
      kicker: "Lookbook",
      title: "Peças que conversam entre si",
      text: "Swatches de couro funcionam como navegação. Monte o look completo e adicione os três itens com um clique, sem sair do editorial.",
    },
    footer: ["Guia de couro", "Lookbook", "Cuidados", "Contato"],
    note: "Acessórios · merchandising por cor",
  },
  watches: {
    nav: ["Relógios", "Coleções", "Movimentos", "Boutique"],
    eyebrow: "Calibre suíço · entrega em 48h",
    filters: ["Todos", "Mergulho", "Cronógrafo", "GMT"],
    items: [
      { name: "Meridian 38", meta: "Automático · 38mm", price: "R$ 18.900" },
      { name: "Abyss 300", meta: "Diver · 300m", price: "R$ 9.450" },
      { name: "Chrono 68", meta: "Cronógrafo · aço", price: "R$ 14.200" },
      { name: "Terra GMT", meta: "GMT · titânio", price: "R$ 22.750" },
    ],
    stats: [
      ["Calibres", "17 movimentos"],
      ["Reserva", "até 72h"],
      ["Garantia", "5 anos"],
    ],
    story: {
      kicker: "Engenharia",
      title: "Cada milímetro tem função",
      text: "Tabela técnica completa, macrofotografia do calibre e comparador de até quatro modelos. Especificação não é letra miúda: é a interface.",
    },
    footer: ["Comparador", "Assistência", "Boutiques", "Imprensa"],
    note: "Relojoaria · comparador técnico",
  },
  "mens-accessories": {
    nav: ["Carteiras", "Mochilas", "Cintos", "Garantia"],
    eyebrow: "Garantia vitalícia em todo couro",
    filters: ["Tudo", "EDC", "Viagem", "Couro"],
    items: [
      { name: "Wallet Slim", meta: "Alumínio · RFID", price: "R$ 549" },
      { name: "Pack 24L", meta: "Lona encerada", price: "R$ 1.290" },
      { name: "Belt Legacy", meta: "Couro vegetal", price: "R$ 420" },
      { name: "Dopp Kit", meta: "Couro full grain", price: "R$ 680" },
    ],
    stats: [
      ["Capacidade", "24L testados"],
      ["Garantia", "Vitalícia"],
      ["Reparo", "Gratuito"],
    ],
    story: {
      kicker: "Built to carry",
      title: "Organização que se sente na mão",
      text: "Diagramas de capacidade mostram o que cabe antes de comprar. Cada costura é documentada e o reparo é gratuito enquanto a peça existir.",
    },
    footer: ["Garantia", "Reparos", "Materiais", "Contato"],
    note: "Acessórios masculinos · utilidade",
  },
  kids: {
    nav: ["Brinquedos", "Por idade", "Enxoval", "Presentes"],
    eyebrow: "Feito para mãos pequenas",
    filters: ["Tudo", "0–2 anos", "3–5 anos", "6–8 anos"],
    items: [
      { name: "Blocos de bordo", meta: "Madeira · 3+", price: "R$ 189" },
      { name: "Kit sensorial", meta: "Algodão · 0+", price: "R$ 240" },
      { name: "Cesta de vime", meta: "Rattan · refúgio", price: "R$ 320" },
      { name: "Coelho Amigo", meta: "Pelúcia · lavável", price: "R$ 149" },
    ],
    stats: [
      ["Segurança", "Certificado INMETRO"],
      ["Material", "Atóxico"],
      ["Faixa", "0 a 8 anos"],
    ],
    story: {
      kicker: "Brincar com propósito",
      title: "A idade certa, o estímulo certo",
      text: "Navegação por fase de desenvolvimento, guia de marcos e atividades off-line. Informação de segurança em cada página de produto.",
    },
    footer: ["Guia de idade", "Segurança", "Trocas", "Blog"],
    note: "Infantil · curadoria por idade",
  },
  beauty: {
    nav: ["Lançamentos", "Rosto", "Olhos", "Lábios"],
    eyebrow: "Escolha seu tom com precisão",
    filters: ["Todos", "Pele", "Make", "Kits"],
    items: [
      { name: "Base Skin Tint", meta: "50 tons · glow", price: "R$ 179" },
      { name: "Blush Cloud", meta: "Rosé · buildable", price: "R$ 139" },
      { name: "Balm Peptide", meta: "Hidratação · 12h", price: "R$ 99" },
      { name: "Kit Rotina 3", meta: "Pele sensível", price: "R$ 329" },
    ],
    stats: [
      ["Tons", "50 de base"],
      ["Cruelty-free", "100%"],
      ["Reviews", "4.9 ★"],
    ],
    story: {
      kicker: "Seu tom, sua rotina",
      title: "Cor como dado, não como sorte",
      text: "Subtom, profundidade e acabamento em filtros combináveis. Compare swatches lado a lado e monte a rotina em três passos.",
    },
    footer: ["Encontre seu tom", "Reviews", "Ingredientes", "Sustentabilidade"],
    note: "Beleza · shade finder",
  },
  "scroll-craft": {
    nav: ["Visão Geral", "Engenharia", "Scrollytelling", "Ficha Técnica"],
    eyebrow: "Demonstrativo interativo controlado por rolagem",
    filters: ["Todos", "Filmic 360°", "Live Surface", "Split Stage"],
    items: [
      { name: "Scrub 360°", meta: "60 FPS · Canvas", price: "Módulo 01" },
      { name: "Pinned Specs", meta: "Ficha travada", price: "Módulo 02" },
      { name: "Exploded View", meta: "Peças 3D", price: "Módulo 03" },
      { name: "Macro Texture", meta: "Zoom 4K", price: "Módulo 04" },
    ],
    stats: [
      ["Timeline", "Scroll nativo"],
      ["Taxa", "120 FPS fluido"],
      ["Gramáticas", "8 modelos"],
    ],
    story: {
      kicker: "Interação & Craft",
      title: "O produto se revela na ponta dos seus dedos",
      text: "A rolagem não apenas desce a página: ela controla a rotação mecânica, a abertura de diafragmas e o desdobramento de peças internas em tempo real.",
    },
    footer: ["Engenharia", "Repositório", "Documentação", "Licença MIT"],
    note: "Scroll-Craft · nateherkai standard",
  },
};

const serifFonts = new Set([
  "Cormorant Garamond",
  "Playfair Display",
  "Fraunces",
  "DM Serif Display",
  "Instrument Serif",
  "Newsreader",
  "Lora",
]);

const googleFonts = new Set([
  ...serifFonts,
  "Inter",
  "Space Grotesk",
  "DM Sans",
  "Karla",
  "Baloo 2",
]);

function fontFamily(name: string, fallbackSerif: boolean): string {
  const resolved = googleFonts.has(name) ? name : "Inter";
  return `'${resolved}', ${fallbackSerif ? "'Times New Roman', Georgia, serif" : "system-ui, -apple-system, sans-serif"}`;
}

function fontUrl(...names: string[]): string {
  const usable = Array.from(new Set(names.filter((n) => googleFonts.has(n))));
  if (!usable.length) usable.push("Inter");
  const families = usable.map((n) => `family=${n.replace(/ /g, "+")}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function motif(categoryId: CategoryId): string {
  const stroke = 'fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"';
  switch (categoryId) {
    case "jewelry":
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><g ${stroke}><circle cx="100" cy="118" r="42"/><path d="M86 66 L100 50 L114 66 L100 82 Z"/><path d="M86 66 L114 66"/><path d="M100 82 L100 50"/></g></svg>`;
    case "watches":
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><g ${stroke}><circle cx="100" cy="100" r="52"/><circle cx="100" cy="100" r="40"/><path d="M100 60v8M140 100h-8M100 140v-8M60 100h8"/><path d="M100 100 L100 72"/><path d="M100 100 L124 112"/><circle cx="100" cy="100" r="3"/></g></svg>`;
    case "mens-accessories":
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><g ${stroke}><rect x="46" y="80" width="108" height="66" rx="8"/><path d="M46 104h108"/><path d="M78 80V64a22 22 0 0 1 44 0v16"/></g></svg>`;
    case "womens-accessories":
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><g ${stroke}><path d="M52 82h96l-8 66H60z"/><path d="M78 82V70a22 22 0 0 1 44 0v12"/><path d="M52 100h96"/></g></svg>`;
    case "kids":
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><g ${stroke}><rect x="52" y="52" width="42" height="42" rx="10"/><rect x="106" y="52" width="42" height="42" rx="21"/><rect x="52" y="106" width="42" height="42" rx="21"/><path d="M127 106v42M106 127h42"/></g></svg>`;
    case "beauty":
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><g ${stroke}><rect x="74" y="88" width="30" height="62" rx="6"/><path d="M74 88V70h30v18"/><path d="M112 70h16v80h-16z"/><circle cx="142" cy="96" r="18"/></g></svg>`;
    case "tech-portfolio":
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><g ${stroke}><circle cx="100" cy="100" r="52"/><ellipse cx="100" cy="100" rx="52" ry="20"/><ellipse cx="100" cy="100" rx="52" ry="20" transform="rotate(60 100 100)"/><ellipse cx="100" cy="100" rx="52" ry="20" transform="rotate(-60 100 100)"/></g></svg>`;
    default:
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><g ${stroke}><path d="M56 76h88v70H56z"/><path d="M56 76l14-20h22l12 20"/><path d="M100 96v30"/><circle cx="132" cy="132" r="6"/></g></svg>`;
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function artStyle(accent: string, accent2: string, index: number): string {
  const angle = 120 + index * 47;
  return `background:
    radial-gradient(120% 120% at ${20 + index * 12}% ${18 + index * 9}%, ${accent}55 0%, transparent 55%),
    radial-gradient(90% 90% at ${80 - index * 6}% ${82 - index * 5}%, ${accent2}55 0%, transparent 60%),
    conic-gradient(from ${angle}deg at 55% 40%, ${accent}22, ${accent2}33, transparent 70%),
    ${"var(--surface)"};`;
}

export function buildPreviewHtml(ds: DesignSystem, category: Category): string {
  const c = content[ds.categoryId] ?? content.ecommerce;
  const serifDisplay = serifFonts.has(ds.fonts.display);
  const p = ds.palette;
  const title = `${ds.name} — Studio preview`;
  const nav = c.nav;
  const filters = c.filters;
  const products = c.items
    .map(
      (item, index) => `
      <article class="card reveal" data-reveal style="--i:${index}">
        <div class="card-art" style="${artStyle(p.accent, p.accent2, index)}">
          <span class="card-motif">${motif(ds.categoryId)}</span>
          <button class="quick" type="button" data-quick aria-label="Adicionar ${escapeHtml(item.name)}">+</button>
        </div>
        <div class="card-body">
          <div class="card-row"><h3>${escapeHtml(item.name)}</h3><span class="price">${escapeHtml(item.price)}</span></div>
          <p class="meta">${escapeHtml(item.meta)}</p>
        </div>
      </article>`,
    )
    .join("");

  const principles = ds.principles
    .map(
      (principle, index) => `
      <div class="principle reveal" data-reveal>
        <span class="num">0${index + 1}</span>
        <h4>${escapeHtml(principle.title)}</h4>
        <p>${escapeHtml(principle.detail)}</p>
      </div>`,
    )
    .join("");

  const skills = ds.skills
    .slice(0, 4)
    .map((skill) => `<span class="chip">${escapeHtml(skill.name)}</span>`)
    .join("");

  const stats = c.stats
    .map(([label, value]) => `<div class="stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`)
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${fontUrl(ds.fonts.display, ds.fonts.body)}" rel="stylesheet" />
<style>
  :root{
    --bg:${p.bg}; --surface:${p.surface}; --ink:${p.ink}; --accent:${p.accent}; --accent-2:${p.accent2};
    --line:${p.line}; --radius:${ds.radius}px; --display:${fontFamily(ds.fonts.display, serifDisplay)}; --body:${fontFamily(ds.fonts.body, false)};
    --max:1220px; --ease:cubic-bezier(.22,1,.36,1);
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased;line-height:1.55}
  a{color:inherit;text-decoration:none}
  h1,h2,h3,h4{font-family:var(--display);font-weight:500;letter-spacing:-.02em;margin:0;line-height:1.02}
  .wrap{max-width:var(--max);margin:0 auto;padding:0 28px}
  .announce{background:var(--ink);color:var(--bg);font-size:11.5px;text-transform:uppercase;letter-spacing:.18em;overflow:hidden;white-space:nowrap}
  .announce-track{display:inline-flex;gap:48px;padding:9px 0;animation:marquee 26s linear infinite}
  .announce-track span{opacity:.9}
  @keyframes marquee{to{transform:translateX(-50%)}}
  header.site{position:sticky;top:0;z-index:20;backdrop-filter:blur(14px);background:color-mix(in srgb,var(--bg) 86%,transparent);border-bottom:1px solid var(--line)}
  .nav{display:flex;align-items:center;justify-content:space-between;height:72px;gap:24px}
  .brand{display:flex;align-items:center;gap:10px;font-family:var(--display);font-size:20px;letter-spacing:-.01em}
  .brand i{width:9px;height:9px;border-radius:999px;background:var(--accent);display:block}
  nav.links{display:flex;gap:26px;font-size:13.5px}
  nav.links a{opacity:.72;transition:opacity .25s var(--ease),transform .25s var(--ease);position:relative}
  nav.links a:hover{opacity:1;transform:translateY(-1px)}
  nav.links a::after{content:"";position:absolute;left:0;bottom:-6px;width:0;height:1px;background:var(--accent);transition:width .3s var(--ease)}
  nav.links a:hover::after{width:100%}
  .actions{display:flex;align-items:center;gap:12px;font-size:13px}
  .icon-btn{width:36px;height:36px;border-radius:999px;border:1px solid var(--line);background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;transition:border-color .25s,background .25s,transform .25s}
  .icon-btn:hover{border-color:var(--accent);transform:translateY(-1px)}
  .cart{position:relative}
  .cart b{position:absolute;top:-4px;right:-4px;background:var(--accent);color:var(--bg);border-radius:999px;font-size:10px;min-width:16px;height:16px;display:grid;place-items:center;padding:0 4px}
  .btn{display:inline-flex;align-items:center;gap:10px;padding:14px 24px;border-radius:calc(var(--radius) / 1.6);background:var(--accent);color:var(--bg);font-size:13.5px;font-weight:600;letter-spacing:.01em;border:1px solid transparent;cursor:pointer;transition:transform .3s var(--ease),filter .3s,box-shadow .3s}
  .btn:hover{transform:translateY(-2px);filter:brightness(1.06);box-shadow:0 14px 30px -14px var(--accent)}
  .btn.ghost{background:transparent;color:var(--ink);border-color:var(--line)}
  .btn.ghost:hover{border-color:var(--accent);box-shadow:none}
  main{overflow:hidden}
  /* hero */
  .hero{padding:68px 0 54px;position:relative}
  .hero-grid{display:grid;grid-template-columns:1.02fr .98fr;gap:56px;align-items:center}
  .kicker{display:inline-flex;align-items:center;gap:8px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;padding:7px 13px;border:1px solid var(--line);border-radius:999px;color:var(--ink);opacity:.8}
  .kicker i{width:6px;height:6px;border-radius:999px;background:var(--accent)}
  h1.hero-title{font-size:clamp(2.7rem,6vw,4.7rem);margin:22px 0 18px;letter-spacing:-.035em}
  h1.hero-title em{font-style:italic;color:var(--accent)}
  .hero-sub{max-width:46ch;opacity:.72;font-size:15.5px}
  .hero-cta{display:flex;gap:12px;align-items:center;margin-top:28px;flex-wrap:wrap}
  .hero-note{font-size:12px;opacity:.55;margin-top:18px;display:flex;gap:14px;flex-wrap:wrap}
  .art{position:relative;aspect-ratio:1/1.04;border-radius:calc(var(--radius) * 1.3);border:1px solid var(--line);overflow:hidden;display:grid;place-items:center;${artStyle(p.accent, p.accent2, 1)}}
  .art::before{content:"";position:absolute;inset:0;background-image:linear-gradient(90deg,var(--line) 1px,transparent 1px),linear-gradient(var(--line) 1px,transparent 1px);background-size:56px 56px;opacity:.35;mask-image:radial-gradient(circle at 50% 50%,#000,transparent 78%)}
  .art-motif{position:relative;width:52%;color:var(--ink);opacity:.86;filter:drop-shadow(0 18px 40px rgba(0,0,0,.22));animation:float 9s ease-in-out infinite}
  .art-tag{position:absolute;left:18px;bottom:18px;background:color-mix(in srgb,var(--surface) 82%,transparent);backdrop-filter:blur(10px);border:1px solid var(--line);border-radius:999px;padding:8px 14px;font-size:11.5px;letter-spacing:.04em}
  .art-badge{position:absolute;top:18px;right:18px;background:var(--ink);color:var(--bg);border-radius:999px;padding:8px 13px;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase}
  @keyframes float{0%,100%{transform:translateY(-8px) rotate(-2deg)}50%{transform:translateY(10px) rotate(2deg)}}
  .stats{display:flex;gap:0;border-top:1px solid var(--line);margin-top:56px;flex-wrap:wrap}
  .stat{flex:1 1 150px;padding:20px 22px 0 0}
  .stat strong{display:block;font-family:var(--display);font-size:19px;font-weight:500}
  .stat span{font-size:11px;text-transform:uppercase;letter-spacing:.16em;opacity:.55}
  /* kinetic variant */
  .v-kinetic .art{aspect-ratio:1/1.04;border-radius:0}
  .v-kinetic .hero{background-image:radial-gradient(circle at 15% 10%,${p.accent}18,transparent 45%)}
  .kinetic-bar{overflow:hidden;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:14px 0;margin-top:38px}
  .kinetic-track{display:inline-flex;gap:36px;white-space:nowrap;animation:marquee 22s linear infinite;font-family:var(--display);font-size:clamp(1.4rem,3vw,2.1rem);letter-spacing:-.02em}
  .kinetic-track span{opacity:.5}
  .kinetic-track b{font-weight:500}
  /* brutalist variant */
  .v-brutalist .hero-title{font-size:clamp(3rem,8vw,6.2rem);text-transform:uppercase;letter-spacing:-.05em;line-height:.92}
  .v-brutalist .art{border-radius:0;border-width:2px}
  .v-brutalist .kicker{border-radius:0}
  .v-brutalist .btn{border-radius:0}
  /* soft variant */
  .v-soft .art{border-radius:calc(var(--radius) * 2)}
  .v-soft .hero-title em{font-style:normal}
  .v-soft .kicker{background:color-mix(in srgb,var(--accent) 14%,transparent);border-color:transparent}
  /* editorial variant */
  .v-editorial .hero-title{font-size:clamp(2.9rem,7vw,5.4rem)}
  .v-editorial .art{border-radius:0}
  .v-editorial {border-bottom:1px solid var(--line)}
  /* split variant */
  .v-split .hero-grid{grid-template-columns:1fr 1.05fr}
  .v-split .art{border-radius:var(--radius)}
  /* filters + products */
  .section{padding:64px 0}
  .section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:30px}
  .section-head h2{font-size:clamp(1.7rem,3.4vw,2.5rem)}
  .section-head p{font-size:13px;opacity:.6;margin:8px 0 0;max-width:48ch}
  .filters{display:flex;gap:8px;flex-wrap:wrap}
  .filter{font-size:12px;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:transparent;color:inherit;cursor:pointer;transition:all .25s var(--ease)}
  .filter[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
  .filter:hover{border-color:var(--accent)}
  .products{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
  .card{border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;background:var(--surface);transition:transform .4s var(--ease),box-shadow .4s var(--ease),border-color .4s;display:flex;flex-direction:column}
  .card:hover{transform:translateY(-5px);box-shadow:0 26px 50px -34px rgba(0,0,0,.5);border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}
  .card-art{aspect-ratio:4/4.5;position:relative;display:grid;place-items:center;overflow:hidden}
  .card-motif{width:46%;opacity:.7;color:var(--ink);transition:transform .5s var(--ease)}
  .card:hover .card-motif{transform:scale(1.08) rotate(3deg)}
  .quick{position:absolute;right:12px;bottom:12px;width:34px;height:34px;border-radius:999px;border:none;background:var(--ink);color:var(--bg);font-size:18px;cursor:pointer;display:grid;place-items:center;transition:transform .3s var(--ease),background .3s}
  .quick:hover{transform:scale(1.12);background:var(--accent)}
  .card-body{padding:16px 16px 18px}
  .card-row{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
  .card h3{font-size:16px;font-weight:500}
  .price{font-size:13px;opacity:.85;white-space:nowrap}
  .meta{margin:5px 0 0;font-size:11.5px;letter-spacing:.04em;opacity:.5;text-transform:uppercase}
  /* story */
  .story{display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:center;padding:58px 0;border-top:1px solid var(--line)}
  .story-art{position:relative;aspect-ratio:5/4;border-radius:var(--radius);overflow:hidden;border:1px solid var(--line);${artStyle(p.accent2, p.accent, 3)}}
  .story-art span{position:absolute;inset:auto 18px 18px 18px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;opacity:.7}
  .story h2{font-size:clamp(1.7rem,3.4vw,2.5rem);margin:14px 0}
  .story p{opacity:.72;font-size:14.5px;max-width:48ch}
  .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}
  .chip{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:6px 11px;opacity:.75}
  /* principles */
  .principles{display:grid;grid-template-columns:repeat(2,1fr);gap:26px;padding:56px 0;border-top:1px solid var(--line)}
  .principle .num{font-size:11px;letter-spacing:.2em;color:var(--accent);opacity:.9}
  .principle h4{font-size:20px;margin:10px 0 8px}
  .principle p{font-size:13.5px;opacity:.66;margin:0;max-width:42ch}
  /* cta */
  .cta-band{background:var(--ink);color:var(--bg);border-radius:calc(var(--radius) * 1.4);padding:44px 40px;display:flex;gap:28px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:20px 0 64px}
  .cta-band h2{font-size:clamp(1.6rem,3vw,2.3rem);max-width:24ch}
  .cta-band .btn{background:var(--accent);color:var(--bg)}
  .cta-band p{margin:8px 0 0;font-size:13px;opacity:.7;max-width:44ch}
  footer.site{border-top:1px solid var(--line);padding:34px 0 44px;font-size:12px}
  .foot{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;align-items:center}
  .foot nav{display:flex;gap:20px;flex-wrap:wrap;opacity:.7}
  .foot .fine{opacity:.45;margin-top:18px;font-size:11px;letter-spacing:.04em}
  .reveal{opacity:0;transform:translateY(22px);transition:opacity .8s var(--ease),transform .8s var(--ease);transition-delay:calc(var(--i,0) * 70ms)}
  .reveal.in{opacity:1;transform:none}
  .toast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,20px);background:var(--ink);color:var(--bg);padding:11px 18px;border-radius:999px;font-size:12px;opacity:0;pointer-events:none;transition:all .35s var(--ease);z-index:40}
  .toast.show{opacity:1;transform:translate(-50%,0)}
  @media (max-width:960px){
    .hero-grid,.story{grid-template-columns:1fr;gap:32px}
    .products{grid-template-columns:repeat(2,1fr)}
    nav.links{display:none}
    .principles{grid-template-columns:1fr}
    .art{order:-1}
  }
  @media (max-width:560px){
    .wrap{padding:0 18px}
    .products{grid-template-columns:1fr}
    .hero{padding-top:36px}
    .cta-band{padding:30px 24px}
  }
  @media (prefers-reduced-motion:reduce){
    *{animation:none!important;transition:none!important}
    .reveal{opacity:1;transform:none}
  }
</style>
</head>
<body>
  <div class="announce"><div class="announce-track">
    <span>${escapeHtml(c.eyebrow)}</span><span>${escapeHtml(ds.preview.badge)}</span><span>${escapeHtml(ds.tagline)}</span><span>Concierge</span>
    <span>${escapeHtml(c.eyebrow)}</span><span>${escapeHtml(ds.preview.badge)}</span><span>${escapeHtml(ds.tagline)}</span><span>Concierge</span>
  </div></div>
  <header class="site"><div class="wrap nav">
    <a class="brand" href="#"><i></i>${escapeHtml(ds.name.split(" ")[0])}<span style="opacity:.4;font-size:12px">${escapeHtml(ds.name.split(" ").slice(1).join(" "))}</span></a>
    <nav class="links">${nav.map((n) => `<a href="#">${escapeHtml(n)}</a>`).join("")}</nav>
    <div class="actions">
      <button class="icon-btn" type="button" aria-label="Buscar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      </button>
      <button class="icon-btn cart" type="button" aria-label="Carrinho">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16l-1.5 12h-13z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
        <b data-cart>0</b>
      </button>
      <button class="btn" data-add type="button">${escapeHtml(ds.preview.cta)}</button>
    </div>
  </div></header>
  <main>
    <section class="wrap hero v-${ds.variant}">
      <div class="hero-grid">
        <div>
          <span class="kicker"><i></i>${escapeHtml(ds.preview.badge)}</span>
          <h1 class="hero-title">${escapeHtml(ds.preview.hero.split(" ").slice(0, 3).join(" "))}<br/><em>${escapeHtml(ds.preview.hero.split(" ").slice(3).join(" ") || ds.tagline.split(" ").slice(0, 2).join(" "))}</em></h1>
          <p class="hero-sub">${escapeHtml(ds.preview.sub)}</p>
          <div class="hero-cta">
            <button class="btn" data-add type="button">${escapeHtml(ds.preview.cta)} <span aria-hidden="true">→</span></button>
            <a class="btn ghost" href="#selecao">${ds.categoryId === "tech-portfolio" ? "Estudos de caso" : "Ver coleção"}</a>
          </div>
          <div class="hero-note"><span>✦ ${escapeHtml(ds.tags[0] ?? "curadoria")}</span><span>✦ ${escapeHtml(ds.tags[1] ?? "design system")}</span><span>✦ ${escapeHtml(ds.rating.toFixed(1))} / 5</span></div>
        </div>
        <div class="art" data-tilt>
          <div class="art-motif">${motif(ds.categoryId)}</div>
          <span class="art-tag">${escapeHtml(ds.source)}</span>
          <span class="art-badge">${escapeHtml(ds.kind === "library" ? "library" : ds.kind === "patterns" ? "patterns" : "benchmark")}</span>
        </div>
      </div>
      ${ds.variant === "kinetic" ? `<div class="kinetic-bar"><div class="kinetic-track"><b>${escapeHtml(ds.tagline)}</b><span>✦</span><b>${escapeHtml(ds.name)}</b><span>✦</span><b>${escapeHtml(ds.tagline)}</b><span>✦</span><b>${escapeHtml(ds.name)}</b></div></div>` : ""}
      <div class="stats">${stats}</div>
    </section>

    <section class="wrap section" id="selecao">
      <div class="section-head">
        <div>
          <h2>${ds.categoryId === "kids" ? "Escolhidos por idade" : ds.categoryId === "tech-portfolio" ? "Trabalhos selecionados" : "A seleção da casa"}</h2>
          <p>${escapeHtml(ds.description)}</p>
        </div>
        <div class="filters">${filters.map((f, i) => `<button class="filter" type="button" aria-pressed="${i === 0}">${escapeHtml(f)}</button>`).join("")}</div>
      </div>
      <div class="products">${products}</div>
    </section>

    <section class="wrap story">
      <div>
        <span class="kicker"><i></i>${escapeHtml(c.story.kicker)}</span>
        <h2>${escapeHtml(c.story.title)}</h2>
        <p>${escapeHtml(c.story.text)}</p>
        <div class="chips">${skills}</div>
      </div>
      <div class="story-art"><span>${escapeHtml(ds.name)} · ${escapeHtml(ds.fonts.display)}</span></div>
    </section>

    <section class="wrap principles">${principles}</section>

    <section class="wrap">
      <div class="cta-band">
        <div>
          <h2>${escapeHtml(ds.preview.hero)}</h2>
          <p>${escapeHtml(c.note)} · ${escapeHtml(ds.stack.slice(0, 2).join(" + "))}</p>
        </div>
        <button class="btn" data-add type="button">${escapeHtml(ds.preview.cta)} <span aria-hidden="true">→</span></button>
      </div>
    </section>
  </main>
  <footer class="site"><div class="wrap">
    <div class="foot">
      <div class="brand"><i></i>${escapeHtml(ds.name)}</div>
      <nav>${c.footer.map((f) => `<a href="#">${escapeHtml(f)}</a>`).join("")}</nav>
    </div>
    <div class="fine">Preview gerado pelo Studio · ${escapeHtml(ds.fonts.display)} + ${escapeHtml(ds.fonts.body)} · ${escapeHtml(ds.source)} — dados de demonstração.</div>
  </div></footer>
  <div class="toast" data-toast>Adicionado à sacola</div>
  <script>
    (function(){
      var cart = 0;
      var cartEl = document.querySelector('[data-cart]');
      var toast = document.querySelector('[data-toast]');
      function add(n){
        cart += n;
        if (cartEl) cartEl.textContent = String(cart);
        if (toast) { toast.classList.add('show'); window.setTimeout(function(){ toast.classList.remove('show'); }, 1600); }
      }
      document.querySelectorAll('[data-add]').forEach(function(b){ b.addEventListener('click', function(){ add(1); }); });
      document.querySelectorAll('[data-quick]').forEach(function(b){ b.addEventListener('click', function(e){ e.preventDefault(); add(1); }); });
      document.querySelectorAll('.filter').forEach(function(b){
        b.addEventListener('click', function(){
          document.querySelectorAll('.filter').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
          b.setAttribute('aria-pressed','true');
          document.querySelectorAll('.card').forEach(function(card, i){
            card.style.transitionDelay = (i * 30) + 'ms';
          });
        });
      });
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){ if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); } });
      }, { threshold: 0.12 });
      document.querySelectorAll('[data-reveal]').forEach(function(el){ io.observe(el); });
      var tilt = document.querySelector('[data-tilt]');
      if (tilt && window.matchMedia('(pointer:fine)').matches) {
        tilt.addEventListener('mousemove', function(e){
          var r = tilt.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          tilt.style.transform = 'perspective(900px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg)';
        });
        tilt.addEventListener('mouseleave', function(){ tilt.style.transform = ''; });
      }
      window.addEventListener('scroll', function(){
        var y = window.scrollY;
        var bar = document.querySelector('.kinetic-track');
        if (bar) bar.style.transform = 'translateX(' + (-y * 0.06) + 'px)';
      }, { passive: true });
    })();
  </script>
</body>
</html>`;
}

export function buildBlankPreview(palette: DesignSystem["palette"], title = "Novo projeto"): string {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${escapeHtml(title)}</title>
<style>
  :root{--bg:${palette.bg};--surface:${palette.surface};--ink:${palette.ink};--accent:${palette.accent};--line:${palette.line}}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;padding:32px}
  .card{max-width:560px;border:1px solid var(--line);background:var(--surface);border-radius:20px;padding:40px}
  h1{font-size:32px;letter-spacing:-.03em;margin:0 0 12px}p{opacity:.7;margin:0 0 24px;line-height:1.6}
  a{display:inline-block;background:var(--accent);color:var(--bg);padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}
</style></head>
<body><div class="card"><h1>${escapeHtml(title)}</h1><p>Comece a editar o HTML no painel de código. As mudanças aparecem aqui automaticamente.</p><a href="#">Continuar</a></div></body></html>`;
}
