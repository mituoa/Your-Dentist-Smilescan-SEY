/** @deprecated Prefer `YdAuthLoadingState` — thin wrapper for legacy imports. */
export function AuthLoadingSpinner(props: { className?: string }) {
  return (
    <div
      className={props.className ?? "yd-auth-loading-pulse"}
      role="status"
      aria-hidden={!props.className}
    />
  );
}
