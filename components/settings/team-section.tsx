"use client";

import { useTransition } from "react";
import { Clock } from "lucide-react";
import { revokeInvitation, removeTeamMember } from "@/app/(protected)/settings/actions";
import { SectionHeader } from "./section-header";
import { InviteForm } from "./invite-form";
import { useRouter } from "next/navigation";
import type { TeamMember, TeamInvitation } from "@/lib/queries/settings";

interface TeamSectionProps {
  members: TeamMember[];
  invitations: TeamInvitation[];
  currentUserId: string;
}

export function TeamSection({
  members,
  invitations,
  currentUserId,
}: TeamSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRevoke = (id: string) => {
    if (!confirm("Einladung widerrufen?")) return;
    startTransition(async () => {
      await revokeInvitation(id);
      router.refresh();
    });
  };

  const handleRemove = (userId: string) => {
    if (!confirm("Mitglied wirklich entfernen?")) return;
    startTransition(async () => {
      await removeTeamMember(userId);
      router.refresh();
    });
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        number="IV"
        title="Team"
        description="Mitglieder und offene Einladungen."
      />

      <div className="max-w-2xl space-y-6">
        <InviteForm />

        <div>
          <h3 className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
            Aktive Mitglieder ({members.length})
          </h3>
          <div className="border-t border-border">
            {members.map((m) => (
              <div
                key={m.user_id}
                className="flex items-center justify-between py-3 border-b border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-xs font-medium">
                    {m.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.email}</div>
                    <div className="text-xs text-text-tertiary uppercase tracking-wider">
                      {m.role === "doctor" ? "Arzt" : "Team"}
                      {m.user_id === currentUserId && " · Sie"}
                    </div>
                  </div>
                </div>
                {m.user_id !== currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleRemove(m.user_id)}
                    disabled={isPending}
                    className="text-xs text-text-tertiary hover:text-danger"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {invitations.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-text-tertiary mb-3">
              Offene Einladungen ({invitations.length})
            </h3>
            <div className="border-t border-border">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3 border-b border-border"
                >
                  <div className="flex items-center gap-3">
                    <Clock
                      className="w-4 h-4 text-text-tertiary"
                      strokeWidth={1.75}
                    />
                    <div>
                      <div className="text-sm">{inv.email}</div>
                      <div className="text-xs text-text-tertiary uppercase tracking-wider">
                        {inv.role === "doctor" ? "Arzt" : "Team"} · Läuft ab{" "}
                        {new Date(inv.expires_at).toLocaleDateString("de-DE")}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRevoke(inv.id)}
                    disabled={isPending}
                    className="text-xs text-text-tertiary hover:text-danger"
                  >
                    Widerrufen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
