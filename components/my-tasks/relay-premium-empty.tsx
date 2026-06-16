type RelayPremiumEmptyProps = {
  title: string;
  text: string;
  hint?: string;
  variant?: "panel" | "inline" | "detail";
};

/** Ruhige Leerzustände — Medical SaaS, nicht Wireframe. */
export function RelayPremiumEmpty({
  title,
  text,
  hint,
  variant = "panel",
}: RelayPremiumEmptyProps) {
  return (
    <div className={`yd-relay-premium-empty yd-relay-premium-empty--${variant}`}>
      {variant === "detail" ? <div className="yd-relay-premium-empty__glow" aria-hidden /> : null}
      <div className="yd-relay-premium-empty__content">
        <p className="yd-relay-premium-empty__title">{title}</p>
        <p className="yd-relay-premium-empty__text">{text}</p>
        {hint ? <p className="yd-relay-premium-empty__hint">{hint}</p> : null}
      </div>
    </div>
  );
}
