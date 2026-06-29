"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ClipboardList, MessageSquarePlus, Plus } from "lucide-react";

import { fetchAssignableMembersForTaskCreate } from "@/app/(protected)/my-tasks/actions";
import { useAssistDispatchOptional } from "@/components/command-assist/assist-shell";
import { NewRelayMessageModal } from "@/components/my-tasks/new-relay-message-modal";
import type { AssignableMember } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

type RelayCreateMenuProps = {
  assignableMembers?: AssignableMember[];
  currentUserId?: string;
  className?: string;
  /** @deprecated Nutze placement="header" */
  variant?: "primary" | "secondary";
  placement?: "header" | "toolbar" | "inline" | "mobile";
  /** @deprecated Nicht mehr im Menü verwendet */
  isDoctor?: boolean;
  label?: string;
  onMessageCreated?: () => void;
  /** @deprecated Gruppenchat nicht mehr im Neu-Menü */
  onGroupCreated?: (conversationId: string) => void;
};

function triggerClass(
  placement: RelayCreateMenuProps["placement"],
  variant: RelayCreateMenuProps["variant"],
  open: boolean
) {
  if (placement === "mobile") {
    return cn(
      "yd-mobile-topbar-create yd-mobile-topbar-create--task yd-relay-create-menu__trigger",
      open && "yd-mobile-topbar-create--open"
    );
  }
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
  label,
  onMessageCreated,
}: RelayCreateMenuProps) {
  const router = useRouter();
  const assist = useAssistDispatchOptional();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [members, setMembers] = useState<AssignableMember[]>(membersProp ?? []);
  const [currentUserId, setCurrentUserId] = useState(userIdProp ?? "");
  const [membersLoading, setMembersLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const triggerLabel =
    label ??
    (placement === "mobile"
      ? ""
      : placement === "header"
        ? "Neu"
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

  const openTask = () => {
    setOpen(false);
    assist?.openTaskModal();
  };

  const openMessage = async () => {
    setOpen(false);
    await ensureMembers();
    setMessageOpen(true);
  };

  const handleMessageClose = () => {
    setMessageOpen(false);
    onMessageCreated?.();
  };

  const showChevron =
    placement !== "mobile" && (placement !== "inline" || variant === "primary");
  const isMobileIcon = placement === "mobile";

  return (
    <div
      ref={rootRef}
      className={cn(
        "yd-relay-create-menu",
        isMobileIcon && "yd-mobile-topbar-create-menu",
        className
      )}
    >
      <button
        type="button"
        className={triggerClass(placement, variant, open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        title={isMobileIcon ? "Neu erstellen" : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <Plus className="h-4 w-4 shrink-0" strokeWidth={isMobileIcon ? 2.25 : 2} aria-hidden />
        {triggerLabel ? <span>{triggerLabel}</span> : <span className="sr-only">Neu erstellen</span>}
        {showChevron ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
        ) : null}
      </button>

      {open ? (
        <ul
          id={menuId}
          className={cn(
            "yd-relay-create-menu__dropdown",
            isMobileIcon && "yd-mobile-topbar-create-menu__dropdown"
          )}
          role="menu"
        >
          <li role="none">
            <button
              type="button"
              className="yd-relay-create-menu__item yd-relay-create-menu__item--compact"
              role="menuitem"
              onClick={openTask}
            >
              <ClipboardList className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span>Aufgabe</span>
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              className="yd-relay-create-menu__item yd-relay-create-menu__item--compact"
              role="menuitem"
              onClick={() => void openMessage()}
            >
              <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span>Teamnachricht</span>
            </button>
          </li>
        </ul>
      ) : null}

      <NewRelayMessageModal
        open={messageOpen}
        onClose={handleMessageClose}
        assignableMembers={members}
        currentUserId={currentUserId}
      />
    </div>
  );
}
