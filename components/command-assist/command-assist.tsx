"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, Command, Mic, Send } from "lucide-react";

import {
  applyCommandAiPatientDraft,
  applyCommandAiRelayMessage,
  applyCommandAiSendToPatient,
  applyCommandAiStatus,
  applyCommandAiTask,
  getCommandAiGptStatus,
  loadCommandAiChatHistory,
  resolveCommandAiSession,
  sendCommandAiChat,
} from "@/app/(protected)/command-ai/chat-actions";
import { stashCommandDraftForSubmission } from "@/lib/command-ai/draft-bridge";
import {
  COMMAND_AI_WELCOME_MESSAGE,
  type CommandAiAssistantAction,
  type CommandAiChatContext,
  type CommandAiChatTurn,
  type CommandAiNavigateTarget,
  type CommandAiPracticeStatusAction,
  type CommandAiUiMessage,
  type CommandAiWorkspaceZone,
} from "@/lib/command-ai/command-ai-chat-types";
import {
  loadLocalCommandAiSession,
  saveLocalCommandAiSession,
  streamPracticeCommandAi,
} from "@/lib/command-ai/stream-chat-client";
import { COMMAND_AI_NO_AUTO_SEND } from "@/lib/command-ai/safety-copy";
import { detectAssistZone } from "@/lib/clinical/assist-workspace-context";

import { clinicalCommandSheetWidthMd } from "@/lib/clinical-ui";
import { cn } from "@/lib/utils";
import { useAssistCaseOptional, useAssistStateOptional } from "./assist-shell";

const SHEET =
  "flex max-md:min-h-0 max-md:flex-1 flex-col overflow-hidden rounded-2xl border border-[#E8ECF2] bg-white " +
  "shadow-[0_20px_56px_-16px_rgba(15,23,42,0.16),0_8px_20px_-8px_rgba(15,23,42,0.08)] " +
  "max-md:max-h-none md:max-h-[min(82dvh,880px)] md:shadow-[0_20px_60px_-24px_rgba(15,23,42,0.14)]";

const HEADER_DIVIDER = "border-b border-[#EEF2F6]";

const FAB =
  "pointer-events-auto flex h-[52px] w-[52px] touch-manipulation items-center justify-center rounded-full border border-white/80 bg-white text-[#1A4F9C] " +
  "shadow-[0_0_0_1px_rgba(43,111,232,0.12),0_8px_24px_-8px_rgba(43,111,232,0.35),0_0_0_8px_rgba(43,111,232,0.08)] " +
  "transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none " +
  "hover:shadow-[0_0_0_1px_rgba(43,111,232,0.18),0_12px_32px_-10px_rgba(43,111,232,0.4),0_0_0_10px_rgba(43,111,232,0.1)] " +
  "active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const ICON_WRAP =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF] text-[#2563EB] ring-1 ring-[rgba(43,111,232,0.1)]";

const INPUT_AREA =
  "w-full resize-none rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#0F172A] shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] outline-none placeholder:text-[#94A3B8] " +
  "focus:border-[rgba(43,111,232,0.38)] focus:ring-[3px] focus:ring-[rgba(43,111,232,0.12)]";

const BTN_SECONDARY =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#FAFBFF] px-3.5 text-[13px] font-medium text-[#334155] " +
  "transition-colors duration-150 hover:border-[rgba(43,111,232,0.22)] hover:bg-[#F4F7FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.2)] disabled:opacity-50";

const BTN_PRIMARY =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#1A4F9C] px-3.5 text-[13px] font-semibold text-white transition hover:bg-[#2563EB] disabled:opacity-45";

function newMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toChatZone(zone: ReturnType<typeof detectAssistZone>): CommandAiWorkspaceZone {
  if (zone === "default") return "other";
  return zone;
}

function placeholderForZone(
  zone: ReturnType<typeof detectAssistZone>,
  hasInboxCase: boolean
): string {
  if (hasInboxCase) {
    return "Frage stellen oder Antwortentwurf anfordern …";
  }
  switch (zone) {
    case "dashboard":
      return "Was soll als Nächstes passieren?";
    case "relay":
      return "Aufgabe oder Nachricht formulieren …";
    case "journal":
      return "Frage zu Praxiswissen …";
    case "settings":
      return "Einstellung oder Rolle …";
    case "inbox":
      return "Fall öffnen oder Frage stellen …";
    default:
      return "Nachricht an die Praxis-Assistenz …";
  }
}

