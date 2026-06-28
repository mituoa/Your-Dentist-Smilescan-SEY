"use client";

import {
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ListTodo,
  MessageCircle,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  RELAY_BEREICHE,
  type RelayBereich,
} from "@/lib/relay/relay-bereich-model";

const BEREICH_ICONS: Record<RelayBereich, typeof ListTodo> = {
  aufgaben: ListTodo,
  team: MessageCircle,
  journal: BookOpen,
  praxis: Building2,
  patienten: Users,
};

const NAV_COLLAPSED_KEY = "relay-side-nav-collapsed";

type Props = {
  activeBereich: RelayBereich;
  counts: Record<RelayBereich, number>;
  teamUnread: number;
  onBereichChange: (bereich: RelayBereich) => void;
  variant?: "desktop" | "mobile";
};

export function RelaySideNav({
  activeBereich,
  counts,
  teamUnread,
  onBereichChange,
  variant = "desktop",
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (variant !== "desktop") return;
    try {
      setCollapsed(window.localStorage.getItem(NAV_COLLAPSED_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, [variant]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(NAV_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <nav
      className={cn(
        "relay-center__side-nav",
        variant === "mobile" && "relay-center__side-nav--mobile",
        variant === "desktop" && collapsed && "relay-center__side-nav--collapsed"
      )}
      aria-label="Relay-Navigation"
    >
      {variant === "desktop" ? (
        <div className="relay-center__side-nav-top">
          {!collapsed ? <p className="relay-center__side-nav-eyebrow">Relay</p> : null}
          <button
            type="button"
            className="relay-center__side-nav-toggle"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Navigation erweitern" : "Navigation einklappen"}
            title={collapsed ? "Erweitern" : "Einklappen"}
          >
            {collapsed ? <ChevronRight size={16} strokeWidth={2} /> : <ChevronLeft size={16} strokeWidth={2} />}
          </button>
        </div>
      ) : null}
      <ul className="relay-center__side-nav-list">
        {RELAY_BEREICHE.map((item) => {
          const active = activeBereich === item.id;
          const badge =
            item.id === "team" ? teamUnread : item.id !== "aufgaben" ? counts[item.id] : 0;
          const Icon = BEREICH_ICONS[item.id];

          return (
            <li key={item.id}>
              <button
                type="button"
                className={cn(
                  "relay-center__side-nav-pill",
                  active && "relay-center__side-nav-pill--active"
                )}
                onClick={() => onBereichChange(item.id)}
                aria-current={active ? "true" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="relay-center__side-nav-icon" size={18} strokeWidth={1.75} aria-hidden />
                <span className="relay-center__side-nav-label">{item.label}</span>
                {badge > 0 ? <span className="relay-center__side-nav-badge">{badge}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function RelayBereichHeading({ bereich }: { bereich: RelayBereich }) {
  const item = RELAY_BEREICHE.find((b) => b.id === bereich);
  if (!item) return null;

  const subtitles: Record<RelayBereich, string> = {
    aufgaben: "Ihre persönlichen Aufgaben für heute",
    team: "Interne Nachrichten und Abstimmung",
    journal: "Redaktion und Freigaben",
    praxis: "Organisation und Teamabläufe",
    patienten: "Anfragen und Rückmeldungen",
  };

  return (
    <header className="relay-mod__section-head">
      <h2 className="relay-mod__section-title">{item.label}</h2>
      <p className="relay-mod__section-sub">{subtitles[bereich]}</p>
    </header>
  );
}

type EmptyStateProps = {
  title?: string;
  hint?: string;
};

export function RelayV2EmptyState({
  title = "Keine offenen Aufgaben",
  hint,
}: EmptyStateProps) {
  return (
    <div className="relay-v2-empty">
      <Inbox className="relay-v2-empty__icon" strokeWidth={1.5} aria-hidden />
      <p className="relay-v2-empty__title">{title}</p>
      {hint ? <p className="relay-v2-empty__hint">{hint}</p> : null}
    </div>
  );
}
