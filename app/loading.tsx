import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";

/** Global route transition — clinical workspace canvas (no warm paper flash). */
export default function RootLoading() {
  return (
    <div
      className="flex min-h-[100dvh] w-full max-w-full min-w-0 flex-col items-center justify-center gap-3 px-4"
      style={{ background: "#F7F9FC" }}
    >
      <YourDentistBrandLockup size="md" centered />
      <svg
        className="h-5 w-5 shrink-0 animate-spin text-[#0284C7]/50"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
        <path
          className="opacity-70"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
