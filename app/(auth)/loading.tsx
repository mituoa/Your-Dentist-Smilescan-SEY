import Image from "next/image";
import smileScanLogo from "@/FIGMA DESIGN ALL/SMILESCAN LOGO/SmileScan.svg";

export default function AuthLoading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8">
      <div
        className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(148, 163, 184, 0.7) 0%, rgba(59, 130, 246, 0.55) 100%)",
          filter: "blur(150px)",
          transform: "translate(-25%, -25%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(99, 102, 241, 0.45) 100%)",
          filter: "blur(150px)",
          transform: "translate(25%, 25%)",
        }}
      />

      <div className="relative">
        <Image
          src={smileScanLogo}
          alt="SmileScan Logo"
          priority
          className="smilescan-logo-pulse relative z-10 h-auto w-[220px] max-w-full object-contain"
        />
      </div>
    </div>
  );
}
