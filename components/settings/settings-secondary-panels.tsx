"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SettingsPlaceholderPanelProps = {
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
};

export function SettingsPlaceholderPanel({
  title,
  description,
  href,
  hrefLabel,
}: SettingsPlaceholderPanelProps) {
  return (
    <div className="yd-settings-v2__panel">
      <div className="yd-settings-v2__panel-head yd-settings-v2__panel-head--solo">
        <div>
          <h2 className="yd-settings-v2__panel-title">{title}</h2>
          <p className="yd-settings-v2__panel-copy">{description}</p>
        </div>
      </div>
      {href && hrefLabel ? (
        <Link href={href} className="yd-settings-v2__panel-link">
          {hrefLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      ) : (
        <p className="yd-settings-v2__empty-inline">Dieser Bereich wird als Nächstes ergänzt.</p>
      )}
    </div>
  );
}

type SettingsSecurityPanelProps = {
  userEmail: string;
  theme: "light" | "dark";
  passwordHint: string | null;
  busy: boolean;
  onPasswordReset: () => void;
  onThemeChange: (theme: "light" | "dark") => void;
  onLogout: () => void;
};

export function SettingsSecurityPanel({
  userEmail,
  theme,
  passwordHint,
  busy,
  onPasswordReset,
  onThemeChange,
  onLogout,
}: SettingsSecurityPanelProps) {
  return (
    <div className="yd-settings-v2__panel">
      <div className="yd-settings-v2__panel-head yd-settings-v2__panel-head--solo">
        <div>
          <h2 className="yd-settings-v2__panel-title">Sicherheit</h2>
          <p className="yd-settings-v2__panel-copy">
            Passwort, Erscheinungsbild und Sitzung Ihres Kontos.
          </p>
        </div>
      </div>

      <div className="yd-settings-v2__fields">
        <div className="yd-settings-v2__field">
          <label className="yd-settings-v2__field-label" htmlFor="settings-email">
            E-Mail
          </label>
          <input
            id="settings-email"
            type="email"
            value={userEmail}
            disabled
            readOnly
            className="yd-settings-v2__input yd-settings-v2__input--readonly"
          />
        </div>

        <div className="yd-settings-v2__field">
          <span className="yd-settings-v2__field-label">Passwort</span>
          <button
            type="button"
            onClick={onPasswordReset}
            disabled={busy}
            className="yd-settings-v2__ghost-link"
          >
            Passwort ändern
          </button>
          {passwordHint ? <p className="yd-settings-v2__field-hint">{passwordHint}</p> : null}
        </div>

        <div className="yd-settings-v2__field">
          <span className="yd-settings-v2__field-label">Erscheinungsbild</span>
          <div className="yd-settings-v2__theme-row">
            <button
              type="button"
              onClick={() => onThemeChange("light")}
              className={`yd-settings-v2__theme-btn${theme === "light" ? " yd-settings-v2__theme-btn--active" : ""}`}
            >
              Hell
            </button>
            <button
              type="button"
              onClick={() => onThemeChange("dark")}
              className={`yd-settings-v2__theme-btn${theme === "dark" ? " yd-settings-v2__theme-btn--active" : ""}`}
            >
              Dunkel
            </button>
          </div>
        </div>

        <div className="yd-settings-v2__field yd-settings-v2__field--divider">
          <button type="button" onClick={onLogout} className="yd-settings-v2__logout-btn">
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
