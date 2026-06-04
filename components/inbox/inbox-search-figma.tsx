"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";

import {
  inboxSearchQueryFromParam,
  shouldStripInboxSearchParamFromUrl,
} from "@/lib/inbox-search-q";

interface InboxSearchFigmaProps {
  /** z. B. `/inbox-preview` — öffentliche Mock-Vorschau ohne Session; sonst `/inbox` (geschützt). */
  routeBase?: string;
  /** Eingabe-Platzhalter; Standard „Suchen…“. */
  inputPlaceholder?: string;
  /** `aria-label` für das Suchfeld; Standard „Einsendungen durchsuchen“. */
  searchAriaLabel?: string;
  /**
   * Wenn die Einsendungsliste serverseitig fehlgeschlagen ist: Eingabe deaktivieren, damit keine
   * Such-/URL-Aktion suggeriert wird, die die Liste nicht wiederherstellen würde.
   */
  listUnavailable?: boolean;
}

const SEARCH_REPLACE_DEBOUNCE_MS = 220;

function buildReplaceTarget(routeBase: string, pathname: string): string {
  const onInboxCase = routeBase === "/inbox" && /^\/inbox\/[^/]+$/.test(pathname);
  return onInboxCase ? pathname : routeBase;
}

export function InboxSearchFigma({
  routeBase = "/inbox",
  inputPlaceholder,
  searchAriaLabel,
  listUnavailable = false,
}: InboxSearchFigmaProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchParamsSnapshotRef = useRef(searchParams.toString());

  useEffect(() => {
    searchParamsSnapshotRef.current = searchParams.toString();
  }, [searchParams]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef("");

  const qRaw = searchParams.get("q");
  const qFromUrl = inboxSearchQueryFromParam(qRaw ?? undefined);
  const [value, setValue] = useState(qFromUrl);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL -> lokales Eingabefeld
    setValue(qFromUrl);
  }, [qFromUrl]);

  /** Entfernt bedeutungsloses `q` aus der URL (Reload / manuelle Links). */
  useEffect(() => {
    if (qRaw === null) return;
    if (!shouldStripInboxSearchParamFromUrl(qRaw)) return;

    startTransition(() => {
      const params = new URLSearchParams(searchParamsSnapshotRef.current);
      params.delete("q");
      const qs = params.toString();
      const base = buildReplaceTarget(routeBase, pathname);
      router.replace(qs ? `${base}?${qs}` : base);
    });
  }, [pathname, qRaw, routeBase, router, startTransition]);

  useEffect(
    () => () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    },
    []
  );

  const flushUrl = (next: string) => {
    const params = new URLSearchParams(searchParamsSnapshotRef.current);
    const trimmed = next.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    const qs = params.toString();
    const base = buildReplaceTarget(routeBase, pathname);
    router.replace(qs ? `${base}?${qs}` : base);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (listUnavailable) return;
    const next = e.target.value;
    pendingValueRef.current = next;
    setValue(next);

    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!next.trim()) {
      startTransition(() => flushUrl(next));
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      startTransition(() => flushUrl(pendingValueRef.current));
    }, SEARCH_REPLACE_DEBOUNCE_MS);
  };

  const flushPendingSearchToUrl = () => {
    if (debounceTimerRef.current === null) return;
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = null;
    startTransition(() => flushUrl(pendingValueRef.current));
  };

  return (
    <div className="relative min-w-0">
      <Search
        className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2"
        style={{ color: "#94A3B8" }}
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        disabled={listUnavailable}
        placeholder={
          listUnavailable
            ? "Suche nicht verfügbar"
            : (inputPlaceholder?.trim() || "Suchen...")
        }
        aria-label={searchAriaLabel?.trim() || "Einsendungen durchsuchen"}
        title={listUnavailable ? "Liste derzeit nicht verfügbar — bitte Seite erneut öffnen." : undefined}
        className="h-11 w-full touch-manipulation bg-white text-[15px] focus:outline-none placeholder:text-gray-400 md:h-10 md:text-[14px]"
        style={{
          paddingLeft: "36px",
          paddingRight: "12px",
          borderRadius: "9999px",
          border: "1px solid #E2E8F0",
          color: "#0F172A",
          transition: "all 150ms ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#1A4F9C";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#E5E7EB";
          e.currentTarget.style.boxShadow = "none";
          if (!listUnavailable) flushPendingSearchToUrl();
        }}
      />
    </div>
  );
}
