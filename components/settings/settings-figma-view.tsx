"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import { signOutWithFullPageRedirect } from "@/lib/auth/sign-out-client";
import { clearReturnToPricingFlag } from "@/lib/login-pricing-return";
import { SettingsMobileNav } from "@/components/settings/settings-mobile-nav";
import { SettingsPracticeProfilePanel } from "@/components/settings/settings-practice-profile-panel";
import {
  SettingsPlaceholderPanel,
  SettingsSecurityPanel,
} from "@/components/settings/settings-secondary-panels";
import { SettingsTeamPanel } from "@/components/settings/settings-team-panel";
import {
  defaultTeamTabForSection,
  isSettingsSectionId,
  SETTINGS_NAV_GROUPS,
  type SettingsSectionId,
} from "@/lib/settings/settings-navigation";
import type { TeamInvitation, TeamMember } from "@/lib/types/settings-team";
import type { ThemePreference } from "@/lib/theme";

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
  const searchParams = useSearchParams();

  const sectionFromUrl = searchParams.get("section");
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(
    isSettingsSectionId(sectionFromUrl) ? sectionFromUrl : "team-rollen"
  );

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

  const calDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isSettingsSectionId(sectionFromUrl)) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  useEffect(() => setSlug(initialSlug), [initialSlug]);
  useEffect(() => setWorkspaceName(initialWorkspaceName), [initialWorkspaceName]);
  useEffect(() => setCalendarUrl(initialAppointmentLink || ""), [initialAppointmentLink]);
  useEffect(() => setAccent(initialAccentColor), [initialAccentColor]);
  useEffect(() => setTheme(initialTheme), [initialTheme]);

  const flashSaved = useCallback((field: string) => {
    setSaveIndicator(field);
    setTimeout(() => setSaveIndicator(null), 1800);
  }, []);

  const navigateSection = (section: SettingsSectionId) => {
    setActiveSection(section);
    router.replace(`/settings?section=${section}`, { scroll: false });
  };

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

  const handleRemoveMember = (userId: string) => {
    if (
      !confirm(
        "Mitglied entfernen? Der Account bleibt bestehen, der Zugriff auf diesen Workspace endet."
      )
    )
      return;
    void (async () => {
      setBusy(true);
      try {
        const r = await removeTeamMember(userId);
        if (r.error) setFormError(r.error);
        else router.refresh();
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleRevokeInvitation = (invitationId: string) => {
    if (!confirm("Einladung widerrufen?")) return;
    void (async () => {
      setBusy(true);
      try {
        const r = await revokeInvitation(invitationId);
        if (r.error) setFormError(r.error);
        else router.refresh();
      } finally {
        setBusy(false);
      }
    })();
  };

  const handlePassword = () => {
    if (busy) return;
    setPasswordHint(null);
    setBusy(true);
    void (async () => {
      try {
        const r = await requestPasswordReset();
        if (r.error) setFormError(r.error);
        else setPasswordHint("Link zum Zurücksetzen wurde an Ihre E-Mail gesendet.");
      } finally {
        setBusy(false);
      }
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
      clearReturnToPricingFlag();
      await signOutWithFullPageRedirect();
    })();
  };

  const hostPrefix = hostDocPrefix(appBaseUrl);
  const profileCopyUrl = fullProfileUrl(appBaseUrl, slug);
  const teamTab = defaultTeamTabForSection(activeSection);

  const panel = (() => {
    switch (activeSection) {
      case "praxisprofil":
        return (
          <SettingsPracticeProfilePanel
            slug={slug}
            hostPrefix={hostPrefix}
            profileDocPath={profileDocPath(slug)}
            logoUrl={logoUrl}
            accent={accent}
            workspaceName={workspaceName}
            calendarUrl={calendarUrl}
            busy={busy}
            copiedProfile={copiedProfile}
            copiedCalendar={copiedCalendar}
            saveIndicator={saveIndicator}
            onSlugChange={(v) => {
              setSlug(v);
              setFormError(null);
            }}
            onSlugBlur={flushSlug}
            onCopyProfile={() => handleCopy(profileCopyUrl, "profile")}
            onLogoSelect={handleLogo}
            onLogoRemove={() => {
              void (async () => {
                setBusy(true);
                await removeLogo();
                setBusy(false);
                router.refresh();
              })();
            }}
            onAccent={(hex) => void handleAccent(hex)}
            onWorkspaceNameChange={(v) => {
              setWorkspaceName(v);
              setFormError(null);
            }}
            onWorkspaceNameBlur={flushWorkspaceName}
            onCalendarChange={onCalendarChange}
            onCopyCalendar={() => handleCopy(calendarUrl, "calendar")}
          />
        );
      case "standorte":
        return (
          <SettingsPlaceholderPanel
            title="Standorte"
            description="Adresse und Standortdaten pflegen Sie im Profil-Editor unter Praxis."
            href="/profile/editor"
            hrefLabel="Zum Profil-Editor"
          />
        );
      case "behandlungsspektrum":
        return (
          <SettingsPlaceholderPanel
            title="Behandlungsspektrum"
            description="Schwerpunkte, Leistungen und Vita werden im öffentlichen Profil gepflegt."
            href="/profile/editor"
            hrefLabel="Schwerpunkte bearbeiten"
          />
        );
      case "oeffnungszeiten":
        return (
          <SettingsPlaceholderPanel
            title="Öffnungszeiten"
            description="Sprechzeiten und Erreichbarkeit hinterlegen Sie im Profil-Editor."
            href="/profile/editor"
            hrefLabel="Öffnungszeiten bearbeiten"
          />
        );
      case "team-rollen":
      case "einladungen":
        return (
          <SettingsTeamPanel
            initialTab={teamTab}
            members={members}
            invitations={invitations}
            workspaceName={workspaceName}
            currentUserId={currentUserId}
            busy={busy}
            inviteEmail={inviteEmail}
            inviteRole={inviteRole}
            onInviteEmailChange={setInviteEmail}
            onInviteRoleChange={setInviteRole}
            onInvite={handleInvite}
            onRemoveMember={handleRemoveMember}
            onRevokeInvitation={handleRevokeInvitation}
          />
        );
      case "sicherheit":
        return (
          <SettingsSecurityPanel
            userEmail={userEmail}
            theme={theme}
            passwordHint={passwordHint}
            busy={busy}
            onPasswordReset={handlePassword}
            onThemeChange={handleTheme}
            onLogout={handleLogout}
          />
        );
      case "nachrichten":
        return (
          <SettingsPlaceholderPanel
            title="Nachrichten"
            description="Vorlagen für Patientenkommunikation werden hier gebündelt — derzeit über Tracker und Relay."
          />
        );
      case "automatisierungen":
        return (
          <SettingsPlaceholderPanel
            title="Automatisierungen"
            description="Erinnerungen und Workflows verwalten Sie in Relay."
            href="/relay"
            hrefLabel="Zu Relay"
          />
        );
      case "journal-kategorien":
        return (
          <SettingsPlaceholderPanel
            title="Journal — Kategorien"
            description="Themenbereiche und Inhalte Ihrer Praxiswissensbibliothek."
            href="/journal"
            hrefLabel="Zum Journal"
          />
        );
      case "journal-vorlagen":
        return (
          <SettingsPlaceholderPanel
            title="Journal — Vorlagen"
            description="Nachsorge- und FAQ-Vorlagen entstehen direkt im Journal."
            href="/journal"
            hrefLabel="Vorlagen im Journal"
          />
        );
      default:
        return null;
    }
  })();

  return (
    <div className="yd-settings-v2 yd-clinical-brand relative flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="yd-settings-v2__frame flex-1 overflow-auto pb-12">
        {formError ? (
          <div className="yd-settings-v2__error" role="alert">
            {formError}
          </div>
        ) : null}

        <div className="yd-settings-v2__layout">
          <nav className="yd-settings-v2__nav yd-settings-v2__nav--desktop hidden md:block" aria-label="Einstellungsbereiche">
            {SETTINGS_NAV_GROUPS.map((group) => (
              <div key={group.label} className="yd-settings-v2__nav-group">
                <p className="yd-settings-v2__nav-group-label">{group.label}</p>
                <ul className="yd-settings-v2__nav-list">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`yd-settings-v2__nav-item${isActive ? " yd-settings-v2__nav-item--active" : ""}`}
                          onClick={() => navigateSection(item.id)}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon className="yd-settings-v2__nav-icon" strokeWidth={1.75} aria-hidden />
                          <span className="yd-settings-v2__nav-text">
                            <span className="yd-settings-v2__nav-label">{item.label}</span>
                            <span className="yd-settings-v2__nav-hint">{item.hint}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <SettingsMobileNav activeSection={activeSection} onNavigate={navigateSection} />

          <div className="yd-settings-v2__content">{panel}</div>
        </div>
      </div>
    </div>
  );
}
