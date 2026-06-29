"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";

import { RegisterFormBackButton } from "@/components/auth/register-form-back-button";
import { RegisterFormSubmitButton } from "@/components/auth/register-form-submit-button";
import { RegisterStep4Checkbox } from "@/components/auth/register-step4-checkbox";
import {
  isRegisterStep4PaymentSetupValid,
  RegisterStep4PaymentSetup,
  type RegisterStep4PaymentFields,
  type RegisterStep4PaymentMethod,
} from "@/components/auth/register-step4-payment-setup";
import { RegisterStep4TrustStatus } from "@/components/auth/register-step4-trust-status";
import { RegisterLicenseSideCard } from "@/components/auth/register-license-side-card";
import {
  userFacingRegisterProofFileError,
  userFacingRegisterProofUploadError,
} from "@/lib/auth/register-practice-proof-errors";
import { RegisterPasswordGuidance } from "@/components/auth/register-password-guidance";
import { RegisterSuccessWaiting } from "@/components/auth/register-success-waiting";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";
import { REGISTER_CONTACT_ROLES } from "@/lib/auth/register-contact-roles";
import {
  allPasswordRequirementsMet,
  emailLooksCompleteForTypoHint,
  isRegisterEmailFormatValid,
  normalizeRegisterEmail,
  suggestRegisterEmailFix,
} from "@/lib/auth/register-validation";
import {
  REGISTER_PLANS,
  coerceRegisterPlan,
  type RegisterPlanId,
} from "@/lib/auth/register-plans";
import { clearReturnToPricingFlag } from "@/lib/login-pricing-return";
import { cn } from "@/lib/utils";

type Plan = RegisterPlanId;
type RegistrationStep = 1 | 2 | 3 | 4;

const REGISTER_WIZARD_MAX_STEP_KEY = "yd-reg-max-wizard-step";

