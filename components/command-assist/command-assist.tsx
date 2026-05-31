"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Command, Mic, ChevronRight } from "lucide-react";

import {
  buildAssistQuickDraft,
  type AssistQuickActionId,
} from "@/lib/clinical/message-templates";
import { createCaseFromQuery } from "@/lib/create-case-return";
import {
  assistContextQuickActions,
  detectAssistZone,
} from "@/lib/clinical/assist-workspace-context";

import { clinicalCommandSheetWidthMd } from "@/lib/clinical-ui";
import { cn } from "@/lib/utils";
import { useAssistCaseOptional } from "./assist-shell";

/** Navigation — nur Seiten öffnen, keine Serveraktion. */
function suggestRoutes(text: string, pathname: string): { label: string; href: string }[] {
  const t = text.toLowerCase();
  const out: { label: string; href: string }[] = [];
  if (/(neuer|neue)\s+fall|fall\s+anlegen|patient.*fall/.test(t)) {
    out.push({
      label: "Neuer Fall",
      href: `/create-case?from=${createCaseFromQuery(pathname)}`,
    });
  }
  if (/inbox|tracker|einsendung|posteingang/.test(t)) {
    out.push({ label: "Posteingang", href: "/inbox" });
  }
  if (/relay|aufgabe|task|empfang/.test(t)) {
    out.push({ label: "Relay", href: "/relay" });
  }
  if (/journal|artikel/.test(t)) {
    out.push({ label: "Journals", href: "/journal" });
  }
  if (/dashboard|atlas/.test(t)) {
    out.push({ label: "Atlas", href: "/dashboard" });
  }
  if (/einstellung|profil|praxis|rolle|admin/.test(t)) {
    out.push({ label: "Einstellungen", href: "/settings" });
  }
  return out.slice(0, 4);
}

function suggestInboxDeepLinks(
  text: string,
  submissionId: string | null
): { label: string; href: string }[] {
  if (!submissionId) return [];
  const t = text.toLowerCase();
  const base = `/inbox/${submissionId}`;
  const out: { label: string; href: string }[] = [];
  if (/(rückfrage|nachricht|korrespondenz|schreiben|entwurf)/.test(t)) {
    out.push({ label: "Rückmeldung (Entwurf)", href: `${base}#tracker-korrespondenz` });
  }
  if (/(termin|einladen|einbestellen|link)/.test(t)) {
    out.push({ label: "Terminlink", href: `${base}#tracker-termin` });
  }
  if (/(dringlich|einschätzung|empfehlung)/.test(t)) {
    out.push({ label: "Einordnung & Schritte", href: `${base}#tracker-empfehlung` });
  }
  return out.slice(0, 3);
}

const INBOX_QUICK: { id: AssistQuickActionId; label: string }[] = [
  { id: "invite_today", label: "Einladung heute (Entwurf)" },
  { id: "pain_followup", label: "Rückfrage Schmerzen (Entwurf)" },
  { id: "appointment_link_text", label: "Terminlink-Text" },
  { id: "polish_placeholder", label: "Formulierung (Entwurf)" },
];

/** Sheet — schwebend, klinisch ruhig, iOS-nah. */
const SHEET =
  "flex max-h-[min(88dvh,920px)] flex-col overflow-hidden rounded-t-[20px] border border-black/[0.07] bg-white/[0.92] shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.6)_inset,0_24px_64px_-32px_rgba(43,111,232,0.12)] backdrop-blur-2xl backdrop-saturate-150 " +
  "md:max-h-[min(82dvh,880px)] md:rounded-2xl md:shadow-[0_20px_60px_-24px_rgba(15,23,42,0.22),0_0_0_1px_rgba(255,255,255,0.55)_inset,0_12px_40px_-20px_rgba(43,111,232,0.1)] " +
  "dark:border-white/[0.08] dark:bg-[rgb(24_26_30/0.94)] dark:shadow-[0_24px_64px_-28px_rgba(0,0,0,0.55)]";

const HEADER_DIVIDER =
  "border-b border-black/[0.05] dark:border-white/[0.06]";

