"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Globe, Check, AlertTriangle } from "lucide-react";

import { YdInlineBusy } from "@/components/design-system/yd-skeleton";
import { changeSlug, checkSlugAvailability } from "@/app/(protected)/settings/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "./section-header";

interface SlugSectionProps {
  currentSlug: string;
  appBaseUrl: string;
}

export function SlugSection({ currentSlug, appBaseUrl }: SlugSectionProps) {
  const router = useRouter();
  const [value, setValue] = useState(currentSlug);
  const [availability, setAvailability] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(currentSlug);
    setAvailability("idle");
    setAvailabilityError(null);
    setConfirmOpen(false);
  }, [currentSlug]);

  const runAvailabilityCheck = (v: string) => {
    if (v === currentSlug) {
      setAvailability("idle");
      setAvailabilityError(null);
      return;
    }
    setAvailability("checking");
    void (async () => {
      const result = await checkSlugAvailability(v);
      if (result.error) {
        setAvailability("invalid");
        setAvailabilityError(result.error);
      } else if (result.available) {
        setAvailability("available");
        setAvailabilityError(null);
      } else {
        setAvailability("taken");
        setAvailabilityError("Dieser Slug ist bereits vergeben.");
      }
    })();
  };

  const handleChange = (v: string) => {
    setValue(v);
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (v === currentSlug) {
      setAvailability("idle");
      setAvailabilityError(null);
      return;
    }
    setAvailability("checking");
    checkTimer.current = setTimeout(() => runAvailabilityCheck(v), 400);
  };

  const handleSave = () => {
    if (!confirmOpen) {
      setConfirmOpen(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await changeSlug(value);
      if (result.error) {
        setError(result.error);
      } else if (result.slug) {
        setConfirmOpen(false);
        router.refresh();
      }
    });
  };

  const canSave = availability === "available" && value !== currentSlug;

  return (
    <section className="space-y-6">
      <SectionHeader
        number="II"
        title="Öffentlicher Link"
        description="Die URL, unter der Ihr Profil für Patienten erreichbar ist."
      />

      <div className="space-y-3 max-w-xl">
        <div>
          <Label>Aktuelle URL</Label>
          <div className="mt-1 px-3 py-2 bg-surface-sunken border border-border rounded text-sm font-mono text-text-secondary">
            {appBaseUrl}/doc/{currentSlug}
          </div>
        </div>

        <div>
          <Label htmlFor="new_slug">Neuen Slug wählen</Label>
          <div className="relative mt-1">
            <Globe
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
              strokeWidth={1.75}
            />
            <Input
              id="new_slug"
              value={value}
              onChange={(e) => handleChange(e.target.value.toLowerCase())}
              placeholder="praxis-baysal"
              className="pl-10 font-mono"
              maxLength={50}
            />
          </div>

          <div className="mt-2 text-xs h-5">
            {availability === "checking" && (
              <span className="text-text-tertiary">Prüfe Verfügbarkeit…</span>
            )}
            {availability === "available" && (
              <span className="text-brand flex items-center gap-1">
                <Check className="w-3 h-3" /> Verfügbar
              </span>
            )}
            {availability === "taken" && (
              <span className="text-danger flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {availabilityError}
              </span>
            )}
            {availability === "invalid" && (
              <span className="text-danger flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {availabilityError}
              </span>
            )}
          </div>

          <p className="text-xs text-text-tertiary mt-1">
            Kleinbuchstaben, Zahlen, Bindestriche. 3–50 Zeichen. Ihre Vorschau:{" "}
            <span className="font-mono">
              {appBaseUrl}/doc/{value || "…"}
            </span>
          </p>
        </div>

        {confirmOpen && (
          <div className="p-4 bg-warning/10 border border-warning/30 rounded">
            <p className="text-sm text-text-primary font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" strokeWidth={2} />
              Slug wirklich ändern?
            </p>
            <p className="text-xs text-text-secondary mb-3">
              Ihr alter Link{" "}
              <span className="font-mono">
                {appBaseUrl}/doc/{currentSlug}
              </span>{" "}
              wird automatisch auf den neuen weitergeleitet. Patienten, die den
              alten Link gespeichert haben, landen weiterhin auf Ihrem Profil.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isPending} size="sm">
                {isPending ? (
                  <YdInlineBusy />
                ) : (
                  "Ja, ändern"
                )}
              </Button>
              <Button
                onClick={() => setConfirmOpen(false)}
                variant="ghost"
                size="sm"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {!confirmOpen && (
          <Button onClick={handleSave} disabled={!canSave} className="w-fit">
            Neuen Slug speichern
          </Button>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </section>
  );
}
