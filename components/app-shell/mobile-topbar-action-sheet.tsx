"use client";

import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type MobileTopbarActionSheetItem = {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  onSelect: () => void;
};

type MobileTopbarActionSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  items: MobileTopbarActionSheetItem[];
};

/** Portiertes Auswahl-Sheet — lesbar über dem Workspace, ohne Topbar-Overflow. */
export function MobileTopbarActionSheet({
  open,
  onClose,
  title = "Neu erstellen",
  items,
}: MobileTopbarActionSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="yd-mobile-create-sheet-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="yd-mobile-create-sheet"
        role="menu"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="yd-mobile-create-sheet__head">
          <p className="yd-mobile-create-sheet__title">{title}</p>
          <button
            type="button"
            className="yd-mobile-create-sheet__close"
            onClick={onClose}
            aria-label="Schließen"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
        <ul className="yd-mobile-create-sheet__list">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className="yd-mobile-create-sheet__item"
                  onClick={() => {
                    onClose();
                    item.onSelect();
                  }}
                >
                  <span className="yd-mobile-create-sheet__icon-shell" aria-hidden>
                    <Icon className="yd-mobile-create-sheet__icon" strokeWidth={1.75} />
                  </span>
                  <span className="yd-mobile-create-sheet__text">
                    <span className="yd-mobile-create-sheet__label">{item.label}</span>
                    {item.hint ? (
                      <span className="yd-mobile-create-sheet__hint">{item.hint}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body
  );
}