const FAB =
  "pointer-events-auto flex h-12 w-12 touch-manipulation items-center justify-center rounded-2xl border border-black/[0.06] bg-white/[0.82] text-[#2563EB] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08),0_8px_24px_-12px_rgba(43,111,232,0.15),0_0_0_1px_rgba(255,255,255,0.7)_inset] backdrop-blur-xl backdrop-saturate-150 " +
  "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none " +
  "hover:border-[rgba(43,111,232,0.18)] hover:bg-white/[0.92] hover:shadow-[0_4px_14px_-4px_rgba(15,23,42,0.1),0_12px_32px_-16px_rgba(43,111,232,0.18)] " +
  "active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent " +
  "md:h-[52px] md:w-[52px] md:rounded-[14px] " +
  "dark:border-white/[0.1] dark:bg-[rgb(28_30_34/0.88)] dark:text-[#93C5FD] dark:shadow-[0_12px_36px_-20px_rgba(0,0,0,0.45)]";

const ICON_WRAP =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF] text-[#2563EB] ring-1 ring-[rgba(43,111,232,0.1)] " +
  "dark:bg-[rgba(43,111,232,0.15)] dark:text-[#93C5FD] dark:ring-[rgba(59,130,246,0.2)]";

const INPUT_AREA =
  "w-full resize-none rounded-xl border border-black/[0.08] bg-white/[0.96] px-4 py-3.5 text-[15px] leading-relaxed text-[#0F172A] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none placeholder:text-[#94A3B8] " +
  "focus:border-[rgba(43,111,232,0.38)] focus:ring-[3px] focus:ring-[rgba(43,111,232,0.12)] " +
  "dark:border-white/[0.1] dark:bg-[rgb(22_24_28/0.95)] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[rgba(96,165,250,0.4)] dark:focus:ring-[rgba(59,130,246,0.15)]";

const BTN_SECONDARY =
  "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-black/[0.08] bg-[#FAFBFF] px-4 text-[14px] font-medium text-[#334155] " +
  "transition-colors duration-150 hover:border-[rgba(43,111,232,0.22)] hover:bg-[#F4F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.2)] disabled:opacity-50 " +
  "dark:border-white/[0.1] dark:bg-[rgb(24_26_30/0.9)] dark:text-slate-200 dark:hover:bg-[rgb(30_32_38)]";

const HINT_ROW =
  "flex min-h-11 w-full items-center justify-between rounded-xl border border-black/[0.06] bg-white/[0.72] px-4 py-2.5 text-left text-[14px] font-medium text-[#0F172A] " +
  "transition-[border-color,background-color] duration-150 hover:border-[rgba(43,111,232,0.2)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.18)] " +
  "dark:border-white/[0.08] dark:bg-[rgb(22_24_28/0.75)] dark:text-slate-100 dark:hover:border-[rgba(96,165,250,0.25)]";

const CHIP =
  "min-h-9 rounded-lg border border-[#E8ECF2] bg-white px-3 py-1.5 text-left text-[13px] font-medium text-[#475569] transition-colors duration-150 " +
  "hover:border-[rgba(43,111,232,0.28)] hover:bg-[#FAFCFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.2)] " +
  "dark:border-slate-600 dark:bg-[rgb(22_24_28)] dark:text-slate-200 dark:hover:border-[rgba(96,165,250,0.35)]";

function inboxCaseExtraDrafts(patientName: string, concernLine: string | null): { id: string; label: string; text: string }[] {
  const name = patientName.trim() || "Patient";
  return [
    {
      id: "case_summary",
      label: "Interne Stichworte (Entwurf)",
      text:
        `Interne Kurzfassung (nicht zum Versand):\n\n` +
        `Patient: ${name}\n` +
        `Anliegen: ${concernLine?.trim() || "[kurz aus Einsendung]"}\n\n` +
        `Kernpunkte:\n• \n• \n\nEinordnung / nächster Praxisschritt (intern):\n`,
    },
    {
      id: "patient_contact",
      label: "Kontakt-Entwurf",
      text:
        `Sehr geehrte/r ${name},\n\n` +
        `[Inhalt — z. B. Termin, Rückfrage, Einladung]\n\n` +
        `Mit freundlichen Grüßen\nIhr Praxisteam\n\n` +
        `(Manuell prüfen und versenden.)`,
    },
  ];
}

function placeholderForZone(
  zone: ReturnType<typeof detectAssistZone>,
  hasInboxCase: boolean
): string {
  if (hasInboxCase) {
    return "Notiz, Navigation oder Entwurf — nichts wird automatisch versendet";
  }
  switch (zone) {
    case "dashboard":
      return "Befehl — z. B. Überblick, Aufgabe, neuer Fall …";
    case "relay":
      return "Befehl — z. B. Delegation, Priorität …";
    case "journal":
      return "Befehl — z. B. Zusammenfassung, Gliederung …";
    case "settings":
      return "Befehl — z. B. Einstellung, Rollen …";
    case "inbox":
      return "Kurz eingeben — z. B. Triage, Terminvorbereitung (nur Hilfe, kein Versand) …";
    default:
      return "Befehl — Posteingang, Relay, Journals …";
  }
}

export function CommandAssist() {
  const pathname = usePathname();
  const router = useRouter();
  const assistCtx = useAssistCaseOptional();
  const inboxCase =
    assistCtx?.casePayload?.kind === "inbox" ? assistCtx.casePayload : null;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);

  const hidden = pathname.startsWith("/login");

  const zone = detectAssistZone(pathname);

  const draftParams = useMemo(
    () =>
      inboxCase
        ? {
            patientName: inboxCase.patientName || "Patient",
            urgency: (inboxCase.urgency as "today" | "this_week" | "not_urgent") || null,
            practicePhone: inboxCase.practicePhone || "",
            appointmentUrl: inboxCase.appointmentUrl,
          }
        : null,
    [inboxCase]
  );

  const caseExtras = useMemo(() => {
    if (!inboxCase) return [];
    return inboxCaseExtraDrafts(inboxCase.patientName || "Patient", inboxCase.concernLine);
  }, [inboxCase]);

  const applyQuickDraft = useCallback(
    (id: AssistQuickActionId) => {
      if (!draftParams) return;
      setText(buildAssistQuickDraft(id, draftParams));
    },
    [draftParams]
  );

  const contextQuick = useMemo(() => {
    if (inboxCase && draftParams) return [];
    return assistContextQuickActions(zone);
  }, [inboxCase, draftParams, zone]);

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

  /** iOS-/SaaS-like dismiss: außerhalb tippen, Scroll im Hintergrund, Escape. */
  useEffect(() => {
    if (!open) return;

    const insideCommandUi = (n: Node | null) => {
      if (!n) return false;
      if (fabRef.current?.contains(n)) return true;
      if (sheetRef.current?.contains(n)) return true;
      return false;
    };

    const onPointerDownCapture = (e: PointerEvent) => {
      if (insideCommandUi(e.target as Node)) return;
      setOpen(false);
    };

    const onScrollCapture = (e: Event) => {
      const t = e.target;
      if (t === document || t === document.documentElement) {
        setOpen(false);
        return;
      }
      if (t instanceof Node && sheetRef.current?.contains(t)) return;
      setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    document.addEventListener("scroll", onScrollCapture, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
      document.removeEventListener("scroll", onScrollCapture, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (hidden) return null;

  const routeHints = suggestRoutes(text, pathname);
  const deepHints = suggestInboxDeepLinks(text, inboxCase?.submissionId ?? null);
  const hints = [...deepHints, ...routeHints].slice(0, 5);

  const sheetBody = (
    <>
      <div className={`shrink-0 px-5 pb-3 pt-2 md:px-6 md:pb-4 md:pt-5 ${HEADER_DIVIDER}`}>
        <div className="flex justify-center pb-2 md:hidden" aria-hidden>
          <span className="h-1 w-9 rounded-full bg-[#E2E8F0] dark:bg-slate-600" />
        </div>
        <div className="flex items-start gap-3">
          <div className={ICON_WRAP} aria-hidden>
            <Command className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-[15px] font-semibold tracking-tight text-[#0F172A] dark:text-slate-100">
                Command
              </p>
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#94A3B8] dark:text-slate-500">
                Praxis
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748B] dark:text-slate-400">
              Entwurfshilfe, Navigation, Diktat — ausschließlich unter Ihrer Kontrolle, ohne autonome
              Aktionen.{" "}
              <span className="font-medium text-[#475569] dark:text-slate-300">Kein automatischer Versand</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 [-webkit-overflow-scrolling:touch] sm:px-6 sm:py-5">
        <div className="space-y-4">
          {inboxCase && draftParams ? (
            <div className="rounded-xl border border-[rgba(43,111,232,0.12)] bg-[#F4F7FB] px-3.5 py-3.5 dark:border-[rgba(59,130,246,0.2)] dark:bg-[rgba(43,111,232,0.08)]">
              <p className="text-[12px] font-medium text-[#94A3B8] dark:text-slate-500">Aktueller Fall</p>
              <p className="mt-1 truncate text-[15px] font-semibold text-[#0F172A] dark:text-slate-100">
                {inboxCase.patientName || "Patient"}
              </p>
              {inboxCase.concernLine ? (
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[#64748B] dark:text-slate-400">
                  {inboxCase.concernLine}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {INBOX_QUICK.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => applyQuickDraft(q.id)}
                    className={CHIP}
                  >
                    {q.label}
                  </button>
                ))}
                {caseExtras.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setText(q.text)}
                    className={CHIP}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!inboxCase && contextQuick.length > 0 ? (
            <div className="rounded-xl border border-black/[0.06] bg-[#FAFBFF] px-3.5 py-3.5 dark:border-white/[0.08] dark:bg-[rgba(43,111,232,0.06)]">
              <p className="text-[12px] font-medium text-[#94A3B8] dark:text-slate-500">Entwurfsbausteine</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {contextQuick.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setText(q.template)}
                    className={CHIP}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder={placeholderForZone(zone, Boolean(inboxCase && draftParams))}
            className={INPUT_AREA}
          />

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={startDictation} disabled={listening} className={BTN_SECONDARY}>
              <Mic className="h-4 w-4 text-[#2563EB]" strokeWidth={1.75} />
              {listening ? "Hört zu …" : "Diktat"}
            </button>
          </div>

          {hints.length > 0 ? (
            <div className="space-y-2 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8] dark:text-slate-500">
                {deepHints.length > 0 ? "Springen" : "Navigation"}
              </p>
              {hints.map((h) => (
                <button
                  key={h.href + h.label}
                  type="button"
                  onClick={() => {
                    router.push(h.href);
                    setOpen(false);
                  }}
                  className={HINT_ROW}
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#64748B]" strokeWidth={2} aria-hidden />
                    {h.label}
                  </span>
                  <span className="shrink-0 text-[#94A3B8]">→</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[44] transition-[opacity,backdrop-filter] duration-200 ease-out motion-reduce:transition-none",
          open
            ? "bg-slate-950/[0.22] opacity-100 backdrop-blur-[8px] md:bg-slate-950/[0.15] md:backdrop-blur-[6px]"
            : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
        aria-live="polite"
      />

      <div
        ref={sheetRef}
        id="command-assist-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command — Praxis"
        className={cn(
          "fixed z-[45] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          "left-3 right-3 bottom-[max(0.5rem,env(safe-area-inset-bottom,0px))] w-auto max-w-none md:left-auto md:right-8",
          clinicalCommandSheetWidthMd,
          "md:bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))]",
          SHEET,
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0 md:translate-y-3 md:opacity-0"
        )}
      >
        {sheetBody}
      </div>

      <div
        className={cn(
          "fixed z-[46]",
          "bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 md:bottom-8 md:right-8"
        )}
      >
        <button
          ref={fabRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={FAB}
          aria-expanded={open}
          aria-controls="command-assist-panel"
          aria-label={open ? "Command schließen" : "Command öffnen"}
        >
          <Command className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </>
  );
}
