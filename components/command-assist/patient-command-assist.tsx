"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";

import { COMMAND_AI_PATIENT_WELCOME_MESSAGE } from "@/lib/command-ai/command-ai-chat-types";
import type { CommandAiUiMessage } from "@/lib/command-ai/command-ai-chat-types";
import {
  loadLocalCommandAiSession,
  saveLocalCommandAiSession,
  streamPatientCommandAi,
} from "@/lib/command-ai/stream-chat-client";
import { cn } from "@/lib/utils";

function newMessageId(): string {
  return `pmsg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type PatientCommandAssistProps = {
  slug: string;
  practiceName: string;
};

export function PatientCommandAssist({ slug, practiceName }: PatientCommandAssistProps) {
  const [messages, setMessages] = useState<CommandAiUiMessage[]>([
    { id: newMessageId(), role: "assistant", content: COMMAND_AI_PATIENT_WELCOME_MESSAGE },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const local = loadLocalCommandAiSession(`patient-${slug}`);
    if (local.messages.length > 0) {
      setMessages(
        local.messages.map((m) => ({
          id: newMessageId(),
          role: m.role,
          content: m.content,
        }))
      );
    }
    if (local.sessionId) setSessionId(local.sessionId);
  }, [slug]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  useEffect(() => {
    saveLocalCommandAiSession(`patient-${slug}`, {
      sessionId,
      messages: messages
        .filter((m) => !m.pending && m.content.trim())
        .slice(-30)
        .map((m) => ({ role: m.role, content: m.content })),
    });
  }, [messages, sessionId, slug]);

  const send = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setText("");
    setBusy(true);
    const pendingId = newMessageId();

    setMessages((prev) => [
      ...prev,
      { id: newMessageId(), role: "user", content: trimmed },
      { id: pendingId, role: "assistant", content: "", pending: true, streaming: true },
    ]);

    const history = messages
      .filter((m) => !m.pending && m.content !== COMMAND_AI_PATIENT_WELCOME_MESSAGE)
      .map((m) => ({ role: m.role, content: m.content }));

    await streamPatientCommandAi({
      slug,
      history,
      userMessage: trimmed,
      sessionId,
      handlers: {
        onSession: (id) => setSessionId(id),
        onDelta: (piece) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === pendingId
                ? { ...m, pending: false, content: `${m.content}${piece}`, streaming: true }
                : m
            )
          );
        },
        onDone: (assistant) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === pendingId
                ? {
                    id: m.id,
                    role: "assistant",
                    content: assistant.reply,
                    journalLinks: assistant.journalLinks,
                    pending: false,
                    streaming: false,
                  }
                : m
            )
          );
        },
        onError: (msg) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === pendingId
                ? { ...m, pending: false, streaming: false, content: msg }
                : m
            )
          );
        },
      },
    });

    setBusy(false);
  }, [text, busy, messages, sessionId, slug]);

  return (
    <div className="yd-patient-assist mx-auto flex w-full max-w-lg flex-col rounded-2xl border border-[#E8ECF2] bg-white shadow-[0_12px_40px_-20px_rgba(15,23,42,0.18)]">
      <div className="border-b border-[#EEF2F6] px-4 py-3">
        <p className="text-[15px] font-semibold text-[#0F172A]">Praxis-Assistenz</p>
        <p className="text-[12px] text-[#64748B]">{practiceName}</p>
      </div>

      <div className="yd-command-chat max-h-[min(52dvh,420px)] min-h-[280px] flex-1 overflow-y-auto px-3 py-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "yd-command-chat__row mb-3",
              message.role === "user"
                ? "yd-command-chat__row--user"
                : "yd-command-chat__row--assistant"
            )}
          >
            {message.role === "assistant" ? (
              <div className="yd-command-chat__avatar" aria-hidden>
                <Bot className="h-4 w-4" />
              </div>
            ) : null}
            <div
              className={cn(
                "yd-command-chat__bubble",
                message.role === "user"
                  ? "yd-command-chat__bubble--user"
                  : "yd-command-chat__bubble--assistant"
              )}
            >
              {message.pending ? (
                <span className="yd-command-chat__typing">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{message.content}</p>
              )}
              {message.journalLinks && message.journalLinks.length > 0 ? (
                <ul className="mt-2 space-y-1 border-t border-[#E2E8F0] pt-2">
                  {message.journalLinks.map((link) => (
                    <li key={link.title}>
                      {link.url ? (
                        <a
                          href={link.url}
                          className="text-[13px] font-medium text-[#2563EB] underline-offset-2 hover:underline"
                        >
                          {link.title}
                        </a>
                      ) : (
                        <span className="text-[13px]">{link.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-[#EEF2F6] p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={2}
            placeholder="Ihre Frage …"
            className="min-h-[2.5rem] flex-1 resize-none rounded-xl border border-[#E2E8F0] px-3 py-2 text-[15px] outline-none focus:border-[#2563EB]"
            disabled={busy}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!text.trim() || busy}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A4F9C] text-white disabled:opacity-40"
            aria-label="Senden"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-[#94A3B8]">
          Keine Diagnose — bei Beschwerden wenden Sie sich bitte direkt an die Praxis.
        </p>
      </div>
    </div>
  );
}
