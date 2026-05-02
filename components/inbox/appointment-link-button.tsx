"use client";

import { useState, useTransition } from "react";
import { sendAppointmentLink } from "@/app/(protected)/inbox/[id]/actions";
import { Button } from "@/components/ui/button";
import { Send, Check, AlertCircle } from "lucide-react";

interface AppointmentLinkButtonProps {
  submissionId: string;
  hasPatientEmail: boolean;
  canSend: boolean;
}

export function AppointmentLinkButton({
  submissionId,
  hasPatientEmail,
  canSend,
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
      <div className="rounded-lg bg-surface-sunken p-3 text-sm leading-5 text-text-tertiary">
        Keine E-Mail-Adresse hinterlegt. Terminlink kann nicht gesendet werden.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleClick}
        disabled={!canSend || isPending}
        title={
          !canSend
            ? "Nur Ärzte dürfen Terminlinks versenden."
            : undefined
        }
        className="min-h-11 w-full"
      >
        <Send className="w-4 h-4 mr-2" strokeWidth={1.75} />
        {isPending ? "Wird gesendet…" : "Terminlink per E-Mail senden"}
      </Button>

      {result && (
        <div
          className={`flex items-start gap-2 rounded-lg p-2.5 text-sm leading-5 ${
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
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
