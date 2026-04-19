"use client";

import { useState, useTransition } from "react";
import { Calendar, Check, Loader2 } from "lucide-react";
import { saveAppointmentLink } from "@/app/(protected)/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

interface TerminlinkSectionProps {
  initial: string | null;
}

export function TerminlinkSection({ initial }: TerminlinkSectionProps) {
  const [value, setValue] = useState(initial || "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveAppointmentLink(value);
      if (result.error) setError(result.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <section className="space-y-6">
      <SectionHeader
        number="I"
        title="Terminlink"
        description="Ihre Kalender-URL. Wird an Patienten gesendet, wenn Sie im Inbox-Detail den Terminlink-Button klicken."
      />

      <div className="space-y-2 max-w-xl">
        <Label htmlFor="appointment_link">URL zu Ihrem Kalender</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
              strokeWidth={1.75}
            />
            <Input
              id="appointment_link"
              type="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://calendly.com/dr-baysal"
              className="pl-10"
            />
          </div>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              "Speichern"
            )}
          </Button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {saved && <p className="text-xs text-brand">Terminlink gespeichert</p>}
        <p className="text-xs text-text-tertiary">
          Beispiele: Calendly, Cal.com, Doctolib, Jameda Online-Terminbuchung
        </p>
      </div>
    </section>
  );
}
