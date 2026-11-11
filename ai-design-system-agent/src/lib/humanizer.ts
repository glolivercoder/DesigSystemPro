/**
 * Humanizer Engine
 * Based on blader/humanizer (v4.0.0)
 * Eliminates artificial AI writing tells, cliches, dramatic fragments,
 * inflated claims, and returns authentic human prose.
 */

export interface HumanizeOptions {
  tone?: "conversational" | "editorial" | "direct" | "technical";
  industry?: string;
  brandName?: string;
}

// Common AI tells and cliches that sound like synthetic output
const AI_CLICHE_WORDS = [
  /\bdelve(?:\s+into)?\b/gi,
  /\ba testament to\b/gi,
  /\btapestry of\b/gi,
  /\bseamlessly\b/gi,
  /\bgame-?changer\b/gi,
  /\belevate\b/gi,
  /\brevolutionize\b/gi,
  /\bunleash\b/gi,
  /\bmeticulously\b/gi,
  /\bbeacon of\b/gi,
  /\bpivotal role\b/gi,
  /\blandscape\b/gi,
  /\bcornerstone\b/gi,
  /\bfoster(?:ing)?\b/gi,
  /\bharness(?:ing)?\b/gi,
  /\bembark(?:\s+on)?\b/gi,
  /\bplethora\b/gi,
  /\bmyriad\b/gi,
  /\bparamount\b/gi,
  /\bintertwined\b/gi,
  /\bvibrant\b/gi,
];

// Common empty dramatic closers
const AI_EMPTY_CLOSERS = [
  /\bthat is the real win\.?\b/gi,
  /\blet that sink in\.?\b/gi,
  /\bread that again\.?\b/gi,
  /\bthat distinction matters\.?\b/gi,
  /\band it shows\.?\b/gi,
  /\bthe future is here\.?\b/gi,
  /\bneedless to say,?\b/gi,
  /\bin conclusion,?\b/gi,
  /\bit goes without saying that\b/gi,
];

// Conversational replacement mapping
const REPLACEMENTS: [RegExp, string][] = [
  [/\bnot only ([^,]+), but also ([^.]+)\./gi, "$1 e $2."],
  [/\bnão apenas ([^,]+), mas também ([^.]+)\./gi, "$1 e $2."],
  [/\bé mais do que apenas ([^,]+), é ([^.]+)\./gi, "É $2, com foco em $1."],
  [/\bmergulhe de cabeça no\b/gi, "conheça o"],
  [/\bum divisor de águas\b/gi, "um passo importante"],
  [/\beleve sua experiência\b/gi, "melhore seu dia a dia"],
  [/\brevolucione seu\b/gi, "simplifique seu"],
  [/\bmeticulosamente desenhado\b/gi, "feito com atenção a cada detalhe"],
  [/\bperfeitamente integrado\b/gi, "pronto para usar"],
  [/\btestemunho da excelência\b/gi, "resultado de anos de experiência"],
  [/\btrajetória marcante\b/gi, "trabalho consistente"],
];

export function humanizeText(text: string, options: HumanizeOptions = {}): {
  original: string;
  humanized: string;
  changesCount: number;
  flags: string[];
} {
  let result = text;
  const flags: string[] = [];
  let changes = 0;

  // 1. Detect and strip AI empty closers (§2 of humanizer)
  for (const regex of AI_EMPTY_CLOSERS) {
    if (regex.test(result)) {
      flags.push("Fechamento dramático artificial removido (§2)");
      result = result.replace(regex, "");
      changes++;
    }
  }

  // 2. Remove em-dash storms (—) replacing with natural commas or periods (§8)
  const emDashCount = (result.match(/—/g) || []).length;
  if (emDashCount >= 2) {
    flags.push(`Excesso de travessões (${emDashCount} encontrados) normalizado (§8)`);
    result = result.replace(/\s*—\s*/g, ", ");
    changes++;
  }

  // 3. Replace cliche vocabulary (§14)
  for (const [pattern, replacement] of REPLACEMENTS) {
    if (pattern.test(result)) {
      flags.push(`Padrão artificial '${pattern.source.slice(0, 25)}…' corrigido para tom natural`);
      result = result.replace(pattern, replacement);
      changes++;
    }
  }

  // 4. Tone adjustments
  if (options.tone === "direct") {
    // Cut verbose filler
    result = result
      .replace(/Gostaríamos de convidar você a/gi, "Venha")
      .replace(/Temos o prazer de anunciar/gi, "Chegou")
      .replace(/Com o objetivo de proporcionar/gi, "Para garantir");
  } else if (options.tone === "editorial") {
    // Elevate cadence without AI puffery
    result = result
      .replace(/MUITO BOM/gi, "Impecável")
      .replace(/compre agora/gi, "conheça a coleção")
      .replace(/clique aqui/gi, "descubra os detalhes");
  }

  // Clean double spaces and punctuation gaps
  result = result
    .replace(/\s{2,}/g, " ")
    .replace(/ ,/g, ",")
    .replace(/ \./g, ".")
    .trim();

  return {
    original: text,
    humanized: result,
    changesCount: changes,
    flags: flags.length > 0 ? flags : ["Texto conciso e autêntico; sem vícios de IA detectados."],
  };
}

/** Humanizes an entire Social/Creative payload (Headline, Body, CTA) */
export function humanizeCreativeCopy(copy: {
  headline: string;
  subheadline: string;
  caption: string;
  cta: string;
}, options: HumanizeOptions = {}) {
  const h = humanizeText(copy.headline, options);
  const s = humanizeText(copy.subheadline, options);
  const c = humanizeText(copy.caption, options);
  const a = humanizeText(copy.cta, { ...options, tone: "direct" });

  return {
    headline: h.humanized,
    subheadline: s.humanized,
    caption: c.humanized,
    cta: a.humanized,
    totalFlags: [...h.flags, ...s.flags, ...c.flags],
    changesCount: h.changesCount + s.changesCount + c.changesCount,
  };
}

