"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowRight, Check, Plus, Shield } from "lucide-react";

import {
  displayNameFromEmail,
  initialsFromEmail,
  SettingsTeamMemberCard,
} from "@/components/settings/settings-team-member-card";
import { REFERENCE_ROLES } from "@/lib/settings/reference-roles";
import type { TeamInvitation, TeamMember } from "@/lib/types/settings-team";

type TeamTab = "mitglieder" | "rollen" | "einladungen";

type SettingsTeamPanelProps = {
  initialTab: TeamTab;
  members: TeamMember[];
  invitations: TeamInvitation[];
  workspaceName: string;
  currentUserId: string;
  busy: boolean;
  inviteEmail: string;
  inviteRole: "doctor" | "team";
  onInviteEmailChange: (value: string) => void;
  onInviteRoleChange: (value: "doctor" | "team") => void;
  onInvite: () => void;
  onRemoveMember: (userId: string) => void;
  onRevokeInvitation: (invitationId: string) => void;
};

function PermissionPill({ label }: { label: string }) {
  const restricted = label.toLowerCase().includes("keine");
  return (
    <span className={`yd-settings-v2__perm${restricted ? " yd-settings-v2__perm--muted" : ""}`}>
      {!restricted ? <Check className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden /> : null}
      {label}
    </span>
  );
}

function MemberAvatars({
  emails,
  extra = 0,
}: {
  emails: string[];
  extra?: number;
}) {
  const visible = emails.slice(0, 2);
  return (
    <div className="yd-settings-v2__avatars" aria-hidden>
      {visible.map((email) => (
        <span key={email} className="yd-settings-v2__avatar" title={email}>
          {initialsFromEmail(email)}
        </span>
      ))}
      {extra > 0 ? <span className="yd-settings-v2__avatar yd-settings-v2__avatar--more">+{extra}</span> : null}
    </div>
  );
}

