import type { ReactNode } from "react";
import { notFound } from "next/navigation";

/**
 * Kill-Switch für `/inbox-preview`: `INBOX_PREVIEW_ENABLED=false` oder `0` (nur Server-Env) → 404.
 * Vertrags- und Finalisierungskommentar (MVP, Punkte 12–13, Abschluss): `page.tsx`.
 */
export default function InboxPreviewLayout({ children }: { children: ReactNode }) {
  const v = (process.env.INBOX_PREVIEW_ENABLED ?? "").trim().toLowerCase();
  if (v === "false" || v === "0") {
    notFound();
  }
  return children;
}
