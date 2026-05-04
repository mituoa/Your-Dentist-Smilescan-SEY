"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Eye, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  changeSlug,
  changeWorkspaceName,
  checkSlugAvailability,
  inviteTeamMember,
  removeTeamMember,
  requestPasswordReset,
  revokeInvitation,
  saveAccentColor,
  saveAppointmentLink,
  uploadLogo,
  removeLogo,
} from "@/app/(protected)/settings/actions";
import { setThemePreference } from "@/app/actions/theme";
import type { TeamInvitation, TeamMember } from "@/lib/types/settings-team";
import type { ThemePreference } from "@/lib/theme";

const ACCENT_PRESETS = [
  { value: "#2F80ED", default: true },
  { value: "#27AE60" },
  { value: "#95A5A6" },
  { value: "#5D6D7E" },
];

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function roleLabelDoctorTeam(role: "doctor" | "team"): string {
  return role === "doctor" ? "Administrator" : "Bearbeiter";
}

function profileDocPath(slug: string): string {
  return `/doc/${slug}`;
}

function fullProfileUrl(appBase: string, slug: string): string {
  const base = appBase.replace(/\/$/, "");
  return `${base}/doc/${slug}`;
}

function hostDocPrefix(appBase: string): string {
  try {
    const u = new URL(appBase);
    return `${u.host}/doc/`;
  } catch {
    return "…/doc/";
  }
}

interface SettingsFigmaViewProps {
  appBaseUrl: string;
  initialSlug: string;
  initialWorkspaceName: string;
  initialAppointmentLink: string | null;
  logoUrl: string | null;
  initialAccentColor: string;
  userEmail: string;
  initialTheme: ThemePreference;
  members: TeamMember[];
  invitations: TeamInvitation[];
  currentUserId: string;
}

