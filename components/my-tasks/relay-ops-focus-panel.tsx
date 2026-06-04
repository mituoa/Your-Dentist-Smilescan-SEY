"use client";

import Link from "next/link";

import type { RelayOpsFocusItem } from "@/lib/relay/build-relay-ops-snapshot";

type RelayOpsFocusPanelProps = {
  title: string;
  subtitle: string;
  items: RelayOpsFocusItem[];
  emptyTitle: string;
  emptyText: string;
};

export function RelayOpsFocusPanel({
  title,
  subtitle,
  items,
  emptyTitle,
  emptyText,
}: RelayOpsFocusPanelProps) {
  return (
    <section className="yd-relay-ops-focus" aria-label={title}>
      <header className="yd-relay-ops-focus__head">
        <h2 className="yd-relay-ops-focus__title">{title}</h2>
        <p className="yd-relay-ops-focus__subtitle">{subtitle}</p>
      </header>
      {items.length === 0 ? (
        <div className="yd-relay-empty-state yd-relay-empty-state--compact">
          <p className="yd-relay-empty-state__title">{emptyTitle}</p>
          <p className="yd-relay-empty-state__text">{emptyText}</p>
        </div>
      ) : (
        <ul className="yd-relay-ops-focus__list">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="yd-relay-ops-focus__row">
                <span className="yd-relay-ops-focus__row-title">{item.title}</span>
                <span className="yd-relay-ops-focus__row-meta">
                  {item.patientLabel ? `${item.patientLabel} · ` : ""}
                  {item.assigneeLabel} · {item.lastActivityLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
