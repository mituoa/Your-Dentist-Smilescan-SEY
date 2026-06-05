"use client";

import { ChevronRight } from "lucide-react";

import {
  SETTINGS_MOBILE_NAV_GROUPS,
  type SettingsSectionId,
} from "@/lib/settings/settings-navigation";

type SettingsMobileNavProps = {
  activeSection: SettingsSectionId;
  onNavigate: (section: SettingsSectionId) => void;
};

/** Mobile-only settings hub — grouped premium sections (desktop nav unchanged). */
export function SettingsMobileNav({ activeSection, onNavigate }: SettingsMobileNavProps) {
  return (
    <nav className="yd-settings-mobile-nav md:hidden" aria-label="Einstellungsbereiche">
      {SETTINGS_MOBILE_NAV_GROUPS.map((group) => (
        <section key={group.label} className="yd-settings-mobile-nav__group">
          <h2 className="yd-settings-mobile-nav__group-label">{group.label}</h2>
          <ul className="yd-settings-mobile-nav__list">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`yd-settings-mobile-nav__item${isActive ? " yd-settings-mobile-nav__item--active" : ""}`}
                    onClick={() => onNavigate(item.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="yd-settings-mobile-nav__icon-wrap" aria-hidden>
                      <Icon className="yd-settings-mobile-nav__icon" strokeWidth={1.75} />
                    </span>
                    <span className="yd-settings-mobile-nav__text">
                      <span className="yd-settings-mobile-nav__label">{item.label}</span>
                      <span className="yd-settings-mobile-nav__hint">{item.hint}</span>
                    </span>
                    <ChevronRight className="yd-settings-mobile-nav__chevron" strokeWidth={1.75} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
