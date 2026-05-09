"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, Command, Mic, Sparkles } from "lucide-react";

import {
  buildAssistQuickDraft,
  type AssistQuickActionId,
} from "@/lib/clinical/message-templates";
import {
  assistContextQuickActions,
  detectAssistZone,
} from "@/lib/clinical/assist-workspace-context";

import { useAssistCaseOptional } from "./assist-shell";

/** Navigation — nur Seiten öffnen, keine Serveraktion. */
function suggestRoutes(text: string): { label: string; href: string }[] {
  const t = text.toLowerCase();
  const out: { label: string; href: string }[] = [];
  if (/(neuer|neue)\s+fall|fall\s+anlegen|patient.*fall/.test(t)) {
    out.push({ label: "Neuer Fall", href: "/create-case" });
  }
  if (/inbox|tracker|einsendung|posteingang/.test(t)) {
    out.push({ label: "Tracker", href: "/inbox" });
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
    out.push({ label: "Nachrichtentwurf", href: `${base}#tracker-korrespondenz` });
  }
  if (/(termin|einladen|einbestellen|link)/.test(t)) {
    out.push({ label: "Terminlink", href: `${base}#tracker-termin` });
  }
  if (/(dringlich|einschätzung|empfehlung)/.test(t)) {
    out.push({ label: "Empfohlene Aktion", href: `${base}#tracker-empfehlung` });
  }
  return out.slice(0, 3);
}

const INBOX_QUICK: { id: AssistQuickActionId; label: string }[] = [
  { id: "invite_today", label: "Heute einbestellen" },
  { id: "pain_followup", label: "Rückfrage Schmerzen" },
  { id: "appointment_link_text", label: "Terminlink-Text" },
  { id: "polish_placeholder", label: "Formulierung prüfen" },
];

/** Systemweite Dock-Position: identisch auf allen Routen (Desktop unten rechts). */
const DOCK_OUTER =
  "pointer-events-none fixed z-[45] flex w-full flex-col gap-2 " +
  "bottom-0 right-0 items-stretch px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-0 " +
  "lg:bottom-8 lg:right-8 lg:w-auto lg:items-end lg:self-end lg:px-8 lg:pb-8 lg:pt-0";

const DOCK_INNER = "pointer-events-auto flex w-full flex-col gap-2 lg:w-[min(100vw-2rem,520px)] lg:items-end";

/** Panel — weiche Elevation, ruhige Radien, Glass. */
const PANEL =
  "rounded-[20px] border border-black/[0.06] bg-white/[0.88] shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25),0_4px_14px_-6px_rgba(43,111,232,0.12)] backdrop-blur-2xl backdrop-saturate-150 " +
  "dark:border-white/[0.08] dark:bg-[rgb(24_26_30/0.92)] dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.55)]";

const HEADER_DIVIDER =
  "border-b border-black/[0.05] dark:border-white/[0.06]";

/** Konstante Bar-Höhe, Raycast/Linear-artig. */
const COMMAND_BAR =
  "group/command-bar pointer-events-auto flex h-12 w-full shrink-0 items-center justify-between gap-3 rounded-xl border border-black/[0.07] bg-white/[0.78] px-3.5 " +
  "shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_10px_38px_-22px_rgba(15,23,42,0.18),0_2px_8px_-4px_rgba(43,111,232,0.06)] backdrop-blur-xl backdrop-saturate-150 " +
  "transition-[border-color,box-shadow,background-color,color] duration-200 ease-out " +
  "hover:border-[rgba(43,111,232,0.22)] hover:bg-white/[0.92] hover:shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_14px_44px_-20px_rgba(43,111,232,0.14),0_4px_12px_-4px_rgba(15,23,42,0.08)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent " +
  "dark:border-white/[0.1] dark:bg-[rgb(28_30_34/0.88)] dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.45)] dark:hover:border-[rgba(96,165,250,0.28)] dark:hover:bg-[rgb(32_34_40/0.92)]";

const ICON_WRAP =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF6FF] text-[#2563EB] ring-1 ring-[rgba(43,111,232,0.12)] " +
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
      label: "Fall zusammenfassen",
      text:
        `Interne Kurzfassung (nicht zum Versand):\n\n` +
        `Patient: ${name}\n` +
        `Anliegen: ${concernLine?.trim() || "[kurz aus Einsendung]"}\n\n` +
        `Kernpunkte:\n• \n• \n\nEmpfehlung / nächster Schritt:\n`,
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
  if (hasInboxCase) return "Befehl oder Diktat — z. B. Rückfrage, Terminlogik …";
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
      return "Befehl — z. B. Triage, Terminvorbereitung …";
    default:
      return "Befehl — Tracker, Relay, Journals …";
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

  if (hidden) return null;

  const routeHints = suggestRoutes(text);
  const deepHints = suggestInboxDeepLinks(text, inboxCase?.submissionId ?? null);
  const hints = [...deepHints, ...routeHints].slice(0, 5);

  return (
    <div className={DOCK_OUTER} aria-live="polite">
      <div className={DOCK_INNER}>
        <div
          id="command-assist-panel"
          className={`overflow-hidden transition-[opacity,transform,max-height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${PANEL} ${
            open
              ? "max-h-[min(85vh,920px)] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 translate-y-1 opacity-0"
          }`}
        >
          <div className={`px-5 py-4 sm:px-6 sm:py-5 ${HEADER_DIVIDER}`}>
            <div className="flex items-start gap-3.5">
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
                  Klinische Kommandoebene — Entwürfe, Navigation, Diktat. Nur zur Prüfung,{" "}
                  <span className="font-medium text-[#475569] dark:text-slate-300">kein automatischer Versand</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
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
                <p className="text-[12px] font-medium text-[#94A3B8] dark:text-slate-500">Schnellaktionen</p>
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
                  {deepHints.length > 0 ? "Aktion & Navigation" : "Navigation"}
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
                      <Sparkles className="h-4 w-4 shrink-0 text-[#2563EB]" strokeWidth={1.75} />
                      {h.label}
                    </span>
                    <span className="shrink-0 text-[#94A3B8]">→</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={COMMAND_BAR}
          aria-expanded={open}
          aria-controls="command-assist-panel"
          aria-label={open ? "Command schließen" : "Command öffnen"}
        >
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <span className={ICON_WRAP}>
              <Command className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[14px] font-semibold tracking-tight text-[#0F172A] dark:text-slate-100">
                Command
              </span>
              <span className="block truncate text-[11px] font-medium leading-tight text-[#64748B] dark:text-slate-400">
                {open ? "Eingeben oder wählen" : "Klinische Kommandoebene"}
              </span>
            </span>
          </span>
          <ChevronUp
            className={`h-4 w-4 shrink-0 text-[#94A3B8] transition-transform duration-300 ease-out dark:text-slate-500 ${open ? "" : "rotate-180"}`}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
