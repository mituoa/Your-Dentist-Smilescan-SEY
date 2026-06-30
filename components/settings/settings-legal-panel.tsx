import { TrustCenterIndex } from "@/components/trust/trust-center-index";
import { TRUST_HOME_SECTIONS, mapContractVersionToLabel } from "@/lib/trust/navigation";
import { SETTINGS_LEGAL_RETURN_PATH } from "@/lib/trust/return-path";
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
          <p className="yd-settings-v2__panel-copy">Akzeptierte Vertragsstände.</p>
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

      <div className="yd-settings-legal__trust">
        <TrustCenterIndex
          sections={TRUST_HOME_SECTIONS}
          returnTo={SETTINGS_LEGAL_RETURN_PATH}
          className="yd-trust-index--settings"
        />
      </div>
    </div>
  );
}
