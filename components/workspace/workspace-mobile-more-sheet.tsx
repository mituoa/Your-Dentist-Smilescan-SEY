"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  LogOut,
  MapPin,
  MoreHorizontal,
  Settings,
  Store,
  UserCircle,
  Users,
  X,
} from "lucide-react";

import { signOutWithFullPageRedirect } from "@/lib/auth/sign-out-client";
import { cn } from "@/lib/utils";

type MoreLink = {
  id: string;
  href: string;
  label: string;
  hint?: string;
  icon: typeof Settings;
  external?: boolean;
};

const MORE_LINKS: MoreLink[] = [
  { id: "settings", href: "/settings", label: "Einstellungen", icon: Settings },
  { id: "team", href: "/settings?section=team-rollen", label: "Team", icon: Users },
  { id: "profile", href: "/settings?section=praxisprofil", label: "Praxisprofil", icon: Store },
  {
    id: "journal-settings",
    href: "/settings?section=journal-kategorien",
    label: "Journal-Einstellungen",
    icon: BookOpen,
  },
  { id: "locations", href: "/settings?section=standorte", label: "Standorte", icon: MapPin },
  { id: "hours", href: "/settings?section=oeffnungszeiten", label: "Öffnungszeiten", icon: Clock },
  {
    id: "public-profile",
    href: "/profile/editor",
    label: "Profil bearbeiten",
    hint: "Öffentliche Darstellung",
    icon: UserCircle,
  },
];

type WorkspaceMobileMoreSheetProps = {
  active?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function WorkspaceMobileMoreSheet({
  active = false,
  onOpenChange,
  className,
}: WorkspaceMobileMoreSheetProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  const setSheetOpen = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setSheetOpen]);

  const handleLogout = () => {
    if (busy) return;
    setBusy(true);
    void (async () => {
      try {
        await signOutWithFullPageRedirect();
      } finally {
        setBusy(false);
      }
    })();
  };

  const sheet =
    mounted && open
      ? createPortal(
          <div
            className="yd-mobile-more-backdrop"
            role="presentation"
            onClick={() => setSheetOpen(false)}
          >
            <div
              className="yd-mobile-more-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="yd-mobile-more-sheet__head">
                <h2 id={titleId} className="yd-mobile-more-sheet__title">
                  Mehr
                </h2>
                <button
                  type="button"
                  className="yd-mobile-more-sheet__close"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Schließen"
                >
                  <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
              <ul className="yd-mobile-more-sheet__list">
                {MORE_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="yd-mobile-more-sheet__link"
                        onClick={() => setSheetOpen(false)}
                      >
                        <Icon className="yd-mobile-more-sheet__link-icon" strokeWidth={1.75} aria-hidden />
                        <span className="yd-mobile-more-sheet__link-text">
                          <span className="yd-mobile-more-sheet__link-label">{link.label}</span>
                          {link.hint ? (
                            <span className="yd-mobile-more-sheet__link-hint">{link.hint}</span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className="yd-mobile-more-sheet__logout"
                disabled={busy}
                aria-busy={busy}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Abmelden
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        className={cn(
          "yd-ws-mobile-shortcuts__item yd-ws-mobile-shortcuts__item--more",
          active && "yd-ws-mobile-shortcuts__item--active",
          className
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setSheetOpen(true)}
      >
        <MoreHorizontal className="yd-ws-mobile-shortcuts__icon" strokeWidth={1.85} aria-hidden />
        <span className="yd-ws-mobile-shortcuts__label">Mehr</span>
      </button>
      {sheet}
    </>
  );
}
