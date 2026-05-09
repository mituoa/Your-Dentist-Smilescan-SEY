"use client";

import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, Mic, Sparkles, Stethoscope } from "lucide-react";

import {
  buildAssistQuickDraft,
  type AssistQuickActionId,
} from "@/lib/clinical/message-templates";

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
  if (/einstellung|profil|praxis/.test(t)) {
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

  const hidden =
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login");

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

  const inTracker = pathname.startsWith("/inbox");
  const routeHints = suggestRoutes(text);
  const deepHints = suggestInboxDeepLinks(text, inboxCase?.submissionId ?? null);
  const hints = [...deepHints, ...routeHints].slice(0, 5);

  const panelShell = embeddedMode
    ? "rounded-lg border border-slate-200/80 bg-white shadow-none"
    : inTracker
      ? "border-[rgba(15,23,42,0.08)] bg-white/92 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[rgb(28_30_34/0.94)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]"
      : "border-border/70 bg-surface-card/88 shadow-[0_20px_50px_-18px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-border/50 dark:bg-surface-card/90 dark:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.55)]";

  const inner = (
    <div
      className={`flex flex-col gap-3 ${embeddedMode ? "w-full" : "w-full lg:w-[min(100vw-1.5rem,520px)]"}`}
    >
      <div
        id="command-assist-panel"
        className={`overflow-hidden ${embeddedMode ? "rounded-lg" : "rounded-2xl"} border transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${panelShell} ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 translate-y-1 opacity-0"
        }`}
      >
        <div
          className={`${embeddedMode ? "px-4 py-3" : "px-5 py-4 sm:px-6 sm:py-5"} ${inTracker ? "border-b border-[rgba(15,23,42,0.06)]" : "border-b border-border/60"}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-1 h-9 w-px shrink-0 rounded-full ${inTracker ? "bg-[#2B6FE8]/35" : "hidden"}`}
              aria-hidden={!inTracker}
            />
            {!inTracker ? (
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand">
                <Stethoscope className="h-5 w-5" strokeWidth={1.75} />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p
                className={`font-semibold tracking-tight text-text-primary ${embeddedMode ? "text-[13px]" : "text-[15px]"}`}
              >
                {inTracker ? "Klinische Assistenz" : "Praxisassistent"}
              </p>
              <p
                className={`mt-1 leading-relaxed text-text-secondary ${embeddedMode ? "text-[11px]" : "text-[13px]"}`}
              >
                Entwürfe, Diktat und Sprungmarken — nur zur Prüfung in der Praxis.{" "}
                <span className="font-medium text-text-primary">Kein automatischer Versand.</span>
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
            <div
              className={`rounded-xl px-3 py-3 ${inTracker ? "bg-[#F4F7FB]" : "border border-border/50 bg-surface-page/50 dark:bg-surface-sunken/40"}`}
            >
              <p className="text-[12px] font-medium" style={{ color: "#94A3B8" }}>
                Aktueller Fall
              </p>
              <p className="mt-1 truncate text-[15px] font-semibold" style={{ color: "#0F172A" }}>
                {inboxCase.patientName || "Patient"}
              </p>
              {inboxCase.concernLine ? (
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug" style={{ color: "#64748B" }}>
                  {inboxCase.concernLine}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {INBOX_QUICK.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => applyQuickDraft(q.id)}
                    className="min-h-9 rounded-lg border px-3 py-1.5 text-left text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.2)]"
                    style={{
                      borderColor: "#E2E8F0",
                      background: "#FFFFFF",
                      color: "#475569",
                    }}
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
            placeholder={
              inboxCase
                ? "z. B. „Rückfrage wegen Schmerzen“ oder Diktat …"
                : "z. B. „Neuer Fall“ oder „Relay“ …"
            }
            className={`w-full resize-none border border-border/80 bg-surface-card/95 leading-relaxed text-text-primary shadow-inner outline-none placeholder:text-text-tertiary focus:border-brand/40 focus:ring-2 focus:ring-brand/12 ${embeddedMode ? "rounded-lg px-3 py-2.5 text-[13px]" : "rounded-xl px-4 py-3.5 text-[15px]"}`}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startDictation}
              disabled={listening}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border/80 bg-surface-page/90 px-4 text-[14px] font-medium text-text-secondary transition hover:bg-surface-card hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 disabled:opacity-50"
            >
              <Mic className="h-4 w-4" strokeWidth={1.75} />
              {listening ? "Hört zu …" : "Diktat"}
            </button>
          </div>

          {hints.length > 0 ? (
            <div className="space-y-2 border-t border-border/60 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
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
                  className="flex w-full min-h-11 items-center justify-between rounded-xl border border-border/70 bg-surface-page/80 px-4 py-2.5 text-left text-[14px] font-medium text-text-primary transition hover:border-brand/30 hover:bg-surface-card"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand" strokeWidth={1.75} />
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
        className={
          embeddedMode
            ? "flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-slate-200/90 bg-white px-3 py-2 text-left text-[12px] font-medium text-slate-800 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.2)]"
            : `flex min-h-[48px] w-full items-center justify-between gap-2.5 rounded-xl border px-4 py-2.5 text-left text-[14px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.25)] md:min-h-[50px] md:px-4 ${
                inTracker
                  ? "pointer-events-auto rounded-2xl border-[rgba(15,23,42,0.1)] bg-white/95 text-[#0F172A] shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] backdrop-blur-md hover:border-[rgba(43,111,232,0.25)]"
                  : "pointer-events-auto rounded-full border-border/80 bg-surface-card/92 text-text-primary shadow-[0_12px_32px_-16px_rgba(15,23,42,0.35)] backdrop-blur-xl hover:shadow-[0_16px_40px_-14px_rgba(15,23,42,0.4)] dark:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.65)]"
              }`
        }
        aria-expanded={open}
        aria-controls="command-assist-panel"
      >
        <span className={`flex min-w-0 items-center ${embeddedMode ? "gap-2" : "gap-2.5"}`}>
          <span
            className={`flex shrink-0 items-center justify-center ${embeddedMode ? "h-7 w-7" : "h-8 w-8"} ${inTracker ? "rounded-lg bg-[#EEF6FF] text-[#2563EB]" : "rounded-full bg-brand/12 text-brand"}`}
          >
            <Stethoscope className={embeddedMode ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.75} />
          </span>
          <span className="truncate">{inTracker ? "Assistenz" : "Assist"}</span>
        </span>
        <ChevronUp
          className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform duration-300 ${open ? "" : "rotate-180"}`}
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
        inTracker
          ? "bottom-0 right-0 max-lg:inset-x-0 max-lg:px-3 max-lg:pt-0 max-lg:items-stretch lg:bottom-8 lg:right-8 lg:items-end lg:p-8"
          : "bottom-0 right-0 items-end p-4 md:p-8"
      }`}
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex flex-col gap-3 max-lg:w-full ${inTracker ? "max-lg:items-stretch lg:items-end" : "items-end"}`}
      >
        {inner}
      </div>
    </div>
  );
}
