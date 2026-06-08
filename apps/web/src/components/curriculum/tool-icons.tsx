import type { ReactNode } from "react";

/**
 * Icon resolution for curriculum tool pills.
 *
 * - Real brands resolve to their official colored logo via Google's favicon
 *   service (works for every brand, including ones missing from icon sets such
 *   as Naukri / Internshala / Midjourney).
 * - Concept "tools" that have no real logo (e.g. GD, Chain-of-Thought) use the
 *   colored glyph icons ported from the reference curriculum design.
 */

export type ToolIcon =
  | { kind: "logo"; src: string }
  | { kind: "glyph"; bg: string; viewBox: string; node: ReactNode };

/** Lowercased tool name → official domain used for the colored logo. */
const BRAND_DOMAINS: Record<string, string> = {
  chatgpt: "openai.com",
  "dall-e": "openai.com",
  "claude ai": "claude.ai",
  claude: "claude.ai",
  gemini: "gemini.google.com",
  "linkedin setup": "linkedin.com",
  linkedin: "linkedin.com",
  "microsoft excel": "microsoft.com",
  excel: "microsoft.com",
  "python basics": "python.org",
  python: "python.org",
  sql: "postgresql.org",
  postgresql: "postgresql.org",
  bigquery: "cloud.google.com",
  "power bi": "powerbi.microsoft.com",
  canva: "canva.com",
  "adobe express": "adobe.com",
  midjourney: "midjourney.com",
  "make.com": "make.com",
  zapier: "zapier.com",
  "notion ai": "notion.so",
  notion: "notion.so",
  miro: "miro.com",
  "google slides": "slides.google.com",
  "teal hq": "tealhq.com",
  naukri: "naukri.com",
  internshala: "internshala.com",
};

const STAR = <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" />;

/** Lowercased tool name → colored glyph (for tools with no real logo). */
const GLYPHS: Record<string, { bg: string; viewBox: string; node: ReactNode }> = {
  "prompt design": {
    bg: "#7d2ae8",
    viewBox: "0 0 24 24",
    node: (
      <>
        <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 4v-4H5a2 2 0 01-2-2z" />
        <path d="M12 6l1 2.5L15.5 9 13 10l-1 2.5L11 10 8.5 9 11 8.5z" fill="#7d2ae8" />
      </>
    ),
  },
  "chain-of-thought": {
    bg: "#4f46e5",
    viewBox: "0 0 24 24",
    node: (
      <path
        d="M9 7H7a5 5 0 000 10h2M15 7h2a5 5 0 010 10h-2M8 12h8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    ),
  },
  "few-shot": {
    bg: "#0d9488",
    viewBox: "0 0 24 24",
    node: (
      <path
        d="M12 3l9 5-9 5-9-5zm-9 9l9 5 9-5m-18 4l9 5 9-5"
        stroke="white"
        strokeWidth="1.7"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  "power query": {
    bg: "#217346",
    viewBox: "0 0 24 24",
    node: <path d="M3 4h18l-7 8v7l-4 2v-9z" />,
  },
  "ai formulas": {
    bg: "#217346",
    viewBox: "0 0 24 24",
    node: (
      <path d="M15 3h-3a3 3 0 00-3 3v3H6v3h3v9h3v-9h3V9h-3V6.5a.5.5 0 01.5-.5H15z" />
    ),
  },
  dax: {
    bg: "#b8860b",
    viewBox: "0 0 24 24",
    node: <path d="M6 4h12v3l-7 5 7 5v3H6v-3h8l-6-5 6-5H6z" />,
  },
  "case study method": {
    bg: "#1e5fa8",
    viewBox: "0 0 24 24",
    node: (
      <path d="M4 2h14a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h14V4H4zm2 3h10v2H6V7zm0 4h10v2H6v-2zm0 4h7v2H6v-2z" />
    ),
  },
  "jam — just a minute": {
    bg: "#e8a020",
    viewBox: "0 0 24 24",
    node: <path d="M14 4h4v12c0 3.3-2.7 6-6 6S6 19.3 6 16h4c0 1.1.9 2 2 2s2-.9 2-2V4z" />,
  },
  "picture presentation": {
    bg: "#e83a6f",
    viewBox: "0 0 24 24",
    node: (
      <>
        <rect x="2" y="3" width="20" height="15" rx="2" />
        <path d="M7 14l3-4 3 4 2-2 3 3H4z" fill="#e83a6f" />
        <circle cx="8" cy="8" r="1.5" fill="#e83a6f" />
      </>
    ),
  },
  bootcamp: { bg: "#7d2ae8", viewBox: "0 0 24 24", node: STAR },
  "interview ai": {
    bg: "#1e5fa8",
    viewBox: "0 0 24 24",
    node: (
      <>
        <rect x="3" y="5" width="18" height="13" rx="3" />
        <path d="M8 22l4-4 4 4H8z" />
      </>
    ),
  },
  "j5m — just 5 minutes": { bg: "#e8a020", viewBox: "0 0 24 24", node: STAR },
  gd: {
    bg: "#10c97a",
    viewBox: "0 0 24 24",
    node: (
      <>
        <circle cx="9" cy="7" r="3" />
        <circle cx="17" cy="8" r="2.5" />
        <path d="M2 20c0-4 3-6 7-6s7 2 7 6" />
        <path d="M17 13c2.5 0 5 1.5 5 5" stroke="white" strokeWidth="1.5" fill="none" />
      </>
    ),
  },
  "project pipeline": {
    bg: "#1e88e5",
    viewBox: "0 0 28 24",
    node: (
      <>
        <rect x="1" y="8" width="6" height="8" rx="2" />
        <rect x="11" y="5" width="6" height="14" rx="2" />
        <rect x="21" y="2" width="6" height="20" rx="2" />
        <line x1="7" y1="12" x2="11" y2="12" stroke="white" strokeWidth="2" />
        <line x1="17" y1="12" x2="21" y2="12" stroke="white" strokeWidth="2" />
      </>
    ),
  },
  "portfolio showcase": {
    bg: "#e8a020",
    viewBox: "0 0 24 24",
    node: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" fill="none" stroke="white" strokeWidth="2" />
        <path d="M12 11v6M9 14h6" stroke="#e8a020" strokeWidth="2" fill="none" />
      </>
    ),
  },
};

function badgeGlyph(name: string): { bg: string; viewBox: string; node: ReactNode } {
  const letter = (name.match(/[A-Za-z0-9]/)?.[0] ?? "•").toUpperCase();
  return {
    bg: "#475569",
    viewBox: "0 0 24 24",
    node: (
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fill="white"
        fontFamily="sans-serif"
      >
        {letter}
      </text>
    ),
  };
}

export function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function resolveToolIcon(name: string): ToolIcon {
  const key = name.trim().toLowerCase();
  const domain = BRAND_DOMAINS[key];
  if (domain) return { kind: "logo", src: faviconUrl(domain) };
  const glyph = GLYPHS[key] ?? badgeGlyph(name);
  return { kind: "glyph", ...glyph };
}
