import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type TrustEscapeBarProps = {
  returnTo: string;
  label?: string;
};

/** Rückweg in die App — z. B. aus Einstellungen · Rechtliches. */
export function TrustEscapeBar({
  returnTo,
  label = "Zurück zur Praxis",
}: TrustEscapeBarProps) {
  return (
    <div className="yd-trust-escape">
      <Link href={returnTo} className="yd-trust-escape__link">
        <ArrowLeft className="yd-trust-escape__icon" strokeWidth={2} aria-hidden />
        {label}
      </Link>
    </div>
  );
}
