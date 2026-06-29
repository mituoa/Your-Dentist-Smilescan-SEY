"use client";

import { FileDown, Check, Copy, Printer } from "lucide-react";
import { useCallback, useState } from "react";

type TrustDocumentActionsProps = {
  canonicalUrl: string;
};

export function TrustDocumentActions({ canonicalUrl }: TrustDocumentActionsProps) {
  const [copied, setCopied] = useState(false);

  const onPrint = useCallback(() => {
    window.print();
  }, []);

  const onPdf = useCallback(() => {
    window.print();
  }, []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [canonicalUrl]);

  return (
    <div className="yd-trust-actions" data-print-hide>
      <button type="button" className="yd-trust-action-btn" onClick={onPrint}>
        <Printer className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Drucken
      </button>
      <button type="button" className="yd-trust-action-btn" onClick={onPdf}>
        <FileDown className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        PDF exportieren
      </button>
      <button type="button" className="yd-trust-action-btn" onClick={() => void onCopy()}>
        {copied ? (
          <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        ) : (
          <Copy className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        )}
        {copied ? "Kopiert" : "Link kopieren"}
      </button>
    </div>
  );
}
