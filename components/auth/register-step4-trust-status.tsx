/** Compact trust signals — max two lines, no paragraph block. */
export function RegisterStep4TrustStatus() {
  return (
    <div
      className="yd-reg-step4-trust-status mx-auto mb-7 max-w-md rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-left md:mb-8"
      role="status"
    >
      <ul className="space-y-1.5 text-[12px] leading-snug text-slate-700">
        <li className="flex items-start gap-2">
          <span className="mt-px text-green-700" aria-hidden>
            ✓
          </span>
          <span>Keine Abbuchung vor Freischaltung</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-px text-green-700" aria-hidden>
            ✓
          </span>
          <span>Prüfung innerhalb von 24 Stunden</span>
        </li>
      </ul>
    </div>
  );
}
