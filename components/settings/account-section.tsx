"use client";

import { useState, useTransition } from "react";
import { Mail, Key, Check } from "lucide-react";
import {
  changeWorkspaceName,
  requestPasswordReset,
} from "@/app/(protected)/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

interface AccountSectionProps {
  email: string;
  workspaceName: string;
}

export function AccountSection({ email, workspaceName }: AccountSectionProps) {
  const [name, setName] = useState(workspaceName);
  const [isPending, startTransition] = useTransition();
  const [savedName, setSavedName] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveName = () => {
    setError(null);
    startTransition(async () => {
      const result = await changeWorkspaceName(name);
      if (result.error) setError(result.error);
      else {
        setSavedName(true);
        setTimeout(() => setSavedName(false), 3000);
      }
    });
  };

  const handlePasswordReset = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordReset();
      if (result.error) setError(result.error);
      else setPasswordResetSent(true);
    });
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        number="III"
        title="Account"
        description="Persönliche Account-Einstellungen."
      />

      <div className="space-y-6 max-w-xl">
        <div>
          <Label>E-Mail-Adresse</Label>
          <div className="mt-1 flex items-center gap-2 px-3 py-2 bg-surface-sunken border border-border rounded">
            <Mail className="w-4 h-4 text-text-tertiary" strokeWidth={1.75} />
            <span className="text-sm text-text-primary">{email}</span>
          </div>
          <p className="text-xs text-text-tertiary mt-1">
            Änderung der E-Mail-Adresse derzeit nur auf Anfrage.
          </p>
        </div>

        <div>
          <Label htmlFor="workspace_name">Workspace-Name</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="workspace_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
            />
            <Button
              onClick={handleSaveName}
              disabled={isPending || name === workspaceName}
            >
              {savedName ? <Check className="w-4 h-4" /> : "Speichern"}
            </Button>
          </div>
        </div>

        <div>
          <Label>Passwort</Label>
          <div className="mt-1 space-y-2">
            <Button
              onClick={handlePasswordReset}
              variant="ghost"
              disabled={isPending || passwordResetSent}
            >
              <Key className="w-4 h-4 mr-2" strokeWidth={1.75} />
              {passwordResetSent
                ? "E-Mail gesendet"
                : "Passwort-Reset per E-Mail anfordern"}
            </Button>
            {passwordResetSent && (
              <p className="text-xs text-text-tertiary">
                Sie erhalten eine E-Mail mit einem Link zum Zurücksetzen.
              </p>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </section>
  );
}
