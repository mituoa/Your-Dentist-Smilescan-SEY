"use client";

import { ArrowUpDown, Filter, LayoutGrid, MoreHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function RelayOverflowMenu() {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relay-v2-overflow">
      <button
        type="button"
        className={cn("relay-v2-overflow__trigger", open && "relay-v2-overflow__trigger--open")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label="Weitere Optionen"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal strokeWidth={1.75} aria-hidden />
      </button>
      {open ? (
        <ul id={menuId} className="relay-v2-overflow__menu" role="menu">
          <li role="none">
            <button type="button" className="relay-v2-overflow__item" role="menuitem">
              <Filter strokeWidth={1.75} aria-hidden />
              Filter
            </button>
          </li>
          <li role="none">
            <button type="button" className="relay-v2-overflow__item" role="menuitem">
              <ArrowUpDown strokeWidth={1.75} aria-hidden />
              Sortierung
            </button>
          </li>
          <li role="none">
            <button type="button" className="relay-v2-overflow__item" role="menuitem">
              <LayoutGrid strokeWidth={1.75} aria-hidden />
              Ansicht
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
