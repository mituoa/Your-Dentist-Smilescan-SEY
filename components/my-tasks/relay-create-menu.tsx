"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  MessageSquarePlus,
  Plus,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { fetchAssignableMembersForTaskCreate } from "@/app/(protected)/my-tasks/actions";
import { RelayGroupCreateModal } from "@/components/my-tasks/relay-group-create-modal";
import { NewRelayMessageModal } from "@/components/my-tasks/new-relay-message-modal";
import { createTaskFromQuery } from "@/lib/create-task-return";
import type { AssignableMember } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

type RelayCreateMenuProps = {
  assignableMembers?: AssignableMember[];
  currentUserId?: string;
  className?: string;
  /** @deprecated Nutze placement="header" */
  variant?: "primary" | "secondary";
  placement?: "header" | "toolbar" | "inline";
  isDoctor?: boolean;
  label?: string;
  onMessageCreated?: () => void;
  onGroupCreated?: (conversationId: string) => void;
};

function triggerClass(
  placement: RelayCreateMenuProps["placement"],
  variant: RelayCreateMenuProps["variant"],
  open: boolean
) {
  if (placement === "header") {
    return cn(
      "yd-dash-header-premium__cta yd-dash-header-premium__cta--secondary yd-relay-create-menu__trigger",
      open && "yd-relay-create-menu__trigger--open"
    );
  }
  if (placement === "inline") {
    return cn(
      "yd-relay-create-menu__trigger yd-relay-create-menu__trigger--inline",
      open && "yd-relay-create-menu__trigger--open"
    );
  }
  return cn(
    variant === "primary"
      ? "yd-tracker-v4-new-case yd-relay-practice__create yd-relay-create-menu__trigger"
      : "yd-tracker-v4-new-case yd-relay-create-menu__trigger",
    open && "yd-relay-create-menu__trigger--open"
  );
}

export function RelayCreateMenu({
  assignableMembers: membersProp,
  currentUserId: userIdProp,
  className,
  variant = "primary",
  placement = "toolbar",
  isDoctor = false,
  label,
  onMessageCreated,
  onGroupCreated,
}: RelayCreateMenuProps) {
  const router = useRouter();
  const pathname = usePathname() || "/relay";
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [members, setMembers] = useState<AssignableMember[]>(membersProp ?? []);
  const [currentUserId, setCurrentUserId] = useState(userIdProp ?? "");
  const [membersLoading, setMembersLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const taskHref = `/my-tasks/new?from=${createTaskFromQuery(pathname)}`;
  const triggerLabel =
    label ??
    (placement === "header"
      ? "Praxisaufgabe erstellen"
      : placement === "inline"
        ? "Erstellen"
        : variant === "primary"
          ? "Erstellen"
          : "Neue Nachricht");

  useEffect(() => {
    if (membersProp?.length) setMembers(membersProp);
  }, [membersProp]);

  useEffect(() => {
    if (userIdProp) setCurrentUserId(userIdProp);
  }, [userIdProp]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const ensureMembers = useCallback(async () => {
    if (members.length > 0 && currentUserId) return true;
    if (membersLoading) return members.length > 0;
    setMembersLoading(true);
    try {
      const res = await fetchAssignableMembersForTaskCreate();
      if (!res.ok) return false;
      setMembers(res.members);
      setCurrentUserId(res.currentUserId);
      return true;
    } finally {
      setMembersLoading(false);
    }
  }, [members.length, currentUserId, membersLoading]);

  const openMessage = async () => {
    setOpen(false);
    await ensureMembers();
    setMessageOpen(true);
  };

  const openGroup = async () => {
    setOpen(false);
    await ensureMembers();
    setGroupOpen(true);
  };

  const handleMessageClose = () => {
    setMessageOpen(false);
    onMessageCreated?.();
  };

  const handleGroupCreated = (conversationId: string) => {
    onGroupCreated?.(conversationId);
    router.replace(`/relay?bereich=teamwork&item=msg-${conversationId}`);
    router.refresh();
  };

  const showChevron = placement !== "inline" || variant === "primary";

  return (
    <div ref={rootRef} className={cn("yd-relay-create-menu", className)}>
      <button
        type="button"
        className={triggerClass(placement, variant, open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        <span>{triggerLabel}</span>
        {showChevron ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
        ) : null}
      </button>

      {open ? (
        <ul id={menuId} className="yd-relay-create-menu__dropdown" role="menu">
          <li role="none">
            <Link
              href={taskHref}
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
              onClick={() => void openMessage()}
            >
              <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span>
                <strong>Neue Nachricht</strong>
                <small>Empfänger wählen und intern senden</small>
              </span>
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              className="yd-relay-create-menu__item"
              role="menuitem"
              onClick={() => void openGroup()}
            >
              <UsersRound className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span>
                <strong>Gruppe erstellen</strong>
                <small>Team-Chat für Übergaben und Abstimmung</small>
              </span>
            </button>
          </li>
          {isDoctor ? (
            <li role="none">
              <Link
                href="/settings?section=einladungen"
                className="yd-relay-create-menu__item"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <UserPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                <span>
                  <strong>Mitarbeiter einladen</strong>
                  <small>Team in Einstellungen erweitern</small>
                </span>
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}

      <NewRelayMessageModal
        open={messageOpen}
        onClose={handleMessageClose}
        assignableMembers={members}
        currentUserId={currentUserId}
      />

      {currentUserId ? (
        <RelayGroupCreateModal
          open={groupOpen}
          onClose={() => setGroupOpen(false)}
          members={members}
          currentUserId={currentUserId}
          onCreated={handleGroupCreated}
        />
      ) : null}
    </div>
  );
}
