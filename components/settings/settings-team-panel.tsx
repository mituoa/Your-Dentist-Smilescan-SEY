"use client";

import { useMemo, useState, useEffect } from "react";
import { Check, Plus } from "lucide-react";

import {
  displayNameFromEmail,
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

function MemberSummary({ emails }: { emails: string[] }) {
  if (emails.length === 0) return null;
  const visible = emails.slice(0, 3).map(displayNameFromEmail);
  const hidden = emails.length - visible.length;
  return (
    <p className="yd-settings-v2__role-members">
      {visible.join(" · ")}
      {hidden > 0 ? ` · +${hidden}` : ""}
    </p>
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
        <button
          type="button"
          className="yd-settings-v2__primary-btn"
          onClick={() => setTab("einladungen")}
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Mitglied einladen
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

          <div className="yd-settings-v2__invite-box yd-settings-v2__invite-box--inline">
            <label className="yd-settings-v2__field-label" htmlFor="settings-v2-invite-email-inline">
              Teammitglied einladen
            </label>
            <input
              id="settings-v2-invite-email-inline"
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
        </div>
      ) : null}

      {tab === "rollen" ? (
        <div className="yd-settings-v2__tab-panel" role="tabpanel">
          <div className="yd-settings-v2__roles-group">
            {REFERENCE_ROLES.map((role) => {
              let emails: string[] = [];

              if (role.memberRole === "doctor") {
                emails = roleMembers.doctors;
              } else if (role.memberRole === "team") {
                emails = roleMembers.team;
              }

              const memberCount =
                role.memberRole === "doctor"
                  ? roleMembers.doctors.length
                  : role.memberRole === "team"
                    ? roleMembers.team.length
                    : 0;

              return (
                <article key={role.id} className="yd-settings-v2__role-card">
                  <div className="yd-settings-v2__role-head">
                    <h3 className="yd-settings-v2__role-name">{role.label}</h3>
                    <p className="yd-settings-v2__role-desc">{role.description}</p>
                  </div>

                  <div className="yd-settings-v2__role-card-section">
                    <p className="yd-settings-v2__role-card-label">Mitglieder</p>
                    {memberCount > 0 ? (
                      <MemberSummary emails={emails} />
                    ) : (
                      <span className="yd-settings-v2__role-empty">Noch keine Zuordnung</span>
                    )}
                  </div>

                  <div className="yd-settings-v2__role-card-section">
                    <p className="yd-settings-v2__role-card-label">Berechtigungen</p>
                    <ul className="yd-settings-v2__perm-list">
                      {role.permissions.map((p) => (
                        <li key={p}>
                          <PermissionPill label={p} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="yd-settings-v2__info-banner">
            <div className="yd-settings-v2__info-banner-body">
              <p className="yd-settings-v2__info-banner-title">
                Berechtigungen folgen dem Prinzip der minimalen Rechte
              </p>
              <p className="yd-settings-v2__info-banner-copy">
                Jede Rolle erhält nur die Berechtigungen, die für ihre Aufgaben erforderlich sind.
                Individuelle Rollen können Sie bei Bedarf mit uns abstimmen.
              </p>
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