function dispatchTrackerDraftUpdated(submissionId: string, body: string) {
  if (typeof window === "undefined") return;
  stashCommandDraftForSubmission({
    submissionId,
    body,
    savedAt: new Date().toISOString(),
  });
  window.dispatchEvent(
    new CustomEvent("yd-tracker-draft-updated", {
      detail: { submissionId, body },
    })
  );
  document.getElementById("tracker-kommunikation")?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

function navigateTargetHref(
  target: CommandAiNavigateTarget,
  submissionId: string | null
): string {
  switch (target) {
    case "inbox_case":
      return submissionId ? `/inbox/${submissionId}` : "/inbox";
    case "inbox":
      return "/inbox";
    case "relay":
      return "/relay";
    case "relay_messages":
      return "/relay?panel=messages";
    case "journal":
      return "/journal";
    case "dashboard":
      return "/dashboard";
    case "settings":
      return "/settings";
    default:
      return "/dashboard";
  }
}

function actionLabel(action: CommandAiAssistantAction): string {
  switch (action.type) {
    case "set_status":
      return `Status: ${action.status ?? "ändern"}`;
    case "navigate":
      return "Öffnen";
    case "relay_message":
      return "Relay-Nachricht senden";
    case "open_draft":
      return "Entwurf speichern";
    case "send_patient":
      return "An Patient:in senden";
    default:
      return "Ausführen";
  }
}

function ChatBubble({
  message,
  submissionId,
  onApplyDraft,
  onApplyTask,
  onApplyRelay,
  onApplyStatus,
  onApplySend,
  onNavigate,
  busyAction,
  taskRelayHref,
  actionRelayHref,
}: {
  message: CommandAiUiMessage;
  submissionId: string | null;
  onApplyDraft?: () => void;
  onApplyTask?: () => void;
  onApplyRelay?: () => void;
  onApplyStatus?: (status: string) => void;
  onApplySend?: () => void;
  onNavigate?: (href: string) => void;
  busyAction: boolean;
  taskRelayHref: string | null;
  actionRelayHref: string | null;
}) {
  const isUser = message.role === "user";
  const isPending = message.pending;

  return (
    <div
      className={cn(
        "yd-command-chat__row",
        isUser ? "yd-command-chat__row--user" : "yd-command-chat__row--assistant"
      )}
    >
      {!isUser ? (
        <div className="yd-command-chat__avatar" aria-hidden>
          <Bot className="h-4 w-4" strokeWidth={2} />
        </div>
      ) : null}
      <div
        className={cn(
          "yd-command-chat__bubble",
          isUser ? "yd-command-chat__bubble--user" : "yd-command-chat__bubble--assistant"
        )}
      >
        {isPending && !message.content?.trim() ? (
          <span className="yd-command-chat__typing" aria-live="polite">
            <span />
            <span />
            <span />
          </span>
        ) : (
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed">
            {message.content}
            {message.streaming ? (
              <span className="yd-command-chat__cursor" aria-hidden>
                ▍
              </span>
            ) : null}
          </p>
        )}

        {!isPending && message.journalLinks && message.journalLinks.length > 0 ? (
          <div className="yd-command-chat__draft">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#64748B]">
              Praxiswissen
            </p>
            <ul className="mt-1 space-y-1">
              {message.journalLinks.map((link) => (
                <li key={link.title}>
                  {link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-medium text-[#2563EB] underline-offset-2 hover:underline"
                    >
                      {link.title}
                    </a>
                  ) : (
                    <span className="text-[13px] text-[#334155]">{link.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!isPending && message.relayMessage ? (
          <div className="yd-command-chat__draft">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#64748B]">
              Interne Nachricht (Relay)
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-[#334155]">
              {message.relayMessage}
            </p>
            {onApplyRelay ? (
              <button
                type="button"
                onClick={onApplyRelay}
                disabled={busyAction}
                className={cn(BTN_PRIMARY, "mt-2.5 w-full")}
              >
                {busyAction ? "Wird gesendet …" : "An Team senden"}
              </button>
            ) : null}
            {actionRelayHref ? (
              <Link
                href={actionRelayHref}
                className="mt-2 block text-center text-[12px] font-medium text-[#2563EB] underline-offset-2 hover:underline"
              >
                In Relay öffnen
              </Link>
            ) : null}
          </div>
        ) : null}

        {!isPending && message.patientDraft ? (
          <div className="yd-command-chat__draft">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#64748B]">
              Patientenantwort (Entwurf)
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-[#334155]">
              {message.patientDraft}
            </p>
            {onApplyDraft ? (
              <button
                type="button"
                onClick={onApplyDraft}
                disabled={busyAction}
                className={cn(BTN_PRIMARY, "mt-2.5 w-full")}
              >
                {busyAction ? "Wird übernommen …" : "Entwurf übernehmen"}
              </button>
            ) : null}
            {onApplySend && submissionId ? (
              <button
                type="button"
                onClick={onApplySend}
                disabled={busyAction}
                className={cn(BTN_SECONDARY, "mt-2 w-full justify-center")}
              >
                {busyAction ? "…" : "Freigeben & senden"}
              </button>
            ) : null}
          </div>
        ) : null}

        {!isPending && message.taskTitle ? (
          <div className="yd-command-chat__draft">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#64748B]">
              Team-Aufgabe
            </p>
            <p className="mt-1 text-[13px] font-semibold text-[#0F172A]">{message.taskTitle}</p>
            {message.taskNotes ? (
              <p className="mt-1 whitespace-pre-wrap text-[13px] text-[#475569]">
                {message.taskNotes}
              </p>
            ) : null}
            {onApplyTask ? (
              <button
                type="button"
                onClick={onApplyTask}
                disabled={busyAction}
                className={cn(BTN_PRIMARY, "mt-2.5 w-full")}
              >
                {busyAction ? "Wird erstellt …" : "Aufgabe erstellen"}
              </button>
            ) : null}
            {taskRelayHref ? (
              <Link
                href={taskRelayHref}
                className="mt-2 block text-center text-[12px] font-medium text-[#2563EB] underline-offset-2 hover:underline"
              >
                In Relay öffnen
              </Link>
            ) : null}
          </div>
        ) : null}

        {!isPending && message.actions && message.actions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.actions.map((action, idx) => {
              if (action.type === "navigate" && action.navigate && onNavigate) {
                return (
                  <button
                    key={`${action.type}-${idx}`}
                    type="button"
                    disabled={busyAction}
                    onClick={() =>
                      onNavigate(navigateTargetHref(action.navigate!, submissionId))
                    }
                    className={BTN_SECONDARY}
                  >
                    {actionLabel(action)}
                  </button>
                );
              }
              if (action.type === "set_status" && action.status && onApplyStatus) {
                return (
                  <button
                    key={`${action.type}-${idx}`}
                    type="button"
                    disabled={busyAction}
                    onClick={() => onApplyStatus(action.status!)}
                    className={BTN_SECONDARY}
                  >
                    {actionLabel(action)}
                  </button>
                );
              }
              if (action.type === "relay_message" && onApplyRelay) {
                return (
                  <button
                    key={`${action.type}-${idx}`}
                    type="button"
                    disabled={busyAction}
                    onClick={onApplyRelay}
                    className={BTN_SECONDARY}
                  >
                    {actionLabel(action)}
                  </button>
                );
              }
              if (action.type === "open_draft" && onApplyDraft) {
                return (
                  <button
                    key={`${action.type}-${idx}`}
                    type="button"
                    disabled={busyAction}
                    onClick={onApplyDraft}
                    className={BTN_SECONDARY}
                  >
                    {actionLabel(action)}
                  </button>
                );
              }
              if (action.type === "send_patient" && onApplySend) {
                return (
                  <button
                    key={`${action.type}-${idx}`}
                    type="button"
                    disabled={busyAction}
                    onClick={onApplySend}
                    className={BTN_SECONDARY}
                  >
                    {actionLabel(action)}
                  </button>
                );
              }
              return null;
            })}
          </div>
        ) : null}

        {!isPending && message.suggestedNavigate && onNavigate ? (
          <button
            type="button"
            className={cn(BTN_SECONDARY, "mt-2")}
            onClick={() =>
              onNavigate(navigateTargetHref(message.suggestedNavigate!, submissionId))
            }
          >
            Weiter zu {message.suggestedNavigate}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function CommandAssist() {
  const pathname = usePathname();
  const router = useRouter();
  const assistCtx = useAssistCaseOptional();
  const assistState = useAssistStateOptional();
  const inboxCase =
    assistState?.casePayload?.kind === "inbox" ? assistState.casePayload : null;

  const open = assistState?.commandOpen ?? false;
  const setOpen = assistCtx?.setCommandOpen ?? (() => {});

  const [text, setText] = useState("");
  const [messages, setMessages] = useState<CommandAiUiMessage[]>([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [statusHint, setStatusHint] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");
  const [taskRelayHref, setTaskRelayHref] = useState<string | null>(null);
  const [actionRelayHref, setActionRelayHref] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gptEnabled, setGptEnabled] = useState<boolean | null>(null);
  const [persistenceEnabled, setPersistenceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const recRef = useRef<{ stop: () => void } | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef("");

  const hidden = pathname.startsWith("/login");

  useLayoutEffect(() => {
    setPortalMounted(true);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (!open) {
      html.removeAttribute("data-yd-command-open");
      return;
    }
    html.setAttribute("data-yd-command-open", "true");
    return () => {
      html.removeAttribute("data-yd-command-open");
    };
  }, [open]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    void getCommandAiGptStatus().then((s) => {
      setGptEnabled(s.enabled);
      setPersistenceEnabled(s.persistence);
    });
  }, []);

  const submissionId = inboxCase?.submissionId ?? null;

  useEffect(() => {
    if (!open || historyLoaded) return;

    const local = loadLocalCommandAiSession(submissionId);
    if (local.sessionId) setSessionId(local.sessionId);

    const load = async () => {
      let sid = local.sessionId;
      if (!sid) {
        sid = await resolveCommandAiSession({
          submissionId,
          existingSessionId: null,
        });
        if (sid) setSessionId(sid);
      }

      if (sid && persistenceEnabled) {
        const { messages: persisted } = await loadCommandAiChatHistory({ sessionId: sid });
        if (persisted.length > 0) {
          setMessages(
            persisted.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              patientDraft: m.payload?.patientDraft,
              taskTitle: m.payload?.taskTitle,
              taskNotes: m.payload?.taskNotes,
              relayMessage: m.payload?.relayMessage,
              journalLinks: m.payload?.journalLinks,
              actions: m.payload?.actions,
              suggestedNavigate: m.payload?.suggestedNavigate,
            }))
          );
          setHistoryLoaded(true);
          return;
        }
      }

      if (local.messages.length > 0) {
        setMessages(
          local.messages.map((m) => ({
            id: newMessageId(),
            role: m.role,
            content: m.content,
          }))
        );
      } else {
        setMessages([
          {
            id: newMessageId(),
            role: "assistant",
            content: COMMAND_AI_WELCOME_MESSAGE,
          },
        ]);
      }
      setHistoryLoaded(true);
    };

    void load();
  }, [open, historyLoaded, submissionId, persistenceEnabled]);

  const zone = detectAssistZone(pathname);

  const chatContext = useMemo((): CommandAiChatContext => {
    return {
      zone: toChatZone(zone),
      activeCase: inboxCase
        ? {
            submissionId: inboxCase.submissionId,
            patientName: inboxCase.patientName,
            concernLine: inboxCase.concernLine,
            urgency: inboxCase.urgency ?? null,
            practicePhone: inboxCase.practicePhone,
            appointmentUrl: inboxCase.appointmentUrl,
          }
        : null,
    };
  }, [zone, inboxCase]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages, scrollToBottom]);

  useEffect(() => {
    if (!open) {
      setHistoryLoaded(false);
    }
  }, [submissionId, open]);

  useEffect(() => {
    if (messages.length === 0) return;
    saveLocalCommandAiSession(
      submissionId,
      {
        sessionId,
        messages: messages
          .filter((m) => !m.pending && m.content.trim())
          .slice(-40)
          .map((m) => ({ role: m.role, content: m.content })),
      }
    );
  }, [messages, sessionId, submissionId]);

  const historyForApi = useCallback((msgs: CommandAiUiMessage[]): CommandAiChatTurn[] => {
    return msgs
      .filter((m) => !m.pending && m.content.trim())
      .filter((m) => !(m.role === "assistant" && m.content === COMMAND_AI_WELCOME_MESSAGE))
      .map((m) => ({ role: m.role, content: m.content }));
  }, []);

  const sendMessage = useCallback(
    async (raw?: string) => {
      const trimmed = (raw ?? text).trim();
      if (!trimmed || chatBusy) return;

      setText("");
      setStatusHint(null);
      setTaskRelayHref(null);
      setActionRelayHref(null);
      setStatusTone("neutral");

      const userMsg: CommandAiUiMessage = {
        id: newMessageId(),
        role: "user",
        content: trimmed,
      };
      const pendingId = newMessageId();
      const pendingMsg: CommandAiUiMessage = {
        id: pendingId,
        role: "assistant",
        content: "",
        pending: true,
        streaming: true,
      };

      const nextMessages = [...messages, userMsg, pendingMsg];
      setMessages(nextMessages);
      setChatBusy(true);

      const history = historyForApi(messages).concat({ role: "user", content: trimmed });

      const finalizeAssistant = (assistant: {
        reply: string;
        patientDraft?: string | null;
        taskTitle?: string | null;
        taskNotes?: string | null;
        relayMessage?: string | null;
        journalLinks?: { title: string; url: string | null }[];
        actions?: CommandAiAssistantAction[];
        suggestedNavigate?: CommandAiNavigateTarget | null;
      }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? {
                  id: m.id,
                  role: "assistant" as const,
                  content: assistant.reply,
                  patientDraft: assistant.patientDraft,
                  taskTitle: assistant.taskTitle,
                  taskNotes: assistant.taskNotes,
                  relayMessage: assistant.relayMessage,
                  journalLinks: assistant.journalLinks,
                  actions: assistant.actions,
                  suggestedNavigate: assistant.suggestedNavigate,
                  pending: false,
                  streaming: false,
                }
              : m
          )
        );
      };

      try {
        if (gptEnabled) {
          const streamed = await streamPracticeCommandAi({
            history,
            userMessage: trimmed,
            context: chatContext,
            sessionId,
            handlers: {
              onSession: (id) => setSessionId(id),
              onStatus: (phase) => {
                if (phase === "preparing") {
                  setStatusHint("Antwort wird vorbereitet …");
                } else {
                  setStatusHint(null);
                }
              },
              onDelta: (piece) => {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === pendingId
                      ? {
                          ...m,
                          pending: false,
                          content: `${m.content}${piece}`,
                          streaming: true,
                        }
                      : m
                  )
                );
              },
              onDone: (assistant) => finalizeAssistant(assistant),
              onError: (msg) => {
                setStatusTone("error");
                setStatusHint(msg);
              },
            },
          });

          if (streamed) return;
        }

        const result = await sendCommandAiChat({
          history,
          userMessage: trimmed,
          context: chatContext,
          sessionId,
        });

        if (!result.ok) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === pendingId
                ? {
                    ...m,
                    pending: false,
                    streaming: false,
                    content: result.error,
                  }
                : m
            )
          );
          setStatusTone("error");
          setStatusHint(result.error);
          return;
        }

        if (result.sessionId) setSessionId(result.sessionId);
        finalizeAssistant(result.assistant);

        if (!result.usedGpt && gptEnabled === false) {
          setStatusTone("neutral");
          setStatusHint("Regel-Assistent aktiv — OPENAI_API_KEY für KI-Chat setzen.");
        }
      } finally {
        setChatBusy(false);
      }
    },
    [text, chatBusy, messages, historyForApi, chatContext, gptEnabled, sessionId]
  );

  const handleApplyDraft = useCallback(
    async (message: CommandAiUiMessage) => {
      if (!message.patientDraft?.trim()) return;
      if (!inboxCase?.submissionId) {
        setStatusTone("error");
        setStatusHint("Bitte öffnen Sie zuerst einen Patientenfall.");
        return;
      }

      setActionBusy(true);
      setStatusHint(null);
      try {
        const result = await applyCommandAiPatientDraft({
          submissionId: inboxCase.submissionId,
          body: message.patientDraft,
        });
        if (!result.ok) {
          setStatusTone("error");
          setStatusHint(result.error);
          return;
        }
        dispatchTrackerDraftUpdated(inboxCase.submissionId, result.body);
        setStatusTone("success");
        setStatusHint("Entwurf übernommen — bitte in der Kommunikation prüfen.");
        router.refresh();
      } finally {
        setActionBusy(false);
      }
    },
    [inboxCase, router]
  );

  const handleApplyTask = useCallback(
    async (message: CommandAiUiMessage) => {
      if (!message.taskTitle?.trim()) return;

      setActionBusy(true);
      setStatusHint(null);
      setTaskRelayHref(null);
      try {
        const result = await applyCommandAiTask({
          submissionId: inboxCase?.submissionId ?? null,
          taskTitle: message.taskTitle,
          taskNotes: message.taskNotes ?? null,
        });
        if (!result.ok) {
          setStatusTone("error");
          setStatusHint(result.error);
          return;
        }
        setStatusTone("success");
        setStatusHint(result.message);
        setTaskRelayHref(result.relayHref);
        router.refresh();
      } finally {
        setActionBusy(false);
      }
    },
    [inboxCase, router]
  );

  const handleApplyRelay = useCallback(
    async (message: CommandAiUiMessage) => {
      const body = message.relayMessage?.trim();
      if (!body) return;

      setActionBusy(true);
      setStatusHint(null);
      setActionRelayHref(null);
      try {
        const result = await applyCommandAiRelayMessage({
          submissionId: inboxCase?.submissionId ?? null,
          body,
        });
        if (!result.ok) {
          setStatusTone("error");
          setStatusHint(result.error);
          return;
        }
        setStatusTone("success");
        setStatusHint(result.message);
        setActionRelayHref(result.relayHref);
        router.refresh();
      } finally {
        setActionBusy(false);
      }
    },
    [inboxCase, router]
  );

  const handleApplyStatus = useCallback(
    async (status: string) => {
      if (!inboxCase?.submissionId) {
        setStatusTone("error");
        setStatusHint("Bitte öffnen Sie zuerst einen Fall.");
        return;
      }

      setActionBusy(true);
      try {
        const result = await applyCommandAiStatus({
          submissionId: inboxCase.submissionId,
          status: status as CommandAiPracticeStatusAction,
        });
        if (!result.ok) {
          setStatusTone("error");
          setStatusHint(result.error);
          return;
        }
        setStatusTone("success");
        setStatusHint(result.message);
        router.refresh();
      } finally {
        setActionBusy(false);
      }
    },
    [inboxCase, router]
  );

  const handleApplySend = useCallback(
    async (message: CommandAiUiMessage) => {
      if (!message.patientDraft?.trim() || !inboxCase?.submissionId) return;

      setActionBusy(true);
      try {
        const result = await applyCommandAiSendToPatient({
          submissionId: inboxCase.submissionId,
          body: message.patientDraft,
          messageKind: "reply",
        });
        if (!result.ok) {
          setStatusTone("error");
          setStatusHint(result.error);
          return;
        }
        setStatusTone("success");
        setStatusHint(result.message);
        router.refresh();
      } finally {
        setActionBusy(false);
      }
    },
    [inboxCase, router]
  );

  const handleNavigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router, setOpen]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

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
    r.onend = () => {
      setListening(false);
      window.setTimeout(() => {
        const t = textRef.current.trim();
        if (t) void sendMessage(t);
      }, 120);
    };
    r.onerror = () => setListening(false);
    recRef.current = r;
    setListening(true);
    r.start();
  }, [sendMessage]);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const insideCommandUi = (n: Node | null) => {
      if (!n) return false;
      if (fabRef.current?.contains(n)) return true;
      if (sheetRef.current?.contains(n)) return true;
      const sidebar = document.getElementById("app-sidebar");
      if (sidebar?.contains(n)) return true;
      return false;
    };

    const onPointerDownCapture = (e: PointerEvent) => {
      if (insideCommandUi(e.target as Node)) return;
      setOpen(false);
    };

    const onScrollCapture = (e: Event) => {
      if (typeof window !== "undefined" && window.innerWidth < 768) return;
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
  }, [open, setOpen]);

  const sheetBody = (
    <>
      <div className={`yd-command-sheet__head shrink-0 ${HEADER_DIVIDER}`}>
        <span className="yd-command-sheet__handle md:hidden" aria-hidden />
        <div className="yd-command-sheet__title-row">
          <div className={ICON_WRAP} aria-hidden>
            <Command className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold tracking-tight text-[#0F172A]">
              KI Assistenz
            </p>
            <p className="truncate text-[12px] text-[#64748B]">
              {inboxCase ? inboxCase.patientName || "Patient" : "Fälle, Entwürfe, Aufgaben"}
            </p>
          </div>
        </div>
      </div>

      <div
        className="yd-command-sheet__body yd-command-chat min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 [-webkit-overflow-scrolling:touch] sm:px-4"
        aria-live="polite"
      >
        <div className="space-y-3">
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              submissionId={submissionId}
              busyAction={actionBusy}
              taskRelayHref={
                message.taskTitle && taskRelayHref && statusTone === "success"
                  ? taskRelayHref
                  : null
              }
              actionRelayHref={
                message.relayMessage && actionRelayHref && statusTone === "success"
                  ? actionRelayHref
                  : null
              }
              onNavigate={handleNavigate}
              onApplyStatus={(status) => {
                void handleApplyStatus(status);
              }}
              onApplyDraft={
                message.patientDraft
                  ? () => {
                      void handleApplyDraft(message);
                    }
                  : undefined
              }
              onApplySend={
                message.patientDraft && submissionId
                  ? () => {
                      void handleApplySend(message);
                    }
                  : undefined
              }
              onApplyRelay={
                message.relayMessage
                  ? () => {
                      void handleApplyRelay(message);
                    }
                  : undefined
              }
              onApplyTask={
                message.taskTitle
                  ? () => {
                      void handleApplyTask(message);
                    }
                  : undefined
              }
            />
          ))}
          <div ref={messagesEndRef} aria-hidden />
        </div>
      </div>

      <div className="yd-command-chat__composer shrink-0 border-t border-[#EEF2F6] px-3 py-3 sm:px-4">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            rows={2}
            placeholder={placeholderForZone(zone, Boolean(inboxCase))}
            className={cn(INPUT_AREA, "min-h-[2.75rem] flex-1 py-2.5")}
            disabled={chatBusy}
            aria-busy={chatBusy}
          />
          <div className="flex shrink-0 flex-col gap-1.5">
            <button
              type="button"
              onClick={startDictation}
              disabled={listening || chatBusy}
              className={cn(BTN_SECONDARY, "h-10 w-10 justify-center px-0")}
              aria-label={listening ? "Diktat läuft" : "Diktat starten"}
            >
              <Mic className="h-4 w-4 text-[#2563EB]" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => {
                void sendMessage();
              }}
              disabled={!text.trim() || chatBusy}
              className={cn(BTN_PRIMARY, "h-10 w-10 px-0")}
              aria-label={chatBusy ? "Antwort wird erstellt" : "Nachricht senden"}
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {statusHint ? (
          <p
            className={cn(
              "mt-2 text-center text-[11px] leading-snug",
              statusTone === "success"
                ? "text-[#166534]"
                : statusTone === "error"
                  ? "text-[#B45309]"
                  : "text-[#64748B]"
            )}
            role="status"
          >
            {statusHint}
            {taskRelayHref && statusTone === "success" ? (
              <>
                {" "}
                <Link
                  href={taskRelayHref}
                  onClick={() => setOpen(false)}
                  className="font-medium text-[#2563EB] underline-offset-2 hover:underline"
                >
                  Relay
                </Link>
              </>
            ) : null}
          </p>
        ) : (
          <p className="mt-2 text-center text-[10px] leading-snug text-[#94A3B8]">
            {COMMAND_AI_NO_AUTO_SEND}
          </p>
        )}
      </div>
    </>
  );

  if (hidden || !portalMounted) return null;

  return createPortal(
    <div className="yd-command-assist-root" data-command-open={open ? "true" : "false"}>
      {open ? (
        <div
          className="yd-command-assist-backdrop"
          aria-hidden={false}
          onClick={() => setOpen(false)}
        />
      ) : null}

      {open ? (
        <div
          ref={sheetRef}
          id="command-assist-panel"
          role="dialog"
          aria-modal="true"
          aria-label="KI Assistenz"
          className={cn(
            "yd-command-assist-sheet transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            clinicalCommandSheetWidthMd,
            SHEET,
            "translate-y-0 opacity-100"
          )}
        >
          {sheetBody}
        </div>
      ) : null}

      <div className="yd-command-assist-fab-host">
        <button
          ref={fabRef}
          type="button"
          onClick={() => setOpen(!open)}
          className={FAB}
          aria-expanded={open}
          aria-controls="command-assist-panel"
          aria-label={open ? "Assistenz schließen" : "Praxis-Assistenz öffnen (⌘K)"}
          title="Praxis-Assistenz (⌘K)"
        >
          <Command className="h-[22px] w-[22px] shrink-0" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>,
    document.body
  );
}
