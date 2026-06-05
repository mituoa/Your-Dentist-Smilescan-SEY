"use client";

import Link from "next/link";
import {
  ClipboardList,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Users,
} from "lucide-react";

import type { RelayPracticeSection, RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

function sectionIcon(section: RelayPracticeSection) {
  switch (section) {
    case "attention":
      return FileText;
    case "teamwork":
      return Users;
    case "handovers":
      return MessageSquare;
    case "practice":
      return ClipboardList;
  }
}

type RelayCentralTaskCardProps = {
  row: RelayWorkRow;
  section: RelayPracticeSection;
};

/** Aufgabenzeile — Referenz-Layout, Enterprise-Materialität. */
export function RelayCentralTaskCard({ row, section }: RelayCentralTaskCardProps) {
  const Icon = sectionIcon(section);

  return (
    <li className="yd-relay-central-task">
      <div className="yd-relay-central-task__surface">
        <span className={cn("yd-relay-central-task__icon", `yd-relay-central-task__icon--${section}`)}>
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <Link href={row.href} className="yd-relay-central-task__main">
          <span className="yd-relay-central-task__title yd-tracker-v16-inbox-card__headline">
            {row.primaryLabel}
          </span>
          <span className="yd-relay-central-task__meta yd-tracker-v16-inbox-card__context">
            {row.context}
            {row.timeLabel ? ` · ${row.timeLabel}` : ""}
          </span>
        </Link>
        <span className={cn("yd-relay-central-task__pill", `yd-relay-central-task__pill--${section}`)}>
          {row.statusLabel}
        </span>
        <Link href={row.href} className="yd-relay-central-task__action">
          {row.actionLabel}
        </Link>
        <Link
          href={row.href}
          className="yd-relay-central-task__more"
          aria-label="Details öffnen"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </li>
  );
}
