"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";
import { cn } from "@/lib/utils";

export type MedicalFormShellProps = {
  title: string;
  subtitle: string;
  onClose: () => void;
  closeDisabled?: boolean;
  children: React.ReactNode;
  footer: React.ReactNode;
  /** Screen reader label for the dialog */
  ariaLabel?: string;
  /** Wider panel for split layouts (e.g. landing inquiry + preview) */
  panelClassName?: string;
};

/**
 * Vollflächiger Fokusmodus — gleiche Geometrie wie Registrierung (`yd-auth-register-*`).
 */
export function MedicalFormShell({
  title,
  subtitle,
  onClose,
  closeDisabled = false,
  children,
  footer,
  ariaLabel,
  panelClassName,
}: MedicalFormShellProps) {
  const [mounted, setMounted] = React.useState(false);
  const titleId = React.useId();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !closeDisabled) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDisabled, onClose]);

  if (!mounted) return null;

  const overlay = (
    <div className="yd-auth-register-overlay yd-medical-form-overlay">
      <div className="yd-auth-register-backdrop" aria-hidden />

      <div className="yd-auth-register-stage">
        <div
          className={cn("yd-auth-register-panel yd-medical-form-panel", panelClassName)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-label={ariaLabel}
        >
          <button
            type="button"
            onClick={() => !closeDisabled && onClose()}
            disabled={closeDisabled}
            aria-label="Schließen"
            className="yd-auth-close-btn"
          >
            <svg
              className="h-4 w-4 text-gray-600 transition-all duration-200 group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="yd-auth-register-header">
            <div className="mb-5 flex justify-center pb-1 md:mb-6">
              <YourDentistBrandLockup size="md" centered tagline={PUBLIC_BRAND_TAGLINE} />
            </div>
            <h1 id={titleId} className="yd-auth-register-title">
              {title}
            </h1>
            <p className="yd-auth-register-subtitle mt-2">{subtitle}</p>
          </div>

          <div className="yd-auth-register-body yd-medical-form-body">
            <div className="yd-medical-form-scroll">{children}</div>
            <div className="yd-medical-form-footer">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
