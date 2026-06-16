/** Desktop breakpoint — matches .yd-clinical-desktop-only visibility. */
export const PUBLIC_SITE_DESKTOP_MQ = "(min-width: 900px)";

/** Legacy-Hashes und Nav-Keys → kanonische Bento-Section-IDs */
const SECTION_ID_ALIASES: Record<string, string> = {
  preise: "demo",
  pakete: "demo",
  pricing: "demo",
  demo: "demo",
  hero: "hero",
  plattform: "plattform",
  journey: "journey",
  heilung: "heilung",
  command: "command",
  "command-ai": "command",
  automation: "automation",
  services: "services",
  warum: "warum",
  faq: "faq",
  problem: "warum",
  praxisalltag: "warum",
  patienten: "journey",
  perspektive: "journey",
  team: "relay",
  loesung: "plattform",
  ablauf: "journey",
  nutzen: "plattform",
  funktionen: "plattform",
  "fuer-wen": "demo",
  "fuer-praxen": "demo",
  einfuehrung: "demo",
};

/** Mobile — fehlende Sektionen auf sinnvolle Ziele mappen */
const SECTION_SCROLL_FALLBACKS: Record<string, string> = {};

function isDesktopPublicSite(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(PUBLIC_SITE_DESKTOP_MQ).matches;
}

function getPublicSiteScope(): ParentNode {
  if (typeof document === "undefined") return document;
  const homeSelector = isDesktopPublicSite()
    ? ".yd-bento-page, .yd-clinical-desktop-only"
    : ".yd-bento-page, .yd-public-site-mobile-page";
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
