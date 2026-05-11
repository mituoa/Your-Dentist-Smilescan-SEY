/** Ruhiger, einheitlicher Spinner für Auth-Flächen (motion-reduce: ohne Rotation). */
export function AuthLoadingSpinner(props: { className?: string }) {
  return (
    <svg
      className={
        props.className ??
        "h-5 w-5 shrink-0 animate-spin text-[#0284C7]/65 motion-reduce:animate-none motion-reduce:opacity-70"
      }
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
