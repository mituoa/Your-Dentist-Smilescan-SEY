import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  TRUST_DOCUMENT_LINKS,
  TRUST_FOOTER_LINK,
  mapContractVersionToLabel,
} from "@/lib/trust/navigation";
import type { WorkspaceContractAcceptance } from "@/lib/types/settings-legal";

type SettingsLegalPanelProps = {
  contract: WorkspaceContractAcceptance | null;
};

function formatAcceptedAt(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function SettingsLegalPanel({ contract }: SettingsLegalPanelProps) {
  const versionLabel = mapContractVersionToLabel(contract?.contract_version);
  const acceptedAt = formatAcceptedAt(contract?.accepted_at);

  return (
    <div className="yd-settings-v2__panel">
      <div className="yd-settings-v2__panel-head yd-settings-v2__panel-head--solo">
        <div>
          <h2 className="yd-settings-v2__panel-title">Rechtliches</h2>
          <p className="yd-settings-v2__panel-copy">
            Akzeptierte Vertragsstände und Zugriff auf das Trust Center.
          </p>
        </div>
      </div>

      <div className="yd-settings-legal__acceptance">
        <div className="yd-settings-legal__card">
          <p className="yd-settings-legal__card-label">Nutzungsbedingungen</p>
          <p className="yd-settings-legal__card-value">
            {contract?.accepted_tos ? `Version ${versionLabel}` : "Nicht dokumentiert"}
          </p>
          {contract?.accepted_tos ? (
            <p className="yd-settings-legal__card-sub">Zustimmung am {acceptedAt}</p>
          ) : null}
        </div>

        <div className="yd-settings-legal__card">
          <p className="yd-settings-legal__card-label">Datenschutzerklärung</p>
          <p className="yd-settings-legal__card-value">
            {contract?.accepted_privacy ? `Version ${versionLabel}` : "Nicht dokumentiert"}
          </p>
          {contract?.accepted_privacy ? (
            <p className="yd-settings-legal__card-sub">Zustimmung am {acceptedAt}</p>
          ) : null}
        </div>
      </div>

      <p className="yd-settings-v2__field-label yd-settings-legal__links-label">Trust Center</p>
      <div className="yd-settings-legal__links">
        <Link
          href={TRUST_FOOTER_LINK.href}
          target="_blank"
          rel="noopener noreferrer"
          className="yd-settings-legal__link-row"
        >
          {TRUST_FOOTER_LINK.label}
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </Link>
        {TRUST_DOCUMENT_LINKS.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            target="_blank"
            rel="noopener noreferrer"
            className="yd-settings-legal__link-row"
          >
            {entry.label}
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