const REGISTER_STEP_LABELS = [
  "Ansprechperson & Zugang",
  "Praxis",
  "Verifizierung",
  "Praxiszugang",
] as const;

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
  /** Schließen auf Schritt 1 (z. B. Startseite). */
  exitHref: string;
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
  /** Inline page card on /register; overlay reserved for modal contexts. */
  presentation?: "page" | "overlay";
}) {
  const presentation = props.presentation ?? "page";
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginBackHref = props.loginHref;
  const exitHref = props.exitHref;
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
    router.replace(exitHref);
  };
  const plan = coerceRegisterPlan(props.initialPlan);
  const [registrationStep, setRegistrationStep] = React.useState<RegistrationStep>(
    () => props.initialWizardStep ?? 1
  );
  const [regName, setRegName] = React.useState("");
  const [regRole, setRegRole] = React.useState("");
  const [regPractice, setRegPractice] = React.useState("");
  const [regPhone, setRegPhone] = React.useState("");
  const [regWebsite, setRegWebsite] = React.useState("");
  const [regEmail, setRegEmail] = React.useState(props.prefilledEmail ?? "");
  const [navBusy, setNavBusy] = React.useState(false);
  const registerStep4SubmitIntentRef = React.useRef<string | null>(null);
  const [regPassword, setRegPassword] = React.useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = React.useState("");
  const [passwordPairError, setPasswordPairError] = React.useState("");

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
  const [frontSideError, setFrontSideError] = React.useState("");
  const [backSideError, setBackSideError] = React.useState("");

  const [frontQualityOk, setFrontQualityOk] = React.useState<boolean | null>(null);
  const [backQualityOk, setBackQualityOk] = React.useState<boolean | null>(null);
  const [frontQualityHint, setFrontQualityHint] = React.useState<string>("");
  const [backQualityHint, setBackQualityHint] = React.useState<string>("");

  const [acceptedLegal, setAcceptedLegal] = React.useState(false);
  const [acceptedWithdrawal, setAcceptedWithdrawal] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<RegisterStep4PaymentMethod>("sepa_debit");
  const [paymentFields, setPaymentFields] = React.useState<RegisterStep4PaymentFields>({
    sepaAccountHolder: "",
    sepaIban: "",
    invoiceName: "",
    invoiceAddress: "",
    invoicePostalCity: "",
    invoiceVatId: "",
  });

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
    appliedSuggested: string;
  } | null>(null);
  const [emailBlurred, setEmailBlurred] = React.useState(false);
  const [emailSubmitAttempted, setEmailSubmitAttempted] = React.useState(false);
  const [step2SubmitAttempted, setStep2SubmitAttempted] = React.useState(false);

  const [frontDocStatus, setFrontDocStatus] = React.useState<"idle" | "checking" | "success" | "warn">("idle");
  const [backDocStatus, setBackDocStatus] = React.useState<"idle" | "checking" | "success" | "warn">("idle");

  const passwordsMatch = React.useMemo(
    () => regPassword.length > 0 && regPassword === regPasswordConfirm,
    [regPassword, regPasswordConfirm]
  );

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

  const registrationDocsSatisfied = Boolean(
    licenseFrontStoragePath || licenseBackStoragePath || licenseStoragePath
  );

  const paymentSetupValid = isRegisterStep4PaymentSetupValid(
    paymentMethod,
    selectedPlan,
    paymentFields
  );

  const step4CanSubmit =
    acceptedLegal && acceptedWithdrawal && registrationDocsSatisfied && paymentSetupValid;

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
      const suggestion = suggestRegisterEmailFix(email);
      setEmailTypoSuggestion(suggestion);
    }, 400);

    return () => window.clearTimeout(t);
  }, [regEmail, registrationStep]);

  React.useEffect(() => {
    if (!emailTypoUndo) return;
    const t = window.setTimeout(() => setEmailTypoUndo(null), 8000);
    return () => window.clearTimeout(t);
  }, [emailTypoUndo]);

  const showEmailValidationHints = emailBlurred || emailSubmitAttempted;

  React.useEffect(() => {
    if (registrationStep !== 1) return;
    const email = normalizeRegisterEmail(regEmail);
    if (!email) {
      setEmailCheckStatus("idle");
      setEmailCheckMessage("");
      return;
    }
    if (!isRegisterEmailFormatValid(email)) {
      if (!showEmailValidationHints) {
        setEmailCheckStatus("idle");
        setEmailCheckMessage("");
        return;
      }
      setEmailCheckStatus("invalid");
      setEmailCheckMessage("Bitte prüfen Sie die E-Mail-Adresse.");
      return;
    }

    setEmailCheckStatus("checking");
    setEmailCheckMessage("");

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
        setEmailCheckMessage("");
      } catch {
        setEmailCheckStatus("error");
        setEmailCheckMessage("");
      }
    }, 450);

    return () => window.clearTimeout(t);
  }, [regEmail, registrationStep, showEmailValidationHints]);

  React.useEffect(() => {
    try {
      sessionStorage.setItem("yd-registration-plan", selectedPlan);
    } catch {
      /* ignore */
    }
  }, [selectedPlan]);

  React.useEffect(() => {
    if (selectedPlan === "monthly" && paymentMethod === "invoice") {
      setPaymentMethod("sepa_debit");
    }
  }, [selectedPlan, paymentMethod]);

  React.useEffect(() => {
    if (!regPractice.trim()) return;
    setPaymentFields((prev) =>
      prev.invoiceName.trim() ? prev : { ...prev, invoiceName: regPractice.trim() }
    );
  }, [regPractice]);

  const onPaymentFieldChange = (field: keyof RegisterStep4PaymentFields, value: string) => {
    setPaymentFields((prev) => ({ ...prev, [field]: value }));
  };

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

  const applyDocQualityResult = (side: "front" | "back", ok: boolean, hint: string) => {
    if (side === "front") {
      setFrontQualityOk(ok);
      setFrontQualityHint(hint);
      setFrontDocStatus(ok ? "success" : "warn");
    } else {
      setBackQualityOk(ok);
      setBackQualityHint(hint);
      setBackDocStatus(ok ? "success" : "warn");
    }
  };

  const runSideDocCheck = async (file: File, side: "front" | "back") => {
    if (side === "front") setFrontDocStatus("checking");
    else setBackDocStatus("checking");
    const result = await analyzeImageQuality(file);
    applyDocQualityResult(side, result.ok, result.hint);
  };

  const ingestLicenseFile = (file: File, side: "front" | "back") => {
    const fileError = userFacingRegisterProofFileError(file);
    if (fileError) {
      if (side === "front") {
        setFrontSideError(fileError);
        setLicenseFrontFile(null);
        setFrontPreview(null);
        setFrontDocStatus("idle");
        setFrontQualityHint("");
      } else {
        setBackSideError(fileError);
        setLicenseBackFile(null);
        setBackPreview(null);
        setBackDocStatus("idle");
        setBackQualityHint("");
      }
      return;
    }

    if (side === "front") {
      setFrontSideError("");
      setLicenseFrontFile(file);
      setLicenseFrontStoragePath("");
    } else {
      setBackSideError("");
      setLicenseBackFile(file);
      setLicenseBackStoragePath("");
    }

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
      applyDocQualityResult(side, true, "PDF wird bei der Bearbeitung gesondert betrachtet.");
      return;
    }

    void runSideDocCheck(file, side);
  };

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) ingestLicenseFile(e.target.files[0], "front");
    e.target.value = "";
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) ingestLicenseFile(e.target.files[0], "back");
    e.target.value = "";
  };

  const handleFrontCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) ingestLicenseFile(e.target.files[0], "front");
    e.target.value = "";
  };

  const handleBackCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) ingestLicenseFile(e.target.files[0], "back");
    e.target.value = "";
  };

  const analyzeImageQuality = async (file: File): Promise<{ ok: boolean; hint: string }> => {
    if (!file.type.startsWith("image/")) {
      return { ok: true, hint: "PDF wird bei der Bearbeitung gesondert betrachtet." };
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
        hint: "Das Bild scheint unscharf zu sein. Bitte erneut aufnehmen.",
      };
    }

    return { ok: true, hint: "Dokument gut lesbar" };
  };

  const onStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    setEmailSubmitAttempted(true);
    setPasswordPairError("");
    const email = normalizeRegisterEmail(regEmail);
    if (!regName.trim()) return;
    if (!regRole) return;
    if (!email || !isRegisterEmailFormatValid(email)) return;
    if (!allPasswordRequirementsMet(regPassword)) {
      setPasswordPairError("Bitte erfüllen Sie alle Passwort-Anforderungen.");
      return;
    }
    if (!passwordsMatch) {
      setPasswordPairError("Die Passwörter stimmen noch nicht überein.");
      return;
    }
    if (emailCheckStatus === "checking") return;
    goToStep(2);
  };

  const onStep2Submit = (e: FormEvent) => {
    e.preventDefault();
    setStep2SubmitAttempted(true);
    if (!regPractice.trim()) return;
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
          : "";
      throw new Error(userFacingRegisterProofUploadError(msg));
    }
    return json.storagePath;
  };

  const onStep3Submit = async (e: FormEvent) => {
    e.preventDefault();
    setLicenseUploading(true);
    setLicenseUploadError("");
    try {
      if (!licenseFrontFile && !licenseBackFile) {
        setLicenseUploadError(
          "Bitte laden Sie Vorder- oder Rückseite Ihres Zahnarztausweises oder Ihrer Approbationsurkunde hoch."
        );
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
          "Hinweis: Die Aufnahme ist für die Bearbeitung grenzwertig. Sie können fortfahren — wir melden uns bei Bedarf."
        );
      }
      goToStep(4);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Upload fehlgeschlagen.";
      console.error("[RegisterClient] license upload", raw);
      setLicenseUploadError(userFacingRegisterProofUploadError(raw));
    } finally {
      setLicenseUploading(false);
    }
  };

  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    if (presentation !== "overlay") return;
    setPortalTarget(document.body);
  }, [presentation]);

  React.useEffect(() => {
    if (presentation !== "overlay" || !props.wizardOpen) return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [presentation, props.wizardOpen]);

  if (!props.wizardOpen) {
    return null;
  }

  const registerPanel = (
          <div
            className={cn(
              "yd-auth-register-panel",
              presentation === "page" && "yd-auth-register-panel--page"
            )}
          >
          {presentation === "page" ? (
            <div className="yd-auth-register-page-top">
              <button
                type="button"
                onClick={handleRegistrationModalClose}
                className="yd-auth-register-page-back"
              >
                {registrationStep > 1 && !props.success ? "Zurück" : "Schließen"}
              </button>
              {!props.success ? (
                <span
                  className="yd-auth-register-page-meta"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={4}
                  aria-valuenow={registrationStep}
                  aria-valuetext={REGISTER_STEP_LABELS[registrationStep - 1]}
                >
                  {registrationStep}/4
                </span>
              ) : null}
            </div>
          ) : (
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
          )}

          {presentation === "page" && !props.success ? (
            <h1 className="yd-auth-register-page-title">Registrierung</h1>
          ) : null}

            <div className="yd-auth-register-header">
              <div className="mb-5 flex justify-center pb-1 md:mb-6">
                <YourDentistBrandLockup size="md" centered tagline={PUBLIC_BRAND_TAGLINE} />
              </div>
            </div>

            <div className="yd-auth-register-body">
              {props.success ? (
                <RegisterSuccessWaiting
                  queryError={props.queryError}
                  resent={props.resent}
                  inviteToken={props.inviteToken}
                  loginHref={loginBackHref}
                  prefilledEmail={props.prefilledEmail}
                  resendConfirmationAction={props.resendConfirmationAction}
                />
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

              {presentation !== "page" ? (
              <div
                className="yd-reg-wizard"
                aria-label={`Schritt ${registrationStep} von 4`}
              >
                  <div className="yd-reg-wizard__head">
                    <span className="yd-reg-wizard__eyebrow">Registrierung</span>
                    <span className="yd-reg-wizard__meta">
                      {Math.round(((registrationStep - 1) / 3) * 100)} % abgeschlossen
                    </span>
                  </div>
                <div
                  className="yd-reg-wizard__track"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={4}
                  aria-valuenow={registrationStep}
                  aria-valuetext={REGISTER_STEP_LABELS[registrationStep - 1]}
                >
                  <div
                    className="yd-reg-wizard__fill"
                    style={{ width: `${((registrationStep - 1) / 3) * 100}%` }}
                  />
                </div>
                  <p className="yd-reg-wizard__label">{REGISTER_STEP_LABELS[registrationStep - 1]}</p>
              </div>
              ) : null}

              {registrationStep === 1 ? (
                <div className="yd-auth-awaken-field">
                  {presentation !== "page" ? (
                    <div className="yd-auth-register-step-intro">
                      <h3 className="yd-auth-register-title">
                        Geschützten Praxiszugang einrichten
                      </h3>
                      <p className="yd-auth-register-subtitle">
                        {props.inviteToken ? (
                          <>
                            Team-Einladung: Bitte dieselbe E-Mail-Adresse wie in der Einladung verwenden. Die
                            Freischaltung erfolgt nach fachlicher Prüfung.
                          </>
                        ) : (
                          <>
                            Erstellen Sie den Zugang für Ihre Praxis. Die Freischaltung erfolgt nach fachlicher
                            Prüfung.
                          </>
                        )}
                      </p>
                    </div>
                  ) : null}

                  <form
                    onSubmit={onStep1Submit}
                    className="yd-auth-form-stack"
                    aria-busy={emailCheckStatus === "checking"}
                  >
                    <div className="yd-auth-field">
                      <label htmlFor="reg-name">
                        Name Ansprechpartner/in *
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        autoComplete="name"
                        className="yd-auth-input scroll-mt-8"
                        required
                      />
                    </div>

                    <div className="yd-auth-field">
                      <label htmlFor="reg-role">
                        Rolle in der Praxis *
                      </label>
                      <select
                        id="reg-role"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="yd-auth-input scroll-mt-8"
                        required
                      >
                        <option value="">Bitte wählen</option>
                        {REGISTER_CONTACT_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="yd-auth-field">
                      <label htmlFor="reg-email">
                        E-Mail *
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        onBlur={() => setEmailBlurred(true)}
                        autoComplete="email"
                        inputMode="email"
                        aria-invalid={showEmailValidationHints && emailCheckStatus === "invalid"}
                        className={`yd-auth-input scroll-mt-8 ${
                          emailCheckStatus === "ready" && isRegisterEmailFormatValid(regEmail)
                            ? "border-green-300/80"
                            : ""
                        }`}
                        required
                      />
                      {emailCheckStatus === "ready" && isRegisterEmailFormatValid(regEmail) ? (
                        <p className="mt-2 text-[12px] text-green-700" role="status">
                          ✓ E-Mail gültig
                        </p>
                      ) : null}
                      {showEmailValidationHints && emailCheckStatus === "invalid" ? (
                        <p className="mt-2 text-[12px] text-amber-800" role="alert">
                          {emailCheckMessage}
                        </p>
                      ) : null}
                      {showEmailValidationHints && emailCheckStatus === "checking" ? (
                        <p className="mt-2 text-[12px] text-slate-500" aria-live="polite">
                          Prüfe Eingabe…
                        </p>
                      ) : null}

                      {emailTypoSuggestion ? (
                        <p className="mt-2.5 text-[12px] leading-relaxed text-gray-600">
                          Meinten Sie{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setEmailTypoUndo({
                                prevEmail: regEmail,
                                appliedSuggested: emailTypoSuggestion.suggested,
                              });
                              setRegEmail(emailTypoSuggestion.suggested);
                              setEmailTypoSuggestion(null);
                            }}
                            className="font-medium yd-auth-link underline decoration-[#0284C7]/30 underline-offset-2 hover:decoration-[#0284C7]"
                          >
                            {emailTypoSuggestion.suggested}
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
                              setEmailTypoUndo(null);
                            }}
                            className="text-[12px] font-semibold yd-auth-link hover:underline"
                          >
                            Rückgängig
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="yd-auth-field">
                      <label htmlFor="reg-password">
                        Passwort *
                      </label>
                      <input
                        id="reg-password"
                        type="password"
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          setPasswordPairError("");
                        }}
                        autoComplete="new-password"
                        minLength={8}
                        className="yd-auth-input scroll-mt-8"
                        required
                      />

                      <RegisterPasswordGuidance password={regPassword} />
                    </div>

                    <div className="yd-auth-field">
                      <label htmlFor="reg-password-confirm">
                        Passwort bestätigen *
                      </label>
                      <input
                        id="reg-password-confirm"
                        type="password"
                        value={regPasswordConfirm}
                        onChange={(e) => {
                          setRegPasswordConfirm(e.target.value);
                          setPasswordPairError("");
                        }}
                        autoComplete="new-password"
                        minLength={8}
                        className="yd-auth-input scroll-mt-8"
                        required
                      />
                      {passwordPairError ? (
                        <p className="mt-2 text-[12px] text-amber-800" role="alert">
                          {passwordPairError}
                        </p>
                      ) : regPasswordConfirm.length > 0 && !passwordsMatch ? (
                        <p className="mt-2 text-[12px] text-amber-800" role="alert">
                          Die Passwörter stimmen noch nicht überein.
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        (showEmailValidationHints && emailCheckStatus === "invalid") ||
                        emailCheckStatus === "checking" ||
                        !regName.trim() ||
                        !regRole ||
                        !normalizeRegisterEmail(regEmail) ||
                        !allPasswordRequirementsMet(regPassword) ||
                        !passwordsMatch
                      }
                      className="yd-auth-btn-primary w-full"
                    >
                      Weiter
                    </button>
                  </form>

                  {!props.inviteToken ? (
                    <p className="yd-auth-register-footer">
                      Bereits registriert?{" "}
                      <Link href={loginBackHref} className="yd-auth-link">
                        Anmelden
                      </Link>
                    </p>
                  ) : null}
                </div>
              ) : null}

              {registrationStep === 2 ? (
                <div className="yd-auth-awaken-field">
                  {presentation !== "page" ? (
                    <div className="yd-auth-register-step-intro">
                      <h3 className="yd-auth-register-title">
                        Praxisinformationen
                      </h3>
                      <p className="yd-auth-register-subtitle">
                        Angaben zur Praxis, für die der Zugang eingerichtet wird.
                      </p>
                    </div>
                  ) : null}

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
                        autoComplete="organization"
                        className="yd-auth-input h-[52px] scroll-mt-8"
                        required
                      />
                      {step2SubmitAttempted && !regPractice.trim() ? (
                        <p className="mt-2 text-[12px] text-amber-800" role="alert">
                          Bitte geben Sie den Praxisnamen an.
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="reg-phone" className="mb-2 block text-[13px] font-medium text-gray-700">
                        Telefonnummer
                      </label>
                      {presentation !== "page" ? (
                        <p className="mb-2 text-[12px] leading-relaxed text-slate-500">
                          Telefonnummer für Rückfragen zur Freischaltung.
                        </p>
                      ) : null}
                      <input
                        id="reg-phone"
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        autoComplete="tel"
                        maxLength={30}
                        className="yd-auth-input h-[52px] scroll-mt-8 text-[16px]"
                      />
                    </div>

                    <div>
                      <label htmlFor="reg-website" className="mb-2 block text-[13px] font-medium text-gray-700">
                        Website <span className="font-normal text-gray-500">(optional)</span>
                      </label>
                      <input
                        id="reg-website"
                        type="url"
                        inputMode="url"
                        value={regWebsite}
                        onChange={(e) => setRegWebsite(e.target.value)}
                        autoComplete="url"
                        maxLength={100}
                        placeholder="https://ihre-praxis.de"
                        className="yd-auth-input h-[52px] scroll-mt-8 text-[16px]"
                      />
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
                  {presentation !== "page" ? (
                    <div className="yd-auth-register-step-intro">
                      <h3 className="yd-auth-register-title">
                        Berufliche Verifizierung
                      </h3>
                      <p className="yd-auth-register-subtitle">
                        Laden Sie Ihren Zahnarztausweis oder Ihre Approbationsurkunde hoch. Wir prüfen Ihre
                        Angaben vor der Freischaltung Ihres Praxiszugangs.
                      </p>
                    </div>
                  ) : null}

                  <form onSubmit={onStep3Submit} className="min-w-0 space-y-5" aria-busy={licenseUploading}>

                    <div className="min-w-0">
                      {!licenseFrontFile && !licenseBackFile ? (
                        <div className="mb-4 rounded-xl border border-slate-200/90 bg-slate-50/50 px-4 py-3.5 text-left">
                          <p className="text-[12px] font-medium text-slate-800">Gute Aufnahme:</p>
                          <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-slate-600">
                            <li className="flex gap-2">
                              <span className="text-green-700" aria-hidden>
                                ✓
                              </span>
                              vollständig sichtbar
                            </li>
                            <li className="flex gap-2">
                              <span className="text-green-700" aria-hidden>
                                ✓
                              </span>
                              gute Beleuchtung
                            </li>
                            <li className="flex gap-2">
                              <span className="text-green-700" aria-hidden>
                                ✓
                              </span>
                              Text lesbar
                            </li>
                          </ul>
                        </div>
                      ) : null}
                      <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                        <RegisterLicenseSideCard
                          title="Vorderseite"
                          sideId="license-front"
                          file={licenseFrontFile}
                          preview={frontPreview}
                          docStatus={frontDocStatus}
                          qualityHint={frontQualityHint}
                          sideError={frontSideError || null}
                          dragActive={dragActive}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onFilePick={handleFrontFileChange}
                          onCameraPick={handleFrontCameraChange}
                          onClear={() => {
                            setLicenseFrontFile(null);
                            setFrontPreview(null);
                            setFrontQualityOk(null);
                            setFrontQualityHint("");
                            setFrontDocStatus("idle");
                            setLicenseFrontStoragePath("");
                            setFrontSideError("");
                          }}
                        />
                        <RegisterLicenseSideCard
                          title="Rückseite"
                          sideId="license-back"
                          file={licenseBackFile}
                          preview={backPreview}
                          docStatus={backDocStatus}
                          qualityHint={backQualityHint}
                          sideError={backSideError || null}
                          dragActive={dragActive}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          onFilePick={handleBackFileChange}
                          onCameraPick={handleBackCameraChange}
                          onClear={() => {
                            setLicenseBackFile(null);
                            setBackPreview(null);
                            setBackQualityOk(null);
                            setBackQualityHint("");
                            setBackDocStatus("idle");
                            setLicenseBackStoragePath("");
                            setBackSideError("");
                          }}
                        />
                      </div>
                      {licenseUploadError ? (
                        <p
                          className={`mt-3 break-words rounded-lg border px-3 py-2 text-[12px] leading-relaxed ${
                            licenseUploadError.startsWith("Hinweis:")
                              ? "border-amber-200 bg-amber-50 text-amber-900"
                              : "border-amber-200/80 bg-amber-50/60 text-amber-950"
                          }`}
                          role="alert"
                        >
                          {licenseUploadError}
                        </p>
                      ) : null}
                      <div className="mt-4 flex gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/40 px-4 py-3.5 text-left">
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.75}
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                          />
                        </svg>
                        <p className="text-[12px] leading-relaxed text-slate-600">
                          Ihre Angaben werden geschützt übertragen und ausschließlich zur Einrichtung Ihres
                          Praxiszugangs verwendet.
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
                  {presentation !== "page" ? (
                    <header className="mb-4 text-center md:mb-5">
                      <h3 className="text-[22px] font-semibold leading-snug tracking-tight text-slate-900 md:text-[23px]">
                        Praxiszugang vorbereiten
                      </h3>
                      <p className="mx-auto mt-2.5 max-w-md text-[13px] leading-relaxed text-slate-600">
                        Abrechnung vorbereiten. Aktivierung nach Prüfung Ihrer Praxis.
                      </p>
                    </header>
                  ) : null}

                  {presentation !== "page" ? <RegisterStep4TrustStatus /> : null}

                  <form
                    action={props.signUpAction}
                    className="block min-w-0 space-y-8"
                    onSubmit={(e) => {
                      const sub = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null | undefined;
                      registerStep4SubmitIntentRef.current =
                        sub?.name === "register_submit" && sub.value ? sub.value : "standard";
                    }}
                  >
                    <RegisterStep4LockableFieldset>
                      <div className="flex flex-col gap-8">
                        <section aria-labelledby="reg-step4-tarif-heading" className="min-w-0">
                          <h4
                            id="reg-step4-tarif-heading"
                            className="mb-4 text-left text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                          >
                            Abrechnungsintervall
                          </h4>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
                            {(Object.keys(plans) as Plan[]).map((key) => {
                              const p = plans[key];
                              const active = selectedPlan === key;
                              const recommended = key === "yearly";
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setSelectedPlan(key)}
                                  className={cn(
                                    "relative rounded-xl border px-5 py-4 text-left transition-colors duration-150",
                                    active ? "yd-reg-step4-plan--selected" : "yd-reg-step4-plan--idle"
                                  )}
                                >
                                  {active ? (
                                    <span
                                      className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#0284C7] text-white"
                                      aria-hidden
                                    >
                                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </span>
                                  ) : null}
                                  <div className="flex items-center gap-2 pr-7">
                                    <p className="text-[13px] font-medium text-slate-900">{p.label}</p>
                                    {recommended ? (
                                      <span className="text-[10px] font-medium text-slate-500">Empfohlen</span>
                                    ) : null}
                                  </div>
                                  <p className="mt-2 text-[1.15rem] font-semibold tabular-nums tracking-tight text-slate-800">
                                    {p.price} €
                                  </p>
                                  {active && key !== "monthly" ? (
                                    <p className="mt-1.5 text-[10px] leading-snug text-slate-500">
                                      {p.total} €
                                      {key === "halfyearly" ? " alle 6 Monate" : " jährlich"}
                                    </p>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        </section>

                        <div className="border-t border-slate-100 pt-4" aria-live="polite">
                          <p className="text-[13px] font-medium text-slate-900">Praxiszugang</p>
                          <p className="text-[12px] text-slate-600">{plans[selectedPlan].label}</p>
                          <p className="mt-1 text-[14px] font-semibold tabular-nums text-slate-900">
                            {plans[selectedPlan].price} €/Monat
                          </p>
                        </div>

                        <section
                          aria-labelledby="reg-step4-pay-heading"
                          className="border-t border-slate-100 pt-5"
                        >
                          <h4
                            id="reg-step4-pay-heading"
                            className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                          >
                            Zahlungsweise
                          </h4>
                          <RegisterStep4PaymentSetup
                            method={paymentMethod}
                            onMethodChange={setPaymentMethod}
                            selectedPlan={selectedPlan}
                            fields={paymentFields}
                            onFieldChange={onPaymentFieldChange}
                          />
                        </section>

                        <section aria-labelledby="reg-step4-agreements-heading" className="border-t border-slate-100 pt-6">
                          <h4
                            id="reg-step4-agreements-heading"
                            className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                          >
                            Vereinbarungen
                          </h4>
                          <div className="space-y-0.5">
                            <RegisterStep4Checkbox checked={acceptedLegal} onChange={setAcceptedLegal}>
                              <>
                                <Link
                                  href="/agb"
                                  className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                                >
                                  AGB
                                </Link>{" "}
                                und{" "}
                                <Link
                                  href="/datenschutz"
                                  className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                                >
                                  Datenschutz
                                </Link>{" "}
                                akzeptieren
                              </>
                            </RegisterStep4Checkbox>
                            <RegisterStep4Checkbox
                              checked={acceptedWithdrawal}
                              onChange={setAcceptedWithdrawal}
                              ariaLabel="Ich verlange ausdrücklich, dass Your Dentist vor Ablauf der Widerrufsfrist mit der Leistung beginnt, und bestätige, dass ich dadurch mein Widerrufsrecht verlieren kann."
                            >
                              <>
                                Aktivierung nach Freischaltung bestätigen
                                <span className="text-slate-500">
                                  {" "}
                                  (
                                  <Link
                                    href="/widerruf"
                                    className="underline decoration-slate-300 underline-offset-2 hover:text-slate-700"
                                  >
                                    Widerruf
                                  </Link>
                                  )
                                </span>
                              </>
                            </RegisterStep4Checkbox>
                          </div>
                        </section>
                      </div>
                    </RegisterStep4LockableFieldset>
                    <RegisterStep4PendingIntentSync intentRef={registerStep4SubmitIntentRef} />

                    <div className="mt-6 space-y-4">
                    <input type="hidden" name="email" value={normalizeRegisterEmail(regEmail)} />
                    <input type="hidden" name="password" value={regPassword} />
                    <input type="hidden" name="password_confirm" value={regPasswordConfirm} />
                    <input type="hidden" name="display_name" value={regName} />
                    <input type="hidden" name="contact_role" value={regRole} />
                    <input type="hidden" name="contact_phone" value={regPhone.trim()} />
                    <input type="hidden" name="practice_website" value={regWebsite.trim()} />
                    <input type="hidden" name="workspace_name" value={regPractice} />
                    <input type="hidden" name="billing_interval" value={selectedPlan} />
                    <input type="hidden" name="contract_version" value="v1" />
                    <input type="hidden" name="accepted_at" value={new Date().toISOString()} />
                    <input type="hidden" name="accepted_tos" value={acceptedLegal ? "1" : "0"} />
                    <input type="hidden" name="accepted_privacy" value={acceptedLegal ? "1" : "0"} />
                    <input type="hidden" name="accepted_withdrawal" value={acceptedWithdrawal ? "1" : "0"} />
                    <input type="hidden" name="payment_method" value={paymentMethod} />
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

                    {presentation === "page" ? (
                      <p className="yd-auth-register-approval-note" role="note">
                        Freischaltung nach fachlicher Prüfung Ihrer Angaben.
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
                        label="Registrierung absenden"
                        pendingLabel="Wird übermittelt…"
                        disabled={!step4CanSubmit}
                        className={cn(
                          "h-[52px] min-h-[48px] flex-1 sm:h-[52px]",
                          step4CanSubmit && "yd-reg-step4-submit"
                        )}
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
                        disabled={!step4CanSubmit}
                        className="h-[50px] w-full min-h-[48px] rounded-lg border border-amber-400/70 bg-white text-[13px] font-medium text-amber-950 transition-colors duration-150 hover:bg-amber-50/90 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ backgroundColor: "#fffbeb" }}
                        pendingStyle={{ backgroundColor: "#fef3c7" }}
                      />
                    </div>
                  ) : null}

                  </form>
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
  );

  if (presentation === "page") {
    return registerPanel;
  }

  const registerOverlay = (
    <div className="yd-auth-register-overlay">
      <div className="yd-auth-register-backdrop" aria-hidden />
      <div className="yd-auth-register-stage">{registerPanel}</div>
    </div>
  );

  if (!portalTarget) {
    return registerOverlay;
  }

  return createPortal(registerOverlay, portalTarget);
}

