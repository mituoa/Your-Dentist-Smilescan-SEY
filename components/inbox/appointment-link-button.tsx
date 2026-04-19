"use client";

import { useState, useTransition } from "react";
import { sendAppointmentLink } from "@/app/(protected)/inbox/[id]/actions";
import { Button } from "@/components/ui/button";
import { Send, Check, AlertCircle } from "lucide-react";

interface AppointmentLinkButtonProps {
  submissionId: string;
  hasPatientEmail: boolean;
}

export function AppointmentLinkButton({
  submissionId,
  hasPatientEmail,
}: AppointmentLinkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleClick = () => {
    setResult(null);
    startTransition(async () => {
      const res = await sendAppointmentLink(submissionId);
      if (res.error) {
        setResult({ type: "error", message: res.error });
      } else {
        setResult({
          type: "success",
          message: res.message || "E-Mail versendet.",
        });
      }
    });
  };

  if (!hasPatientEmail) {
    return (
      <div className="p-3 bg-surface-sunken rounded text-xs text-text-tertiary">
        Keine E-Mail-Adresse des Patienten hinterlegt.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={isPending} className="w-full">
        <Send className="w-4 h-4 mr-2" strokeWidth={1.75} />
        {isPending ? "Wird gesendet…" : "Terminlink senden"}
      </Button>

      {result && (
        <div
          className={`flex items-start gap-2 p-2.5 rounded text-xs ${
            result.type === "success"
              ? "bg-brand/10 text-brand"
              : "bg-danger/10 text-danger"
          }`}
        >
          {result.type === "success" ? (
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} />
          ) : (
            <AlertCircle
              className="w-3.5 h-3.5 shrink-0 mt-0.5"
              strokeWidth={2}
            />
          )}
          <span className="leading-snug">{result.message}</span>
        </div>
      )}
    </div>
  );
}
