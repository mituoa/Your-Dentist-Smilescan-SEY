import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";
import { Activity, LayoutDashboard, Shield, Users } from "lucide-react";

const PREVIEW_ROWS = [
  { name: "M. Keller", meta: "Einsendung · heute", status: "Neu" },
  { name: "S. Berk", meta: "Rückfrage · Termin", status: "Vorbereitet" },
  { name: "A. Nguyen", meta: "Relay · Aufgabe", status: "Offen" },
] as const;

/** Desktop-Showcase — Premium Medical OS (ohne Phone-Mockup). */
export function LoginShowcase() {
  return (
    <div className="yd-login-showcase" aria-hidden>
      <div className="yd-login-showcase__mesh" />
      <div className="yd-login-showcase__grid" />
      <div className="yd-login-showcase__orb yd-login-showcase__orb--a" />
      <div className="yd-login-showcase__orb yd-login-showcase__orb--b" />
      <div className="yd-login-showcase__vignette" />

      <div className="yd-login-showcase__inner">
        <div className="yd-login-showcase__brand-panel">
          <YourDentistBrandLockup size="md" tagline={PUBLIC_BRAND_TAGLINE} />
        </div>

        <p className="yd-login-showcase__eyebrow">Praxis-Betriebssystem</p>
        <h2 className="yd-login-showcase__headline">
          Klinische Klarheit.
          <br />
          Ein geschützter Arbeitsraum.
        </h2>
        <p className="yd-login-showcase__lead">
          Atlas, Tracker und Relay — strukturiert wie Ihr Dashboard, gebaut für autorisierte
          Praxisteams.
        </p>

        <div className="yd-login-showcase__composition">
          <div className="yd-login-showcase__preview">
            <div className="yd-login-showcase__preview-toolbar">
              <span className="yd-login-showcase__preview-tab yd-login-showcase__preview-tab--active">
                <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                Atlas
              </span>
              <span className="yd-login-showcase__preview-tab">
                <Users className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                Tracker
              </span>
              <span className="yd-login-showcase__preview-tab">
                <Activity className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                Relay
              </span>
            </div>

            <div className="yd-login-showcase__kpis">
              <div className="yd-login-showcase__kpi">
                <span className="yd-login-showcase__kpi-label">Eingänge</span>
                <span className="yd-login-showcase__kpi-value">12</span>
              </div>
              <div className="yd-login-showcase__kpi yd-login-showcase__kpi--accent">
                <span className="yd-login-showcase__kpi-label">Vorbereitet</span>
                <span className="yd-login-showcase__kpi-value">5</span>
              </div>
              <div className="yd-login-showcase__kpi">
                <span className="yd-login-showcase__kpi-label">Entscheidungen</span>
                <span className="yd-login-showcase__kpi-value">3</span>
              </div>
            </div>

            <div className="yd-login-showcase__table">
              <div className="yd-login-showcase__table-head">
                <span>Patient</span>
                <span>Status</span>
              </div>
              {PREVIEW_ROWS.map((row) => (
                <div key={row.name} className="yd-login-showcase__table-row">
                  <div className="yd-login-showcase__table-cell">
                    <span className="yd-login-showcase__avatar" />
                    <span>
                      <span className="yd-login-showcase__row-name">{row.name}</span>
                      <span className="yd-login-showcase__row-meta">{row.meta}</span>
                    </span>
                  </div>
                  <span
                    className={`yd-login-showcase__status yd-login-showcase__status--${row.status === "Neu" ? "new" : row.status === "Vorbereitet" ? "prep" : "open"}`}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="yd-login-showcase__float-badge">
            <Shield className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>Freigabe durch Sie — kein Auto-Versand</span>
          </div>
        </div>

        <ul className="yd-login-showcase__trust">
          <li>Verschlüsselte Verbindung zum Praxiszugang</li>
          <li>Einheitliches Design wie Dashboard &amp; Tracker</li>
          <li>Nur für autorisierte Praxisteams</li>
        </ul>
      </div>
    </div>
  );
}
