"use client";

import { useId, useRef, useState } from "react";
import { Users } from "lucide-react";

import {
  formatRelayReadReceiptBlock,
  type RelayReadReceiptRow,
} from "@/lib/relay/read-receipt-display";
import { cn } from "@/lib/utils";

type RelayReadStatusCompactProps = {
  receipts: RelayReadReceiptRow[];
  isGroup: boolean;
};

export function RelayReadStatusCompact({ receipts, isGroup }: RelayReadStatusCompactProps) {
  const popoverId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const { summary, lines } = formatRelayReadReceiptBlock(receipts, isGroup);
  const readLines = lines.filter((l) => l.read);
  const unreadLines = lines.filter((l) => !l.read);
  const allRead = lines.length > 0 && unreadLines.length === 0;

  if (receipts.length === 0 && !isGroup) {
    return (
      <p className="relay-read-compact__muted" aria-label="Zustellstatus">
        {summary}
      </p>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relay-read-compact"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn("relay-read-compact__trigger", allRead && "relay-read-compact__trigger--done")}
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={`Lesestatus: ${summary}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Users className="relay-read-compact__icon" strokeWidth={1.75} aria-hidden />
        <span className="relay-read-compact__summary">{summary}</span>
      </button>

      {open ? (
        <div id={popoverId} role="tooltip" className="relay-read-compact__popover">
          {readLines.length > 0 ? (
            <div className="relay-read-compact__group">
              <p className="relay-read-compact__heading">Gelesen</p>
              <ul className="relay-read-compact__names">
                {readLines.map((l) => (
                  <li key={l.name}>{l.name}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {unreadLines.length > 0 ? (
            <div className="relay-read-compact__group">
              <p className="relay-read-compact__heading">Noch offen</p>
              <ul className="relay-read-compact__names relay-read-compact__names--pending">
                {unreadLines.map((l) => (
                  <li key={l.name}>{l.name}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