export function SettingsTeamPanel({
  initialTab,
  members,
  invitations,
  workspaceName,
  currentUserId,
  busy,
  inviteEmail,
  inviteRole,
  onInviteEmailChange,
  onInviteRoleChange,
  onInvite,
  onRemoveMember,
  onRevokeInvitation,
}: SettingsTeamPanelProps) {
  const [tab, setTab] = useState<TeamTab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        if (a.role !== b.role) return a.role === "doctor" ? -1 : 1;
        return a.email.localeCompare(b.email);
      }),
    [members]
  );

  const roleMembers = useMemo(() => {
    const doctors = members.filter((m) => m.role === "doctor").map((m) => m.email);
    const team = members.filter((m) => m.role === "team").map((m) => m.email);
    return { doctors, team };
  }, [members]);

  return (
    <div className="yd-settings-v2__panel">
      <div className="yd-settings-v2__panel-head">
        <div>
          <h2 className="yd-settings-v2__panel-title">Team & Rollen</h2>
          <p className="yd-settings-v2__panel-copy">
            Verwalten Sie Ihr Team und definieren Sie Rollen mit individuellen Berechtigungen.
          </p>
        </div>
        <button type="button" className="yd-settings-v2__primary-btn" disabled aria-disabled="true">
          <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Neue Rolle erstellen
        </button>
      </div>

      <div className="yd-settings-v2__tabs" role="tablist" aria-label="Team-Bereiche">
        {(
          [
            ["mitglieder", "Teammitglieder"],
            ["rollen", "Rollen & Berechtigungen"],
            ["einladungen", "Einladungen"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`yd-settings-v2__tab${tab === id ? " yd-settings-v2__tab--active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "mitglieder" ? (
        <div className="yd-settings-v2__tab-panel" role="tabpanel">
          <div className="yd-settings-v2__member-list">
            {sortedMembers.map((m) => (
              <SettingsTeamMemberCard
                key={m.user_id}
                email={m.email}
                role={m.role}
                joinedAt={m.joined_at}
                workspaceName={workspaceName}
                isCurrentUser={m.user_id === currentUserId}
                busy={busy}
                onRemove={
                  m.user_id !== currentUserId
                    ? () => onRemoveMember(m.user_id)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ) : null}

      {tab === "rollen" ? (
        <div className="yd-settings-v2__tab-panel" role="tabpanel">
          <div className="yd-settings-v2__roles-grid">
            {REFERENCE_ROLES.map((role) => {
              const Icon = role.icon;
              let emails: string[] = [];
              let extra = 0;

              if (role.memberRole === "doctor") {
                emails = roleMembers.doctors;
                extra = Math.max(0, roleMembers.doctors.length - 2);
              } else if (role.memberRole === "team") {
                emails = roleMembers.team;
                extra = Math.max(0, roleMembers.team.length - 2);
              }

              const memberCount =
                role.memberRole === "doctor"
                  ? roleMembers.doctors.length
                  : role.memberRole === "team"
                    ? roleMembers.team.length
                    : 0;

              return (
                <article key={role.id} className="yd-settings-v2__role-card">
                  <div className="yd-settings-v2__role-cell">
                    <span className="yd-settings-v2__role-icon">
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span>
                      <span className="yd-settings-v2__role-name">{role.label}</span>
                      <span className="yd-settings-v2__role-desc">{role.description}</span>
                    </span>
                  </div>

                  <div className="yd-settings-v2__role-card-section">
                    <p className="yd-settings-v2__role-card-label">Mitglieder</p>
                    {memberCount > 0 ? (
                      <MemberAvatars emails={emails} extra={extra} />
                    ) : (
                      <span className="yd-settings-v2__role-empty">Noch keine Zuordnung</span>
                    )}
                  </div>

                  <div className="yd-settings-v2__role-card-section">
                    <p className="yd-settings-v2__role-card-label">Berechtigungen</p>
                    <div className="yd-settings-v2__perm-list">
                      {role.permissions.map((p) => (
                        <PermissionPill key={p} label={p} />
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="yd-settings-v2__info-banner">
            <Shield className="yd-settings-v2__info-banner-icon" strokeWidth={1.75} aria-hidden />
            <div className="yd-settings-v2__info-banner-body">
              <p className="yd-settings-v2__info-banner-title">
                Berechtigungen folgen dem Prinzip der minimalen Rechte
              </p>
              <p className="yd-settings-v2__info-banner-copy">
                Jede Rolle erhält nur die Berechtigungen, die für ihre Aufgaben erforderlich sind.
                Individuelle Rollen werden in einer kommenden Version ergänzt.
              </p>
              <button type="button" className="yd-settings-v2__info-banner-btn" disabled aria-disabled="true">
                Berechtigungen verwalten
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "einladungen" ? (
        <div className="yd-settings-v2__tab-panel" role="tabpanel">
          {invitations.length > 0 ? (
            <div className="yd-settings-v2__member-list yd-settings-v2__member-list--compact">
              {invitations.map((inv) => (
                <SettingsTeamMemberCard
                  key={inv.id}
                  email={inv.email}
                  role={inv.role}
                  joinedAt={inv.created_at}
                  workspaceName={workspaceName}
                  pending
                  busy={busy}
                  onRevoke={() => onRevokeInvitation(inv.id)}
                />
              ))}
            </div>
          ) : (
            <p className="yd-settings-v2__empty-inline">Keine offenen Einladungen.</p>
          )}

          <div className="yd-settings-v2__invite-box">
            <label className="yd-settings-v2__field-label" htmlFor="settings-v2-invite-email">
              Neues Mitglied einladen
            </label>
            <input
              id="settings-v2-invite-email"
              type="email"
              placeholder="E-Mail-Adresse"
              value={inviteEmail}
              onChange={(e) => onInviteEmailChange(e.target.value)}
              className="yd-settings-v2__input"
              disabled={busy}
            />
            <select
              value={inviteRole}
              onChange={(e) => onInviteRoleChange(e.target.value as "doctor" | "team")}
              className="yd-settings-v2__input"
              disabled={busy}
              aria-label="Rolle für Einladung"
            >
              <option value="doctor">Zahnarzt / Administrator</option>
              <option value="team">Teammitglied</option>
            </select>
            <button
              type="button"
              onClick={onInvite}
              disabled={!inviteEmail.trim() || busy}
              className="yd-settings-v2__primary-btn yd-settings-v2__primary-btn--block"
            >
              Einladung senden
            </button>
          </div>

          {members.length > 0 ? (
            <div className="yd-settings-v2__invite-summary">
              <p className="yd-settings-v2__field-label">Aktive Mitglieder</p>
              <ul className="yd-settings-v2__invite-summary-list">
                {sortedMembers.map((m) => (
                  <li key={m.user_id}>
                    <span>{displayNameFromEmail(m.email)}</span>
                    <span>{m.role === "doctor" ? "Zahnarzt" : "Team"}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
