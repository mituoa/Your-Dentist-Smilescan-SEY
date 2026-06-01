import Image from "next/image";
import { HeartPulse, Microscope, Stethoscope, UserRound } from "lucide-react";

/** Dekorative linke Spalte — Referenz-Login (Phone, Bögen, Medical Blue). */
export function LoginShowcase() {
  return (
    <div className="yd-login-showcase" aria-hidden>
      <div className="yd-login-showcase__cross yd-login-showcase__cross--1" />
      <div className="yd-login-showcase__cross yd-login-showcase__cross--2" />
      <div className="yd-login-showcase__cross yd-login-showcase__cross--3" />

      <svg
        className="yd-login-showcase__arc yd-login-showcase__arc--tl"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden
      >
        <path
          d="M20 180 C 80 40, 140 20, 180 60"
          stroke="url(#yd-login-arc-a)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="yd-login-arc-a" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(42,95,158,0.08)" />
            <stop offset="100%" stopColor="rgba(42,95,158,0.35)" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        className="yd-login-showcase__arc yd-login-showcase__arc--br"
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden
      >
        <path
          d="M10 40 C 60 120, 120 160, 190 100"
          stroke="url(#yd-login-arc-b)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="yd-login-arc-b" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(42,95,158,0.12)" />
            <stop offset="100%" stopColor="rgba(42,95,158,0.4)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="yd-login-showcase__float yd-login-showcase__float--1">
        <div className="yd-login-showcase__float-inner">
          <UserRound className="h-5 w-5 text-[#1a4f9c]" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
      <div className="yd-login-showcase__float yd-login-showcase__float--2">
        <div className="yd-login-showcase__float-inner yd-login-showcase__float-inner--accent">
          <Stethoscope className="h-5 w-5 text-white" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
      <div className="yd-login-showcase__float yd-login-showcase__float--3">
        <div className="yd-login-showcase__float-inner yd-login-showcase__float-inner--scene">
          <Microscope className="h-6 w-6 text-[#1a4f9c]/80" strokeWidth={1.5} aria-hidden />
        </div>
      </div>
      <div className="yd-login-showcase__float yd-login-showcase__float--4">
        <div className="yd-login-showcase__float-inner yd-login-showcase__float-inner--scene yd-login-showcase__float-inner--soft">
          <HeartPulse className="h-5 w-5 text-[#163d7a]/75" strokeWidth={1.5} aria-hidden />
        </div>
      </div>

      <div className="yd-login-showcase__orbit yd-login-showcase__orbit--1" />
      <div className="yd-login-showcase__orbit yd-login-showcase__orbit--2" />

      <div className="yd-login-showcase__phone">
        <div className="yd-login-showcase__phone-notch" />
        <div className="yd-login-showcase__phone-screen">
          <div className="yd-login-showcase__phone-brand">
            <Image
              src="/brand/your-dentist/logo-mark.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-[11px] font-semibold tracking-[-0.02em] text-[#0f172a]">
              Your Dentist
            </span>
          </div>
          <p className="yd-login-showcase__phone-title">Anmelden</p>
          <p className="yd-login-showcase__phone-lead">Geschützter Praxiszugang</p>
          <div className="yd-login-showcase__phone-field" />
          <div className="yd-login-showcase__phone-field" />
          <div className="yd-login-showcase__phone-btn" />
        </div>
      </div>
    </div>
  );
}
