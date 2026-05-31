/** Desktop breakpoint — matches .yd-clinical-desktop-only visibility. */
export const PUBLIC_SITE_DESKTOP_MQ = "(min-width: 900px)";

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

/** Hash-Aliase: /#preise → pricing */
export function normalizePublicSectionId(sectionId: string): string {
  const id = sectionId.replace(/^#/, "").trim();
  if (id === "preise" || id === "pakete") return "pricing";
  return id;
}

export function resolvePublicSectionElement(sectionId: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const normalized = normalizePublicSectionId(sectionId);
  const scope = getPublicSiteScope();
  if (scope === document) {
    return document.getElementById(normalized);
  }
  return scope.querySelector<HTMLElement>(`#${CSS.escape(normalized)}`);
}

export function scrollToPublicSection(sectionId: string, onDone?: () => void): boolean {
  const normalized = normalizePublicSectionId(sectionId);
  const el = resolvePublicSectionElement(normalized);
  if (!el) return false;

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

  if (typeof window !== "undefined" && window.location.hash !== `#${normalized}`) {
    const url = `${window.location.pathname}${window.location.search}#${normalized}`;
    window.history.replaceState(null, "", url);
  }

  onDone?.();
  return true;
}

/** Initial load: /#nutzen etc. */
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
