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
      <p className="text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
        Keine E-Mail-Adresse hinterlegt — ein Terminlink per E-Mail ist hier nicht möglich.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={handleClick}
        disabled={!canSend || isPending}
        aria-busy={isPending}
        title={
          !canSend
            ? "Nur Ärzte dürfen Terminlinks versenden."
            : undefined
        }
        className="h-11 w-full rounded-[10px] border-0 bg-[#0C1929] text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(12,25,41,0.12)] hover:bg-[#1A4F9C]"
      >
        <Send className="w-4 h-4 mr-2" strokeWidth={1.75} />
        {isPending ? "Wird gesendet…" : "Terminlink per E-Mail senden"}
      </Button>

      {result && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`flex items-start gap-2 rounded-[10px] px-3 py-2.5 text-[14px] leading-relaxed ${
            result.type === "success"
              ? "bg-[#ECFDF5] text-[#047857]"
              : "bg-[#FEF2F2] text-[#B91C1C]"
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
