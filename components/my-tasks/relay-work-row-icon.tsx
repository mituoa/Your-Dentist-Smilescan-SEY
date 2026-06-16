"use client";

import {
  ArrowLeftRight,
  ClipboardList,
  MessageSquare,
  RefreshCw,
  Stamp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import {
  RELAY_WORK_TYPE_LABELS,
  resolveRelayWorkVisualType,
  type RelayWorkVisualType,
} from "@/lib/relay/relay-work-visual-type";
import { cn } from "@/lib/utils";

const ICONS: Record<RelayWorkVisualType, LucideIcon> = {
  freigabe: Stamp,
  aufgabe: ClipboardList,
  routine: RefreshCw,
  nachricht: MessageSquare,
  uebergabe: ArrowLeftRight,
};

type RelayWorkRowIconProps = {
  row: RelayWorkRow;
  className?: string;
};

/** Kleines neutrales Symbol — Vorgangstyp in <0,5 s erkennbar. */
export function RelayWorkRowIcon({ row, className }: RelayWorkRowIconProps) {
  const visual = resolveRelayWorkVisualType(row);
  const Icon = ICONS[visual];
  const label = RELAY_WORK_TYPE_LABELS[visual];

  return (
    <span className={cn("yd-relay-v7-row-icon", className)} aria-hidden>
      <Icon className="yd-relay-v7-row-icon__glyph" strokeWidth={1.75} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
