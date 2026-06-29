import { LEGAL_DRAFT_BANNER } from "@/lib/legal/meta";

export function LegalDraftBanner() {
  return (
    <div className="yd-legal-draft" role="note">
      <p>{LEGAL_DRAFT_BANNER}</p>
    </div>
  );
}
