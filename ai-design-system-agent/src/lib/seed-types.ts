import type { PreviewVariant, SkillLevel } from "./types";

/** Compact authoring format for the curated design-system repository. */
export interface SeedSystem {
  /** id */
  i: string;
  /** name */
  n: string;
  /** kind */
  k: "library" | "benchmark" | "patterns";
  /** source */
  s: string;
  /** tagline */
  tg: string;
  /** description */
  d: string;
  tags: string[];
  /** stack */
  st: string[];
  /** palette: bg, surface, ink, accent, accent2 */
  pal: [string, string, string, string, string];
  /** fonts: display, body */
  f: [string, string];
  v: PreviewVariant;
  r: number;
  /** hero headline */
  h: string;
  /** badge / kicker */
  b: string;
  /** principles [title, detail] */
  pr: [string, string][];
  /** skills [name, level, summary, outputs] */
  sk: [string, SkillLevel, string, string][];
}

export type SeedCategory = {
  id: string;
  name: string;
  short: string;
  description: string;
  accent: string;
  keywords: string[];
  cta: string;
  systems: SeedSystem[];
};
