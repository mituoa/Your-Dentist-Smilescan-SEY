"use client";

import * as React from "react";
import type { FormEvent } from "react";
import Link from "next/link";

import { RegisterFormSubmitButton } from "@/components/auth/register-form-submit-button";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";

type Plan = "monthly" | "halfyearly" | "yearly";
type RegistrationStep = 1 | 2 | 3 | 4;

type SignUpAction = (formData: FormData) => void | Promise<void>;
type ResendAction = (formData: FormData) => void | Promise<void>;

function coercePlan(value: string | null | undefined): Plan {
  if (!value) return "yearly";
  const v = value.toLowerCase();
  if (v === "monthly" || v === "halfyearly" || v === "yearly") return v;
  return "yearly";
}

export function RegisterClient(props: {
  signUpAction: SignUpAction;
  resendConfirmationAction: ResendAction;
  inviteToken: string;
  prefilledEmail: string;
  initialPlan?: string | null;
  queryError?: string;
  success?: boolean;
  loginHref?: string;
  /** Zeigt zweiten Submit „ohne Stripe“ (wirksam nur mit REGISTRATION_DEMO_MODE am Server). */
  registrationDemoUi?: boolean;
  /** Server: Registrierung ohne Stripe-Redirect (Standard bis ENABLE_STRIPE_CHECKOUT_AT_SIGNUP). */
  skipPaymentAtSignup?: boolean;
  /** Server (REGISTRATION_DEMO_MODE): Lizenz-Upload-Schritt optional überspringbar. */
  licenseStepOptional?: boolean;
}) {
  const loginBackHref = props.loginHref ?? "/login";
  const plan = coercePlan(props.initialPlan);
  const [registrationStep, setRegistrationStep] = React.useState<RegistrationStep>(1);

  const [regName, setRegName] = React.useState("");
  const [regPractice, setRegPractice] = React.useState("");
  const [regLicense, setRegLicense] = React.useState("");
  const [regEmail, setRegEmail] = React.useState(props.prefilledEmail ?? "");
  const [regEmailConfirm, setRegEmailConfirm] = React.useState("");
  const [regEmailConfirmDirty, setRegEmailConfirmDirty] = React.useState(false);
  const [emailPairError, setEmailPairError] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");

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
    "idle" | "checking" | "available" | "taken" | "invalid" | "error"
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

    if (strength <= 1) return { strength: 1, label: "Schwach", color: "#EF4444" };
    if (strength <= 3) return { strength: 2, label: "Mittel", color: "#F59E0B" };
    return { strength: 3, label: "Stark", color: "#10B981" };
  };

  const passwordStrength = regPassword ? getPasswordStrength(regPassword) : null;

  const normalizeEmail = (v: string) => v.trim().toLowerCase();
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(v));
  const emailMatches = normalizeEmail(regEmail) !== "" && normalizeEmail(regEmail) === normalizeEmail(regEmailConfirm);

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
      "hotnail.com": "hotmail.com",
      "hotmai.com": "hotmail.com",
      "icloud.con": "icloud.com",
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
      const suggestion = suggestEmailFix(email);
      setEmailTypoSuggestion(suggestion);
    }, 350);

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
    setEmailCheckMessage("Prüfe Verfügbarkeit…");

    const t = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const json = (await res.json()) as
          | { ok: true; available: boolean }
          | { ok: false; error: string };

        if (!res.ok || !("ok" in json) || json.ok !== true) {
          setEmailCheckStatus("error");
          setEmailCheckMessage("Konnte Verfügbarkeit gerade nicht prüfen.");
          return;
        }

        if (json.available) {
          setEmailCheckStatus("available");
          setEmailCheckMessage("E‑Mail ist verfügbar.");
        } else {
          setEmailCheckStatus("taken");
          setEmailCheckMessage("Diese E‑Mail ist bereits registriert.");
        }
      } catch {
        setEmailCheckStatus("error");
        setEmailCheckMessage("Konnte Verfügbarkeit gerade nicht prüfen.");
      }
    }, 450);

    return () => window.clearTimeout(t);
  }, [regEmail, registrationStep]);

  React.useEffect(() => {
    try {
      sessionStorage.setItem("smilescan-registration-plan", selectedPlan);
    } catch {
      /* ignore */
    }
  }, [selectedPlan]);

  const plans = {
    monthly: {
      price: 20,
      total: 20,
      label: "Monatlich",
      save: null as string | null,
      support: "E-Mail Support (24h)",
      billing: "Monatlich abgerechnet",
    },
    halfyearly: {
      price: 18,
      total: 108,
      label: "Halbjährlich",
      save: "10%",
      support: "Prioritäts-Support (4h)",
      billing: "Alle 6 Monate abgerechnet",
    },
    yearly: {
      price: 16,
      total: 192,
      label: "Jährlich",
      save: "20%",
      support: "VIP-Support (1h) + Onboarding",
      billing: "Jährlich abgerechnet",
    },
  };

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
      return { ok: true, hint: "PDF kann nicht automatisch geprüft werden." };
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
    if (w < 1200 || h < 800) {
      return { ok: false, hint: "Bild ist zu klein. Bitte näher ran und scharf fotografieren." };
    }

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

    if (mean < 60) return { ok: false, hint: "Bild ist sehr dunkel. Bitte bessere Beleuchtung nutzen." };
    if (mean > 210) return { ok: false, hint: "Bild ist sehr hell/überbelichtet. Bitte ohne Blitz testen." };

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
      return { ok: false, hint: "Bild wirkt unscharf. Bitte ruhiger halten und Fokus abwarten." };
    }

    return { ok: true, hint: "Lesbar." };
  };

  const onStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    const email = normalizeEmail(regEmail);
    const confirm = normalizeEmail(regEmailConfirm);
    setEmailPairError("");
    if (!email || !isValidEmail(email)) return;
    if (!confirm) {
      setEmailPairError("Bitte geben Sie Ihre E-Mail-Adresse zur Bestätigung erneut ein.");
      return;
    }
    if (!emailMatches) {
      setEmailPairError("Die E-Mail-Adressen stimmen nicht überein.");
      return;
    }
    if (emailCheckStatus === "taken" || emailCheckStatus === "checking") return;
    setRegistrationStep(2);
  };

  const onStep2Submit = (e: FormEvent) => {
    e.preventDefault();
    setRegistrationStep(3);
  };

  const uploadLicenseSide = async (side: "front" | "back", file: File): Promise<string> => {
    setLicenseUploading(true);
    setLicenseUploadError("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("side", side);
      const res = await fetch("/api/register-license-upload", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as { storagePath?: string; error?: string };
      if (!res.ok || !json.storagePath) {
        throw new Error(json.error || "Upload fehlgeschlagen.");
      }
      return json.storagePath;
    } finally {
      setLicenseUploading(false);
    }
  };

  const onStep3Submit = async (e: FormEvent) => {
    e.preventDefault();
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
          setRegistrationStep(4);
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
      setRegistrationStep(4);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Upload fehlgeschlagen.";
      console.error("[RegisterClient] license upload", raw);
      setLicenseUploadError(userFacingAuthError(raw));
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(2, 132, 199, 0); }
        }
        @keyframes checkmark {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-y-contain"
        style={{ animation: "fadeIn 0.2s ease-out" }}
      >
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-slate-900/60 backdrop-blur-md"
          style={{ animation: "fadeIn 0.25s ease-out" }}
          aria-hidden
        >
        </div>

        <div className="relative z-10 flex w-full max-w-full min-w-0 flex-col items-stretch px-4 pb-28 pt-4 sm:px-5 md:min-h-screen md:items-center md:justify-center md:px-8 md:py-12 md:pb-16">
          <div
            className="relative mx-auto w-full min-w-0 max-w-2xl overflow-x-hidden rounded-3xl bg-white max-md:max-h-[min(calc(100dvh-2rem),920px)] max-md:overflow-y-auto md:overflow-visible md:max-h-none"
            style={{
              boxShadow:
                "0 4px 6px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.10), 0 20px 40px rgba(0,0,0,0.15)",
              animation: "modalSlideIn 0.25s ease-out",
            }}
          >
          <Link
            href={loginBackHref}
            aria-label="Schließen"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 active:scale-90 hover:bg-red-50 md:right-5 md:top-5"
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
          </Link>

            <div
              className="relative px-4 pb-5 pt-6 sm:px-5 md:px-10 md:pb-6 md:pt-8"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(2, 132, 199, 0.03) 0%, rgba(255,255,255,0) 100%)",
              }}
            >
              <div className="mb-1 flex items-center justify-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" fill="none" className="h-9 w-9" aria-hidden="true">
                  <defs>
                    <linearGradient id="logo-modal" x1="50" y1="42" x2="210" y2="214" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFFFFF" />
                      <stop offset="1" stopColor="#E0F2FE" />
                    </linearGradient>
                  </defs>
                  <rect x="42" y="42" width="172" height="172" rx="48" fill="url(#logo-modal)" />
                  <rect x="42.75" y="42.75" width="170.5" height="170.5" rx="47.25" stroke="#0284C7" strokeOpacity="0.18" strokeWidth="1.5" />
                  <path d="M92 90C103 81.333 115 77 128 77C141 77 153 81.333 164 90" stroke="#0284C7" strokeOpacity="0.34" strokeWidth="9" strokeLinecap="round" />
                  <path d="M99 103L128 131L157 103" stroke="#0284C7" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M128 130V157" stroke="#0284C7" strokeWidth="11" strokeLinecap="round" />
                  <path d="M96 171C106.333 181 117 186 128 186C139 186 149.667 181 160 171" stroke="#0284C7" strokeWidth="10" strokeLinecap="round" />
                </svg>
                <div>
                  <h1 className="text-lg font-medium leading-none tracking-tight text-gray-900">
                    <span className="font-light italic">Your</span> Dentist
                  </h1>
                </div>
              </div>
              <p className="text-center text-[9px] font-semibold uppercase tracking-[0.15em] text-[#0284C7]">
                Neutral Practice Platform
              </p>
            </div>

            <div className="px-4 pb-12 sm:px-5 md:px-10 md:pb-10">
              {props.success ? (
                <div className="py-6 text-center" style={{ animation: "slideIn 0.4s ease-out" }}>
                  <h3 className="mb-2 text-[26px] font-semibold tracking-tight text-gray-900">
                    Bitte E‑Mail bestätigen
                  </h3>
                  <p className="mx-auto mb-5 max-w-md text-[14px] leading-relaxed text-gray-600">
                    Um den Zugang zu aktivieren, bestätigen Sie bitte Ihre E‑Mail-Adresse über den Link in der
                    Bestätigungs‑E‑Mail.
                  </p>

                  <div className="mx-auto mb-6 max-w-md rounded-2xl border border-gray-200 bg-gray-50/60 p-4 text-left">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-600">
                      Checkliste
                    </p>
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
                        className="h-[48px] w-full min-w-0 scroll-mt-8 rounded-xl border border-gray-200 bg-white px-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10 md:text-[14px]"
                      />
                      {successEmail.trim() && !isValidEmail(successEmail) ? (
                        <p className="mt-2 text-[12px] text-red-600">Bitte eine gültige E‑Mail-Adresse eingeben.</p>
                      ) : null}
                      {(() => {
                        const suggestion = suggestEmailFix(successEmail);
                        if (!suggestion) return null;
                        return (
                          <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2">
                            <p className="text-[12px] text-amber-900">
                              Meinten Sie <span className="font-semibold">{suggestion.suggested}</span>?
                            </p>
                            <button
                              type="button"
                              onClick={() => setSuccessEmail(suggestion.suggested)}
                              className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                            >
                              Übernehmen
                            </button>
                          </div>
                        );
                      })()}
                      <p className="mt-2 text-[12px] text-gray-500">
                        Falls Sie sich vertippt haben: hier korrigieren und erneut senden.
                      </p>
                    </div>
                  </div>

                  <form action={props.resendConfirmationAction} className="mx-auto mb-4 max-w-md">
                    <input type="hidden" name="email" value={successEmail.trim()} />
                    {props.inviteToken ? (
                      <input type="hidden" name="invite_token" value={props.inviteToken} />
                    ) : null}
                    <button
                      type="submit"
                      disabled={resendCooldown > 0 || !successEmail.trim() || !isValidEmail(successEmail)}
                      onClick={() => {
                        if (resendCooldown === 0) setResendCooldown(30);
                      }}
                      className="h-[52px] w-full rounded-xl border border-gray-200 bg-white text-[14px] font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resendCooldown > 0 ? `E‑Mail erneut senden (${resendCooldown}s)` : "Bestätigungs‑E‑Mail erneut senden"}
                    </button>
                  </form>

                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0284C7] transition-colors duration-150 hover:text-[#0369A1]"
                  >
                    Falsche E‑Mail eingegeben?
                  </Link>

                  <Link
                    href={loginBackHref}
                    className="mt-5 inline-flex items-center justify-center gap-2 text-[13px] font-medium text-[#0284C7] transition-colors duration-150 hover:text-[#0369A1]"
                  >
                    Zurück zur Login-Seite
                  </Link>
                </div>
              ) : null}

              {!props.success ? (
                <>
              {props.queryError ? (
                <p className="mb-6 rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-3 text-[14px] text-red-600">
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
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Fortschritt
                    </span>
                    <span className="text-[11px] font-semibold text-[#0284C7]">
                      {Math.round(((registrationStep - 1) / 3) * 100)}%
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

                <div className="flex items-center justify-center">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-500 ${
                          registrationStep === step
                            ? "bg-gradient-to-b from-[#0284C7] to-[#0369A1] text-white scale-110 shadow-md"
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
                          className={`mx-2 h-[2px] w-12 rounded-full transition-all duration-500 ${
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
                <div style={{ animation: "slideIn 0.4s ease-out" }}>
                  <div className="mb-7 text-center">
                    <h3 className="mb-1.5 text-[24px] font-semibold tracking-tight text-gray-900">
                      Willkommen bei Your Dentist
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      Legen Sie Ihr professionelles Konto an
                    </p>
                  </div>

                  <form onSubmit={onStep1Submit} className="space-y-5">
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
                        className="h-[52px] w-full min-w-0 scroll-mt-8 rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10 md:text-[15px]"
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
                        className="h-[52px] w-full min-w-0 scroll-mt-8 rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10 md:text-[15px]"
                        required
                      />
                      {emailCheckStatus !== "idle" ? (
                        <div className="mt-2 flex items-center justify-between">
                          <p
                            className={`text-[12px] ${
                              emailCheckStatus === "available"
                                ? "text-green-600"
                                : emailCheckStatus === "taken" || emailCheckStatus === "invalid"
                                  ? "text-red-600"
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
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2">
                          <p className="text-[12px] text-amber-900">
                            Meinten Sie{" "}
                            <span className="font-semibold">{emailTypoSuggestion.suggested}</span>?
                          </p>
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
                            }}
                            className="rounded-lg bg-white px-2.5 py-1.5 text-[12px] font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                          >
                            Übernehmen
                          </button>
                        </div>
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
                            className="text-[12px] font-semibold text-[#0284C7] hover:underline"
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
                        }}
                        placeholder="E-Mail-Adresse erneut eingeben"
                        autoComplete="off"
                        name="email_confirm_register"
                        className="h-[52px] w-full min-w-0 scroll-mt-8 rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10 md:text-[15px]"
                        required
                      />
                      {emailPairError ? (
                        <p className="mt-2 text-[12px] text-amber-800">{emailPairError}</p>
                      ) : regEmailConfirm && !emailMatches ? (
                        <p className="mt-2 text-[12px] text-amber-800">
                          Die E-Mail-Adressen stimmen nicht überein.
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
                        className="h-[52px] w-full min-w-0 scroll-mt-8 rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10 md:text-[15px]"
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
                        emailCheckStatus === "taken" ||
                        emailCheckStatus === "invalid" ||
                        emailCheckStatus === "checking" ||
                        !normalizeEmail(regEmailConfirm) ||
                        !emailMatches
                      }
                      className="mt-8 h-[56px] w-full rounded-xl text-[15px] font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(to bottom, #0284C7 0%, #0369A1 100%)",
                      }}
                    >
                      Weiter
                    </button>
                  </form>
                </div>
              ) : null}

              {registrationStep === 2 ? (
                <div style={{ animation: "slideIn 0.4s ease-out" }}>
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
                        className="h-[52px] w-full min-w-0 scroll-mt-8 rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10 md:text-[15px]"
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
                        className="h-[52px] w-full min-w-0 scroll-mt-8 rounded-xl border border-gray-200 bg-white px-4 text-base text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10 md:text-[15px]"
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
                        onClick={() => setRegistrationStep(1)}
                        className="h-[56px] flex-1 rounded-xl border-2 border-gray-200 bg-white text-[15px] font-semibold text-gray-700 transition-all duration-200 active:scale-[0.98] hover:bg-gray-50"
                      >
                        Zurück
                      </button>
                      <button
                        type="submit"
                        className="h-[56px] flex-1 rounded-xl text-[15px] font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.98]"
                        style={{
                          background: "linear-gradient(to bottom, #0284C7 0%, #0369A1 100%)",
                        }}
                      >
                        Weiter
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {registrationStep === 3 ? (
                <div style={{ animation: "slideIn 0.4s ease-out" }}>
                  <div className="mb-7 text-center">
                    <h3 className="mb-1.5 text-[24px] font-semibold tracking-tight text-gray-900">
                      Fast geschafft! 🎉
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      Bitte verifizieren Sie Ihre Zahnarzt-Zulassung
                    </p>
                    {props.licenseStepOptional ? (
                      <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-gray-500">
                        Demo: Sie können ohne Upload fortfahren — die Dokumente können Sie später nachreichen.
                      </p>
                    ) : null}
                  </div>

                  <form onSubmit={onStep3Submit} className="space-y-5">

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
                          <label htmlFor="license-front" className="flex cursor-pointer flex-col px-5 py-6">
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
                                  className="mt-3 text-[13px] font-medium text-[#0284C7] hover:text-[#0369A1]"
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
                          <label htmlFor="license-back" className="flex cursor-pointer flex-col px-5 py-6">
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
                                  className="mt-3 text-[13px] font-medium text-[#0284C7] hover:text-[#0369A1]"
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
                          className={`mt-3 rounded-lg border px-3 py-2 text-[12px] ${
                            licenseUploadError.startsWith("Hinweis:")
                              ? "border-amber-200 bg-amber-50 text-amber-900"
                              : "border-red-200 bg-red-50 text-red-700"
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
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0284C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-[12px] leading-relaxed text-gray-700">
                          Ihre Daten werden verschlüsselt und nur zur Verifizierung verwendet.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setRegistrationStep(2)}
                        className="h-[56px] flex-1 rounded-xl border-2 border-gray-200 bg-white text-[15px] font-semibold text-gray-700 transition-all duration-200 active:scale-[0.98] hover:bg-gray-50"
                      >
                        Zurück
                      </button>
                      <button
                        type="submit"
                        disabled={licenseUploading}
                        className="h-[56px] flex-1 rounded-xl text-[15px] font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.98]"
                        style={{
                          background: "linear-gradient(to bottom, #0284C7 0%, #0369A1 100%)",
                        }}
                      >
                        {licenseUploading ? "Upload läuft..." : "Weiter"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {registrationStep === 4 ? (
                <div style={{ animation: "slideIn 0.4s ease-out" }}>
                  <div className="mb-7 text-center">
                    <h3 className="mb-1.5 text-[24px] font-semibold tracking-tight text-gray-900">
                      Zahlungsintervall wählen
                    </h3>
                    <p className="text-[13px] text-gray-500">
                      Wählen Sie Ihren Abrechnungszeitraum und schließen Sie den Vertrag ab.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {(Object.keys(plans) as Plan[]).map((key) => {
                      const p = plans[key];
                      const active = selectedPlan === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedPlan(key)}
                          className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                            active
                              ? "border-[#0284C7] shadow-md"
                              : "border-gray-200 hover:border-[#0284C7] hover:shadow-sm"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-[15px] font-semibold text-gray-900">{p.label}</p>
                            {p.save ? (
                              <span className="rounded-full bg-[#0284C7] px-2 py-0.5 text-[10px] font-semibold text-white">
                                −{p.save}
                              </span>
                            ) : null}
                          </div>
                          <p className="mb-3 text-[11px] text-gray-500">{p.billing}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[28px] font-semibold text-gray-900">€{p.price}</span>
                            <span className="text-[12px] text-gray-500">/Monat</span>
                          </div>
                          {key !== "monthly" ? (
                            <p className="mt-2 text-[11px] text-gray-500">€{p.total} Gesamt</p>
                          ) : (
                            <p className="mt-2 text-[11px] text-gray-500">&nbsp;</p>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-600">
                      Bestellübersicht
                    </p>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[15px] font-semibold text-gray-900">Your Dentist (Plattform)</p>
                        <p className="mt-0.5 text-[12px] text-gray-600">
                          Abrechnung: <span className="font-medium text-gray-900">{plans[selectedPlan].billing}</span>
                        </p>
                        <p className="mt-0.5 text-[12px] text-gray-600">
                          Start: <span className="font-medium text-gray-900">sofort nach Freischaltung</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[22px] font-semibold text-gray-900">€{plans[selectedPlan].price}</p>
                        <p className="text-[11px] text-gray-500">pro Monat</p>
                      </div>
                    </div>

                    <div className="h-px w-full bg-gray-200/70" />

                    <p className="mt-4 mb-3 text-[12px] font-semibold uppercase tracking-wide text-gray-600">
                      Zahlungsmethode
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("sepa_debit")}
                        className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                          paymentMethod === "sepa_debit"
                            ? "border-[#0284C7] bg-white"
                            : "border-gray-200 bg-white hover:border-[#0284C7]"
                        }`}
                      >
                        <p className="text-[14px] font-semibold text-gray-900">SEPA‑Lastschrift</p>
                        <p className="mt-1 text-[12px] text-gray-600">
                          Abbuchung automatisch gemäß gewähltem Intervall.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                          paymentMethod === "card"
                            ? "border-[#0284C7] bg-white"
                            : "border-gray-200 bg-white hover:border-[#0284C7]"
                        }`}
                      >
                        <p className="text-[14px] font-semibold text-gray-900">Kreditkarte</p>
                        <p className="mt-1 text-[12px] text-gray-600">
                          Sicher bezahlen per Karte (Setup im nächsten Schritt).
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedPlan === "monthly") return;
                          setPaymentMethod("invoice");
                        }}
                        aria-disabled={selectedPlan === "monthly"}
                        className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                          selectedPlan === "monthly"
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : paymentMethod === "invoice"
                              ? "border-[#0284C7] bg-white"
                              : "border-gray-200 bg-white hover:border-[#0284C7]"
                        }`}
                      >
                        <p className="text-[14px] font-semibold">Rechnung</p>
                        <p className="mt-1 text-[12px]">
                          {selectedPlan === "monthly"
                            ? "Verfügbar ab Halbjährlich/Jährlich."
                            : "Für Praxen – Zahlung per Rechnung."}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className={`rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                          paymentMethod === "paypal"
                            ? "border-[#0284C7] bg-white"
                            : "border-gray-200 bg-white hover:border-[#0284C7]"
                        }`}
                      >
                        <p className="text-[14px] font-semibold text-gray-900">PayPal</p>
                        <p className="mt-1 text-[12px] text-gray-600">
                          Optionale Alternative (Setup im nächsten Schritt).
                        </p>
                      </button>
                    </div>

                    <p className="mt-4 mb-3 text-[12px] font-semibold uppercase tracking-wide text-gray-600">
                      Vertrag & Einwilligungen
                    </p>
                    <label className="flex items-start gap-3 text-[13px] text-gray-700">
                      <input
                        type="checkbox"
                        checked={acceptedTos}
                        onChange={(e) => setAcceptedTos(e.target.checked)}
                        className="mt-1 h-4 w-4"
                      />
                      <span>
                        Ich akzeptiere die{" "}
                        <Link href="/agb" className="font-medium text-[#0284C7] hover:underline">
                          AGB
                        </Link>
                        . *
                      </span>
                    </label>
                    <label className="mt-3 flex items-start gap-3 text-[13px] text-gray-700">
                      <input
                        type="checkbox"
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="mt-1 h-4 w-4"
                      />
                      <span>
                        Ich habe die{" "}
                        <Link href="/datenschutz" className="font-medium text-[#0284C7] hover:underline">
                          Datenschutzerklärung
                        </Link>{" "}
                        gelesen. *
                      </span>
                    </label>
                    <label className="mt-3 flex items-start gap-3 text-[13px] text-gray-700">
                      <input
                        type="checkbox"
                        checked={acceptedWithdrawal}
                        onChange={(e) => setAcceptedWithdrawal(e.target.checked)}
                        className="mt-1 h-4 w-4"
                      />
                      <span>
                        Ich verlange ausdrücklich, dass Your Dentist vor Ablauf der Widerrufsfrist mit der Leistung
                        beginnt, und bestätige, dass ich dadurch mein Widerrufsrecht verlieren kann. *
                      </span>
                    </label>
                    <p className="mt-4 text-[11px] text-gray-500">
                      * Pflichtfelder.{" "}
                      <Link href="/widerruf" className="font-medium text-[#0284C7] hover:underline">
                        Widerrufsbelehrung
                      </Link>
                      . Version: <span className="font-medium">v1</span>
                    </p>
                  </div>

                  <form action={props.signUpAction} className="mt-6 space-y-3">
                    <input type="hidden" name="email" value={regEmail} />
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
                      <p className="text-center text-[11px] leading-relaxed text-gray-500">
                        Ihr gewählter Plan wird mit dem Konto verknüpft. Online-Zahlung (Stripe) ist aktuell
                        deaktiviert — Sie können den Zugang dennoch starten.
                      </p>
                    ) : null}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setRegistrationStep(3)}
                        className="h-[56px] flex-1 rounded-xl border-2 border-gray-200 bg-white text-[15px] font-semibold text-gray-700 transition-all duration-200 active:scale-[0.98] hover:bg-gray-50"
                      >
                        Zurück
                      </button>
                      <RegisterFormSubmitButton
                        label={
                          props.skipPaymentAtSignup ? "Registrierung abschließen" : "Zahlungspflichtig bestellen"
                        }
                        pendingLabel="Wird gesendet…"
                        disabled={
                          !acceptedTos ||
                          !acceptedPrivacy ||
                          !acceptedWithdrawal ||
                          !registrationDocsSatisfied
                        }
                        className="h-[56px] flex-1 rounded-xl text-[15px] font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {props.registrationDemoUi && !props.skipPaymentAtSignup ? (
                      <div
                        className="rounded-2xl border border-dashed border-amber-300/90 bg-amber-50/80 p-4"
                        role="region"
                        aria-label="Demo-Registrierung ohne Zahlung"
                      >
                        <p className="mb-3 text-[12px] leading-relaxed text-amber-950">
                          Demo: Registrierung ohne Stripe-Checkout abschließen (nur wenn der Server den Demo-Modus
                          erlaubt).
                        </p>
                        <RegisterFormSubmitButton
                          name="registration_demo_skip"
                          value="1"
                          label="Registrierung abschließen (Demo, ohne Zahlung)"
                          pendingLabel="Wird gesendet…"
                          disabled={
                            !acceptedTos ||
                            !acceptedPrivacy ||
                            !acceptedWithdrawal ||
                            !registrationDocsSatisfied
                          }
                          className="h-[48px] w-full rounded-xl border-2 border-amber-400/80 bg-white text-[14px] font-semibold text-amber-950 shadow-sm transition-all duration-200 active:scale-[0.99] hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ background: "linear-gradient(to bottom, #fffbeb 0%, #ffffff 100%)" }}
                          pendingStyle={{
                            background: "linear-gradient(to bottom, #fef9c3 0%, #fef3c7 100%)",
                          }}
                        />
                      </div>
                    ) : null}

                    <p className="text-center text-[11px] text-gray-500">
                      Sie wählen: <span className="font-medium text-gray-900">{plans[selectedPlan].label}</span>{" "}
                      · {plans[selectedPlan].billing}
                    </p>
                  </form>
                </div>
              ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

