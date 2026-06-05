"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";

import { YdInlineBusy } from "@/components/design-system/yd-skeleton";
import { inviteTeamMember } from "@/app/(protected)/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"team" | "doctor">("team");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    setError(null);
    setSent(false);
    startTransition(async () => {
      const result = await inviteTeamMember(email, role);
      if (result.error) setError(result.error);
      else {
        setSent(true);
        setEmail("");
        setTimeout(() => setSent(false), 5000);
      }
    });
  };

  return (
    <div className="p-5 bg-surface-card border border-border rounded-lg space-y-4">
      <div className="flex items-center gap-2 font-medium">
        <UserPlus className="w-4 h-4" strokeWidth={1.75} />
        <span>Neues Mitglied einladen</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="assistenz@ihre-praxis.de"
          disabled={isPending}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "team" | "doctor")}
          className="px-3 h-10 bg-surface-card border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          <option value="team">Team</option>
          <option value="doctor">Arzt</option>
        </select>
        <Button onClick={handleSubmit} disabled={isPending || !email}>
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <YdInlineBusy />
              <span>Einladen…</span>
            </span>
          ) : (
            "Einladen"
          )}
        </Button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {sent && (
        <p className="text-xs text-brand">
          Einladung verschickt. Gültig für 7 Tage.
        </p>
      )}
      <p className="text-xs text-text-tertiary">
        Der Empfänger erhält eine E-Mail mit Einladungs-Link. Rollen:{" "}
        <strong>Team</strong> sieht nur eigene Aufgaben; <strong>Arzt</strong>{" "}
        hat vollen Zugriff.
      </p>
    </div>
  );
}
