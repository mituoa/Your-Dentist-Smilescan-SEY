"use client";

import { useCallback, useState } from "react";
import { PUBLIC_SITE_DEMO } from "@/lib/marketing/public-site-ia";
import { userFacingDemoRequestError } from "@/lib/marketing/demo-request";

type FormState = "idle" | "pending" | "success" | "error";

export function YdPublicSiteDemoForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "pending") return;

    const form = event.currentTarget;
    const fd = new FormData(form);

    setState("pending");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          practice: fd.get("practice"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          message: fd.get("message"),
          website: fd.get("website"),
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!res.ok || !data.ok) {
        setState("error");
        setErrorMessage(
          data.message || userFacingDemoRequestError(data.error)
        );
        return;
      }

      setState("success");
      form.reset();
    } catch {
      setState("error");
      setErrorMessage(userFacingDemoRequestError(undefined));
    }
  }, [state]);

  if (state === "success") {
    return (
      <div
        className="yd-public-site-demo-success"
        role="status"
        aria-live="polite"
      >
        <p className="yd-public-site-demo-success-title">{PUBLIC_SITE_DEMO.successTitle}</p>
        <p className="yd-public-site-demo-success-body">{PUBLIC_SITE_DEMO.successBody}</p>
        <button
          type="button"
          className="yd-clinical-cta-secondary yd-public-site-demo-success-reset"
          onClick={() => setState("idle")}
        >
          {PUBLIC_SITE_DEMO.successAnother}
        </button>
      </div>
    );
  }

  const isPending = state === "pending";

  return (
    <form
      className="yd-public-site-demo-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isPending}
    >
      <div className="yd-public-site-demo-form-grid">
        <label className="yd-public-site-demo-field">
          <span className="yd-public-site-demo-label">Name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            disabled={isPending}
            className="yd-public-site-demo-input"
          />
        </label>
        <label className="yd-public-site-demo-field">
          <span className="yd-public-site-demo-label">Praxis</span>
          <input
            type="text"
            name="practice"
            required
            autoComplete="organization"
            disabled={isPending}
            className="yd-public-site-demo-input"
          />
        </label>
        <label className="yd-public-site-demo-field">
          <span className="yd-public-site-demo-label">E-Mail</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            disabled={isPending}
            className="yd-public-site-demo-input"
          />
        </label>
        <label className="yd-public-site-demo-field">
          <span className="yd-public-site-demo-label">
            Telefon <span className="yd-public-site-demo-optional">(optional)</span>
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            disabled={isPending}
            className="yd-public-site-demo-input"
          />
        </label>
      </div>

      <label className="yd-public-site-demo-field yd-public-site-demo-field--full">
        <span className="yd-public-site-demo-label">
          Nachricht <span className="yd-public-site-demo-optional">(optional)</span>
        </span>
        <textarea
          name="message"
          rows={3}
          disabled={isPending}
          className="yd-public-site-demo-input yd-public-site-demo-textarea"
        />
      </label>

      {/* Honeypot — für Nutzerinnen unsichtbar */}
      <label className="yd-public-site-demo-honeypot" aria-hidden tabIndex={-1}>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {errorMessage ? (
        <p className="yd-public-site-demo-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="yd-public-site-demo-form-actions">
        <button
          type="submit"
          disabled={isPending}
          className="yd-clinical-cta-primary yd-public-site-demo-submit"
        >
          {isPending ? PUBLIC_SITE_DEMO.submitPending : PUBLIC_SITE_DEMO.submitLabel}
        </button>
      </div>
    </form>
  );
}
