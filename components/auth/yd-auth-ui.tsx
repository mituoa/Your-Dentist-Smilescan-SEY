"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type YdAuthAlertTone = "danger" | "warning" | "info" | "success";

export function YdAuthIntro(props: {
  title: string;
  subtitle?: ReactNode;
  className?: string;
  fieldIndex?: number;
}) {
  const { title, subtitle, className, fieldIndex = 0 } = props;
  return (
    <div
      className={cn("yd-auth-intro yd-auth-awaken-field", className)}
      style={{ ["--yd-auth-field-i" as string]: String(fieldIndex) }}
    >
      <h1 className="yd-auth-title">{title}</h1>
      {subtitle ? <p className="yd-auth-subtitle">{subtitle}</p> : null}
    </div>
  );
}

export function YdAuthAlert(props: {
  tone: YdAuthAlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
  role?: "alert" | "status";
}) {
  const { tone, title, children, className, role = "alert" } = props;
  return (
    <div
      className={cn("yd-auth-alert", `yd-auth-alert--${tone}`, className)}
      role={role}
    >
      {title ? <p className="yd-auth-alert-title">{title}</p> : null}
      {children}
    </div>
  );
}

export function YdAuthLabel(props: {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={props.htmlFor} className={cn("yd-auth-label", props.className)}>
      {props.children}
    </label>
  );
}

export function YdAuthFieldStack(props: {
  children: ReactNode;
  className?: string;
  fieldIndex?: number;
}) {
  return (
    <div
      className={cn("yd-auth-form-stack yd-auth-awaken-field", props.className)}
      style={
        props.fieldIndex != null
          ? ({ ["--yd-auth-field-i" as string]: String(props.fieldIndex) } satisfies CSSProperties)
          : undefined
      }
    >
      {props.children}
    </div>
  );
}

export function YdAuthPending(props: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("yd-auth-pending", props.className)} role="status">
      <p className="yd-auth-pending-title">{props.title}</p>
      <div className="yd-auth-pending-body">{props.children}</div>
    </div>
  );
}

export function YdAuthSuccess(props: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("yd-auth-success", props.className)} role="status" aria-live="polite">
      <p className="yd-auth-success-title">{props.title}</p>
      <div className="yd-auth-success-body">{props.children}</div>
    </div>
  );
}

export function YdAuthLoadingState(props: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("yd-auth-loading-state w-full max-w-sm space-y-3 px-2", props.className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={props.label ?? "Inhalt wird geladen"}
    >
      <div className="yd-skeleton h-3 w-32 rounded-md" aria-hidden />
      <div className="yd-skeleton h-11 w-full rounded-xl yd-skeleton--calm" aria-hidden />
      <div className="yd-skeleton h-11 w-full rounded-xl yd-skeleton--calm" aria-hidden />
      <div className="yd-auth-loading-pulse-v2" aria-hidden />
    </div>
  );
}

export function YdAuthLegalFooter(props: {
  loginHref?: string;
  loginLabel?: string;
  className?: string;
}) {
  const loginHref = props.loginHref ?? "/login";
  const loginLabel = props.loginLabel ?? "Zurück zum Login";
  return (
    <div className={cn("yd-auth-legal", props.className)}>
      <div className="yd-auth-legal-links">
        <Link prefetch href="/?welcome=1" className="yd-auth-link">
          Startseite
        </Link>
        <span aria-hidden>·</span>
        <Link href="/trust/privacy" className="yd-auth-link">
          Datenschutz
        </Link>
        <span aria-hidden>·</span>
        <Link href="/trust/imprint" className="yd-auth-link">
          Impressum
        </Link>
      </div>
      <p className="yd-auth-register mt-4">
        <Link prefetch href={loginHref} className="yd-auth-link">
          {loginLabel}
        </Link>
      </p>
    </div>
  );
}

/** Rechtliches unterhalb der Login-Karte — nicht im Formularbereich. */
export function YdLoginEntryFooter(props: { className?: string }) {
  return (
    <nav className={cn("yd-login-entry-footer", props.className)} aria-label="Weitere Optionen">
      <div className="yd-login-entry-footer-links">
        <Link prefetch href="/?welcome=1" className="yd-login-entry-footer-link">
          Zur Startseite
        </Link>
        <span className="yd-login-entry-footer-sep" aria-hidden>
          ·
        </span>
        <Link href="/trust/privacy" className="yd-login-entry-footer-link">
          Datenschutz
        </Link>
        <span className="yd-login-entry-footer-sep" aria-hidden>
          ·
        </span>
        <Link href="/trust/imprint" className="yd-login-entry-footer-link">
          Impressum
        </Link>
      </div>
    </nav>
  );
}