export function SettingsFigmaView({
  appBaseUrl,
  initialSlug,
  initialWorkspaceName,
  initialAppointmentLink,
  logoUrl,
  initialAccentColor,
  userEmail,
  initialTheme,
  members,
  invitations,
  currentUserId,
}: SettingsFigmaViewProps) {
  const router = useRouter();

  const [slug, setSlug] = useState(initialSlug);
  const [workspaceName, setWorkspaceName] = useState(initialWorkspaceName);
  const [calendarUrl, setCalendarUrl] = useState(initialAppointmentLink || "");
  const [accent, setAccent] = useState(initialAccentColor);
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);

  const [copiedProfile, setCopiedProfile] = useState(false);
  const [copiedCalendar, setCopiedCalendar] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"doctor" | "team">("team");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordHint, setPasswordHint] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const calDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSlug(initialSlug);
  }, [initialSlug]);
  useEffect(() => {
    setWorkspaceName(initialWorkspaceName);
  }, [initialWorkspaceName]);
  useEffect(() => {
    setCalendarUrl(initialAppointmentLink || "");
  }, [initialAppointmentLink]);
  useEffect(() => {
    setAccent(initialAccentColor);
  }, [initialAccentColor]);
  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  const flashSaved = useCallback((field: string) => {
    setSaveIndicator(field);
    setTimeout(() => setSaveIndicator(null), 1800);
  }, []);

  const persistSlug = useCallback(
    async (next: string) => {
      const normalized = next.trim().toLowerCase();
      if (normalized === initialSlug) return;
      const avail = await checkSlugAvailability(normalized);
      if (avail.error || !avail.available) {
        setFormError(avail.error || "Slug nicht verfügbar.");
        return;
      }
      const res = await changeSlug(normalized);
      if (res.error) setFormError(res.error);
      else {
        setFormError(null);
        flashSaved("profileSlug");
        router.refresh();
      }
    },
    [initialSlug, router, flashSaved]
  );

  const flushSlug = useCallback(() => {
    void (async () => {
      setBusy(true);
      try {
        await persistSlug(slug);
      } finally {
        setBusy(false);
      }
    })();
  }, [slug, persistSlug]);

  const persistWorkspaceName = useCallback(
    async (name: string) => {
      if (name === initialWorkspaceName) return;
      const res = await changeWorkspaceName(name);
      if (res.error) setFormError(res.error);
      else {
        setFormError(null);
        flashSaved("workspaceName");
        router.refresh();
      }
    },
    [initialWorkspaceName, router, flashSaved]
  );

  const flushWorkspaceName = useCallback(() => {
    const t = workspaceName.trim();
    if (!t) return;
    void (async () => {
      setBusy(true);
      try {
        await persistWorkspaceName(t);
      } finally {
        setBusy(false);
      }
    })();
  }, [workspaceName, persistWorkspaceName]);

  const persistCalendar = useCallback(
    async (url: string) => {
      const t = url.trim();
      const init = (initialAppointmentLink || "").trim();
      if (t === init) return;
      const res = await saveAppointmentLink(url);
      if (res.error) setFormError(res.error);
      else {
        setFormError(null);
        flashSaved("calendarUrl");
        router.refresh();
      }
    },
    [initialAppointmentLink, router, flashSaved]
  );

  const onCalendarChange = (v: string) => {
    setCalendarUrl(v);
    setFormError(null);
    if (calDebounce.current) clearTimeout(calDebounce.current);
    calDebounce.current = setTimeout(() => {
      void (async () => {
        setBusy(true);
        try {
          await persistCalendar(v);
        } finally {
          setBusy(false);
        }
      })();
    }, 800);
  };

  const handleCopy = (text: string, type: "calendar" | "profile") => {
    void navigator.clipboard.writeText(text);
    if (type === "calendar") {
      setCopiedCalendar(true);
      setTimeout(() => setCopiedCalendar(false), 1800);
    } else {
      setCopiedProfile(true);
      setTimeout(() => setCopiedProfile(false), 1800);
    }
  };

  const handleAccent = async (hex: string) => {
    setAccent(hex);
    setBusy(true);
    setFormError(null);
    try {
      const res = await saveAccentColor(hex);
      if (res.error) setFormError(res.error);
      else {
        flashSaved("accentColor");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleLogo = (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    setBusy(true);
    setFormError(null);
    void (async () => {
      try {
        const r = await uploadLogo(fd);
        if (r.error) setFormError(r.error);
        else router.refresh();
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    setFormError(null);
    void (async () => {
      try {
        const r = await inviteTeamMember(inviteEmail.trim(), inviteRole);
        if (r.error) setFormError(r.error);
        else {
          setInviteEmail("");
          router.refresh();
        }
      } finally {
        setBusy(false);
      }
    })();
  };

  const handlePassword = () => {
    setPasswordHint(null);
    void (async () => {
      const r = await requestPasswordReset();
      if (r.error) setFormError(r.error);
      else setPasswordHint("Link zum Zurücksetzen wurde an Ihre E-Mail gesendet.");
    })();
  };

  const handleTheme = (mode: ThemePreference) => {
    if (mode === theme) return;
    setTheme(mode);
    void (async () => {
      await setThemePreference(mode);
      router.refresh();
    })();
  };

  const handleLogout = () => {
    void (async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    })();
  };

  const sortedMembers = [...members].sort((a, b) => {
    if (a.role !== b.role) return a.role === "doctor" ? -1 : 1;
    return a.email.localeCompare(b.email);
  });

  const listRows: Array<{
    key: string;
    name: string;
    email: string;
    right: string;
    pending?: boolean;
    invitationId?: string;
    memberUserId?: string;
  }> = [];

  for (const m of sortedMembers) {
    listRows.push({
      key: `m-${m.user_id}`,
      name: nameFromEmail(m.email),
      email: m.email,
      right: roleLabelDoctorTeam(m.role),
      memberUserId: m.user_id,
    });
  }
  for (const inv of invitations) {
    listRows.push({
      key: `i-${inv.id}`,
      name: nameFromEmail(inv.email),
      email: inv.email,
      right: "Ausstehend",
      pending: true,
      invitationId: inv.id,
    });
  }

  const hostPrefix = hostDocPrefix(appBaseUrl);
  const profileCopyUrl = fullProfileUrl(appBaseUrl, slug);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-auto" style={{ background: "#FAFAF8" }}>
      <div className="flex-1 overflow-auto">
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 48px 160px" }}>
          {formError ? (
            <div
              className="mb-8 mt-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </div>
          ) : null}

          <div style={{ paddingTop: 96, marginBottom: 72 }}>
            <h1
              className="font-medium"
              style={{
                fontSize: 38,
                color: "#1A1A1A",
                marginBottom: 8,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Einstellungen
            </h1>
            <p style={{ fontSize: 15, color: "#999999", lineHeight: 1.5 }}>
              Verwalten Sie Ihre Praxis und Ihr Team
            </p>
          </div>

          {/* Ihre Praxis */}
          <section style={{ marginBottom: 96 }}>
            <h2
              className="font-medium"
              style={{ fontSize: 20, color: "#1A1A1A", marginBottom: 24, letterSpacing: "-0.01em" }}
            >
              Ihre Praxis
            </h2>

            <div style={{ marginBottom: 32 }}>
              <label className="block" style={{ fontSize: 13, color: "#999999", marginBottom: 8 }}>
                Öffentliches Profil
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="flex min-w-0 flex-1 items-center focus-within:bg-[#F3F3F1]"
                  style={{
                    padding: "12px 14px",
                    background: "#F7F7F5",
                    borderRadius: 10,
                    fontSize: 15,
                    color: "#1A1A1A",
                    transition: "background 140ms ease",
                  }}
                >
                  <span style={{ color: "#CCCCCC", marginRight: 4, flexShrink: 0 }}>{hostPrefix}</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase());
                      setFormError(null);
                    }}
                    onBlur={() => flushSlug()}
                    className="min-w-0 flex-1 bg-transparent focus:outline-none"
                    style={{ color: "#1A1A1A" }}
                    maxLength={50}
                    disabled={busy}
                    aria-label="Profil-Slug"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(profileCopyUrl, "profile")}
                  className="flex shrink-0 items-center justify-center rounded-[10px] transition-colors hover:bg-black/[0.02]"
                  style={{ width: 40, height: 40, color: copiedProfile ? "#2F80ED" : "#999999" }}
                  aria-label="Profil-URL kopieren"
                >
                  {copiedProfile ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p style={{ fontSize: 13, color: "#CCCCCC" }}>Dieser Link ist für Ihre Patienten sichtbar</p>
                {saveIndicator === "profileSlug" ? (
                  <p style={{ fontSize: 13, color: "#999999" }}>Gespeichert</p>
                ) : null}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <Link
                href={profileDocPath(slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#666666] transition-colors hover:text-[#2F80ED]"
                style={{ fontSize: 14, padding: "6px 0" }}
              >
                <Eye className="h-4 w-4" />
                Vorschau anzeigen
              </Link>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label className="block" style={{ fontSize: 13, color: "#999999", marginBottom: 8 }}>
                Logo
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) handleLogo(f);
                }}
              />
              {logoUrl ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex w-full items-center justify-center transition-colors"
                    style={{
                      minHeight: 120,
                      background: "#F7F7F5",
                      borderRadius: 10,
                      border: "1px dashed rgba(0,0,0,0.12)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="" className="max-h-20 max-w-[200px] object-contain" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        setBusy(true);
                        await removeLogo();
                        setBusy(false);
                        router.refresh();
                      })();
                    }}
                    className="text-[13px] text-[#999999] underline-offset-2 hover:text-[#666666] hover:underline"
                  >
                    Logo entfernen
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex w-full cursor-pointer flex-col items-center justify-center transition-colors hover:border-black/[0.16] hover:bg-[#F3F3F1]"
                  style={{
                    height: 120,
                    background: "#F7F7F5",
                    borderRadius: 10,
                    border: "1px dashed rgba(0,0,0,0.12)",
                  }}
                >
                  <Upload className="mx-auto mb-2 h-5 w-5" style={{ color: "#CCCCCC" }} />
                  <p style={{ fontSize: 13, color: "#999999" }}>Logo hochladen</p>
                  <p style={{ fontSize: 13, color: "#CCCCCC", marginTop: 4 }}>512×512px empfohlen</p>
                </button>
              )}
              <p style={{ fontSize: 13, color: "#CCCCCC", marginTop: 8 }}>
                Ihr Logo erscheint in Ihrem öffentlichen Profil
              </p>
            </div>

            <div>
              <label className="block" style={{ fontSize: 13, color: "#999999", marginBottom: 8 }}>
                Akzentfarbe
              </label>
              <div className="flex items-center gap-2">
                {ACCENT_PRESETS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => void handleAccent(option.value)}
                    disabled={busy}
                    className="relative shrink-0 transition-all"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: option.value,
                      border:
                        accent.toLowerCase() === option.value.toLowerCase()
                          ? "2px solid #1A1A1A"
                          : "1px solid rgba(0,0,0,0.08)",
                    }}
                    aria-label={`Akzentfarbe ${option.value}`}
                  >
                    {option.default && accent.toLowerCase() === option.value.toLowerCase() ? (
                      <span
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full"
                        style={{ background: "#1A1A1A" }}
                      />
                    ) : null}
                  </button>
                ))}
              </div>
              {saveIndicator === "accentColor" ? (
                <p style={{ fontSize: 13, color: "#999999", marginTop: 8 }}>Gespeichert</p>
              ) : null}
            </div>
          </section>

          {/* Team & Zugriff */}
          <section style={{ marginBottom: 96 }}>
            <h2
              className="font-medium"
              style={{ fontSize: 20, color: "#1A1A1A", marginBottom: 24, letterSpacing: "-0.01em" }}
            >
              Team & Zugriff
            </h2>

            <div style={{ marginBottom: 32 }}>
              {listRows.map((row, index) => (
                <div
                  key={row.key}
                  className="flex items-start justify-between gap-3"
                  style={{
                    paddingTop: index === 0 ? 0 : 24,
                    paddingBottom: 24,
                    borderBottom: index < listRows.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      style={{
                        fontSize: 15,
                        color: row.pending ? "#999999" : "#1A1A1A",
                        marginBottom: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {row.name}
                    </p>
                    <p style={{ fontSize: 13, color: "#CCCCCC", lineHeight: 1.5 }}>{row.email}</p>
                    {row.invitationId ? (
                      <button
                        type="button"
                        className="mt-1 text-[11px] text-[#CCCCCC] underline-offset-2 hover:text-[#999999] hover:underline"
                        onClick={() => {
                          if (!confirm("Einladung widerrufen?")) return;
                          void (async () => {
                            setBusy(true);
                            await revokeInvitation(row.invitationId!);
                            setBusy(false);
                            router.refresh();
                          })();
                        }}
                      >
                        Widerrufen
                      </button>
                    ) : null}
                    {row.memberUserId && row.memberUserId !== currentUserId ? (
                      <button
                        type="button"
                        className="mt-1 text-[11px] text-[#CCCCCC] underline-offset-2 hover:text-[#999999] hover:underline"
                        onClick={() => {
                          if (
                            !confirm(
                              "Mitglied entfernen? Der Account bleibt bestehen, der Zugriff auf diesen Workspace endet."
                            )
                          )
                            return;
                          void (async () => {
                            setBusy(true);
                            await removeTeamMember(row.memberUserId!);
                            setBusy(false);
                            router.refresh();
                          })();
                        }}
                      >
                        Entfernen
                      </button>
                    ) : null}
                  </div>
                  <p
                    className="shrink-0 text-right"
                    style={{ fontSize: 13, color: row.pending ? "#CCCCCC" : "#999999", lineHeight: 1.5 }}
                  >
                    {row.right}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <label className="block" style={{ fontSize: 13, color: "#999999", marginBottom: 8 }}>
                Neues Mitglied einladen
              </label>
              <input
                type="email"
                placeholder="E-Mail-Adresse"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full focus:outline-none"
                style={{
                  padding: "12px 14px",
                  background: "#F7F7F5",
                  borderRadius: 10,
                  fontSize: 15,
                  color: "#1A1A1A",
                  marginBottom: 16,
                  border: "none",
                }}
                disabled={busy}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "doctor" | "team")}
                className="w-full cursor-pointer focus:outline-none"
                style={{
                  padding: "12px 14px",
                  background: "#F7F7F5",
                  borderRadius: 10,
                  fontSize: 15,
                  color: "#1A1A1A",
                  marginBottom: 16,
                  border: "none",
                }}
                disabled={busy}
              >
                <option value="doctor">Administrator</option>
                <option value="team">Bearbeiter</option>
              </select>
              <button
                type="button"
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || busy}
                className="w-full font-medium transition-colors"
                style={{
                  padding: "12px 14px",
                  height: 44,
                  background: inviteEmail.trim() ? "#2F80ED" : "rgba(0,0,0,0.04)",
                  color: inviteEmail.trim() ? "#FFFFFF" : "#CCCCCC",
                  fontSize: 15,
                  borderRadius: 10,
                  border: "none",
                  cursor: inviteEmail.trim() ? "pointer" : "not-allowed",
                }}
              >
                Einladung senden
              </button>
            </div>

            <div style={{ marginTop: 32 }}>
              <label className="block" style={{ fontSize: 13, color: "#999999", marginBottom: 8 }}>
                Workspace
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => {
                  setWorkspaceName(e.target.value);
                  setFormError(null);
                }}
                onBlur={() => flushWorkspaceName()}
                className="w-full focus:outline-none"
                style={{
                  padding: "12px 14px",
                  background: "#F7F7F5",
                  borderRadius: 10,
                  fontSize: 15,
                  color: "#1A1A1A",
                  border: "none",
                }}
                maxLength={80}
                disabled={busy}
              />
              {saveIndicator === "workspaceName" ? (
                <p style={{ fontSize: 13, color: "#999999", marginTop: 8 }}>Gespeichert</p>
              ) : null}
            </div>
          </section>

          {/* Integrationen */}
          <section style={{ marginBottom: 96 }}>
            <h2
              className="font-medium"
              style={{ fontSize: 20, color: "#1A1A1A", marginBottom: 24, letterSpacing: "-0.01em" }}
            >
              Integrationen
            </h2>
            <div>
              <label className="block" style={{ fontSize: 13, color: "#999999", marginBottom: 8 }}>
                Kalender-Link
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={calendarUrl}
                  onChange={(e) => onCalendarChange(e.target.value)}
                  className="min-w-0 flex-1 focus:outline-none"
                  style={{
                    padding: "12px 14px",
                    background: "#F7F7F5",
                    borderRadius: 10,
                    fontSize: 15,
                    color: "#1A1A1A",
                    border: "none",
                  }}
                  placeholder="https://…"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(calendarUrl, "calendar")}
                  className="flex shrink-0 items-center justify-center rounded-[10px] transition-colors hover:bg-black/[0.02]"
                  style={{ width: 40, height: 40, color: copiedCalendar ? "#2F80ED" : "#999999" }}
                  aria-label="Kalender-Link kopieren"
                >
                  {copiedCalendar ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p style={{ fontSize: 13, color: "#CCCCCC" }}>
                  Über diesen Link können Patienten Termine buchen
                </p>
                {saveIndicator === "calendarUrl" ? (
                  <p style={{ fontSize: 13, color: "#999999" }}>Gespeichert</p>
                ) : null}
              </div>
            </div>
          </section>

          {/* Konto */}
          <section style={{ marginBottom: 96 }}>
            <h2
              className="font-medium"
              style={{ fontSize: 20, color: "#1A1A1A", marginBottom: 24, letterSpacing: "-0.01em" }}
            >
              Konto
            </h2>
            <div style={{ marginBottom: 24 }}>
              <label className="block" style={{ fontSize: 13, color: "#999999", marginBottom: 8 }}>
                E-Mail
              </label>
              <input
                type="email"
                value={userEmail}
                disabled
                readOnly
                className="w-full"
                style={{
                  padding: "12px 14px",
                  background: "#F7F7F5",
                  borderRadius: 10,
                  fontSize: 15,
                  color: "#999999",
                  cursor: "not-allowed",
                  border: "none",
                }}
              />
            </div>
            <div>
              <label className="block" style={{ fontSize: 13, color: "#999999", marginBottom: 8 }}>
                Passwort
              </label>
              <button
                type="button"
                onClick={handlePassword}
                className="transition-colors"
                style={{ fontSize: 14, color: "#666666", padding: "6px 0", background: "none", border: "none" }}
              >
                Passwort ändern
              </button>
              {passwordHint ? (
                <p className="mt-2 text-[13px]" style={{ color: "#999999" }}>
                  {passwordHint}
                </p>
              ) : null}
            </div>
          </section>

          {/* System */}
          <section>
            <h2
              className="font-medium"
              style={{ fontSize: 20, color: "#1A1A1A", marginBottom: 24, letterSpacing: "-0.01em" }}
            >
              System
            </h2>
            <div style={{ marginBottom: 48 }}>
              <label className="block" style={{ fontSize: 13, color: "#999999", marginBottom: 8 }}>
                Erscheinungsbild
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTheme("light")}
                  className="flex-1 text-left transition-colors"
                  style={{
                    padding: "12px 14px",
                    background: theme === "light" ? "#F7F7F5" : "rgba(0,0,0,0.03)",
                    fontSize: 15,
                    color: theme === "light" ? "#1A1A1A" : "#999999",
                    borderRadius: 10,
                    border: "none",
                    boxShadow: theme === "light" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Hell
                </button>
                <button
                  type="button"
                  onClick={() => handleTheme("dark")}
                  className="flex-1 text-left transition-colors"
                  style={{
                    padding: "12px 14px",
                    background: theme === "dark" ? "#F7F7F5" : "rgba(0,0,0,0.03)",
                    fontSize: 15,
                    color: theme === "dark" ? "#1A1A1A" : "#999999",
                    borderRadius: 10,
                    border: "none",
                    boxShadow: theme === "dark" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Dunkel
                </button>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handleLogout}
                className="transition-colors"
                style={{ fontSize: 14, color: "#999999", padding: "6px 0", background: "none", border: "none" }}
              >
                Abmelden
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
