"use client";

import Link from "next/link";
import { useRef } from "react";
import { Check, Copy, Eye, Upload } from "lucide-react";

const ACCENT_PRESETS = [
  { value: "#2F80ED", default: true },
  { value: "#27AE60" },
  { value: "#95A5A6" },
  { value: "#5D6D7E" },
];

type SettingsPracticeProfilePanelProps = {
  slug: string;
  hostPrefix: string;
  profileDocPath: string;
  logoUrl: string | null;
  accent: string;
  workspaceName: string;
  calendarUrl: string;
  busy: boolean;
  copiedProfile: boolean;
  copiedCalendar: boolean;
  saveIndicator: string | null;
  onSlugChange: (value: string) => void;
  onSlugBlur: () => void;
  onCopyProfile: () => void;
  onLogoSelect: (file: File) => void;
  onLogoRemove: () => void;
  onAccent: (hex: string) => void;
  onWorkspaceNameChange: (value: string) => void;
  onWorkspaceNameBlur: () => void;
  onCalendarChange: (value: string) => void;
  onCopyCalendar: () => void;
};

export function SettingsPracticeProfilePanel({
  slug,
  hostPrefix,
  profileDocPath,
  logoUrl,
  accent,
  workspaceName,
  calendarUrl,
  busy,
  copiedProfile,
  copiedCalendar,
  saveIndicator,
  onSlugChange,
  onSlugBlur,
  onCopyProfile,
  onLogoSelect,
  onLogoRemove,
  onAccent,
  onWorkspaceNameChange,
  onWorkspaceNameBlur,
  onCalendarChange,
  onCopyCalendar,
}: SettingsPracticeProfilePanelProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="yd-settings-v2__panel">
      <div className="yd-settings-v2__panel-head yd-settings-v2__panel-head--solo">
        <div>
          <h2 className="yd-settings-v2__panel-title">Praxisprofil</h2>
          <p className="yd-settings-v2__panel-copy">
            Öffentliche Informationen, die Patienten auf Ihrem Profil sehen.
          </p>
        </div>
      </div>

      <div className="yd-settings-v2__fields">
        <div className="yd-settings-v2__field">
          <label className="yd-settings-v2__field-label" htmlFor="settings-workspace-name">
            Praxisname
          </label>
          <input
            id="settings-workspace-name"
            type="text"
            value={workspaceName}
            onChange={(e) => onWorkspaceNameChange(e.target.value)}
            onBlur={onWorkspaceNameBlur}
            className="yd-settings-v2__input"
            maxLength={80}
            disabled={busy}
          />
          {saveIndicator === "workspaceName" ? (
            <p className="yd-settings-v2__field-hint yd-settings-v2__field-hint--saved">Gespeichert</p>
          ) : null}
        </div>

        <div className="yd-settings-v2__field">
          <label className="yd-settings-v2__field-label">Öffentliches Profil</label>
          <div className="yd-settings-v2__slug-row">
            <div className="yd-settings-v2__slug-field">
              <span className="yd-settings-v2__slug-prefix">{hostPrefix}</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value.toLowerCase())}
                onBlur={onSlugBlur}
                className="yd-settings-v2__slug-input"
                maxLength={50}
                disabled={busy}
                aria-label="Profil-Slug"
              />
            </div>
            <button
              type="button"
              onClick={onCopyProfile}
              className={`yd-settings-v2__icon-btn${copiedProfile ? " yd-settings-v2__icon-btn--active" : ""}`}
              aria-label="Profil-URL kopieren"
            >
              {copiedProfile ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="yd-settings-v2__field-foot">
            <p className="yd-settings-v2__field-hint">Dieser Link ist für Ihre Patienten sichtbar</p>
            {saveIndicator === "profileSlug" ? (
              <p className="yd-settings-v2__field-hint yd-settings-v2__field-hint--saved">Gespeichert</p>
            ) : null}
          </div>
        </div>

        <div className="yd-settings-v2__field">
          <Link
            href={profileDocPath}
            target="_blank"
            rel="noopener noreferrer"
            className="yd-settings-v2__text-link"
          >
            <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Vorschau anzeigen
          </Link>
        </div>

        <div className="yd-settings-v2__field">
          <span className="yd-settings-v2__field-label">Logo</span>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) onLogoSelect(f);
            }}
          />
          {logoUrl ? (
            <div className="yd-settings-v2__logo-block">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="yd-settings-v2__logo-preview"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="" className="max-h-20 max-w-[200px] object-contain" />
              </button>
              <button type="button" onClick={onLogoRemove} className="yd-settings-v2__ghost-link" disabled={busy}>
                Logo entfernen
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="yd-settings-v2__upload"
              disabled={busy}
            >
              <Upload className="mb-2 h-5 w-5" strokeWidth={1.75} aria-hidden />
              <span>Logo hochladen</span>
              <span className="yd-settings-v2__upload-hint">512×512px empfohlen</span>
            </button>
          )}
          <p className="yd-settings-v2__field-hint">Ihr Logo erscheint in Ihrem öffentlichen Profil</p>
        </div>

        <div className="yd-settings-v2__field">
          <span className="yd-settings-v2__field-label">Akzentfarbe</span>
          <div className="yd-settings-v2__accents">
            {ACCENT_PRESETS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onAccent(option.value)}
                disabled={busy}
                className={`yd-settings-v2__accent${accent.toLowerCase() === option.value.toLowerCase() ? " yd-settings-v2__accent--active" : ""}`}
                style={{ background: option.value }}
                aria-label={`Akzentfarbe ${option.value}`}
              />
            ))}
          </div>
          {saveIndicator === "accentColor" ? (
            <p className="yd-settings-v2__field-hint yd-settings-v2__field-hint--saved">Gespeichert</p>
          ) : null}
        </div>

        <div className="yd-settings-v2__field">
          <label className="yd-settings-v2__field-label" htmlFor="settings-calendar-url">
            Terminbuchung (Kalender-Link)
          </label>
          <div className="yd-settings-v2__slug-row">
            <input
              id="settings-calendar-url"
              type="text"
              value={calendarUrl}
              onChange={(e) => onCalendarChange(e.target.value)}
              className="yd-settings-v2__input yd-settings-v2__input--grow"
              placeholder="https://…"
              disabled={busy}
            />
            <button
              type="button"
              onClick={onCopyCalendar}
              className={`yd-settings-v2__icon-btn${copiedCalendar ? " yd-settings-v2__icon-btn--active" : ""}`}
              aria-label="Kalender-Link kopieren"
            >
              {copiedCalendar ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="yd-settings-v2__field-foot">
            <p className="yd-settings-v2__field-hint">Patienten können über diesen Link Termine buchen</p>
            {saveIndicator === "calendarUrl" ? (
              <p className="yd-settings-v2__field-hint yd-settings-v2__field-hint--saved">Gespeichert</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
