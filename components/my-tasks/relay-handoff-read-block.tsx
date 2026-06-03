"use client";

import { Check } from "lucide-react";

import {
  formatRelayReadReceiptBlock,
  type RelayReadReceiptRow,
} from "@/lib/relay/read-receipt-display";

type RelayHandoffReadBlockProps = {
  receipts: RelayReadReceiptRow[];
  isGroup: boolean;
};

export function RelayHandoffReadBlock({ receipts, isGroup }: RelayHandoffReadBlockProps) {
  const { summary, lines } = formatRelayReadReceiptBlock(receipts, isGroup);

  if (receipts.length === 0) {
    return (
      <p className="relay-handoff-read__summary" aria-label="Zustellstatus">
        {summary}
      </p>
    );
  }

  return (
    <div className="relay-handoff-read">
      <p className="relay-handoff-read__label">Gelesen von:</p>
      <ul className="relay-handoff-read__list">
        {lines.map((line) => (
          <li key={line.name} className="relay-handoff-read__item">
            {line.read ? (
              <Check className="relay-handoff-read__check" strokeWidth={2.5} aria-hidden />
            ) : (
              <span className="relay-handoff-read__pending" aria-hidden />
            )}
            <span className={line.read ? "" : "relay-handoff-read__unread-name"}>{line.name}</span>
          </li>
        ))}
      </ul>
      {lines.every((l) => l.read) ? null : (
        <p className="relay-handoff-read__summary">{summary}</p>
      )}
    </div>
  );
}
