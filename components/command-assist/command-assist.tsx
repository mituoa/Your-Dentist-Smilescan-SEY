"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronUp, Mic, Sparkles } from "lucide-react";

/** Minimal intent routing — no backend AI; physician stays in control. */
function suggestRoutes(text: string): { label: string; href: string }[] {
  const t = text.toLowerCase();
  const out: { label: string; href: string }[] = [];
  if (/(neuer|neue)\s+fall|fall\s+anlegen|patient.*fall/.test(t)) {
    out.push({ label: "Neuer Fall", href: "/create-case" });
  }
  if (/inbox|tracker|einsendung|posteingang/.test(t)) {
    out.push({ label: "Tracker", href: "/inbox" });
  }
  if (/relay|aufgabe|task/.test(t)) {
    out.push({ label: "Relay", href: "/relay" });
  }
  if (/journal|artikel/.test(t)) {
    out.push({ label: "Journals", href: "/journal" });
  }
  if (/dashboard|atlas/.test(t)) {
    out.push({ label: "Atlas", href: "/dashboard" });
  }
  return out.slice(0, 4);
}

export function CommandAssist() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);

  const hidden =
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login");

  const startDictation = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        start: () => void;
        stop: () => void;
        onresult: ((ev: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        start: () => void;
        stop: () => void;
        onresult: ((ev: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
      };
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "de-DE";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (ev) => {
      const chunk = ev.results[0]?.[0]?.transcript;
      if (chunk) setText((prev) => (prev ? `${prev.trim()} ${chunk}` : chunk));
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
    setListening(true);
    r.start();
  }, []);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  if (hidden) return null;

  const hints = suggestRoutes(text);

  return (
    <div
      className="pointer-events-none fixed bottom-0 right-0 z-[45] flex flex-col items-end gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6"
      aria-live="polite"
    >
      <div
        id="command-assist-panel"
        className={`pointer-events-auto max-w-[min(100vw-2rem,380px)] overflow-hidden rounded-xl border border-border/90 bg-surface-card/95 shadow-sm backdrop-blur-md transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none dark:border-border/60 dark:shadow-[0_1px_0_rgb(255_255_255/0.04)] ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        <div className="border-b border-border/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
            ⌘ Assist
          </p>
          <p className="mt-1 text-[13px] leading-snug text-text-secondary">
            Befehle oder Diktat — Vorschläge öffnen nur Seiten.{" "}
            <span className="font-medium text-text-primary">Keine automatische Aktion.</span>
          </p>
        </div>
        <div className="p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="z. B. „Neuer Fall“ oder „Relay Aufgabe“…"
            className="mb-2 w-full resize-none rounded-lg border border-border bg-surface-card px-3 py-2.5 text-[14px] text-text-primary shadow-sm outline-none placeholder:text-text-tertiary focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startDictation}
              disabled={listening}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-surface-page px-3 text-[13px] font-medium text-text-secondary transition hover:bg-surface-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-50"
            >
              <Mic className="h-4 w-4" strokeWidth={1.75} />
              {listening ? "Hört zu…" : "Diktat"}
            </button>
          </div>
          {hints.length > 0 ? (
            <div className="mt-3 space-y-1.5 border-t border-border/80 pt-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Vorschläge
              </p>
              {hints.map((h) => (
                <button
                  key={h.href + h.label}
                  type="button"
                  onClick={() => {
                    router.push(h.href);
                    setOpen(false);
                  }}
                  className="flex w-full min-h-10 items-center justify-between rounded-lg border border-border/80 bg-surface-page/90 px-3 py-2 text-left text-[13px] font-medium text-text-primary transition hover:border-brand/30 hover:bg-surface-card"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-brand" strokeWidth={1.75} />
                    {h.label}
                  </span>
                  <span className="text-text-tertiary">→</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex min-h-12 items-center gap-2 rounded-full border border-border/90 bg-surface-card/95 px-4 py-2.5 text-[13px] font-semibold text-text-primary shadow-sm backdrop-blur-md transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
        aria-expanded={open}
        aria-controls="command-assist-panel"
      >
        <span className="text-text-tertiary">⌘</span>
        Assist
        <ChevronUp
          className={`h-4 w-4 text-text-tertiary transition-transform duration-200 ${open ? "" : "rotate-180"}`}
        />
      </button>
    </div>
  );
}
