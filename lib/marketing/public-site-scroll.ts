/** Desktop breakpoint — matches .yd-clinical-desktop-only visibility. */
export const PUBLIC_SITE_DESKTOP_MQ = "(min-width: 900px)";

import { PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";

/** Legacy-Hashes und Nav-Keys → kanonische Section-IDs */
const SECTION_ID_ALIASES: Record<string, string> = {
  preise: PUBLIC_SITE_SECTIONS.pricing,
  pakete: PUBLIC_SITE_SECTIONS.pricing,
  pricing: PUBLIC_SITE_SECTIONS.pricing,
  demo: PUBLIC_SITE_SECTIONS.demo,
  problem: PUBLIC_SITE_SECTIONS.praxisalltag,
  praxisalltag: PUBLIC_SITE_SECTIONS.praxisalltag,
  patienten: PUBLIC_SITE_SECTIONS.patienten,
  perspektive: PUBLIC_SITE_SECTIONS.patienten,
  team: PUBLIC_SITE_SECTIONS.team,
  loesung: PUBLIC_SITE_SECTIONS.loesung,
  ablauf: PUBLIC_SITE_SECTIONS.loesung,
  nutzen: PUBLIC_SITE_SECTIONS.loesung,
  funktionen: PUBLIC_SITE_SECTIONS.plattform,
  command: PUBLIC_SITE_SECTIONS.plattform,
  "command-ai": PUBLIC_SITE_SECTIONS.plattform,
  plattform: PUBLIC_SITE_SECTIONS.plattform,
  "fuer-wen": PUBLIC_SITE_SECTIONS.demo,
  "fuer-praxen": PUBLIC_SITE_SECTIONS.demo,
  einfuehrung: PUBLIC_SITE_SECTIONS.demo,
};

/** Mobile — fehlende Sektionen auf sinnvolle Ziele mappen */
const SECTION_SCROLL_FALLBACKS: Record<string, string> = {
  [PUBLIC_SITE_SECTIONS.patienten]: PUBLIC_SITE_SECTIONS.praxisalltag,
  [PUBLIC_SITE_SECTIONS.team]: PUBLIC_SITE_SECTIONS.praxisalltag,
  [PUBLIC_SITE_SECTIONS.loesung]: PUBLIC_SITE_SECTIONS.praxisalltag,
  [PUBLIC_SITE_SECTIONS.plattform]: PUBLIC_SITE_SECTIONS.praxisalltag,
};

function isDesktopPublicSite(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(PUBLIC_SITE_DESKTOP_MQ).matches;
}

function getPublicSiteScope(): ParentNode {
  if (typeof document === "undefined") return document;
  const homeSelector = isDesktopPublicSite()
    ? ".yd-clinical-desktop-only"
    : ".yd-public-site-mobile-page";
  const homeScope = document.querySelector(homeSelector);
  if (homeScope) return homeScope;
  const clinicalPage = document.querySelector(".yd-clinical-page");
  if (clinicalPage) return clinicalPage;
  return document;
}

export function getPublicSiteScrollRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const osScroll = document.querySelector<HTMLElement>(".yd-public-os--scroll");
  if (osScroll) return osScroll;
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

function getHeaderOffset(): number {
  if (typeof document === "undefined") return 68;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--yd-public-header-h");
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 68;
}

export function normalizePublicSectionId(sectionId: string): string {
  const id = sectionId.replace(/^#/, "").trim();
  return SECTION_ID_ALIASES[id] ?? id;
}

function findSectionInScope(scope: ParentNode, sectionId: string): HTMLElement | null {
  const normalized = normalizePublicSectionId(sectionId);
  if (scope === document) {
    return document.getElementById(normalized);
  }
  const el = scope.querySelector<HTMLElement>(`#${CSS.escape(normalized)}`);
  if (el) return el;

  const fallback = SECTION_SCROLL_FALLBACKS[normalized];
  if (!fallback) return null;
  return scope.querySelector<HTMLElement>(`#${CSS.escape(fallback)}`);
}

export function resolvePublicSectionElement(sectionId: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const scope = getPublicSiteScope();
  return findSectionInScope(scope, sectionId);
}

function scrollElementIntoView(el: HTMLElement): void {
  const scrollRoot = getPublicSiteScrollRoot();
  const headerOffset = getHeaderOffset();
  const extraGap = 12;

  if (
    !scrollRoot ||
    scrollRoot === document.documentElement ||
    scrollRoot === document.body
  ) {
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset - extraGap;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  } else {
    const rootRect = scrollRoot.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const top =
      scrollRoot.scrollTop + (elRect.top - rootRect.top) - headerOffset - extraGap;
    scrollRoot.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }
}

export function scrollToPublicSection(sectionId: string, onDone?: () => void): boolean {
  const normalized = normalizePublicSectionId(sectionId);
  const el = resolvePublicSectionElement(sectionId);
  if (!el) return false;

  scrollElementIntoView(el);

  if (typeof window !== "undefined" && window.location.hash !== `#${normalized}`) {
    const url = `${window.location.pathname}${window.location.search}#${normalized}`;
    window.history.replaceState(null, "", url);
  }

  onDone?.();
  return true;
}

/** Initial load: /#funktionen etc. */
export function scrollToPublicSectionFromHash(hash?: string): boolean {
  const raw = (hash ?? (typeof window !== "undefined" ? window.location.hash : ""))
    .replace(/^#/, "")
    .trim();
  if (!raw) return false;
  return scrollToPublicSection(normalizePublicSectionId(raw));
}

/** Von anderer Route: Preise/Demo auf der Landing. */
export function publicSectionHref(sectionId: string): string {
  const id = normalizePublicSectionId(sectionId);
  if (typeof window !== "undefined" && window.location.pathname === "/") {
    return `#${id}`;
  }
  return `/#${id}`;
}
