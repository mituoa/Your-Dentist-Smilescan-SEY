"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  BookOpen,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Settings,
  X,
} from "lucide-react";

import { SignOutSidebarForm } from "@/components/app-shell/sign-out-form";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type MoreLink = {
  id: string;
  href: string;
  label: string;
  hint?: string;
  icon: typeof Settings;
};

function buildMoreLinks(role: "doctor" | "team"): MoreLink[] {
  if (role === "doctor") {
    return [
      {
        id: "profile",
        href: "/profile/editor",
        label: "Profil",
        hint: "Benutzer",
        icon: MessageSquare,
      },
      {
        id: "journal",
        href: "/journal",
        label: "Care Center",
        hint: "Patientenwissen",
        icon: BookOpen,
      },
      {
        id: "settings",
        href: "/settings",
        label: "Admin",
        hint: "Einstellungen",
        icon: Settings,
      },
    ];
  }
  return [];
}

type WorkspaceMobileMoreSheetProps = {
  role?: "doctor" | "team";
  active?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function WorkspaceMobileMoreSheet({
  role = "doctor",
  active = false,
  onOpenChange,
  className,
}: WorkspaceMobileMoreSheetProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const links = buildMoreLinks(role);

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
                  Verwaltung
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
              {links.length > 0 ? (
                <ul className="yd-mobile-more-sheet__list">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.id}>
                        <Link
                          href={link.href}
                          className="yd-mobile-more-sheet__link"
                          onClick={() => setSheetOpen(false)}
                        >
                          <span className="yd-mobile-more-sheet__link-icon-shell" aria-hidden>
                            <Icon className="yd-mobile-more-sheet__link-icon" strokeWidth={1.75} />
                          </span>
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
              ) : null}
              <div className="yd-mobile-more-sheet__logout-wrap">
                <SignOutSidebarForm />
              </div>
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
          "yd-mobile-bottom-nav__item yd-mobile-bottom-nav__item--more group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 touch-manipulation border-0 bg-transparent p-0",
          active && "yd-nav-link-active yd-mobile-bottom-nav__item--active",
          className
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Verwaltung und Abmelden"
        onClick={() => setSheetOpen(true)}
      >
        {active ? <span className="yd-nav-active-halo yd-mobile-bottom-nav__halo" aria-hidden /> : null}
        <span
          className={cn(
            "yd-nav-icon-shell yd-mobile-bottom-nav__icon-shell relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            active && "yd-nav-icon-shell--active"
          )}
        >
          <MoreHorizontal
            className={cn("h-[22px] w-[22px]", active && "yd-nav-icon--active")}
            strokeWidth={active ? 2 : 1.55}
            style={{ color: active ? YD.sidebar.iconActive : YD.sidebar.iconIdle }}
            aria-hidden
          />
        </span>
        <span
          className={cn(
            "yd-mobile-bottom-nav__label max-w-full truncate text-[10px] font-medium leading-tight",
            active ? "text-[#1A4F9C]" : "text-[#64748B]"
          )}
        >
          Mehr
        </span>
      </button>
      {sheet}
    </>
  );
}
