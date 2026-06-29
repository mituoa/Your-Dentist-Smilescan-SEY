"use client";

import { ClipboardList, MessageSquarePlus, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { fetchAssignableMembersForTaskCreate } from "@/app/(protected)/my-tasks/actions";
import { NewCaseModal } from "@/components/cases/new-case-modal";
import { useAssistDispatchOptional } from "@/components/command-assist/assist-shell";
import { RelayCreateMenu } from "@/components/my-tasks/relay-create-menu";
import { NewRelayMessageModal } from "@/components/my-tasks/new-relay-message-modal";
import type { AssignableMember } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

type MobileActionVariant = "both" | "newCase" | "newTask";

type MobileTopbarCreateMenuProps = {
  actionVariant: MobileActionVariant;
  workspaceId: string;
  className?: string;
};

export function MobileTopbarCreateMenu({
  actionVariant,
  workspaceId,
  className,
}: MobileTopbarCreateMenuProps) {
  const router = useRouter();

  if (actionVariant === "newTask") {
    return (
      <RelayCreateMenu
        placement="mobile"
        className={className}
        onMessageCreated={() => router.push("/relay?area=nachrichten")}
      />
    );
  }

  if (actionVariant === "newCase") {
    return <MobileNeuerFallButton workspaceId={workspaceId} className={className} />;
  }

  return <MobileAtlasCreateMenu workspaceId={workspaceId} className={className} />;
}

function MobileNeuerFallButton({
  workspaceId,
  className,
}: {
  workspaceId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Neuer Fall"
        aria-label="Neuer Fall"
        className={cn("yd-mobile-topbar-create yd-mobile-topbar-create--primary", className)}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
      </button>
      <NewCaseModal open={open} onClose={() => setOpen(false)} workspaceId={workspaceId} />
    </>
  );
}

function MobileAtlasCreateMenu({
  workspaceId,
  className,
}: {
  workspaceId: string;
  className?: string;
}) {
  const router = useRouter();
  const assist = useAssistDispatchOptional();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [caseOpen, setCaseOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [members, setMembers] = useState<AssignableMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [membersLoading, setMembersLoading] = useState(false);

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

  const openCase = () => {
    setOpen(false);
    setCaseOpen(true);
  };

  const openTask = () => {
    setOpen(false);
    assist?.openTaskModal();
  };

  const openMessage = async () => {
    setOpen(false);
    await ensureMembers();
    setMessageOpen(true);
  };

  return (
    <div ref={rootRef} className={cn("yd-mobile-topbar-create-menu", className)}>
      <button
        type="button"
        className={cn(
          "yd-mobile-topbar-create yd-mobile-topbar-create--menu",
          open && "yd-mobile-topbar-create--open"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        title="Neu erstellen"
        onClick={() => setOpen((v) => !v)}
      >
        <Plus className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
        <span className="sr-only">Neu erstellen</span>
      </button>

      {open ? (
        <ul id={menuId} className="yd-mobile-topbar-create-menu__dropdown" role="menu">
          <li role="none">
            <button
              type="button"
              className="yd-relay-create-menu__item yd-relay-create-menu__item--compact"
              role="menuitem"
              onClick={openCase}
            >
              <UserPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span>Neuer Fall</span>
            </button>
          </li>
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

      <NewCaseModal open={caseOpen} onClose={() => setCaseOpen(false)} workspaceId={workspaceId} />
      <NewRelayMessageModal
        open={messageOpen}
        onClose={() => {
          setMessageOpen(false);
          router.push("/relay?area=nachrichten");
        }}
        assignableMembers={members}
        currentUserId={currentUserId}
      />
    </div>
  );
}
