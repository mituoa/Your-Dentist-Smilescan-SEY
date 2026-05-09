"use client";

import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, Mic, Sparkles, Stethoscope } from "lucide-react";

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
  if (/relay|aufgabe|task|empfang|assistenz/.test(t)) {
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

/** Einheitliches Medical-Blue-Chrome (Primary #2B6FE8 / #2F80ED-Familie). */
const PANEL_FLOAT =
  "rounded-2xl border border-[rgba(43,111,232,0.14)] bg-white/95 shadow-[0_8px_36px_-14px_rgba(43,111,232,0.2),0_2px_10px_-4px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-[rgba(59,130,246,0.22)] dark:bg-[rgb(28_30_34/0.96)] dark:shadow-[0_10px_40px_-14px_rgba(0,0,0,0.48)]";
const PANEL_EMBED =
  "rounded-xl border border-[rgba(43,111,232,0.14)] bg-white shadow-[0_4px_22px_-12px_rgba(43,111,232,0.18),0_1px_4px_-2px_rgba(15,23,42,0.05)] dark:border-[rgba(59,130,246,0.2)] dark:bg-[rgb(28_30_34/0.98)]";
const HEADER_DIVIDER =
  "border-b border-[rgba(43,111,232,0.12)] dark:border-[rgba(59,130,246,0.18)]";
const TOGGLE_FLOAT =
  "pointer-events-auto rounded-2xl border border-[rgba(43,111,232,0.18)] bg-white/96 text-[#0F172A] shadow-[0_6px_28px_-10px_rgba(43,111,232,0.22),0_2px_10px_-4px_rgba(15,23,42,0.06)] backdrop-blur-md transition hover:border-[rgba(43,111,232,0.32)] hover:shadow-[0_10px_36px_-12px_rgba(43,111,232,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.25)] dark:border-[rgba(59,130,246,0.25)] dark:bg-[rgb(28_30_34/0.94)] dark:text-slate-100 dark:hover:border-[rgba(96,165,250,0.35)] dark:focus-visible:ring-[rgba(59,130,246,0.3)]";
const TOGGLE_EMBED =
  "flex min-h-9 w-full items-center justify-between gap-2 rounded-lg border border-[rgba(43,111,232,0.16)] bg-white px-3 py-2 text-left text-[12px] font-medium text-[#0F172A] transition hover:border-[rgba(43,111,232,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.22)] dark:border-[rgba(59,130,246,0.22)] dark:bg-[rgb(28_30_34/0.95)] dark:text-slate-100";
const ICON_CHIP =
  "flex shrink-0 items-center justify-center rounded-xl bg-[#EEF6FF] text-[#2563EB] dark:bg-[rgba(43,111,232,0.18)] dark:text-[#93C5FD]";
const INPUT_AREA =
  "w-full resize-none border border-[rgba(43,111,232,0.18)] bg-white/98 leading-relaxed text-[#0F172A] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none placeholder:text-[#94A3B8] focus:border-[rgba(43,111,232,0.45)] focus:ring-2 focus:ring-[rgba(43,111,232,0.14)] dark:border-[rgba(59,130,246,0.25)] dark:bg-[rgb(22_24_28/0.95)] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[rgba(96,165,250,0.45)] dark:focus:ring-[rgba(59,130,246,0.2)]";
const BTN_SECONDARY =
  "inline-flex min-h-11 items-center gap-2 rounded-xl border border-[rgba(43,111,232,0.2)] bg-[#FAFBFF] px-4 text-[14px] font-medium text-[#334155] transition hover:border-[rgba(43,111,232,0.35)] hover:bg-[#F4F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.2)] disabled:opacity-50 dark:border-[rgba(59,130,246,0.28)] dark:bg-[rgb(22_24_28/0.9)] dark:text-slate-200 dark:hover:bg-[rgb(30_32_38)]";
const HINT_ROW =
  "flex w-full min-h-11 items-center justify-between rounded-xl border border-[rgba(43,111,232,0.16)] bg-[#FAFBFF]/90 px-4 py-2.5 text-left text-[14px] font-medium text-[#0F172A] transition hover:border-[rgba(43,111,232,0.32)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.18)] dark:border-[rgba(59,130,246,0.22)] dark:bg-[rgb(22_24_28/0.85)] dark:text-slate-100 dark:hover:border-[rgba(96,165,250,0.35)]";
const CHIP =
  "min-h-9 rounded-lg border px-3 py-1.5 text-left text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.22)] border-[#E2E8F0] bg-white text-[#475569] hover:border-[rgba(43,111,232,0.35)] hover:bg-[#F8FAFF] dark:border-slate-600 dark:bg-[rgb(22_24_28)] dark:text-slate-200 dark:hover:border-[rgba(96,165,250,0.4)]";

function placeholderForZone(
  zone: ReturnType<typeof detectAssistZone>,
  hasInboxCase: boolean
): string {
  if (hasInboxCase) return "z. B. „Rückfrage wegen Schmerzen“ oder Diktat …";
  switch (zone) {
    case "dashboard":
      return "z. B. Überblick, Aufgabe diktieren, „Neuer Fall“ …";
    case "relay":
      return "z. B. Aufgabe delegieren, Priorität, Teaminfo …";
    case "journal":
      return "z. B. Zusammenfassung, Gliederung, Notiz strukturieren …";
    case "settings":
      return "z. B. Einstellung finden, Rollen, Praxis-Konfiguration …";
    case "inbox":
      return "z. B. Triage, Terminvorbereitung, Diktat …";
    default:
      return "z. B. Tracker, Relay, Journals — Diktat …";
  }
}

export function CommandAssist() {
  const pathname = usePathname();
  const router = useRouter();
  const assistCtx = useAssistCaseOptional();
  const inboxCase =
    assistCtx?.casePayload?.kind === "inbox" ? assistCtx.casePayload : null;
  const chromeLayout = assistCtx?.chromeLayout ?? "floating";
  const embeddedMode = chromeLayout === "tracker_embedded";

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [embedTarget, setEmbedTarget] = useState<HTMLElement | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);

  const hidden = pathname.startsWith("/login");

  const zone = detectAssistZone(pathname);
  const isInboxRoute = pathname.startsWith("/inbox");

  useLayoutEffect(() => {
    if (hidden || !embeddedMode) {
      setEmbedTarget(null);
      return;
    }
    const el = document.getElementById("tracker-assist-root");
    setEmbedTarget(el);
  }, [hidden, embeddedMode, pathname]);

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

  const panelShell = embeddedMode ? PANEL_EMBED : PANEL_FLOAT;

  const inner = (
    <div
      className={`flex flex-col gap-3 ${embeddedMode ? "w-full" : "w-full lg:w-[min(100vw-1.5rem,520px)]"}`}
    >
      <div
        id="command-assist-panel"
        className={`overflow-hidden transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${panelShell} ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 translate-y-1 opacity-0"
        }`}
      >
        <div
          className={`${embeddedMode ? "px-4 py-3" : "px-5 py-4 sm:px-6 sm:py-5"} ${HEADER_DIVIDER}`}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF6FF] text-[#2563EB] dark:bg-[rgba(43,111,232,0.2)] dark:text-[#93C5FD]"
              aria-hidden
            >
              <Stethoscope className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 border-l border-[rgba(43,111,232,0.2)] pl-3 dark:border-[rgba(59,130,246,0.25)]">
              <p
                className={`font-semibold tracking-tight text-[#0F172A] dark:text-slate-100 ${embeddedMode ? "text-[13px]" : "text-[15px]"}`}
              >
                Klinische Assistenz
              </p>
              <p
                className={`mt-1 leading-relaxed text-[#64748B] dark:text-slate-400 ${embeddedMode ? "text-[11px]" : "text-[13px]"}`}
              >
                Entwürfe, Diktat und Sprungmarken — nur zur Prüfung in der Praxis.{" "}
                <span className="font-medium text-[#334155] dark:text-slate-300">
                  Kein automatischer Versand.
                </span>
              </p>
            </div>
          </div>
        </div>

        <div
          className={
            embeddedMode ? "space-y-3 px-4 py-3" : "space-y-4 px-5 py-4 sm:px-6 sm:py-5"
          }
        >
          {inboxCase && draftParams ? (
            <div className="rounded-xl border border-[rgba(43,111,232,0.12)] bg-[#F4F7FB] px-3 py-3 dark:border-[rgba(59,130,246,0.2)] dark:bg-[rgba(43,111,232,0.08)]">
              <p className="text-[12px] font-medium text-[#94A3B8] dark:text-slate-500">
                Aktueller Fall
              </p>
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
              </div>
            </div>
          ) : null}

          {!inboxCase && contextQuick.length > 0 ? (
            <div className="rounded-xl border border-[rgba(43,111,232,0.1)] bg-[#FAFBFF] px-3 py-3 dark:border-[rgba(59,130,246,0.18)] dark:bg-[rgba(43,111,232,0.06)]">
              <p className="text-[12px] font-medium text-[#94A3B8] dark:text-slate-500">
                Schnellaktionen
              </p>
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
            rows={embeddedMode ? 3 : 5}
            placeholder={placeholderForZone(zone, Boolean(inboxCase && draftParams))}
            className={`${INPUT_AREA} ${embeddedMode ? "rounded-lg px-3 py-2.5 text-[13px]" : "rounded-xl px-4 py-3.5 text-[15px]"}`}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startDictation}
              disabled={listening}
              className={BTN_SECONDARY}
            >
              <Mic className="h-4 w-4 text-[#2563EB]" strokeWidth={1.75} />
              {listening ? "Hört zu …" : "Diktat"}
            </button>
          </div>

          {hints.length > 0 ? (
            <div className="space-y-2 border-t border-[rgba(43,111,232,0.1)] pt-4 dark:border-[rgba(59,130,246,0.15)]">
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
                    <Sparkles className="h-4 w-4 text-[#2563EB]" strokeWidth={1.75} />
                    {h.label}
                  </span>
                  <span className="text-[#94A3B8]">→</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          embeddedMode
            ? TOGGLE_EMBED
            : `flex min-h-[48px] w-full items-center justify-between gap-2.5 px-4 py-2.5 text-left text-[14px] font-semibold md:min-h-[50px] md:px-4 ${TOGGLE_FLOAT}`
        }
        aria-expanded={open}
        aria-controls="command-assist-panel"
      >
        <span className={`flex min-w-0 items-center ${embeddedMode ? "gap-2" : "gap-2.5"}`}>
          <span
            className={`flex shrink-0 items-center justify-center ${embeddedMode ? "h-7 w-7" : "h-8 w-8"} ${ICON_CHIP}`}
          >
            <Stethoscope className={embeddedMode ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.75} />
          </span>
          <span className="truncate text-[#0F172A] dark:text-slate-100">Assistenz</span>
        </span>
        <ChevronUp
          className={`h-4 w-4 shrink-0 text-[#94A3B8] transition-transform duration-300 dark:text-slate-500 ${open ? "" : "rotate-180"}`}
        />
      </button>
    </div>
  );

  if (embeddedMode && embedTarget) {
    return createPortal(
      <div className="pointer-events-auto w-full" aria-live="polite">
        {inner}
      </div>,
      embedTarget
    );
  }

  if (embeddedMode && !embedTarget) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed z-[45] flex flex-col gap-3 pb-[max(1rem,env(safe-area-inset-bottom))] ${
        isInboxRoute
          ? "bottom-0 right-0 max-lg:inset-x-0 max-lg:px-3 max-lg:pt-0 max-lg:items-stretch lg:bottom-8 lg:right-8 lg:items-end lg:p-8"
          : "bottom-0 right-0 items-end p-4 md:p-8"
      }`}
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex flex-col gap-3 max-lg:w-full ${isInboxRoute ? "max-lg:items-stretch lg:items-end" : "items-end"}`}
      >
        {inner}
      </div>
    </div>
  );
}
