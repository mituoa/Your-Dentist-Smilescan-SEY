import type { ReactNode } from "react";

import { YD } from "@/lib/design/yd-design-tokens";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

function formatRelativeShort(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "vor wenigen Sekunden";
  if (diffMin < 60) return `vor ${diffMin} Minuten`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `vor ${h} Stunden`;
  const d = Math.floor(h / 24);
  return d === 1 ? "gestern" : `vor ${d} Tagen`;
}

export function DashboardFloatingPreviewShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p
        className="text-[10px] font-medium uppercase tracking-[0.1em]"
        style={{ color: YD.text.faint }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

export function NewSubmissionFloatingPreview({ row }: { row: SubmissionPreviewRow }) {
  const name = row.patient_name?.trim() || "Unbenannter Patient";
  const status = row.seen_at ? "In Bearbeitung" : "Wartet auf Sichtung";

  return (
    <DashboardFloatingPreviewShell title="Neue Einsendung">
      <p className="text-[14px] font-medium leading-snug" style={{ color: YD.text.primary }}>
        {name}
      </p>
      <p className="text-[12px] leading-relaxed" style={{ color: YD.text.secondary }}>
        Eingang {formatRelativeShort(row.created_at)}
      </p>
      <p className="text-[11px] font-medium" style={{ color: YD.text.muted }}>
        Status: {status}
      </p>
    </DashboardFloatingPreviewShell>
  );
}

export function UnreadCasesFloatingPreview({
  count,
  latest,
}: {
  count: number;
  latest?: SubmissionPreviewRow | null;
}) {
  return (
    <DashboardFloatingPreviewShell title="Ungelesene Fälle">
      <p className="text-[13px] leading-relaxed" style={{ color: YD.text.secondary }}>
        <span className="font-medium" style={{ color: YD.text.primary }}>
          {count}
        </span>{" "}
        {count === 1 ? "Fall" : "Fälle"} ohne Erstprüfung
      </p>
      {latest ? (
        <>
          <p className="text-[14px] font-medium" style={{ color: YD.text.primary }}>
            {latest.patient_name?.trim() || "Patient"}
          </p>
          <p className="text-[11px]" style={{ color: YD.text.muted }}>
            Zuletzt · {formatRelativeShort(latest.created_at)}
          </p>
        </>
      ) : null}
    </DashboardFloatingPreviewShell>
  );
}
