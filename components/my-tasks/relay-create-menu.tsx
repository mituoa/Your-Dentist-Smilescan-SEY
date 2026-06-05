"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ClipboardList, MessageSquarePlus, Plus } from "lucide-react";

import { NewRelayMessageModal } from "@/components/my-tasks/new-relay-message-modal";
import type { AssignableMember } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

type RelayCreateMenuProps = {
  assignableMembers: AssignableMember[];
  currentUserId: string;
  className?: string;
  variant?: "primary" | "secondary";
  onMessageCreated?: () => void;
};

export function RelayCreateMenu({
  assignableMembers,
  currentUserId,
  className,
  variant = "primary",
  onMessageCreated,
}: RelayCreateMenuProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pickMessage = () => {
    setOpen(false);
    setMessageOpen(true);
  };

  return (
    <div ref={rootRef} className={cn("yd-relay-create-menu", className)}>
      <button
        type="button"
        className={cn(
          variant === "primary"
            ? "yd-tracker-v4-new-case yd-relay-practice__create"
            : "yd-tracker-v4-new-case",
          open && variant === "primary" && "yd-relay-create-menu__trigger--open"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
        {variant === "primary" ? (
          <>
            Erstellen
            <ChevronDown className="h-3.5 w-3.5 opacity-80" strokeWidth={2} aria-hidden />
          </>
        ) : (
          "Neue Nachricht"
        )}
      </button>

      {open ? (
        <ul id={menuId} className="yd-relay-create-menu__dropdown" role="menu">
          <li role="none">
            <Link
              href="/my-tasks/new"
              className="yd-relay-create-menu__item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <ClipboardList className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span>
                <strong>Praxisaufgabe</strong>
                <small>Aufgabe, Routine oder Teamzuweisung</small>
              </span>
            </Link>
          </li>
          <li role="none">
            <button
              type="button"
              className="yd-relay-create-menu__item"
              role="menuitem"
              onClick={pickMessage}
            >
              <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span>
                <strong>Neue Nachricht</strong>
                <small>Empfänger wählen und intern senden</small>
              </span>
            </button>
          </li>
        </ul>
      ) : null}

      <NewRelayMessageModal
        open={messageOpen}
        onClose={() => {
          setMessageOpen(false);
          onMessageCreated?.();
        }}
        assignableMembers={assignableMembers}
        currentUserId={currentUserId}
      />
    </div>
  );
}
