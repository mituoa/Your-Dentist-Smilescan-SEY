"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  BellRing,
  ClipboardCheck,
  MessageSquarePlus,
  Plus,
  X,
} from "lucide-react";

import { NewTaskModal } from "@/components/my-tasks/new-task-modal";
import { createCaseFromQuery } from "@/lib/create-case-return";
import { cn } from "@/lib/utils";

type DashboardMobileActionsProps = {
  className?: string;
};

export function DashboardMobileActions({ className }: DashboardMobileActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const createCaseHref = `/create-case?from=${createCaseFromQuery("/dashboard")}`;

  const sheet =
    mounted && menuOpen
      ? createPortal(
          <div
            className="yd-dash-mobile-actions-backdrop fixed inset-0 z-[70] flex flex-col justify-end bg-[rgba(12,25,41,0.2)] backdrop-blur-[8px]"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeMenu();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="yd-dash-mobile-actions-sheet mx-auto w-full max-w-lg rounded-t-[22px] border border-[rgba(180,198,218,0.32)] bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(15,35,58,0.12)]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p id={titleId} className="text-[15px] font-semibold tracking-[-0.02em] text-[#0a1628]">
                  Neu anlegen
                </p>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(180,198,218,0.35)] text-[#64748b]"
                  aria-label="Menü schließen"
                >
                  <X className="h-[18px] w-[18px]" strokeWidth={1.85} />
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      router.push(createCaseHref);
                    }}
                    className="flex min-h-[48px] items-center gap-3 rounded-2xl bg-[#2F80ED] px-4 text-[14px] font-semibold text-white"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Neuer Fall
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full min-h-[48px] items-center gap-3 rounded-2xl border border-[rgba(180,198,218,0.35)] bg-white px-4 text-left text-[14px] font-medium text-[#0c1929]"
                    onClick={() => {
                      closeMenu();
                      setTaskOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 text-[#2F80ED]" strokeWidth={2} />
                    Neue Aufgabe
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      router.push("/relay?panel=messages");
                    }}
                    className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-[rgba(180,198,218,0.35)] bg-white px-4 text-[14px] font-medium text-[#0c1929]"
                  >
                    <MessageSquarePlus className="h-4 w-4 text-[#2F80ED]" strokeWidth={1.75} />
                    Relay Nachricht
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full min-h-[48px] items-center gap-3 rounded-2xl border border-[rgba(180,198,218,0.35)] bg-white px-4 text-left text-[14px] font-medium text-[#0c1929]"
                    onClick={() => {
                      closeMenu();
                      setReminderOpen(true);
                    }}
                  >
                    <BellRing className="h-4 w-4 text-[#2F80ED]" strokeWidth={1.75} />
                    Erinnerung
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      router.push("/inbox");
                    }}
                    className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-[rgba(180,198,218,0.35)] bg-white px-4 text-[14px] font-medium text-[#0c1929]"
                  >
                    <ClipboardCheck className="h-4 w-4 text-[#2F80ED]" strokeWidth={1.75} />
                    Antwort vorbereiten
                  </button>
                </li>
              </ul>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className={cn("yd-dash-mobile-actions-trigger", className)}>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="yd-dash-mobile-actions-btn inline-flex min-h-[44px] w-full items-center justify-center gap-2 px-5 transition-[transform,box-shadow] duration-200 touch-manipulation"
        >
          <Plus className="h-4 w-4 text-[#2F80ED]" strokeWidth={2} />
          Neu
        </button>
      </div>
      {sheet}
      <NewTaskModal open={taskOpen} onClose={() => setTaskOpen(false)} />
      <NewTaskModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        initialRecurrenceType="weekly"
        dialogTitle="Erinnerung"
        dialogHint="Rückruf oder Kontrolle — Rhythmus und Termin nach Bedarf."
      />
    </>
  );
}
