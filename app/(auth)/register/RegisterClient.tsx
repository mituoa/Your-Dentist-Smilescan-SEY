"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";

import { RegisterFormBackButton } from "@/components/auth/register-form-back-button";
import { RegisterFormSubmitButton } from "@/components/auth/register-form-submit-button";
import { ResendSignupSubmitButton } from "@/components/auth/resend-signup-submit-button";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";
import {
  REGISTER_PLANS,
  coerceRegisterPlan,
  type RegisterPlanId,
} from "@/lib/auth/register-plans";
import { clearReturnToPricingFlag } from "@/lib/login-pricing-return";

type Plan = RegisterPlanId;
type RegistrationStep = 1 | 2 | 3 | 4;

const REGISTER_WIZARD_MAX_STEP_KEY = "yd-reg-max-wizard-step";

type SignUpAction = (formData: FormData) => void | Promise<void>;
type ResendAction = (formData: FormData) => void | Promise<void>;

/** Sperrt Plan, Zahlungsart und Vertrags-Checkboxen während Server-Action (ein Formular). */
function RegisterStep4LockableFieldset({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <fieldset
      disabled={pending}
      className="min-w-0 border-0 p-0 m-0 disabled:pointer-events-none disabled:opacity-[0.58] disabled:[&_a]:pointer-events-none"
    >
      {children}
    </fieldset>
  );
}

/** Intent-Ref zurücksetzen, sobald keine Action mehr pending ist (Recovery nach Fehler). */
function RegisterStep4PendingIntentSync({ intentRef }: { intentRef: React.MutableRefObject<string | null> }) {
  const { pending } = useFormStatus();
  React.useEffect(() => {
    if (!pending) intentRef.current = null;
  }, [pending, intentRef]);
  return null;
}

