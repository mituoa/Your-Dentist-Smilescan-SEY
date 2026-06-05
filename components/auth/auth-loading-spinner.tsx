/** @deprecated Prefer `YdInlineBusy` or `YdAuthLoadingState` — legacy wrapper ohne Spinner. */
export function AuthLoadingSpinner(props: { className?: string }) {
  return (
    <div
      className={props.className ?? "yd-auth-loading-pulse-v2"}
      role="status"
      aria-label="Wird geladen"
    />
  );
}
