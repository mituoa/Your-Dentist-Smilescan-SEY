import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";

/** Desktop-Showcase — ruhig, vertrauenswürdig, nicht marketinghaft. */
export function LoginShowcase() {
  return (
    <div className="yd-login-showcase" aria-hidden>
      <div className="yd-login-showcase__mesh" />
      <div className="yd-login-showcase__grid" />
      <div className="yd-login-showcase__vignette" />

      <div className="yd-login-showcase__inner">
        <div className="yd-login-showcase__surface">
          <div className="yd-login-showcase__brand-panel">
            <YourDentistBrandLockup size="md" centered tagline={PUBLIC_BRAND_TAGLINE} />
          </div>

          <h2 className="yd-login-showcase__headline">
            Praxis‑Betriebssystem
            <br />
            für moderne Zahnarztpraxen.
          </h2>

          <p className="yd-login-showcase__lead">Atlas · Tracker · Relay</p>

          <p className="yd-login-showcase__access">
            Sicherer Zugang für autorisierte Praxisteams.
          </p>

          <ul className="yd-login-showcase__trust">
            <li>Verschlüsselte Verbindung</li>
            <li>Strukturierte Praxisabläufe</li>
            <li>Freigabe durch Zahnärzt:innen</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