export function RegisterClient(props: {
  signUpAction: SignUpAction;
  resendConfirmationAction: ResendAction;
  inviteToken: string;
  prefilledEmail: string;
  initialPlan?: string | null;
  queryError?: string;
  success?: boolean;
  /** Nach erneutem Versand der Bestätigungsmail (enumeration-sichere Copy). */
  resent?: boolean;
  /** Aus URL `step` (1–4), nur wenn nicht `success`. */
  initialWizardStep?: RegistrationStep;
  loginHref: string;
  /** Separate pricing/onboarding page — close wizard returns here. */
  pricingHref: string;
  fromPricing?: boolean;
  /** Zeigt zweiten Submit „ohne Stripe“ (wirksam nur mit REGISTRATION_DEMO_MODE am Server). */
  registrationDemoUi?: boolean;
  /** Server `REGISTRATION_DEMO_MODE` — ohne dieses Flag den Demo-Button nicht anzeigen (vermeidet falsche Erwartung). */
  registrationDemoServer?: boolean;
  /** Server: Registrierung ohne Stripe-Redirect (Standard bis ENABLE_STRIPE_CHECKOUT_AT_SIGNUP). */
  skipPaymentAtSignup?: boolean;
  /** Server (REGISTRATION_DEMO_MODE): Lizenz-Upload-Schritt optional überspringbar. */
  licenseStepOptional?: boolean;
  /** Wizard overlay only when step or success is active (pricing stays on page). */
  wizardOpen: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginBackHref = props.loginHref;
  const pricingHref = props.pricingHref;
  const fromPricingFlow = Boolean(props.fromPricing);

  const pushRegisterUrl = React.useCallback(
    (nextParams: URLSearchParams, mode: "push" | "replace") => {
      const qs = nextParams.toString();
      const href = qs ? `/register?${qs}` : "/register";
      if (mode === "replace") router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [router]
  );

  const handleRegistrationModalClose = () => {
    setNavBusy(false);
    if (props.success) {
      router.replace(loginBackHref);
      return;
    }
    if (registrationStep === 4) {
      router.replace(loginBackHref);
      return;
    }
    if (registrationStep > 1) {
      const prev = (registrationStep - 1) as RegistrationStep;
      setRegistrationStep(prev);
      const p = new URLSearchParams(searchParams.toString());
      p.set("step", String(prev));
      pushRegisterUrl(p, "push");
      return;
    }
    router.replace(pricingHref);
  };
  const plan = coerceRegisterPlan(props.initialPlan);
  const [registrationStep, setRegistrationStep] = React.useState<RegistrationStep>(
    () => props.initialWizardStep ?? 1
  );
  const [regName, setRegName] = React.useState("");
  const [regPractice, setRegPractice] = React.useState("");
  const [regLicense, setRegLicense] = React.useState("");
  const [regEmail, setRegEmail] = React.useState(props.prefilledEmail ?? "");
  const [regEmailConfirm, setRegEmailConfirm] = React.useState("");
  const [regEmailConfirmDirty, setRegEmailConfirmDirty] = React.useState(false);
  const [emailPairError, setEmailPairError] = React.useState("");
  /** Mismatch hint only after blur, length near primary, or failed „Weiter“ — not on every keystroke. */
  const [confirmEmailBlurred, setConfirmEmailBlurred] = React.useState(false);
  const [confirmMismatchAfterContinueAttempt, setConfirmMismatchAfterContinueAttempt] = React.useState(false);
  /** Short overlay when advancing steps (calm brand mark). */
  const [navBusy, setNavBusy] = React.useState(false);
  /** Welcher Step-4-Submit (standard | demo) gerade läuft — gemeinsames Formular, ein Spinner. */
  const registerStep4SubmitIntentRef = React.useRef<string | null>(null);
  const [regPassword, setRegPassword] = React.useState("");

  React.useEffect(() => {
    if (!fromPricingFlow) clearReturnToPricingFlag();
  }, [fromPricingFlow]);

  React.useEffect(() => {
    if (!props.success) return;
    try {
      sessionStorage.removeItem(REGISTER_WIZARD_MAX_STEP_KEY);
    } catch {
      /* ignore */
    }
  }, [props.success]);

  React.useEffect(() => {
    if (props.success) return;
    const raw = searchParams.get("step");
    const trimmed = (raw ?? "").trim();
    const strictStep: RegistrationStep | null =
      trimmed === "1" || trimmed === "2" || trimmed === "3" || trimmed === "4"
        ? (Number.parseInt(trimmed, 10) as RegistrationStep)
        : null;

    if (raw !== null && trimmed !== "" && strictStep === null) {
      const p = new URLSearchParams(searchParams.toString());
      p.set("step", "1");
      pushRegisterUrl(p, "replace");
      setRegistrationStep(1);
      return;
    }

    if (strictStep === null) return;

    const parsed = strictStep;

    let maxAllowed = 1;
    try {
      maxAllowed = Math.min(
        4,
        Math.max(1, Number.parseInt(sessionStorage.getItem(REGISTER_WIZARD_MAX_STEP_KEY) || "1", 10) || 1)
      );
    } catch {
      maxAllowed = 1;
    }

    const clamped = Math.min(parsed, maxAllowed) as RegistrationStep;
    if (clamped !== parsed) {
      const p = new URLSearchParams(searchParams.toString());
      p.set("step", String(clamped));
      pushRegisterUrl(p, "replace");
    }
    setRegistrationStep((prev) => (prev !== clamped ? clamped : prev));
  }, [props.success, pushRegisterUrl, searchParams]);

  const [selectedPlan, setSelectedPlan] = React.useState<Plan>(plan);
  const [licenseFrontFile, setLicenseFrontFile] = React.useState<File | null>(null);
  const [licenseBackFile, setLicenseBackFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [frontPreview, setFrontPreview] = React.useState<string | null>(null);
  const [backPreview, setBackPreview] = React.useState<string | null>(null);
  const [licenseStoragePath, setLicenseStoragePath] = React.useState<string>("");
  const [licenseFrontStoragePath, setLicenseFrontStoragePath] = React.useState<string>("");
  const [licenseBackStoragePath, setLicenseBackStoragePath] = React.useState<string>("");
  const [licenseUploading, setLicenseUploading] = React.useState(false);
  const [licenseUploadError, setLicenseUploadError] = React.useState<string>("");

  const [frontQualityOk, setFrontQualityOk] = React.useState<boolean | null>(null);
  const [backQualityOk, setBackQualityOk] = React.useState<boolean | null>(null);
  const [frontQualityHint, setFrontQualityHint] = React.useState<string>("");
  const [backQualityHint, setBackQualityHint] = React.useState<string>("");

  const [acceptedTos, setAcceptedTos] = React.useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = React.useState(false);
  const [acceptedWithdrawal, setAcceptedWithdrawal] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<
    "sepa_debit" | "card" | "invoice" | "paypal"
  >("sepa_debit");

  const [emailCheckStatus, setEmailCheckStatus] = React.useState<
    "idle" | "checking" | "ready" | "invalid" | "error"
  >("idle");
  const [emailCheckMessage, setEmailCheckMessage] = React.useState("");
  const [emailTypoSuggestion, setEmailTypoSuggestion] = React.useState<{
    original: string;
    suggested: string;
  } | null>(null);
  const [emailTypoUndo, setEmailTypoUndo] = React.useState<{
    prevEmail: string;
    prevConfirm: string;
    appliedSuggested: string;
  } | null>(null);

  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [successEmail, setSuccessEmail] = React.useState(props.prefilledEmail ?? "");

  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 1) return { strength: 1, label: "Ausbaufähig", color: "#B45309" };
    if (strength <= 3) return { strength: 2, label: "Solide", color: "#CA8A04" };
    return { strength: 3, label: "Stark", color: "#047857" };
  };

  const passwordStrength = regPassword ? getPasswordStrength(regPassword) : null;

  /** Trim + lowercase only; used for validation/submit — display state stays as typed. */
  const normalizeEmail = (v: string) => v.trim().toLowerCase();

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(v));

  const emailsMatchNormalized = React.useMemo(() => {
    const e = normalizeEmail(regEmail);
    const c = normalizeEmail(regEmailConfirm);
    return e.length > 0 && e === c;
  }, [regEmail, regEmailConfirm]);

  const emailConfirmMismatch = React.useMemo(
    () => normalizeEmail(regEmailConfirm).length > 0 && !emailsMatchNormalized,
    [regEmailConfirm, emailsMatchNormalized]
  );

  const showConfirmMismatchHint = React.useMemo(() => {
    if (!emailConfirmMismatch) return false;
    const confirmMeaningful =
      regEmailConfirm.trim().length > 0 && emailLooksCompleteForTypoHint(regEmailConfirm);
    return (
      confirmMismatchAfterContinueAttempt ||
      confirmEmailBlurred ||
      confirmMeaningful
    );
  }, [
    emailConfirmMismatch,
    regEmailConfirm,
    confirmEmailBlurred,
    confirmMismatchAfterContinueAttempt,
  ]);

  React.useEffect(() => {
    setConfirmEmailBlurred(false);
    setConfirmMismatchAfterContinueAttempt(false);
  }, [regEmail]);

  const goToStep = React.useCallback(
    (next: RegistrationStep) => {
      setNavBusy(true);
      setRegistrationStep(next);
      try {
        const prev = Number.parseInt(sessionStorage.getItem(REGISTER_WIZARD_MAX_STEP_KEY) || "1", 10) || 1;
        sessionStorage.setItem(REGISTER_WIZARD_MAX_STEP_KEY, String(Math.max(prev, next)));
      } catch {
        sessionStorage.setItem(REGISTER_WIZARD_MAX_STEP_KEY, String(next));
      }
      const p = new URLSearchParams(searchParams.toString());
      p.set("step", String(next));
      p.delete("success");
      p.delete("resent");
      p.delete("checkout");
      pushRegisterUrl(p, "push");
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setNavBusy(false));
      });
    },
    [pushRegisterUrl, searchParams]
  );

  const registrationDocsSatisfied =
    props.licenseStepOptional === true ||
    Boolean(licenseFrontStoragePath || licenseBackStoragePath || licenseStoragePath);

  const normalizeLicenseNumber = (v: string) => v.replace(/\s+/g, "").trim();
  const licenseFormatHint = React.useMemo(() => {
    const v = normalizeLicenseNumber(regLicense);
    if (!v) return null;
    // Keep permissive: final verification remains manual approval by admin.
    const ok =
      /^z-?\d{6,10}$/i.test(v) || // e.g. Z-12345678
      /^\d{7,10}$/.test(v) || // pure digits
      /^[a-z]{1,3}-?\d{6,10}$/i.test(v); // e.g. prefix-1234567
    if (ok) return { tone: "ok" as const, text: "Format sieht plausibel aus." };
    return { tone: "warn" as const, text: "Bitte Nummer genau wie auf dem Ausweis eingeben (Format prüfen)." };
  }, [regLicense]);

  /** Domain looks complete (user past „local@domain.tld“) — avoids hints while typing only the local part. */
  const emailLooksCompleteForTypoHint = (raw: string) => {
    const t = raw.trim();
    const at = t.lastIndexOf("@");
    if (at <= 0 || at >= t.length - 1) return false;
    const domain = t.slice(at + 1);
    if (!domain.includes(".")) return false;
    const lastDot = domain.lastIndexOf(".");
    return lastDot >= 1 && lastDot < domain.length - 2;
  };

  const suggestEmailFix = (raw: string): { original: string; suggested: string } | null => {
    const original = raw.trim();
    const value = normalizeEmail(original);
    const at = value.lastIndexOf("@");
    if (at <= 0) return null;
    const local = value.slice(0, at);
    const domain = value.slice(at + 1);
    if (!local || !domain || !domain.includes(".")) return null;

    const domainFixes: Record<string, string> = {
      "gmial.com": "gmail.com",
      "gmal.com": "gmail.com",
      "gnail.com": "gmail.com",
      "gmail.con": "gmail.com",
      "gmai.com": "gmail.com",
      "mgail.com": "gmail.com",
      "outlok.com": "outlook.com",
      "outllok.com": "outlook.com",
      "outlook.con": "outlook.com",
      "hotnail.com": "hotmail.com",
      "hotmai.com": "hotmail.com",
      "icloud.con": "icloud.com",
      "icoud.com": "icloud.com",
      "yaho.com": "yahoo.com",
      "yahoo.con": "yahoo.com",
      "gmx.con": "gmx.com",
      "web.dee": "web.de",
      "t-online.dee": "t-online.de",
    };

    // 1) Known hardcoded typos
    const fixedDomainDirect = domainFixes[domain];
    if (fixedDomainDirect) {
      const suggested = `${local}@${fixedDomainDirect}`;
      if (suggested === value) return null;
      return { original, suggested };
    }

    // 2) Near-miss suggestions for common providers (edit distance <= 2).
    // Keeps it conservative to avoid false positives.
    const commonDomains = [
      "gmail.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com",
      "yahoo.com",
      "gmx.com",
      "web.de",
      "t-online.de",
    ] as const;

    const levenshtein = (a: string, b: string) => {
      if (a === b) return 0;
      const m = a.length;
      const n = b.length;
      if (m === 0) return n;
      if (n === 0) return m;

      const dp = new Array<number>(n + 1);
      for (let j = 0; j <= n; j++) dp[j] = j;

      for (let i = 1; i <= m; i++) {
        let prev = dp[0]!;
        dp[0] = i;
        for (let j = 1; j <= n; j++) {
          const temp = dp[j]!;
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          dp[j] = Math.min(
            dp[j]! + 1, // deletion
            dp[j - 1]! + 1, // insertion
            prev + cost // substitution
          );
          prev = temp;
        }
      }
      return dp[n]!;
    };

    let best: { domain: string; dist: number } | null = null;
    for (const d of commonDomains) {
      const dist = levenshtein(domain, d);
      if (dist === 0) return null;
      if (dist <= 2 && (!best || dist < best.dist)) {
        best = { domain: d, dist };
      }
    }

    if (!best) return null;
    const suggested = `${local}@${best.domain}`;
    return { original, suggested };
  };

  React.useEffect(() => {
    if (registrationStep !== 1) return;
    const email = regEmail.trim();
    if (!email) {
      setEmailTypoSuggestion(null);
      return;
    }

    const t = window.setTimeout(() => {
      if (!emailLooksCompleteForTypoHint(email)) {
        setEmailTypoSuggestion(null);
        return;
      }
      const suggestion = suggestEmailFix(email);
      setEmailTypoSuggestion(suggestion);
    }, 400);

    return () => window.clearTimeout(t);
  }, [regEmail, registrationStep]);

  React.useEffect(() => {
    if (!emailTypoUndo) return;
    const t = window.setTimeout(() => setEmailTypoUndo(null), 8000);
    return () => window.clearTimeout(t);
  }, [emailTypoUndo]);

  React.useEffect(() => {
    if (!props.success) return;
    setResendCooldown(30);
  }, [props.success]);

  React.useEffect(() => {
    if (!props.success) return;
    setSuccessEmail(props.prefilledEmail ?? "");
  }, [props.prefilledEmail, props.success]);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [resendCooldown]);

  React.useEffect(() => {
    if (registrationStep !== 1) return;
    const email = normalizeEmail(regEmail);
    if (!email) {
      setEmailCheckStatus("idle");
      setEmailCheckMessage("");
      return;
    }
    if (!isValidEmail(email)) {
      setEmailCheckStatus("invalid");
      setEmailCheckMessage("Bitte eine gültige E‑Mail-Adresse eingeben.");
      return;
    }

    setEmailCheckStatus("checking");
    setEmailCheckMessage("Prüfe Eingabe…");

    const t = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const json = (await res.json()) as
          | { ok: true; checked?: boolean }
          | { ok: false; error: string };

        if (!res.ok || !("ok" in json) || json.ok !== true) {
          setEmailCheckStatus("error");
          setEmailCheckMessage(
            res.status === 429
              ? "Zu viele Anfragen. Bitte warten Sie einen Moment."
              : "Serverprüfung gerade nicht möglich — Sie können trotzdem fortfahren."
          );
          return;
        }

        setEmailCheckStatus("ready");
        setEmailCheckMessage("Formal gültig — die endgültige Prüfung erfolgt beim Fortfahren.");
      } catch {
        setEmailCheckStatus("error");
        setEmailCheckMessage("Serverprüfung gerade nicht möglich — Sie können trotzdem fortfahren.");
      }
    }, 450);

    return () => window.clearTimeout(t);
  }, [regEmail, registrationStep]);

  React.useEffect(() => {
    try {
      sessionStorage.setItem("yd-registration-plan", selectedPlan);
    } catch {
      /* ignore */
    }
  }, [selectedPlan]);

  const plans = REGISTER_PLANS;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!licenseFrontFile) ingestLicenseFile(file, "front");
      else ingestLicenseFile(file, "back");
    }
  };

  const ingestLicenseFile = (file: File, side: "front" | "back") => {
    if (side === "front") setLicenseFrontFile(file);
    else setLicenseBackFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === "front") setFrontPreview(reader.result as string);
        else setBackPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      if (side === "front") setFrontPreview(null);
      else setBackPreview(null);
    }
  };

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) ingestLicenseFile(e.target.files[0], "front");
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) ingestLicenseFile(e.target.files[0], "back");
  };

  const analyzeImageQuality = async (file: File): Promise<{ ok: boolean; hint: string }> => {
    if (!file.type.startsWith("image/")) {
      return { ok: true, hint: "PDF wird bei der Prüfung gesondert betrachtet." };
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read_failed"));
      r.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("image_load_failed"));
      i.src = dataUrl;
    });

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    const targetW = 420;
    const scale = targetW / w;
    const cw = Math.max(200, Math.round(w * scale));
    const ch = Math.max(200, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { ok: true, hint: "Qualitätsprüfung nicht verfügbar." };
    ctx.drawImage(img, 0, 0, cw, ch);
    const { data } = ctx.getImageData(0, 0, cw, ch);

    let mean = 0;
    const gray = new Float32Array(cw * ch);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      gray[p] = v;
      mean += v;
    }
    mean /= gray.length;

    if (mean < 60) {
      return {
        ok: false,
        hint: "Das Bild wirkt sehr dunkel. Bei etwas mehr Licht lässt sich der Inhalt leichter prüfen.",
      };
    }
    if (mean > 210) {
      return {
        ok: false,
        hint: "Das Bild wirkt sehr hell. Ohne harten Blitz wirkt die Darstellung oft ruhiger.",
      };
    }

    let energy = 0;
    for (let y = 1; y < ch - 1; y++) {
      for (let x = 1; x < cw - 1; x++) {
        const i = y * cw + x;
        const gx = gray[i + 1] - gray[i - 1];
        const gy = gray[i + cw] - gray[i - cw];
        energy += Math.abs(gx) + Math.abs(gy);
      }
    }
    const norm = energy / (cw * ch);
    if (norm < 18) {
      return {
        ok: false,
        hint: "Das Bild könnte klarer sein. Für eine schnellere Prüfung empfehlen wir eine ruhigere Aufnahme.",
      };
    }

    return { ok: true, hint: "Lesbar." };
  };

  const onStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    const email = normalizeEmail(regEmail);
    const confirm = normalizeEmail(regEmailConfirm);
    setEmailPairError("");
    setConfirmMismatchAfterContinueAttempt(false);
    if (!email || !isValidEmail(email)) return;
    if (!confirm) {
      setEmailPairError("Bitte geben Sie Ihre E-Mail-Adresse zur Bestätigung erneut ein.");
      return;
    }
    if (email !== confirm) {
      setEmailPairError("Die beiden E-Mail-Eingaben passen nicht zueinander.");
      setConfirmMismatchAfterContinueAttempt(true);
      return;
    }
    if (emailCheckStatus === "checking") return;
    goToStep(2);
  };

  const onStep2Submit = (e: FormEvent) => {
    e.preventDefault();
    goToStep(3);
  };

  const uploadLicenseSide = async (side: "front" | "back", file: File): Promise<string> => {
    const form = new FormData();
    form.set("file", file);
    form.set("side", side);
    const res = await fetch("/api/register-license-upload", {
      method: "POST",
      body: form,
    });
    const json = (await res.json()) as { storagePath?: string; error?: string };
    if (!res.ok || !json.storagePath) {
      if (res.status === 429) {
        throw new Error("Zu viele Upload-Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.");
      }
      const msg =
        typeof json.error === "string" && json.error.trim().length > 0
          ? json.error.trim()
          : "Upload fehlgeschlagen.";
      throw new Error(msg);
    }
    return json.storagePath;
  };

  const onStep3Submit = async (e: FormEvent) => {
    e.preventDefault();
    setLicenseUploading(true);
    setLicenseUploadError("");
    const optional = props.licenseStepOptional === true;
    try {
      if (!licenseFrontFile && !licenseBackFile) {
        if (optional) {
          setLicenseUploadError("");
          setLicenseFrontStoragePath("");
          setLicenseBackStoragePath("");
          setLicenseStoragePath("");
          setFrontQualityOk(null);
          setBackQualityOk(null);
          setFrontQualityHint("");
          setBackQualityHint("");
          goToStep(4);
          return;
        }
        setLicenseUploadError("Bitte laden Sie Vorder- und Rückseite hoch (oder eine Seite als Bild/PDF).");
        return;
      }

      const frontQ = licenseFrontFile ? await analyzeImageQuality(licenseFrontFile) : { ok: true, hint: "" };
      const backQ = licenseBackFile ? await analyzeImageQuality(licenseBackFile) : { ok: true, hint: "" };
      setFrontQualityOk(licenseFrontFile ? frontQ.ok : null);
      setBackQualityOk(licenseBackFile ? backQ.ok : null);
      setFrontQualityHint(licenseFrontFile ? frontQ.hint : "");
      setBackQualityHint(licenseBackFile ? backQ.hint : "");

      let frontPath = "";
      let backPath = "";
      if (licenseFrontFile) {
        frontPath = await uploadLicenseSide("front", licenseFrontFile);
      }
      if (licenseBackFile) {
        backPath = await uploadLicenseSide("back", licenseBackFile);
      }

      setLicenseFrontStoragePath(frontPath);
      setLicenseBackStoragePath(backPath);
      setLicenseStoragePath(frontPath || backPath);
      setLicenseUploadError("");
      if (!frontQ.ok || !backQ.ok) {
        setLicenseUploadError(
          "Hinweis: Die Scan-Qualität ist für eine manuelle Prüfung grenzwertig. Sie können fortfahren; wir prüfen das Dokument später."
        );
      }
      goToStep(4);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Upload fehlgeschlagen.";
      console.error("[RegisterClient] license upload", raw);
      setLicenseUploadError(userFacingAuthError(raw));
    } finally {
      setLicenseUploading(false);
    }
  };

  const [portalReady, setPortalReady] = React.useState(false);
  React.useEffect(() => {
    setPortalReady(true);
  }, []);

  if (!props.wizardOpen) {
    return null;
  }

  const registerOverlay = (
    <div className="yd-auth-register-overlay">
        <div className="yd-auth-register-backdrop" aria-hidden />

        <div className="yd-auth-register-stage">
          <div className="yd-auth-register-panel">
          <button
            type="button"
            onClick={handleRegistrationModalClose}
            aria-label="Schließen"
            className="yd-auth-close-btn"
          >
            <svg
              className="h-4 w-4 text-gray-600 transition-all duration-200 group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

            <div className="yd-auth-register-header">
              <div className="mb-1 flex justify-center">
                <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" centered />
              </div>
            </div>

            <div className="yd-auth-register-body">
              {props.success ? (
                <div className="py-6 text-center">
                  <h3 className="yd-auth-register-title">Bitte E‑Mail bestätigen</h3>
                  {props.queryError ? (
                    <p className="yd-auth-alert yd-auth-alert--warning mx-auto mb-4 max-w-md scroll-mt-6 text-left">
                      {userFacingAuthError(
                        (() => {
                          try {
                            return decodeURIComponent(props.queryError);
                          } catch {
                            return props.queryError;
                          }
                        })()
                      )}
                    </p>
                  ) : null}
                  {props.resent ? (
                    <p className="yd-auth-alert yd-auth-alert--success mx-auto mb-4 max-w-md scroll-mt-6 text-left">
                      Sofern ein passendes Konto existiert, wurde die Bestätigungs-E-Mail erneut versendet. Bitte
                      prüfen Sie auch den Spam-Ordner.
                    </p>
                  ) : null}
                  <p className="yd-auth-register-subtitle mb-5">
                    Um den Zugang zu aktivieren, bestätigen Sie bitte Ihre E‑Mail-Adresse über den Link in der
                    Bestätigungs‑E‑Mail.
                  </p>

                  <div className="yd-auth-checklist mx-auto mb-6 max-w-md">
                    <p className="yd-auth-checklist-title">Checkliste</p>
                    <ul className="mt-3 space-y-2 text-[13px] text-gray-700">
                      <li>1) Posteingang prüfen</li>
                      <li>2) Spam/Promotion prüfen</li>
                      <li>3) Absender als vertrauenswürdig markieren</li>
                    </ul>
                    <div className="mt-4">
                      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-gray-600">
                        E‑Mail-Adresse
                      </label>
                      <input
                        type="email"
                        value={successEmail}
                        onChange={(e) => setSuccessEmail(e.target.value)}
                        placeholder="name@praxis.de"
                        className="yd-auth-input h-[48px] scroll-mt-8"
                      />
                      {successEmail.trim() && !isValidEmail(successEmail) ? (
                        <p className="mt-2 text-[12px] text-amber-800">Bitte eine gültige E‑Mail-Adresse eingeben.</p>
                      ) : null}
                      {(() => {
                        const raw = successEmail.trim();
                        if (!emailLooksCompleteForTypoHint(raw)) return null;
                        const suggestion = suggestEmailFix(raw);
                        if (!suggestion) return null;
                        return (
                          <p className="mt-2 text-[12px] leading-relaxed text-gray-600">
                            Meinten Sie{" "}
                            <button
                              type="button"
                              onClick={() => setSuccessEmail(suggestion.suggested)}
                              className="font-medium yd-auth-link underline decoration-[#0284C7]/30 underline-offset-2 hover:decoration-[#0284C7]"
                            >
                              {suggestion.suggested.includes("@")
                                ? (suggestion.suggested.split("@")[1] ?? suggestion.suggested)
                                : suggestion.suggested}
                            </button>
                            ?
                          </p>
                        );
                      })()}
                      <p className="mt-2 text-[12px] text-gray-500">
                        Falls Sie sich vertippt haben: hier korrigieren und erneut senden.
                      </p>
                    </div>
                  </div>

                  <form action={props.resendConfirmationAction} className="mx-auto mb-4 max-w-md">
                    <input type="hidden" name="resend_context" value="register_success" />
                    <input type="hidden" name="email" value={successEmail.trim()} />
                    {props.inviteToken ? (
                      <input type="hidden" name="invite_token" value={props.inviteToken} />
                    ) : null}
                    <ResendSignupSubmitButton
                      idleLabel={
                        resendCooldown > 0
                          ? `E‑Mail erneut senden (${resendCooldown}s)`
                          : "Bestätigungs‑E‑Mail erneut senden"
                      }
                      disabled={resendCooldown > 0 || !successEmail.trim() || !isValidEmail(successEmail)}
                      pendingLabel="Wird gesendet…"
                      className="yd-auth-btn-secondary h-[52px]"
                    />
                  </form>

                  <Link
                    href="/register?step=1"
                    className="inline-flex items-center gap-2 text-[13px] font-semibold yd-auth-link transition-colors duration-150 hover:text-[#0369A1]"
                  >
                    Falsche E‑Mail eingegeben?
                  </Link>

                  <Link
                    href={loginBackHref}
                    className="mt-5 inline-flex items-center justify-center gap-2 text-[13px] font-medium yd-auth-link transition-colors duration-150 hover:text-[#0369A1]"
                  >
                    Zurück zur Login-Seite
                  </Link>
                </div>
              ) : null}

              {!props.success ? (
                <>
              {props.queryError ? (
                <p className="mb-6 scroll-mt-6 break-words rounded-xl border border-amber-200/60 bg-amber-50/50 px-4 py-3 text-[14px] leading-relaxed text-amber-950">
                  {userFacingAuthError(
                    (() => {
                      try {
                        return decodeURIComponent(props.queryError);
                      } catch {
                        return props.queryError;
                      }
                    })()
                  )}
                </p>
              ) : null}

              <div className="mb-8">
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Ablauf
                    </span>
                    <span className="shrink-0 text-right text-[11px] font-semibold tabular-nums yd-auth-link">
                      Schritt {registrationStep} von 4 · {Math.round(((registrationStep - 1) / 3) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${((registrationStep - 1) / 3) * 100}%`,
                        background: "linear-gradient(to right, #0284C7, #0369A1)",
                      }}
                    />
                  </div>
                </div>

                <div className="flex min-w-0 items-center justify-center px-0.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex min-w-0 shrink-0 items-center">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                          registrationStep === step
                            ? "bg-gradient-to-b from-[#0284C7] to-[#0369A1] text-white shadow-md max-md:scale-105 md:scale-110"
                            : registrationStep > step
                              ? "bg-gradient-to-b from-green-500 to-green-600 text-white"
                              : "bg-gray-100 text-gray-400"
                        }`}
                        style={{ animation: "none" }}
                      >
                        {registrationStep > step ? (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" style={{ animation: "checkmark 0.3s ease-out" }}>
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-[12px] font-semibold">{step}</span>
                        )}
                      </div>
                      {step < 4 ? (
                        <div
                          className={`mx-1.5 h-[2px] w-8 shrink rounded-full transition-all duration-500 max-md:mx-1 max-md:w-6 ${
                            registrationStep > step
                              ? "bg-gradient-to-r from-green-500 to-green-600"
                              : "bg-gray-200"
                          }`}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center text-[12px] font-medium text-gray-500">
                  {registrationStep === 1 && "Persönliche Daten"}
                  {registrationStep === 2 && "Praxisinformationen"}
                  {registrationStep === 3 && "Verifizierung"}
                  {registrationStep === 4 && "Bestätigung"}
                </div>
              </div>

              {registrationStep === 1 ? (
                <div className="yd-auth-awaken-field">
                  <div className="mb-7 text-center">
                    <h3 className="mb-1.5 text-[24px] font-semibold tracking-tight text-gray-900">
                      Willkommen bei Your Dentist
                    </h3>
                    <p className="text-[13px] leading-relaxed text-gray-500">
                      {props.inviteToken ? (
                        <>
                          Registrierung über Team-Einladung: Bitte dieselbe E‑Mail-Adresse verwenden wie in der
                          Einladung.
                        </>
                      ) : (
                        <>
                          Konto für Ihre Praxis — abschließend per E‑Mail bestätigen. Die Freigabe erfolgt nach
                          fachlicher Prüfung.
                        </>
                      )}
                    </p>
                  </div>

                  <form
                    onSubmit={onStep1Submit}
                    className="space-y-5"
                    aria-busy={emailCheckStatus === "checking"}
                  >
                    <div>
                      <label htmlFor="reg-name" className="mb-2 block text-[13px] font-medium text-gray-700">
                        Vollständiger Name *
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Dr. med. dent. Max Mustermann"
                        className="yd-auth-input h-[52px] scroll-mt-8"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="reg-email" className="mb-2 block text-[13px] font-medium text-gray-700">
                        E-Mail-Adresse *
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setEmailPairError("");
                        }}
                        placeholder="max.mustermann@praxis.de"
                        autoComplete="email"
                        className="yd-auth-input h-[52px] scroll-mt-8"
                        required
                      />
                      {emailCheckStatus !== "idle" ? (
                        <div className="mt-2 flex items-center justify-between">
                          <p
                            className={`text-[12px] ${
                              emailCheckStatus === "ready"
                                ? "text-green-600"
                                : emailCheckStatus === "invalid"
                                  ? "text-amber-800"
                                  : "text-gray-500"
                            }`}
                          >
                            {emailCheckMessage}
                          </p>
                          {emailCheckStatus === "checking" ? (
                            <span className="text-[12px] text-gray-400">…</span>
                          ) : null}
                        </div>
                      ) : null}

                      {emailTypoSuggestion ? (
                        <p className="mt-2.5 text-[12px] leading-relaxed text-gray-600">
                          Meinten Sie{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setEmailTypoUndo({
                                prevEmail: regEmail,
                                prevConfirm: regEmailConfirm,
                                appliedSuggested: emailTypoSuggestion.suggested,
                              });
                              setRegEmail(emailTypoSuggestion.suggested);
                              setEmailTypoSuggestion(null);
                              setRegEmailConfirmDirty(true);
                              setEmailPairError("");
                              setConfirmMismatchAfterContinueAttempt(false);
                            }}
                            className="font-medium yd-auth-link underline decoration-[#0284C7]/30 underline-offset-2 hover:decoration-[#0284C7]"
                          >
                            {emailTypoSuggestion.suggested.includes("@")
                              ? (emailTypoSuggestion.suggested.split("@")[1] ?? emailTypoSuggestion.suggested)
                              : emailTypoSuggestion.suggested}
                          </button>
                          ?
                        </p>
                      ) : null}

                      {emailTypoUndo ? (
                        <div className="mt-2 flex items-center justify-between px-1">
                          <p className="text-[12px] text-gray-500">
                            E‑Mail auf <span className="font-medium text-gray-700">{emailTypoUndo.appliedSuggested}</span>{" "}
                            korrigiert.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setRegEmail(emailTypoUndo.prevEmail);
                              setRegEmailConfirm(emailTypoUndo.prevConfirm);
                              setEmailTypoUndo(null);
                            }}
                            className="text-[12px] font-semibold yd-auth-link hover:underline"
                          >
                            Rückgängig
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="reg-email-confirm" className="mb-2 block text-[13px] font-medium text-gray-700">
                        E-Mail-Adresse bestätigen *
                      </label>
                      <input
                        id="reg-email-confirm"
                        type="email"
                        value={regEmailConfirm}
                        onChange={(e) => {
                          setRegEmailConfirmDirty(true);
                          setRegEmailConfirm(e.target.value);
                          setEmailPairError("");
                          setConfirmMismatchAfterContinueAttempt(false);
                        }}
                        onFocus={() => setConfirmEmailBlurred(false)}
                        onBlur={() => setConfirmEmailBlurred(true)}
                        placeholder="E-Mail-Adresse erneut eingeben"
                        autoComplete="off"
                        name="email_confirm_register"
                        className="yd-auth-input h-[52px] scroll-mt-8"
                        required
                      />
                      {emailPairError ? (
                        <p className="mt-2 text-[12px] text-amber-800">{emailPairError}</p>
                      ) : showConfirmMismatchHint ? (
                        <p className="mt-2 text-[12px] text-amber-800">
                          Die E-Mail-Adressen sollten übereinstimmen.
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="reg-password" className="mb-2 block text-[13px] font-medium text-gray-700">
                        Passwort *
                      </label>
                      <input
                        id="reg-password"
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mindestens 8 Zeichen"
                        autoComplete="new-password"
                        minLength={8}
                        className="yd-auth-input h-[52px] scroll-mt-8"
                        required
                      />

                      {regPassword && passwordStrength ? (
                        <div className="mt-3">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${(passwordStrength.strength / 3) * 100}%`,
                                  background: passwordStrength.color,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold" style={{ color: passwordStrength.color }}>
                              {passwordStrength.label}
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        emailCheckStatus === "invalid" ||
                        emailCheckStatus === "checking" ||
                        !normalizeEmail(regEmailConfirm) ||
                        !emailsMatchNormalized
                      }
                      className="yd-auth-btn-primary mt-8 h-[56px]"
                    >
                      Weiter
                    </button>
                  </form>
                </div>
              ) : null}

              {registrationStep === 2 ? (
                <div className="yd-auth-awaken-field">
                  <div className="mb-7 text-center">
                    <h3 className="mb-1.5 text-[24px] font-semibold tracking-tight text-gray-900">
                      Ihre Praxis
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      Damit wir Sie optimal unterstützen können
                    </p>
                  </div>

                  <form onSubmit={onStep2Submit} className="space-y-5">
                    <div>
                      <label htmlFor="reg-practice" className="mb-2 block text-[13px] font-medium text-gray-700">
                        Praxisname *
                      </label>
                      <input
                        id="reg-practice"
                        type="text"
                        value={regPractice}
                        onChange={(e) => setRegPractice(e.target.value)}
                        placeholder="Zahnarztpraxis Mustermann"
                        className="yd-auth-input h-[52px] scroll-mt-8"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="reg-license" className="mb-2 block text-[13px] font-medium text-gray-700">
                        Zahnarzt-Zulassungsnummer *
                      </label>
                      <input
                        id="reg-license"
                        type="text"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        placeholder="Z-12345678"
                        className="yd-auth-input h-[52px] scroll-mt-8"
                        required
                      />
                      {licenseFormatHint ? (
                        <p
                          className={`mt-2 text-[12px] ${
                            licenseFormatHint.tone === "ok" ? "text-green-700" : "text-amber-800"
                          }`}
                        >
                          {licenseFormatHint.text}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="yd-auth-btn-secondary h-[56px] flex-1"
                      >
                        Zurück
                      </button>
                      <button type="submit" className="yd-auth-btn-primary h-[56px] flex-1">
                        Weiter
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {registrationStep === 3 ? (
                <div className="yd-auth-awaken-field">
                  <div className="mb-7 text-center">
                    <h3 className="mb-1.5 text-[24px] font-semibold tracking-tight text-gray-900">
                      Verifizierung
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      Bitte laden Sie Ihre Zahnarzt-Zulassung hoch — idealerweise Vorder- und Rückseite; mindestens
                      eine Seite als Bild oder PDF.
                    </p>
                    {props.licenseStepOptional ? (
                      <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-gray-500">
                        Demo: Sie können ohne Upload fortfahren — die Dokumente können Sie später nachreichen.
                      </p>
                    ) : null}
                  </div>

                  <form onSubmit={onStep3Submit} className="space-y-5" aria-busy={licenseUploading}>

                    <div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {/* Vorderseite */}
                        <div
                          className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
                            dragActive
                              ? "border-[#0284C7] bg-[#0284C7]/10"
                              : licenseFrontFile
                                ? "border-green-400 bg-green-50"
                                : "border-gray-300 bg-white hover:border-[#0284C7] hover:bg-[#0284C7]/5"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            id="license-front"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFrontFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="license-front"
                            className="flex min-h-[120px] cursor-pointer flex-col justify-center px-5 py-6 max-md:min-h-[132px]"
                          >
                            <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-600">
                              Vorderseite
                            </p>
                            {licenseFrontFile ? (
                              <div className="mt-3">
                                {frontPreview ? (
                                  <div className="mb-3 overflow-hidden rounded-lg border border-green-200 bg-white">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={frontPreview} alt="Vorderseite" className="h-28 w-full object-cover" />
                                  </div>
                                ) : null}
                                <p className="truncate text-[13px] font-semibold text-gray-900">
                                  {licenseFrontFile.name}
                                </p>
                                <p className="mt-1 text-[12px] text-gray-500">
                                  {(licenseFrontFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {frontQualityOk !== null ? (
                                  <p
                                    className={`mt-2 text-[12px] font-medium ${
                                      frontQualityOk ? "text-green-700" : "text-amber-800"
                                    }`}
                                  >
                                    {frontQualityHint}
                                  </p>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setLicenseFrontFile(null);
                                    setFrontPreview(null);
                                    setFrontQualityOk(null);
                                    setFrontQualityHint("");
                                    setLicenseFrontStoragePath("");
                                  }}
                                  className="mt-3 text-[13px] font-medium yd-auth-link hover:text-[#0369A1]"
                                >
                                  Erneut auswählen
                                </button>
                              </div>
                            ) : (
                              <div className="mt-3">
                                <p className="text-[14px] font-semibold text-gray-900">
                                  Foto hochladen
                                </p>
                                <p className="mt-1 text-[12px] text-gray-500">
                                  JPG, PNG oder PDF (max. 10 MB)
                                </p>
                              </div>
                            )}
                          </label>
                        </div>

                        {/* Rückseite */}
                        <div
                          className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
                            dragActive
                              ? "border-[#0284C7] bg-[#0284C7]/10"
                              : licenseBackFile
                                ? "border-green-400 bg-green-50"
                                : "border-gray-300 bg-white hover:border-[#0284C7] hover:bg-[#0284C7]/5"
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            id="license-back"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleBackFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="license-back"
                            className="flex min-h-[120px] cursor-pointer flex-col justify-center px-5 py-6 max-md:min-h-[132px]"
                          >
                            <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-600">
                              Rückseite
                            </p>
                            {licenseBackFile ? (
                              <div className="mt-3">
                                {backPreview ? (
                                  <div className="mb-3 overflow-hidden rounded-lg border border-green-200 bg-white">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={backPreview} alt="Rückseite" className="h-28 w-full object-cover" />
                                  </div>
                                ) : null}
                                <p className="truncate text-[13px] font-semibold text-gray-900">
                                  {licenseBackFile.name}
                                </p>
                                <p className="mt-1 text-[12px] text-gray-500">
                                  {(licenseBackFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {backQualityOk !== null ? (
                                  <p
                                    className={`mt-2 text-[12px] font-medium ${
                                      backQualityOk ? "text-green-700" : "text-amber-800"
                                    }`}
                                  >
                                    {backQualityHint}
                                  </p>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setLicenseBackFile(null);
                                    setBackPreview(null);
                                    setBackQualityOk(null);
                                    setBackQualityHint("");
                                    setLicenseBackStoragePath("");
                                  }}
                                  className="mt-3 text-[13px] font-medium yd-auth-link hover:text-[#0369A1]"
                                >
                                  Erneut auswählen
                                </button>
                              </div>
                            ) : (
                              <div className="mt-3">
                                <p className="text-[14px] font-semibold text-gray-900">
                                  Foto hochladen
                                </p>
                                <p className="mt-1 text-[12px] text-gray-500">
                                  JPG, PNG oder PDF (max. 10 MB)
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                      {licenseUploadError ? (
                        <p
                          className={`mt-3 break-words rounded-lg border px-3 py-2 text-[12px] leading-relaxed ${
                            licenseUploadError.startsWith("Hinweis:")
                              ? "border-amber-200 bg-amber-50 text-amber-900"
                              : "yd-auth-alert yd-auth-alert--danger border-0"
                          }`}
                        >
                          {licenseUploadError}
                        </p>
                      ) : null}
                      <div
                        className="mt-3 flex items-start gap-2 rounded-lg p-3"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, rgba(2, 132, 199, 0.03) 100%)",
                          border: "1px solid rgba(2, 132, 199, 0.2)",
                        }}
                      >
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 yd-auth-link" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-[12px] leading-relaxed text-gray-700">
                          Ihre Dateien werden über eine geschützte Verbindung übertragen und nur zur fachlichen
                          Verifizierung verwendet.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        disabled={licenseUploading}
                        className="yd-auth-btn-secondary h-[56px] flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Zurück
                      </button>
                      <button
                        type="submit"
                        disabled={licenseUploading}
                        className="yd-auth-btn-primary h-[56px] flex-1 disabled:cursor-not-allowed disabled:opacity-90"
                      >
                        {licenseUploading ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <span className="yd-auth-loading-pulse !h-4 !w-4" aria-hidden />
                            Wird hochgeladen…
                          </span>
                        ) : (
                          "Weiter"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {registrationStep === 4 ? (
                <div className="yd-auth-awaken-field">
                  <header className="mb-8 text-center md:mb-10">
                    <h3 className="text-[22px] font-semibold leading-snug tracking-tight text-slate-900 md:text-[23px]">
                      Tarif, Zahlungsweg und Zustimmungen
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-slate-600">
                      Abschluss der Registrierung: Sie legen das Abrechnungsintervall fest und erteilen die
                      vertraglich erforderlichen Einwilligungen. Die fachliche Freigabe Ihrer Praxis erfolgt separat.
                    </p>
                  </header>

                  <div className="mb-8 rounded-xl border border-slate-200/90 bg-slate-50/60 px-4 py-4 text-left md:mb-10 md:px-5 md:py-4">
                    {props.skipPaymentAtSignup ? (
                      <>
                        <p className="text-[12px] font-medium text-slate-800">Hinweis zu dieser Umgebung</p>
                        <ul className="mt-2.5 list-none space-y-2 text-[12px] leading-relaxed text-slate-600">
                          <li>Über dieses Formular wird kein Betrag eingezogen.</li>
                          <li>
                            Leistungsumfang und eine spätere Zahlungsaktivierung ergeben sich aus den verlinkten
                            Dokumenten und dem Onboarding.
                          </li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="text-[12px] font-medium text-slate-800">Hinweis zu Zahlung und Testphase</p>
                        <ul className="mt-2.5 list-none space-y-2 text-[12px] leading-relaxed text-slate-600">
                          <li>
                            Wenn Sie eine Online-Zahlung wählen, folgt im nächsten Schritt ein sicherer
                            Zahlungsdialog — in der Regel mit begrenzter Testphase; Einzelheiten im Vertrag und dort.
                          </li>
                          <li>Die gewählte Zahlungsweise können Sie später im Rahmen des Vertrags anpassen.</li>
                        </ul>
                      </>
                    )}
                  </div>

                  <form
                    action={props.signUpAction}
                    className="block min-w-0 space-y-8 md:space-y-10"
                    onSubmit={(e) => {
                      const sub = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null | undefined;
                      registerStep4SubmitIntentRef.current =
                        sub?.name === "register_submit" && sub.value ? sub.value : "standard";
                    }}
                  >
                    <RegisterStep4LockableFieldset>
                      <section aria-labelledby="reg-step4-tarif-heading" className="min-w-0">
                        <h4
                          id="reg-step4-tarif-heading"
                          className="mb-4 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                        >
                          Abrechnungsintervall
                        </h4>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                          {(Object.keys(plans) as Plan[]).map((key) => {
                            const p = plans[key];
                            const active = selectedPlan === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setSelectedPlan(key)}
                                className={`max-md:min-h-[52px] rounded-xl border px-4 py-3.5 text-left transition-colors duration-150 md:py-4 ${
                                  active
                                    ? "border-slate-500 bg-white ring-1 ring-slate-300/60"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                                }`}
                              >
                                <div className="mb-2 flex items-start justify-between gap-2">
                                  <p className="text-[14px] font-medium text-slate-900">{p.label}</p>
                                  {p.save ? (
                                    <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                      −{p.save}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mb-3 text-[11px] leading-snug text-slate-500">{p.billing}</p>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-[1.35rem] font-semibold tabular-nums tracking-tight text-slate-800 md:text-[1.5rem]">
                                    €{p.price}
                                  </span>
                                  <span className="text-[12px] text-slate-500">pro Monat</span>
                                </div>
                                {key !== "monthly" ? (
                                  <p className="mt-2 text-[11px] text-slate-500">Gesamt je Periode: €{p.total}</p>
                                ) : (
                                  <p className="mt-2 text-[11px] text-slate-500">&nbsp;</p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </section>

                      <section
                        aria-labelledby="reg-step4-summary-heading"
                        className="rounded-xl border border-slate-200/90 bg-white px-4 py-5 md:px-6 md:py-6"
                      >
                        <h4
                          id="reg-step4-summary-heading"
                          className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                        >
                          Zusammenfassung
                        </h4>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="text-[14px] font-medium text-slate-900">Plattformnutzung</p>
                            <p className="text-[12px] leading-relaxed text-slate-600">
                              Abrechnungsrhythmus:{" "}
                              <span className="font-medium text-slate-800">{plans[selectedPlan].billing}</span>
                            </p>
                            <p className="text-[12px] leading-relaxed text-slate-600">
                              Aktivierung des Zugangs:{" "}
                              <span className="font-medium text-slate-800">nach fachlicher Prüfung Ihrer Praxis</span>
                            </p>
                          </div>
                          <div className="shrink-0 border-t border-slate-100 pt-3 text-left sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0 sm:text-right">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                              Monatlicher Betrag
                            </p>
                            <p className="mt-1 text-xl font-semibold tabular-nums text-slate-800 md:text-2xl">
                              €{plans[selectedPlan].price}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">pro Monat</p>
                          </div>
                        </div>

                        <div className="my-6 h-px w-full bg-slate-100" />

                        <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                          Bevorzugte Zahlungsweise
                        </h4>
                        <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
                          Diese Auswahl dient der Vorbereitung Ihres Vertragskontos; technische Umsetzung erfolgt im
                          nächsten Schritt bzw. nach Freischaltung, je nach Konfiguration.
                        </p>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("sepa_debit")}
                            className={`min-h-[48px] rounded-lg border px-3.5 py-3 text-left transition-colors duration-150 md:min-h-0 md:px-4 ${
                              paymentMethod === "sepa_debit"
                                ? "border-slate-500 bg-slate-50 ring-1 ring-slate-200/80"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <p className="text-[13px] font-medium text-slate-900">SEPA‑Lastschrift</p>
                            <p className="mt-1 text-[11px] leading-snug text-slate-600">
                              {props.skipPaymentAtSignup
                                ? "Abbuchung erst nach vertraglicher Freischaltung und Einrichtung."
                                : "Wiederkehrend gemäß gewähltem Intervall."}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("card")}
                            className={`min-h-[48px] rounded-lg border px-3.5 py-3 text-left transition-colors duration-150 md:min-h-0 md:px-4 ${
                              paymentMethod === "card"
                                ? "border-slate-500 bg-slate-50 ring-1 ring-slate-200/80"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <p className="text-[13px] font-medium text-slate-900">Karte</p>
                            <p className="mt-1 text-[11px] leading-snug text-slate-600">
                              {props.skipPaymentAtSignup
                                ? "Kartendaten können nach Freischaltung ergänzt werden."
                                : "Sichere Erfassung im folgenden Schritt."}
                            </p>
                          </button>
                          <button
                            type="button"
                            disabled={selectedPlan === "monthly"}
                            onClick={() => setPaymentMethod("invoice")}
                            className={`min-h-[48px] rounded-lg border px-3.5 py-3 text-left transition-colors duration-150 md:min-h-0 md:px-4 ${
                              selectedPlan === "monthly"
                                ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                                : paymentMethod === "invoice"
                                  ? "border-slate-500 bg-slate-50 ring-1 ring-slate-200/80"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <p className="text-[13px] font-medium text-slate-900">Rechnung</p>
                            <p className="mt-1 text-[11px] leading-snug text-slate-600">
                              {selectedPlan === "monthly"
                                ? "Nur bei Halbjahres- oder Jahresintervall."
                                : props.skipPaymentAtSignup
                                  ? "Abstimmung nach Vereinbarung."
                                  : "Zahlung auf Rechnung (Praxen)."}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("paypal")}
                            className={`min-h-[48px] rounded-lg border px-3.5 py-3 text-left transition-colors duration-150 md:min-h-0 md:px-4 ${
                              paymentMethod === "paypal"
                                ? "border-slate-500 bg-slate-50 ring-1 ring-slate-200/80"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <p className="text-[13px] font-medium text-slate-900">PayPal</p>
                            <p className="mt-1 text-[11px] leading-snug text-slate-600">
                              {props.skipPaymentAtSignup
                                ? "Optional nach Freischaltung."
                                : "Optional im folgenden Schritt."}
                            </p>
                          </button>
                        </div>
                        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
                          Unterstützte Verfahren umfassen unter anderem SEPA‑Lastschrift, Kartenzahlung und PayPal —
                          je nach Tarif und Freigabestatus.
                        </p>
                      </section>

                      <section
                        aria-labelledby="reg-step4-legal-heading"
                        className="rounded-xl border border-slate-200/90 bg-slate-50/40 px-4 py-5 md:px-6 md:py-6"
                      >
                        <h4
                          id="reg-step4-legal-heading"
                          className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                        >
                          Vertrag und Einwilligungen
                        </h4>
                        <div className="space-y-3 md:space-y-3.5">
                          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent bg-white/70 px-3 py-3 text-[13px] leading-snug text-slate-700 transition-colors hover:border-slate-200/90 md:py-2.5">
                            <input
                              type="checkbox"
                              checked={acceptedTos}
                              onChange={(e) => setAcceptedTos(e.target.checked)}
                              className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-slate-600 focus:ring-slate-400/30 md:mt-1 md:h-4 md:w-4"
                            />
                            <span>
                              Ich akzeptiere die{" "}
                              <Link
                                href="/agb"
                                className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                              >
                                AGB
                              </Link>
                              . *
                            </span>
                          </label>
                          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent bg-white/70 px-3 py-3 text-[13px] leading-snug text-slate-700 transition-colors hover:border-slate-200/90 md:py-2.5">
                            <input
                              type="checkbox"
                              checked={acceptedPrivacy}
                              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                              className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-slate-600 focus:ring-slate-400/30 md:mt-1 md:h-4 md:w-4"
                            />
                            <span>
                              Ich habe die{" "}
                              <Link
                                href="/datenschutz"
                                className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                              >
                                Datenschutzerklärung
                              </Link>{" "}
                              zur Kenntnis genommen. *
                            </span>
                          </label>
                          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent bg-white/70 px-3 py-3 text-[13px] leading-snug text-slate-700 transition-colors hover:border-slate-200/90 md:py-2.5">
                            <input
                              type="checkbox"
                              checked={acceptedWithdrawal}
                              onChange={(e) => setAcceptedWithdrawal(e.target.checked)}
                              className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-slate-600 focus:ring-slate-400/30 md:mt-1 md:h-4 md:w-4"
                            />
                            <span>
                              Ich verlange ausdrücklich, dass Your Dentist vor Ablauf der Widerrufsfrist mit der
                              Leistung beginnt, und bestätige, dass ich dadurch mein Widerrufsrecht verlieren kann. *
                            </span>
                          </label>
                        </div>
                        <p className="mt-4 border-t border-slate-200/80 pt-4 text-[11px] leading-relaxed text-slate-500">
                          * Pflichtangaben.{" "}
                          <Link
                            href="/widerruf"
                            className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
                          >
                            Widerrufsbelehrung
                          </Link>
                          . Vertragsdokumentation: <span className="font-medium text-slate-700">Version v1</span>
                        </p>
                      </section>
                    </RegisterStep4LockableFieldset>
                    <RegisterStep4PendingIntentSync intentRef={registerStep4SubmitIntentRef} />

                    <div className="mt-6 space-y-3">
                    <input type="hidden" name="email" value={normalizeEmail(regEmail)} />
                    <input type="hidden" name="password" value={regPassword} />
                    <input type="hidden" name="display_name" value={regName} />
                    <input type="hidden" name="workspace_name" value={regPractice} />
                    <input type="hidden" name="billing_interval" value={selectedPlan} />
                    <input type="hidden" name="contract_version" value="v1" />
                    <input type="hidden" name="accepted_at" value={new Date().toISOString()} />
                    <input type="hidden" name="accepted_tos" value={acceptedTos ? "1" : "0"} />
                    <input type="hidden" name="accepted_privacy" value={acceptedPrivacy ? "1" : "0"} />
                    <input type="hidden" name="accepted_withdrawal" value={acceptedWithdrawal ? "1" : "0"} />
                    <input type="hidden" name="payment_method" value={paymentMethod} />
                    <input type="hidden" name="dentist_license_number" value={regLicense} />
                    <input type="hidden" name="dentist_license_storage_path" value={licenseStoragePath} />
                    <input
                      type="hidden"
                      name="dentist_license_storage_path_front"
                      value={licenseFrontStoragePath || licenseStoragePath}
                    />
                    <input
                      type="hidden"
                      name="dentist_license_storage_path_back"
                      value={licenseBackStoragePath}
                    />
                    {props.inviteToken ? (
                      <input type="hidden" name="invite_token" value={props.inviteToken} />
                    ) : null}

                    {props.skipPaymentAtSignup ? (
                      <p className="text-center text-[12px] leading-relaxed text-slate-600">
                        Ihr gewähltes Intervall wird mit dem Praxis-Konto verknüpft. In dieser Konfiguration erfolgt
                        kein Zahlungsdialog über diese Seite.
                      </p>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
                      <RegisterFormBackButton
                        onBack={() => goToStep(3)}
                        className="h-[52px] min-h-[48px] flex-1 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-800 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[52px]"
                      >
                        Zurück
                      </RegisterFormBackButton>
                      <RegisterFormSubmitButton
                        name="register_submit"
                        value="standard"
                        submitIntentRef={registerStep4SubmitIntentRef}
                        submitIntentValue="standard"
                        label={
                          props.skipPaymentAtSignup
                            ? "Registrierung abschließen"
                            : "Weiter zur vertraglichen Freischaltung"
                        }
                        pendingLabel="Wird übermittelt…"
                        disabled={
                          !acceptedTos ||
                          !acceptedPrivacy ||
                          !acceptedWithdrawal ||
                          !registrationDocsSatisfied
                        }
                        className="h-[52px] min-h-[48px] flex-1 sm:h-[52px]"
                      />
                    </div>
                    </div>

                  {props.registrationDemoUi &&
                  props.registrationDemoServer &&
                  !props.skipPaymentAtSignup ? (
                    <div
                      className="mt-4 rounded-xl border border-dashed border-amber-300/80 bg-amber-50/70 p-4"
                      role="region"
                      aria-label="Demo-Registrierung ohne Zahlung"
                    >
                      <p className="mb-3 text-[12px] leading-relaxed text-amber-950">
                        Nur für Demonstrations- oder Testumgebungen: Registrierung ohne Online-Zahlungsdialog
                        abschließen (serverseitig freigegeben).
                      </p>
                      <RegisterFormSubmitButton
                        name="register_submit"
                        value="demo"
                        submitIntentRef={registerStep4SubmitIntentRef}
                        submitIntentValue="demo"
                        label="Test: ohne Zahlungsdialog abschließen"
                        pendingLabel="Wird übermittelt…"
                        disabled={
                          !acceptedTos ||
                          !acceptedPrivacy ||
                          !acceptedWithdrawal ||
                          !registrationDocsSatisfied
                        }
                        className="h-[50px] w-full min-h-[48px] rounded-lg border border-amber-400/70 bg-white text-[13px] font-medium text-amber-950 transition-colors duration-150 hover:bg-amber-50/90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: "#fffbeb" }}
                        pendingStyle={{ backgroundColor: "#fef3c7" }}
                      />
                    </div>
                  ) : null}

                  </form>

                  <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
                    Auswahl: <span className="font-medium text-slate-700">{plans[selectedPlan].label}</span>
                    {" · "}
                    {plans[selectedPlan].billing}
                  </p>
                </div>
              ) : null}
                </>
              ) : null}

            {navBusy ? (
              <div className="yd-auth-loading-overlay" aria-live="polite" aria-busy="true">
                <YourDentistBrandLockup size="md" centered markOnly />
                <div className="yd-auth-loading-pulse" aria-hidden />
                <span className="yd-auth-loading-label">Bitte kurz warten …</span>
              </div>
            ) : null}
            </div>
          </div>
        </div>
      </div>
  );

  if (!portalReady) {
    return null;
  }

  return createPortal(registerOverlay, document.body);
}

