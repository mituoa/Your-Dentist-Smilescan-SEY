"use client";

import * as React from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type Plan = "monthly" | "halfyearly" | "yearly";
type RegistrationStep = 1 | 2 | 3 | 4;

type SignUpAction = (formData: FormData) => void | Promise<void>;

function coercePlan(value: string | null | undefined): Plan {
  if (!value) return "yearly";
  const v = value.toLowerCase();
  if (v === "monthly" || v === "halfyearly" || v === "yearly") return v;
  return "yearly";
}

export function RegisterClient(props: {
  signUpAction: SignUpAction;
  inviteToken: string;
  prefilledEmail: string;
  initialPlan?: string | null;
  queryError?: string;
}) {
  const plan = coercePlan(props.initialPlan);
  const [registrationStep, setRegistrationStep] = React.useState<RegistrationStep>(1);

  const [regName, setRegName] = React.useState("");
  const [regPractice, setRegPractice] = React.useState("");
  const [regLicense, setRegLicense] = React.useState("");
  const [regEmail, setRegEmail] = React.useState(props.prefilledEmail ?? "");
  const [regPassword, setRegPassword] = React.useState("");

  const [selectedPlan, setSelectedPlan] = React.useState<Plan>(plan);
  const [licenseFile, setLicenseFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);

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
      setLicenseFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLicenseFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const onStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    setRegistrationStep(2);
  };

  const onStep2Submit = (e: FormEvent) => {
    e.preventDefault();
    setRegistrationStep(3);
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ animation: "fadeIn 0.2s ease-out" }}
      >
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          style={{ animation: "fadeIn 0.25s ease-out" }}
        />

        <div
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white"
          style={{
            boxShadow:
              "0 4px 6px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.10), 0 20px 40px rgba(0,0,0,0.15)",
            animation: "modalSlideIn 0.25s ease-out",
          }}
        >
          <Link
            href="/login"
            aria-label="Schließen"
            className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 active:scale-90 hover:bg-red-50"
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
              className="relative px-10 pt-8 pb-6"
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

            <div className="px-10 pb-10">
              {props.queryError ? (
                <p className="mb-6 rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-3 text-[14px] text-red-600">
                  {decodeURIComponent(props.queryError)}
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
                        style={{
                          animation: registrationStep === step ? "pulse 2s ease-in-out infinite" : "none",
                        }}
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
                        className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10"
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
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="max.mustermann@praxis.de"
                        autoComplete="email"
                        className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10"
                        required
                      />
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
                        className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10"
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
                        className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10"
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
                        className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10"
                        required
                      />
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
                  </div>

                  <form action={props.signUpAction} className="space-y-5">
                    <input type="hidden" name="email" value={regEmail} />
                    <input type="hidden" name="password" value={regPassword} />
                    <input type="hidden" name="display_name" value={regName} />
                    <input type="hidden" name="workspace_name" value={regPractice} />
                    {props.inviteToken ? (
                      <input type="hidden" name="invite_token" value={props.inviteToken} />
                    ) : null}

                    <div>
                      <div
                        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 ${
                          dragActive
                            ? "border-[#0284C7] bg-[#0284C7]/10 scale-105"
                            : licenseFile
                              ? "border-green-400 bg-green-50"
                              : "border-gray-300 bg-white hover:border-[#0284C7] hover:bg-[#0284C7]/5 hover:scale-[1.02]"
                        }`}
                        style={{
                          boxShadow: dragActive ? "0 0 0 4px rgba(2, 132, 199, 0.1)" : "none",
                        }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <input
                          id="license-file"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="license-file"
                          className="flex cursor-pointer flex-col items-center justify-center px-6 py-12"
                        >
                          {licenseFile ? (
                            <div className="w-full" style={{ animation: "fadeIn 0.3s ease-out" }}>
                              {filePreview ? (
                                <div className="mb-4 overflow-hidden rounded-lg border-2 border-green-200">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={filePreview} alt="Preview" className="h-32 w-full object-cover" />
                                </div>
                              ) : null}
                              <p className="mb-2 truncate text-center text-[14px] font-semibold text-gray-900">
                                {licenseFile.name}
                              </p>
                              <p className="mb-3 text-center text-[12px] text-gray-500">
                                {(licenseFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setLicenseFile(null);
                                  setFilePreview(null);
                                }}
                                className="text-[13px] font-medium text-[#0284C7] hover:text-[#0369A1]"
                              >
                                Andere Datei wählen
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="mb-1 text-[15px] font-semibold text-gray-900">
                                Zahnarztausweis hochladen
                              </p>
                              <p className="mb-1 text-[12px] text-gray-500">
                                Ziehen Sie die Datei hierher oder klicken Sie
                              </p>
                              <p className="text-[11px] text-gray-400">
                                JPG, PNG oder PDF (max. 10 MB)
                              </p>
                            </>
                          )}
                        </label>
                      </div>
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

                    <div
                      className="rounded-xl p-5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(2, 132, 199, 0.04) 100%)",
                        border: "1.5px solid rgba(2, 132, 199, 0.2)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                            Gewähltes Abo
                          </p>
                          <p className="text-[18px] font-semibold text-gray-900">
                            {plans[selectedPlan].label}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[26px] font-semibold text-[#0284C7]">
                            €{plans[selectedPlan].price}
                          </p>
                          <p className="text-[11px] text-gray-600">/Monat</p>
                        </div>
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
                        className="h-[56px] flex-1 rounded-xl text-[15px] font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.98]"
                        style={{
                          background: "linear-gradient(to bottom, #0284C7 0%, #0369A1 100%)",
                        }}
                      >
                        Registrierung abschließen
                      </button>
                    </div>

                    <p className="pt-3 text-center text-[11px] text-gray-500">
                      Mit der Registrierung akzeptieren Sie unsere AGB und Datenschutzerklärung
                    </p>
                  </form>
                </div>
              ) : null}

              {registrationStep === 4 ? (
                <div className="py-6 text-center" style={{ animation: "slideIn 0.4s ease-out" }}>
                  <h3 className="mb-2 text-[26px] font-semibold tracking-tight text-gray-900">
                    Herzlich willkommen! 🎉
                  </h3>
                  <p className="mx-auto mb-7 max-w-md text-[14px] leading-relaxed text-gray-600">
                    Wir haben dir gerade eine E-Mail geschickt. Bitte bestätige deinen Account, um fortzufahren.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-[13px] font-medium text-[#0284C7] transition-colors duration-150 hover:text-[#0369A1]"
                  >
                    Zurück zur Login-Seite
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
    </>
  );
}

